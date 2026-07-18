// Display labels for the article `kind` enum (content.config.ts / ARTICLE_KINDS).
// Shared by the KindTag chip and the stream-row `.wk` label so the wording stays
// in one place.
export const KIND_LABELS: Record<string, string> = {
  essay: 'essay',
  buildlog: 'build-log',
  incident: 'incident',
  architecture: 'architecture',
};

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}
