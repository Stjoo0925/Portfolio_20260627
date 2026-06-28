"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TagListProps = {
  tags: string[];
  className?: string;
  itemClassName?: string;
  overflowClassName?: string;
};

/**
 * 태그를 한 줄에 맞춰 렌더링하고, 넘치는 태그는 `+n` 칩으로 합산한다.
 * 보이는 목록과 별개로 동일 폭의 보이지 않는 측정용 목록을 두어
 * 실제 줄바꿈 여부를 측정한 뒤 노출 개수를 결정한다.
 */
export function TagList({
  tags,
  className,
  itemClassName,
  overflowClassName,
}: TagListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const probeRef = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(tags.length);
  const [overflow, setOverflow] = useState(0);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    setWidth(ul.clientWidth);
    const ro = new ResizeObserver(() => setWidth(ul.clientWidth));
    ro.observe(ul);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const probe = probeRef.current;
    if (!probe || width === 0 || tags.length === 0) {
      setVisible(tags.length);
      setOverflow(0);
      return;
    }

    const items = Array.from(
      probe.querySelectorAll<HTMLElement>("[data-tag]"),
    );
    const chip = probe.querySelector<HTMLElement>("[data-chip]");
    if (items.length === 0) return;

    const firstTop = items[0].offsetTop;
    const hasOverflow = items.some((it) => it.offsetTop > firstTop);

    if (!hasOverflow) {
      setVisible(tags.length);
      setOverflow(0);
      return;
    }

    const gap = 8; // gap-2
    const chipWidth = chip?.offsetWidth ?? 0;
    const available = width;

    let used = 0;
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      const itemWidth = items[i].offsetWidth;
      const next = used + (used > 0 ? gap : 0) + itemWidth;
      if (next + gap + chipWidth <= available) {
        used = next;
        count = i + 1;
      } else {
        break;
      }
    }
    if (count < 1) count = 1;

    setVisible(count);
    setOverflow(tags.length - count);
  }, [tags, width]);

  return (
    <>
      <ul ref={listRef} className={cn("flex flex-wrap gap-2", className)}>
        {tags.slice(0, visible).map((t) => (
          <li key={t} data-tag className={itemClassName}>
            {t}
          </li>
        ))}
        {overflow > 0 && (
          <li className={overflowClassName}>+{overflow}</li>
        )}
      </ul>

      <ul
        ref={probeRef}
        aria-hidden
        className={cn(
          "pointer-events-none invisible absolute left-0 top-0 flex h-0 flex-wrap gap-2 overflow-hidden",
          className,
        )}
        style={{ width }}
      >
        {tags.map((t) => (
          <li key={t} data-tag className={itemClassName}>
            {t}
          </li>
        ))}
        <li data-chip className={overflowClassName}>
          +{tags.length}
        </li>
      </ul>
    </>
  );
}
