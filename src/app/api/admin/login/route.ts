import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const EXPECTED_USER = "admin";
    const EXPECTED_PASS = process.env.ADMIN_PASSWORD || "admin";

    if (username === EXPECTED_USER && password === EXPECTED_PASS) {
      const response = NextResponse.json({ success: true, message: "Logged in successfully" });
      
      // Set an HTTP-only cookie for secure session tracking
      response.cookies.set({
        name: "admin_session",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
