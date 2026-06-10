import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return 'Add GEMINI_API_KEY to your environment variables to enable AI features. Get a free key at aistudio.google.com'
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err: any) {
    return 'AI generation failed: ' + err.message
  }
}
