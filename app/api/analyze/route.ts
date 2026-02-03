import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `你是專業的 ATS（申請者追蹤系統）專家，擅長分析履歷與職位描述的匹配度。

請根據提供的職位描述（JD）和履歷內容，以繁體中文進行分析，並返回以下 JSON 格式的結果：

{
  "score": 數字（0-100，代表履歷與 JD 的 ATS 匹配度），
  "missingKeywords": 字串陣列（JD 中重要但履歷中缺少的關鍵字或技能），
  "suggestions": 字串陣列（3-5 條具體的改進建議，每條要具體可行）
}

評分標準：
- 90-100：履歷與 JD 高度匹配，關鍵字涵蓋完整
- 70-89：大體匹配，有少數可改進之處
- 50-69：部分匹配，需要補充多項關鍵內容
- 0-49：匹配度低，需要大幅優化

請只返回有效的 JSON，不要有其他文字。`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "請設定 GEMINI_API_KEY 環境變數" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { jobDescription, resume } = body

    if (!jobDescription?.trim() || !resume?.trim()) {
      return NextResponse.json(
        { error: "請提供職位描述和履歷內容" },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    })

    const prompt = `${SYSTEM_PROMPT}

【職位描述】
${jobDescription.trim()}

【履歷內容】
${resume.trim()}

請分析以上履歷與職位描述的匹配度，返回 JSON 格式結果。`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: "AI 無法產生分析結果，請再試一次" },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(text) as {
      score?: number
      missingKeywords?: string[]
      suggestions?: string[]
    }

    const score = Math.min(100, Math.max(0, Number(parsed.score) || 0))
    const missingKeywords = Array.isArray(parsed.missingKeywords)
      ? parsed.missingKeywords
      : []
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : []

    return NextResponse.json({
      score,
      missingKeywords,
      suggestions,
    })
  } catch (error) {
    console.error("Analyze API error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "分析失敗，請檢查 API 金鑰後再試",
      },
      { status: 500 }
    )
  }
}
