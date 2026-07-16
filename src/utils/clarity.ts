/**
 * Clarity is initialized via the official snippet in index.html.
 * This module is kept so callers can safely no-op if already loaded,
 * and so the project ID stays documented next to other analytics IDs.
 */
import { CLARITY_PROJECT_ID } from "./constants.ts";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

const clarityProjectId = (
  import.meta.env.VITE_CLARITY_PROJECT_ID ||
  CLARITY_PROJECT_ID ||
  ""
)
  .replace(/['"]/g, "")
  .trim();

export const initClarity = () => {
  if (!clarityProjectId || typeof window === "undefined") return;

  // Official snippet in index.html already injected the tag — do not load twice.
  if (document.querySelector(`script[src*="clarity.ms/tag/"]`)) return;
  if (typeof window.clarity === "function") return;

  const clarityStub = (...args: unknown[]) => {
    clarityStub.q = clarityStub.q || [];
    clarityStub.q.push(args);
  };
  clarityStub.q = [] as unknown[][];
  window.clarity = clarityStub;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  document.head.appendChild(script);
};
