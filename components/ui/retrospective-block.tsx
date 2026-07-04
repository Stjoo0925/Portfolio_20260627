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
      <h4 className="retrospective-subheading">{title}</h4>
      <ul className="retrospective-list">
        {items.map((item) => (
          <li key={item}>
            <span>·</span>
            <span>{item}</span>
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
    <div className="retrospective-card">
      <h3 className="detail-heading">
        회고
      </h3>

      {filled ? (
        <div className="retrospective-content">
          {retrospective.overview?.trim() && (
            <p className="retrospective-copy">
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
              <h4 className="retrospective-subheading">
                다음에 개선할 점
              </h4>
              <p className="retrospective-copy">
                {retrospective.nextSteps}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="retrospective-empty">
          프로젝트 회고를 작성해 주세요. JSON의{" "}
          <code>retrospective</code> 필드에 내용을
          추가하면 여기에 표시됩니다.
        </p>
      )}
    </div>
  );
}
