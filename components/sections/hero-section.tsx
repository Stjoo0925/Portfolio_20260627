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
      <div className="w-full max-w-4xl">
        <p className="text-accent mb-4 font-mono text-[11px] uppercase tracking-[0.24em]">
          {hero.greeting}
        </p>

        <h1 className="font-display text-display-xl font-bold">
          <TextReveal text={hero.name} />
        </h1>

        <p className="mt-4 font-display text-2xl italic md:text-3xl">
          <RoleCycle roles={hero.roles} />
        </p>

        <p className="text-muted text-measure-wide mt-8 text-lg text-prose break-keep">
          {hero.tagline}
        </p>

        <Link
          href="/about"
          aria-label="Go to about"
          className="mt-16 inline-flex text-accent"
        >
          <Icon name="ArrowDown" size={20} className="animate-bounce" />
        </Link>
      </div>
    </ScrollSection>
  );
}
