"use client";
import { useEffect, useState } from "react";

export function DebugViewport() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    setInfo({
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio,
      isMobile: /Android|iPhone/i.test(navigator.userAgent),
    });
  }, []);

  if (!info) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        background: "rgba(0,0,0,0.9)",
        color: "#00ff00",
        padding: "15px",
        fontSize: "16px",
        zIndex: 9999,
        fontFamily: "monospace",
        borderRadius: "0 0 8px 0",
      }}
    >
      <div>Width: {info.width}px</div>
      <div>Height: {info.height}px</div>
      <div>DPR: {info.dpr}</div>
      <div>Mobile: {info.isMobile ? "YES" : "NO"}</div>
      <div style={{ marginTop: "8px", fontSize: "12px", color: "#888" }}>
        {info.width < 500 ? "✓ Viewport working" : "✗ Viewport NOT working"}
      </div>
    </div>
  );
}
