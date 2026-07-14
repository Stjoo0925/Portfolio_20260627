import Link from "next/link";
import type { CSSProperties } from "react";
import { TextReveal } from "@/components/motion/text-reveal";
import { ScrollSection } from "@/components/ui/scroll-section";
import { RoleCycle } from "@/components/ui/role-cycle";
import { loadHero } from "@/lib/content/load";

function enterDelay(ms: number) {
  return { "--enter-delay": `${ms}ms` } as CSSProperties;
}

export function HeroSection() {
  const hero = loadHero();

  return (
    <ScrollSection id="hero">
      <div className="legacy-hero">
        <p className="legacy-hero__greeting hero-enter" style={enterDelay(80)}>
          {hero.greeting}
        </p>

        <h1 className="legacy-hero__title">
          <TextReveal text={hero.name} />
        </h1>

        <div
          className="legacy-hero__rule hero-rule"
          style={enterDelay(620)}
          aria-hidden
        />

        <p className="legacy-hero__role hero-enter" style={enterDelay(760)}>
          <RoleCycle roles={hero.roles} />
        </p>

        <p className="legacy-hero__tagline hero-enter" style={enterDelay(920)}>
          {hero.tagline}
        </p>

        <Link
          href="/about"
          aria-label="Go to about"
          className="legacy-hero__next hero-enter"
          style={enterDelay(1200)}
        >
          <span className="scroll-cue" aria-hidden />
        </Link>
      </div>
    </ScrollSection>
  );
}
