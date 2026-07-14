import type { CSSProperties } from "react";

export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="text-reveal__mask">
          <span
            className="text-reveal__word"
            style={{ "--word-index": index } as CSSProperties}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
