"use client";

import { Component, useState, useTransition, type ReactNode } from "react";
import {
  updateSectionContent,
  toggleSectionEnabled,
  reorderSection,
  regenerateSection,
} from "@/app/admin/(protected)/reports/[id]/editor/actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionRenderer } from "@/components/report/section-renderer";
import type { SectionType } from "@/types/report";

const GENERATABLE: Partial<Record<SectionType, true>> = {
  month_over_month_snapshot: true,
  audience: true,
  search_visibility: true,
};

export function SectionEditorCard({
  reportId,
  section,
}: {
  reportId: string;
  section: {
    id: string;
    section_type: string;
    enabled: boolean;
    content_json: Record<string, unknown>;
  };
}) {
  const [text, setText] = useState(JSON.stringify(section.content_json, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateSectionContent(reportId, section.id, text);
      setError(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{section.section_type.replace(/_/g, " ")}</CardTitle>
          <Badge tone={section.enabled ? "green" : "neutral"}>{section.enabled ? "Enabled" : "Hidden"}</Badge>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => reorderSection(reportId, section.id, "up")}>
            ↑
          </Button>
          <Button size="sm" variant="ghost" onClick={() => reorderSection(reportId, section.id, "down")}>
            ↓
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toggleSectionEnabled(reportId, section.id, !section.enabled)}
          >
            {section.enabled ? "Hide" : "Show"}
          </Button>
          {GENERATABLE[section.section_type as SectionType] && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                startTransition(() =>
                  regenerateSection(reportId, section.id, section.section_type as SectionType),
                )
              }
            >
              Restore generated
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            className="w-full rounded-md border border-border-subtle bg-surface-muted p-3 font-mono text-xs outline-none focus:border-brand-pink"
          />
          {error && <p className="mt-1 text-sm text-[#c02929]">{error}</p>}
          <Button size="sm" className="mt-2" onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save content"}
          </Button>
        </div>
        {showPreview && (
          <div className="overflow-auto rounded-md border border-border-subtle bg-background p-3" style={{ maxHeight: 480 }}>
            <SafeSectionPreview sectionType={section.section_type as SectionType} content={parseOrNull(text)} />
          </div>
        )}
      </div>
    </Card>
  );
}

function parseOrNull(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-xs text-[#c02929]">Content doesn&apos;t match this section&apos;s expected shape yet.</p>
      );
    }
    return this.props.children;
  }
}

function SafeSectionPreview({
  sectionType,
  content,
}: {
  sectionType: SectionType;
  content: Record<string, unknown> | null;
}) {
  if (!content) return <p className="text-xs text-[#c02929]">Invalid JSON — preview unavailable.</p>;
  return (
    <PreviewErrorBoundary>
      <SectionRenderer sectionType={sectionType} order="—" content={content} />
    </PreviewErrorBoundary>
  );
}
