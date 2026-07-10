import type { ValidationResult } from "./types";

export type HtmlStructureInput = {
  html: string;
};

// Void elements never require a closing tag per the HTML spec — excluding them
// from the stack check prevents false "unclosed tag" positives.
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;

type TagStackResult = { balanced: boolean; errors: string[] };

// This is intentionally NOT a full HTML parser: it does not understand
// implied-end-tag rules (e.g. a stray <p> auto-closing on <div>), does not
// validate attribute syntax, and treats content inside <script>/<style> as
// opaque so embedded `<` characters there don't confuse the stack. It is a
// best-effort balance check meant to catch gross structural errors (a section
// generator emitting a truncated template), not a spec-compliant validator.
function checkTagBalance(html: string): TagStackResult {
  const withoutOpaque = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  const withoutComments = withoutOpaque.replace(/<!--[\s\S]*?-->/g, "");

  const stack: string[] = [];
  const errors: string[] = [];
  let match: RegExpExecArray | null;

  TAG_PATTERN.lastIndex = 0;
  while ((match = TAG_PATTERN.exec(withoutComments)) !== null) {
    const [full, rawName, selfClosingSlash] = match;
    const name = rawName.toLowerCase();
    const isClosing = full.startsWith("</");
    const isSelfClosing = selfClosingSlash === "/" || VOID_ELEMENTS.has(name);

    if (isClosing) {
      const top = stack[stack.length - 1];
      if (top === name) {
        stack.pop();
      } else if (stack.includes(name)) {
        while (stack.length > 0 && stack[stack.length - 1] !== name) {
          errors.push(`unclosed tag <${stack.pop()}>`);
        }
        stack.pop();
      } else {
        errors.push(`closing tag </${name}> with no matching open tag`);
      }
    } else if (!isSelfClosing) {
      stack.push(name);
    }
  }

  while (stack.length > 0) {
    errors.push(`unclosed tag <${stack.pop()}>`);
  }

  return { balanced: errors.length === 0, errors };
}

function tryDomParserBalance(html: string): TagStackResult | null {
  if (typeof DOMParser === "undefined") return null;
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      return { balanced: false, errors: [parserError.textContent ?? "DOMParser reported an error"] };
    }
    return { balanced: true, errors: [] };
  } catch {
    return null;
  }
}

function hasReportTitleNode(html: string): boolean {
  return (
    /<title[^>]*>[^<]*\S[^<]*<\/title>/i.test(html) ||
    /data-report-title\b/i.test(html) ||
    /<h1\b[^>]*>[^<]*\S[^<]*<\/h1>/i.test(html)
  );
}

export function checkHtmlStructure(input: HtmlStructureInput): ValidationResult {
  const checkId = "html-structure";
  const label = "Rendered HTML is structurally sound";

  const balanceResult = tryDomParserBalance(input.html) ?? checkTagBalance(input.html);
  const hasTitle = hasReportTitleNode(input.html);

  if (balanceResult.balanced && hasTitle) {
    return { checkId, label, passed: true, severity: "blocking", message: "" };
  }

  const parts: string[] = [];
  if (!balanceResult.balanced) {
    parts.push(`HTML has unbalanced tags: ${balanceResult.errors.join("; ")}.`);
  }
  if (!hasTitle) {
    parts.push("No report title node found (expected a <title>, data-report-title element, or <h1>).");
  }

  return {
    checkId,
    label,
    passed: false,
    severity: "blocking",
    message: parts.join(" "),
    details: { tagBalanceErrors: balanceResult.errors, hasTitle },
  };
}
