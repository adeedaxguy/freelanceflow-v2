export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supportChat } from "@/lib/groq";
import { z } from "zod";

const schema = z.object({
  messages: z.array(z.object({
    role:    z.enum(["user", "assistant"]),
    content: z.string().min(1),
  })).min(1),
  email: z.string().email().optional(),
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

    const { messages, email } = parsed.data;
    const { reply, shouldCreateTicket } = await supportChat(messages);

    let ticketCreated = false;
    if (shouldCreateTicket) {
      const userEmail = email ?? session?.user?.email ?? "unknown@user.com";
      const firstMsg = messages.find(m => m.role === "user")?.content ?? "Support request";
      try {
        await prisma.supportTicket.create({
          data: {
            userId:   session?.user?.id ?? null,
            email:    userEmail,
            subject:  firstMsg.slice(0, 100),
            messages: JSON.stringify(messages),
            status:   "open",
          },
        });
        ticketCreated = true;
      } catch (ticketError) {
        console.error("Support ticket creation failed:", ticketError);
      }
    }

    return NextResponse.json({ reply, ticketCreated });
  } catch (err) {
    console.error("Support chat error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
