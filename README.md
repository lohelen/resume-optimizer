# ResumeATS - 履歷 ATS 優化工具

幫助求職者優化履歷以通過 ATS（申請者追蹤系統）的單頁應用。

## 功能

- 貼上職位描述（JD）與履歷內容
- 使用 Google Gemini 2.0 Flash 分析匹配度
- 顯示 ATS 匹配度評分（0-100 分）
- 列出缺少的關鍵字
- 提供 3-5 條具體改進建議

## 技術棧

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Google Gemini API (gemini-2.0-flash-exp)

## 快速開始

1. 安裝依賴：

```bash
npm install
```

2. 設定環境變數：

複製 `.env.local.example` 為 `.env.local`，並填入你的 Gemini API Key：

```
GEMINI_API_KEY=你的API金鑰
```

取得 API Key：https://aistudio.google.com/apikey

3. 啟動開發伺服器：

```bash
npm run dev
```

4. 開啟 http://localhost:3000 開始使用

## 專案結構

```
resume-optimizer/
├── app/
│   ├── api/analyze/route.ts   # Gemini 分析 API
│   ├── layout.tsx
│   ├── page.tsx               # 主頁面
│   └── globals.css
├── components/ui/             # Shadcn 組件
└── lib/utils.ts
```
