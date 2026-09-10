export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supportChat } from "@/lib/groq";
import { z } from "zod";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";
import { notifySupportRequest } from "@/lib/support-notifications";

const schema = z.object({
  messages: z.array(z.object({
    role:    z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4_000),
  })).min(1).max(40),
  email: z.string().trim().email().max(254).optional(),
});

export async function POST(req: NextRequest) {
  try {
    let session: Session | null = null;
    try {
      session = await getServerSession(authOptions) as Session | null;
    } catch (sessionError) {
      console.error("Support chat session lookup failed:", sessionError);
    }
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const limit = await securityRateLimit(
      "support-chat",
      session?.user?.id ?? getClientIp(req.headers),
      20,
      15 * 60 * 1000,
    );
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many support requests. Please try again later." }, {
        status: 429,
        headers: rateLimitHeaders(limit),
      });
    }

    const { messages, email } = parsed.data;
    const { reply, shouldCreateTicket } = await supportChat(messages);

    let ticketCreated = false;
    if (shouldCreateTicket) {
      const userEmail = session?.user?.email ?? email;
      if (!userEmail) {
        return NextResponse.json({
          reply: "Please add your email below and send your request again, or use Contact support. We need a reply address to follow up.",
          ticketCreated: false, needsEmail: true,
        });
      }
      const ticketLimit = await securityRateLimit("support-ticket", session?.user?.id ?? getClientIp(req.headers), 5, 60 * 60 * 1000);
      if (!ticketLimit.allowed) {
        return NextResponse.json({ error: "Too many support requests. Please email hello@icloseleads.com." }, {
          status: 429, headers: rateLimitHeaders(ticketLimit),
        });
      }
      const firstMsg = messages.find(m => m.role === "user")?.content ?? "Support request";
      try {
        const ticket = await prisma.supportTicket.create({
          data: {
            userId:   session?.user?.id ?? null,
            email:    userEmail,
            subject:  firstMsg.slice(0, 100),
            messages: JSON.stringify(messages.map(message => ({ role: message.role, text: message.content, at: new Date().toISOString() }))),
            status:   "open",
          },
        });
        await notifySupportRequest({
          id: ticket.id, source: "ticket", email: userEmail, subject: firstMsg.slice(0, 100),
          message: messages.map(message => `${message.role}: ${message.content}`).join("\n\n"),
        });
        ticketCreated = true;
      } catch (ticketError) {
        console.error("Support ticket creation failed:", ticketError);
        return NextResponse.json({ error: "We could not save your ticket. Please use Contact support or email hello@icloseleads.com." }, { status: 503 });
      }
    }

    return NextResponse.json({ reply, ticketCreated });
  } catch (err) {
    console.error("Support chat error:", err);
    return NextResponse.json({ error: "Support chat is temporarily unavailable." }, { status: 503 });
  }
}
