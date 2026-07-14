"use client";

import { useEffect, useState } from "react";

const CYCLE_MS = 3600;
const EXIT_MS = 420;

export function RoleCycle({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (roles.length < 2) return;

    let swap: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setLeaving(true);
      swap = setTimeout(() => {
        setIndex((current) => (current + 1) % roles.length);
        setLeaving(false);
      }, EXIT_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(cycle);
      clearTimeout(swap);
    };
  }, [roles.length]);

  return (
    <span className="role-cycle">
      <span className="role-cycle__viewport">
        <span
          key={index}
          className="role-cycle-text"
          data-leaving={leaving ? "true" : undefined}
        >
          {roles[index] ?? ""}
        </span>
      </span>
      <span className="role-cycle__caret" aria-hidden />
    </span>
  );
}
