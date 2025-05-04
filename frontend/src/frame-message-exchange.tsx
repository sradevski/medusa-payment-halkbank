import React, { useEffect, useRef } from "react"

interface FrameMessageExchangeProps {
  frameName: string
  onLoad: () => void
  onResponse: (response: { error?: any; data?: any }) => void
}

export const FrameMessageExchange = ({
  frameName,
  onLoad,
  onResponse,
}: FrameMessageExchangeProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!frameRef?.current) {
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "handshake_start") {
        frameRef?.current?.contentWindow?.postMessage(
          { type: "handshake_end" },
          "*"
        )
      } else if (event.data.type === "data") {
        onResponse(event.data.data)
      }
    }

    window.addEventListener("message", handleMessage, false)
    return () => window.removeEventListener("message", handleMessage, false)
  }, [frameRef, onResponse])

  return (
    <iframe
      style={{
        border: 0,
        padding: 0,
        margin: 0,
        height: 500,
        width: 620,
      }}
      ref={frameRef}
      name={frameName}
      onLoad={onLoad}
    />
  )
}
