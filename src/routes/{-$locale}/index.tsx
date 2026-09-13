import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Braces,
  FileText,
  Globe2,
  Languages,
  LayoutTemplate,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { FAQSection } from "~/components/landing/faq-section";
import { StepsSection } from "~/components/landing/steps-section";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { Button } from "~/components/ui/button";
import {
  getMessages,
  loadLocaleMessageCatalog,
  resolveLocale,
  useLocale,
  useTranslations,
  withLocalePath,
} from "~/lib/i18n";
import {
  generateCanonicalLink,
  generateFaqJsonLd,
  generateSeoMeta,
  generateWebsiteJsonLd,
} from "~/lib/seo";

export const Route = createFileRoute("/{-$locale}/")({
  head: async ({ params }) => {
    const locale = resolveLocale(params?.locale);
    await loadLocaleMessageCatalog(locale);
    const t = getMessages("index", locale);
    const path = withLocalePath("/", locale);
    const faqJsonLd = generateFaqJsonLd(t.faq.items);

    return {
      meta: generateSeoMeta({
        title: t.meta.title,
        description: t.meta.description,
        keywords: t.meta.keywords,
        path,
      }),
      links: [generateCanonicalLink(path)],
      scripts: [
        { type: "application/ld+json", children: generateWebsiteJsonLd(locale) },
        ...(faqJsonLd ? [{ type: "application/ld+json", children: faqJsonLd }] : []),
      ],
    };
  },
  component: HomePage,
});

const highlightIcons = [Languages, Search, FileText];
const featureIcons = [Globe2, Search, Braces, FileText, LayoutTemplate, Sparkles];

function HomePage() {
  const locale = useLocale();
  const t = useTranslations("index");

  const highlights = t.highlights.items.map((item, index) => ({
    ...item,
    icon: highlightIcons[index] ?? Sparkles,
  }));
  const features = t.features.items.map((feature, index) => ({
    ...feature,
    icon: featureIcons[index] ?? Sparkles,
  }));

  return (
    <div className="landing-root flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="landing-hero landing-hero-compact">
          <div className="container">
            <div className="landing-hero-copy landing-hero-copy-center">
              <span
                className="landing-eyebrow landing-reveal"
                style={{ animationDelay: "0.05s" }}
              >
                {t.hero.badge}
              </span>
              <h1
                className="landing-display landing-reveal"
                style={{ animationDelay: "0.12s" }}
              >
                {t.hero.title}{" "}
                <span className="landing-display-highlight">{t.hero.highlight}</span>
              </h1>
              <p
                className="landing-lead landing-reveal"
                style={{ animationDelay: "0.2s" }}
              >
                {t.hero.description}
              </p>
              <div
                className="landing-hero-actions landing-reveal"
                style={{ animationDelay: "0.28s" }}
              >
                <Button
                  size="lg"
                  className="landing-primary-button"
                  render={<Link to={withLocalePath("/blog", locale)} />}
                  nativeButton={false}
                >
                  {t.hero.primaryCta}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="landing-secondary-button"
                  render={<Link to={withLocalePath("/about", locale)} />}
                  nativeButton={false}
                >
                  {t.hero.secondaryCta}
                </Button>
              </div>
              <div
                className="landing-hero-highlights landing-reveal"
                style={{ animationDelay: "0.36s" }}
              >
                {highlights.map((item) => (
                  <div className="landing-highlight" key={item.title}>
                    <span className="landing-highlight-icon">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="landing-highlight-title block">{item.title}</span>
                      <span className="landing-highlight-desc block">
                        {item.description}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="container">
            <div className="landing-section-heading landing-section-heading-center">
              <h2 className="landing-section-title">{t.features.title}</h2>
              <p className="landing-section-lead">{t.features.description}</p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature, index) => (
                <div
                  key={`${feature.title}-${feature.description}`}
                  className="landing-feature-card"
                >
                  <div className="landing-feature-top">
                    <span className="landing-feature-icon">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <span className="landing-feature-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="landing-feature-title">{feature.title}</h3>
                  <p className="landing-feature-desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="landing-steps">
          <StepsSection title={t.steps.title} steps={t.steps.items} />
        </div>

        <div className="landing-faq">
          <FAQSection title={t.faq.title} items={t.faq.items} />
        </div>

        <section className="landing-cta">
          <div className="container">
            <div className="landing-cta-inner">
              <div>
                <h2 className="landing-cta-title">{t.cta.title}</h2>
                <p className="landing-cta-desc">{t.cta.description}</p>
              </div>
              <div className="landing-cta-actions">
                <Button
                  size="lg"
                  className="landing-primary-button"
                  render={<Link to={withLocalePath("/blog", locale)} />}
                  nativeButton={false}
                >
                  {t.cta.primaryLabel}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="landing-secondary-button"
                  render={<Link to={withLocalePath("/about", locale)} />}
                  nativeButton={false}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t.cta.secondaryLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
