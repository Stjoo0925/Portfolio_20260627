import { FadeIn } from "@/components/motion/fade-in";
import { Icon } from "@/components/ui/icon";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadContact } from "@/lib/content/load";

export function ContactSection() {
  const contact = loadContact();

  return (
    <ScrollSection id="contact">
      <FadeIn className="max-w-2xl">
        <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
          {contact.label}
        </p>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          {contact.title}
        </h2>
        <p className="text-muted mt-6 text-lg">{contact.body}</p>

        <dl className="mt-8 space-y-4">
          <div>
            <dt className="text-muted font-mono text-xs uppercase tracking-widest">
              Email
            </dt>
            <dd className="mt-1">
              <a
                href={`mailto:${contact.email}`}
                className="text-accent star-glow transition-opacity hover:opacity-80"
              >
                {contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted font-mono text-xs uppercase tracking-widest">
              Location
            </dt>
            <dd className="mt-1 text-foreground/90">{contact.location}</dd>
          </div>
        </dl>

        <div className="mt-10">
          <p className="text-muted mb-4 font-mono text-xs uppercase tracking-widest">
            Social
          </p>
          <div className="flex gap-6">
            {contact.channels
              .filter((c) => c.href)
              .map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition-colors hover:text-accent"
                  aria-label={c.name}
                >
                  <Icon name={c.icon} size={22} />
                </a>
              ))}
            {contact.channels.every((c) => !c.href) && (
              <div className="flex gap-6 opacity-50">
                {contact.channels.map((c) => (
                  <span
                    key={c.name}
                    className="text-muted"
                    title={`${c.name} (URL 미설정)`}
                    aria-label={c.name}
                  >
                    <Icon name={c.icon} size={22} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
