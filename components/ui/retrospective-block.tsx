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
      <h4 className="text-foreground/80 text-sm font-medium">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-foreground/75 flex gap-2 text-sm leading-relaxed"
          >
            <span className="text-accent shrink-0">·</span>
            {item}
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
            <p className="text-foreground/85 text-sm leading-relaxed">
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
              <h4 className="text-foreground/80 text-sm font-medium">
                다음에 개선할 점
              </h4>
              <p className="text-foreground/75 mt-2 text-sm leading-relaxed">
                {retrospective.nextSteps}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted mt-4 text-sm leading-relaxed">
          프로젝트 회고를 작성해 주세요. JSON의{" "}
          <code className="text-accent/90">retrospective</code> 필드에 내용을
          추가하면 여기에 표시됩니다.
        </p>
      )}
    </div>
  );
}
