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
    
    // Check if viewport meta tag exists
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const viewportContent = viewportMeta?.getAttribute('content') || 'NOT FOUND';
    
    setInfo({
      width,
      height,
      dpr,
      physicalWidth,
      physicalHeight,
      isMobile: /Android|iPhone/i.test(navigator.userAgent),
      viewportContent,
      hasViewportTag: !!viewportMeta,
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
      <div>
        CSS: {info.width} × {info.height}px
      </div>
      <div>
        Physical: {info.physicalWidth} × {info.physicalHeight}px
      </div>
      <div>DPR: {info.dpr}</div>
      <div>Mobile: {info.isMobile ? "YES" : "NO"}</div>
      <div style={{ marginTop: "8px", fontSize: "12px", borderTop: "1px solid #333", paddingTop: "8px" }}>
        <div style={{ color: info.hasViewportTag ? "#0f0" : "#f00", fontWeight: "bold" }}>
          Meta tag: {info.hasViewportTag ? "✓ FOUND" : "✗ MISSING"}
        </div>
        <div style={{ fontSize: "10px", color: "#888", marginTop: "4px", wordBreak: "break-all" }}>
          {info.viewportContent}
        </div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "14px", color: "#ffff00" }}>
        {info.width <= 600 ? "✓ Viewport working" : "⚠ UI looks wrong"}
      </div>
    </div>
  );
}
