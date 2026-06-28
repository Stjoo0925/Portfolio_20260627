import type { Retrospective } from "@/lib/content/schema";

function hasContent(value: Retrospective) {
  return (
    Boolean(value.overview?.trim()) ||
    (value.learnings?.length ?? 0) > 0 ||
    (value.challenges?.length ?? 0) > 0 ||
    Boolean(value.nextSteps?.trim())
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-foreground/80">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-relaxed text-foreground/75"
          >
            <span className="text-accent mt-0.5 shrink-0">·</span>
            <span className="min-w-0 flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RetrospectiveBlock({
  retrospective,
}: {
  retrospective?: Retrospective;
}) {
  if (!retrospective) return null;

  const filled = hasContent(retrospective);

  return (
    <div className="mt-10 rounded-2xl border border-border bg-background/40 p-6">
      <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
        회고
      </h3>

      {filled ? (
        <div className="mt-4 space-y-6">
          {retrospective.overview?.trim() && (
            <p className="text-measure-wide text-sm leading-relaxed text-foreground/85">
              {retrospective.overview}
            </p>
          )}
          <ListSection title="배운 점" items={retrospective.learnings ?? []} />
          <ListSection
            title="어려웠던 점"
            items={retrospective.challenges ?? []}
          />
          {retrospective.nextSteps?.trim() && (
            <div>
              <h4 className="text-sm font-medium text-foreground/80">
                다음에 개선할 점
              </h4>
              <p className="text-measure-wide mt-2 text-sm leading-relaxed text-foreground/75">
                {retrospective.nextSteps}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          프로젝트 회고를 작성해 주세요. JSON의{" "}
          <code className="text-accent/90">retrospective</code> 필드에 내용을
          추가하면 여기에 표시됩니다.
        </p>
      )}
    </div>
  );
}
