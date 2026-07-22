"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLButtonElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(
    400px circle at ${mouseX}px ${mouseY}px,
    rgba(216, 216, 224, 0.08),
    transparent 80%
  )`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className="work-row relative overflow-hidden"
      data-selected={selected ? "true" : undefined}
      aria-expanded={selected}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlightBackground }}
      />
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
    </motion.button>
  );
}

