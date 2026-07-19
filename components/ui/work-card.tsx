"use client";

type WorkCardProps = {
  kindLabel: "PROJECT" | "LAB";
  type: string;
  title: string;
  summary: string;
  tags: string[];
  selected?: boolean;
  onClick?: () => void;
  meta?: string;
  status?: string;
};

export function WorkCard({
  kindLabel,
  type,
  title,
  summary,
  tags,
  selected = false,
  onClick,
  meta,
  status,
}: WorkCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="work-row"
      data-selected={selected ? "true" : undefined}
      aria-expanded={selected}
    >
      <div className="work-row__identity">
        <span className="work-row__field-label">{kindLabel}</span>
        <div className="work-row__eyeline">
          <span>{type}</span>
          {status ? <span>{status}</span> : null}
        </div>
        <h3>{title}</h3>
      </div>

      <div className="work-row__details">
        {meta ? (
          <div>
            <span className="work-row__field-label">PERIOD</span>
            <p className="work-row__meta">{meta}</p>
          </div>
        ) : null}
        <div>
          <span className="work-row__field-label">SUMMARY</span>
          <p className="work-row__summary">{summary}</p>
        </div>
        <div>
          <span className="work-row__field-label">STACK</span>
          <p className="work-row__tags">{tags.join(" · ")}</p>
        </div>
      </div>

      <span className="work-row__action" aria-hidden="true">
        상세 보기 <span>→</span>
      </span>
    </button>
  );
}
