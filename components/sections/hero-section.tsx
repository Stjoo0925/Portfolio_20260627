import Link from "next/link";
import { ScrollSection } from "@/components/ui/scroll-section";
import { RoleCycle } from "@/components/ui/role-cycle";
import { Icon } from "@/components/ui/icon";
import { loadHero } from "@/lib/content/load";

export function HeroSection() {
  const hero = loadHero();

  return (
    <ScrollSection id="hero">
      <div className="max-w-3xl">
        <p className="text-accent mb-6 font-mono text-xs uppercase tracking-[0.3em]">
          {hero.greeting}
        </p>
        <h1 className="font-display text-6xl leading-[1.02] font-bold md:text-8xl">
          {hero.name}
        </h1>
        <p className="mt-4 font-display text-2xl italic md:text-3xl">
          <RoleCycle roles={hero.roles} />
        </p>
        <p className="text-muted mt-8 max-w-xl text-lg">{hero.tagline}</p>

        <div className="mt-10 flex flex-wrap gap-4">
          {hero.cta.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="accent-glow flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-6 py-3 text-sm font-medium transition-colors hover:bg-accent/20"
            >
              {c.label}
            </Link>
          ))}
        </div>

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
