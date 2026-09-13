import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";

interface LegalSection {
  title: string;
  body: string;
}

interface HighlightsBlock {
  title: string;
  items: string[];
}

interface LegalPageLayoutProps {
  heroTitle: string;
  heroDescription: string;
  sections: LegalSection[];
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  tocTitle: string;
  highlights?: HighlightsBlock;
}

function toAnchorId(title: string, index: number) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-");
  return normalized || `section-${index + 1}`;
}

export function LegalPageLayout({
  heroTitle,
  heroDescription,
  sections,
  contactTitle,
  contactDescription,
  contactEmail,
  tocTitle,
  highlights,
}: LegalPageLayoutProps) {
  const [contactPrefix, contactSuffix] = contactDescription.split("{email}");

  const sectionAnchors = sections.map((section, index) => ({
    id: toAnchorId(section.title, index),
    label: section.title,
  }));
  const highlightsAnchor = highlights
    ? `${toAnchorId(highlights.title, 999)}-highlights`
    : "";
  const contactAnchor = "contact";

  return (
    <div className="page-atmo flex min-h-screen flex-col">
      <SiteHeader />

      <section className="page-hero">
        <div className="container">
          <div className="page-hero-copy page-reveal">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {heroTitle}
            </h1>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-reveal container py-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="space-y-5 text-sm md:text-base">
            {sections.map((section, index) => (
              <section
                id={sectionAnchors[index]?.id}
                key={section.title}
                className="bg-background/85 scroll-mt-24 space-y-2 rounded-xl border p-5 md:p-6"
              >
                <h2 className="text-lg font-semibold md:text-xl">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </section>
            ))}

            {highlights ? (
              <section
                id={highlightsAnchor}
                className="bg-background/85 scroll-mt-24 space-y-3 rounded-xl border p-5 md:p-6"
              >
                <h2 className="text-lg font-semibold md:text-xl">{highlights.title}</h2>
                <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
                  {highlights.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section
              id={contactAnchor}
              className="bg-background/85 scroll-mt-24 space-y-2 rounded-xl border p-5 md:p-6"
            >
              <h2 className="text-lg font-semibold md:text-xl">{contactTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {contactPrefix}
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
                {contactSuffix}
              </p>
            </section>
          </article>

          <aside className="hidden lg:block">
            <nav
              className="bg-background/90 sticky top-20 rounded-xl border p-4"
              aria-label={tocTitle}
            >
              <p className="text-foreground mb-3 text-sm font-semibold">{tocTitle}</p>
              <ul className="space-y-2 text-sm">
                {sectionAnchors.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                {highlights ? (
                  <li>
                    <a
                      href={`#${highlightsAnchor}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {highlights.title}
                    </a>
                  </li>
                ) : null}
                <li>
                  <a
                    href={`#${contactAnchor}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {contactTitle}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
