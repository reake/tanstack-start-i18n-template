import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "~/components/legal/legal-page-layout";
import {
  getMessages,
  loadLocaleMessageCatalog,
  resolveLocale,
  useTranslations,
  withLocalePath,
} from "~/lib/i18n";
import { generateCanonicalLink, generateSeoMeta } from "~/lib/seo";
import { siteConfig } from "~/site.config";

export const Route = createFileRoute("/{-$locale}/(pages)/about")({
  head: async ({ params }) => {
    const locale = resolveLocale(params?.locale);
    await loadLocaleMessageCatalog(locale);
    const t = getMessages("about", locale);
    const path = withLocalePath("/about", locale);

    return {
      meta: generateSeoMeta({
        title: t.meta.title,
        description: t.meta.description,
        keywords: t.meta.keywords,
        path,
      }),
      links: [generateCanonicalLink(path)],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const t = useTranslations("about");
  const common = useTranslations("common");

  return (
    <LegalPageLayout
      heroTitle={t.hero.title}
      heroDescription={t.hero.description}
      sections={t.sections}
      highlights={t.highlights}
      contactTitle={t.contact.title}
      contactDescription={t.contact.description}
      contactEmail={siteConfig.email}
      tocTitle={common.onThisPage}
    />
  );
}
