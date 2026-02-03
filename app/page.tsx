"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface AnalysisResult {
  score: number
  missingKeywords: string[]
  suggestions: string[]
}

function getScoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-red-500"
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("")
  const [resume, setResume] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setError(null)
    setResult(null)

    if (!jobDescription.trim() || !resume.trim()) {
      setError("請填寫職位描述和履歷內容")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          resume: resume.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "分析失敗")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失敗，請再試一次")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">ResumeATS</h1>
          <p className="mt-1 text-slate-600">
            履歷 ATS 優化工具 · 讓你的履歷通過申請者追蹤系統
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>職位描述（JD）</CardTitle>
              <CardDescription>
                貼上完整的職位描述文字，包含所需技能、經驗等
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="jd" className="sr-only">
                職位描述
              </Label>
              <Textarea
                id="jd"
                placeholder="請貼上職位描述內容..."
                className="min-h-[200px] resize-y"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>履歷內容</CardTitle>
              <CardDescription>
                貼上你的履歷文字（純文字即可，不需格式）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="resume" className="sr-only">
                履歷內容
              </Label>
              <Textarea
                id="resume"
                placeholder="請貼上履歷內容..."
                className="min-h-[200px] resize-y"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              開始分析
            )}
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>分析結果</CardTitle>
              <CardDescription>
                根據 ATS 系統常見的關鍵字與格式進行評估
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>ATS 匹配度評分</Label>
                  <span
                    className={`text-2xl font-bold ${
                      result.score >= 70
                        ? "text-emerald-600"
                        : result.score >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.score} 分
                  </span>
                </div>
                <div className="relative h-6 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${getScoreColor(result.score)}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {result.missingKeywords.length > 0 && (
                <div>
                  <Label className="mb-2 block">缺少的關鍵字</Label>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, i) => (
                      <Badge key={i} variant="destructive">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div>
                  <Label className="mb-2 block">改進建議</Label>
                  <ol className="list-inside list-decimal space-y-2 text-slate-700">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="leading-relaxed">
                        {suggestion}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
