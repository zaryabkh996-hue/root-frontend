import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (session?.user) {
      return NextResponse.json({ 
        session: {
          user: session.user 
        } 
      });
    }

    return NextResponse.json({ session: null });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
