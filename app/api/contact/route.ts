import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (typeof name !== "string" || name.length > 200) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (typeof email !== "string" || !email.includes("@") || email.length > 300) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    console.log("Contact form submission:", { name, email, message: message.slice(0, 100) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("contact: error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
