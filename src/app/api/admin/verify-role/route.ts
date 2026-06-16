export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    isAdmin: session?.user?.role === "ADMIN",
    role:    session?.user?.role ?? null,
    email:   session?.user?.email ?? null,
  });
}
