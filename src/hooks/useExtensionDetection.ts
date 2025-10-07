import { useEffect, useState } from "react";

interface ExtensionInfo {
  name: string;
  detected: boolean;
  interference: "high" | "medium" | "low";
  description: string;
}

interface ExtensionDetectionResult {
  problematicExtensions: ExtensionInfo[];
  hasInterference: boolean;
  suggestions: string[];
}

export const useExtensionDetection = (): ExtensionDetectionResult => {
  const [detectedExtensions, setDetectedExtensions] = useState<ExtensionInfo[]>(
    [],
  );

  useEffect(() => {
    const detectExtensions = () => {
      const extensions: ExtensionInfo[] = [];

      // Check for Avast/AVG antivirus extensions
      if (typeof window !== "undefined") {
        try {
          // Check for AT-SDK (Avast/AVG)
          const avastDetected =
            document.querySelector("[data-avast]") ||
            window.navigator.userAgent.includes("AVAST") ||
            // Check for Avast-specific errors in console
            console.error
              .toString()
              .includes("AT-SDK") ||
            // Check for global Avast objects
            (window as any).avast ||
            (window as any).AVAST;

          if (avastDetected) {
            extensions.push({
              name: "Avast/AVG Antivirus",
              detected: true,
              interference: "high",
              description:
                "Known to interfere with WebGL contexts and 3D graphics",
            });
          }

          // Check for content security extensions (WAX, etc.)
          const contentSecurityDetected =
            document.querySelector("[data-wax]") ||
            document.querySelector("[data-cs]") ||
            (window as any).WAX ||
            (window as any).ContentSecurity;

          if (contentSecurityDetected) {
            extensions.push({
              name: "Content Security Extension",
              detected: true,
              interference: "medium",
              description: "May interfere with page content and WebGL contexts",
            });
          }

          // Check for ad blockers that might interfere
          const adBlockerDetected =
            (window as any).uBlock ||
            (window as any).AdBlock ||
            document.querySelector("[data-adblock]");

          if (adBlockerDetected) {
            extensions.push({
              name: "Ad Blocker",
              detected: true,
              interference: "low",
              description: "Some ad blockers may interfere with 3D content",
            });
          }

          // Check for general extension interference patterns
          const extensionErrors = [
            "runtime.lastError",
            "message port closed",
            "Unable to add filesystem",
            "ContentIsolatedWorld",
            "AT-SDK disabled",
          ];

          const hasExtensionErrors = extensionErrors.some((error) => {
            // Check recent console messages for extension-related errors
            return (
              console.error.toString().includes(error) ||
              console.warn.toString().includes(error)
            );
          });

          if (hasExtensionErrors && extensions.length === 0) {
            extensions.push({
              name: "Unknown Browser Extension",
              detected: true,
              interference: "medium",
              description:
                "Detected extension-related interference with page functionality",
            });
          }

          // Check for Transparent Zen or similar themes
          const themeExtensionDetected =
            document.documentElement.style.getPropertyValue(
              "--zen-logo-path",
            ) || document.documentElement.classList.contains("tz-hidden");

          if (themeExtensionDetected) {
            extensions.push({
              name: "Transparent Zen Theme",
              detected: true,
              interference: "medium",
              description:
                "Browser theme that modifies page appearance and may affect functionality",
            });
          }
        } catch (error) {
          // Extension detection itself might be blocked
          console.warn("Extension detection partially blocked:", error);
        }
      }

      setDetectedExtensions(extensions);
    };

    // Initial detection
    detectExtensions();

    // Re-check after page load and extension initialization
    const timeouts = [
      setTimeout(detectExtensions, 1000),
      setTimeout(detectExtensions, 3000),
      setTimeout(detectExtensions, 5000),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const problematicExtensions = detectedExtensions.filter(
    (ext) => ext.interference === "high" || ext.interference === "medium",
  );

  const hasInterference = problematicExtensions.length > 0;

  const suggestions = [
    "Try refreshing the page to restore 3D graphics",
    "Temporarily disable browser extensions to test functionality",
    "Use an incognito/private browsing window (extensions disabled by default)",
    "Whitelist this site in your antivirus/security extensions",
    "Update your browser extensions to the latest versions",
  ];

  return {
    problematicExtensions,
    hasInterference,
    suggestions,
  };
};
