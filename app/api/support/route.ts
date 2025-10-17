import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { subject, category, message } = await request.json()

    if (!subject || !category || !message) {
      return NextResponse.json({ error: "Subject, category, and message are required" }, { status: 400 })
    }

    // Simulate sending support message
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real application, you would:
    // 1. Save the message to a database
    // 2. Send an email to the support team
    // 3. Create a ticket in your support system
    // 4. Send a confirmation email to the user

    console.log("Support message received:", {
      subject,
      category,
      message,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Support message sent successfully",
      ticketId: `TICKET-${Date.now()}`,
    })
  } catch (error) {
    console.error("Support message error:", error)
    return NextResponse.json({ error: "Failed to send support message" }, { status: 500 })
  }
}
