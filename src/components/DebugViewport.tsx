"use client";
import { useEffect, useState } from "react";

export function DebugViewport() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio;
    const physicalWidth = Math.round(width * dpr);
    const physicalHeight = Math.round(height * dpr);
    
    setInfo({
      width,
      height,
      dpr,
      physicalWidth,
      physicalHeight,
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
      <div>CSS: {info.width} × {info.height}px</div>
      <div>Physical: {info.physicalWidth} × {info.physicalHeight}px</div>
      <div>DPR: {info.dpr}</div>
      <div>Mobile: {info.isMobile ? "YES" : "NO"}</div>
      <div style={{ marginTop: "8px", fontSize: "14px", color: "#ffff00" }}>
        {info.width <= 600 ? "✓ Viewport working" : "⚠ Check if UI looks right"}
      </div>
    </div>
  );
}
