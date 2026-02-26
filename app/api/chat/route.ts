import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyD-xBbEWKQMnPjUykgNFCgV_VbhkHJNcKc")

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Use the correct model name for the current API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // System prompt to give Ramu personality and context
  const systemPrompt = `You are Nora, a professional and helpful AI assistant for CETMCA26.live.

Your personality:
- Friendly, enthusiastic, and supportive
- Use emojis occasionally to be more engaging
- Knowledgeable about MCA curriculum, programming, and student life
- Always encouraging and positive
- Keep responses concise but helpful

Your knowledge includes:
- MCA curriculum and subjects
- Programming languages (Java, Python, C++, JavaScript, etc.)
- Database management, web development, software engineering
- Project guidance and career advice for MCA students
- General academic and technical support

Guidelines:
- Keep responses under 200 words when possible
- Be encouraging and motivational
- If you don't know something specific about CETMCA26, be honest but still try to help
- Do not repeat or copy user input verbatim
- When the user provides content like notes or lists, summarize, clarify, or answer specific questions rather than restating
- Don't store or remember previous conversations
- Focus on being helpful for MCA students

User message: ${message}`


    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Sorry, I'm having trouble right now. Please try again! ",
      },
      { status: 500 },
    )
  }
}
