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
  if (document.querySelector(`script[src*="clarity.ms/tag/"]`)) return;

  if (!window.clarity) {
    const clarityStub = (...args: unknown[]) => {
      clarityStub.q = clarityStub.q || [];
      clarityStub.q.push(args);
    };
    clarityStub.q = [] as unknown[][];
    window.clarity = clarityStub;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
};
