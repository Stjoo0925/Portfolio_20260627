"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function RoleCycle({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (roles.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % roles.length),
      2400,
    );
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-accent star-glow inline-block font-display italic"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
