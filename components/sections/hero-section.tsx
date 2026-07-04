import Link from "next/link";
import { TextReveal } from "@/components/motion/text-reveal";
import { ScrollSection } from "@/components/ui/scroll-section";
import { RoleCycle } from "@/components/ui/role-cycle";
import { Icon } from "@/components/ui/icon";
import { loadHero } from "@/lib/content/load";

export function HeroSection() {
  const hero = loadHero();

  return (
    <ScrollSection id="hero">
      <div className="legacy-hero">
        <p className="legacy-hero__greeting">
          {hero.greeting}
        </p>

        <h1 className="legacy-hero__title">
          <TextReveal text={hero.name} />
        </h1>

        <p className="legacy-hero__role">
          <RoleCycle roles={hero.roles} />
        </p>

        <p className="legacy-hero__tagline">
          {hero.tagline}
        </p>

        <Link
          href="/about"
          aria-label="Go to about"
          className="legacy-hero__next"
        >
          <Icon name="ArrowDown" size={20} className="animate-bounce" />
        </Link>
      </div>
    </ScrollSection>
  );
}
