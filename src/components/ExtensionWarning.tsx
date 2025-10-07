"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { useExtensionDetection } from "@/hooks/useExtensionDetection";

export const ExtensionWarning = () => {
  const { problematicExtensions, hasInterference, suggestions } =
    useExtensionDetection();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no interference detected or user dismissed
  if (!hasInterference || dismissed) {
    return null;
  }

  const highInterferenceExtensions = problematicExtensions.filter(
    (ext) => ext.interference === "high",
  );
  const isHighRisk = highInterferenceExtensions.length > 0;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${
        isHighRisk ? "bg-red-500/95" : "bg-yellow-500/95"
      } text-white rounded-lg shadow-lg border border-white/20`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <h3 className="font-semibold text-sm">
              {isHighRisk
                ? "Browser Extension Interference"
                : "Potential Extension Issues"}
            </h3>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-1"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm mb-3">
          <p className="mb-2">
            Detected extensions that may interfere with 3D graphics:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {problematicExtensions.map((ext, index) => (
              <li key={index}>
                <span className="font-medium">{ext.name}</span>
                {ext.interference === "high" && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    High Impact
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <button
            onClick={() => {
              // Open a new incognito window (where available)
              if (navigator.userAgent.includes("Chrome")) {
                alert(
                  "Try opening this page in an Incognito window (Ctrl+Shift+N) to disable extensions.",
                );
              } else if (navigator.userAgent.includes("Firefox")) {
                alert(
                  "Try opening this page in a Private window (Ctrl+Shift+P) to disable extensions.",
                );
              } else {
                alert(
                  "Try opening this page in a private/incognito window to disable extensions.",
                );
              }
            }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
          >
            Try Incognito
          </button>
        </div>

        {isHighRisk && (
          <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/90">
            <p>
              <strong>Tip:</strong> Temporarily disable security extensions or
              add this site to your whitelist for the best experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
