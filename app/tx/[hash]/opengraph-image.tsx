import { ImageResponse } from "next/og"

import { loadStory } from "@/lib/ethereum"
import { shortHex } from "@/lib/formatters"

export const alt = "unhash"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash } = await params
  const [result, font] = await Promise.all([loadStory(hash), loadFont()])
  const headline =
    result.kind === "ready" || result.kind === "pending"
      ? result.story.headline
      : shortHex(hash)
  const lead =
    result.kind === "ready" || result.kind === "pending"
      ? result.story.lead
      : "A transaction on Ethereum"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ededed",
          padding: "72px 80px",
          fontFamily: font ? "Inter" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#8a8a8a" }}>unhash</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#8a8a8a" }}>{lead}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Inter", data: font, style: "normal", weight: 600 }]
        : [],
    },
  )
}

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.8/latin-600-normal.ttf",
    )
    if (!response.ok) return null
    return response.arrayBuffer()
  } catch {
    return null
  }
}
