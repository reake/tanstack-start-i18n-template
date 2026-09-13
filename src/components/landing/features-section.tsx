import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  features: Feature[];
}

export function FeaturesSection({ title = "Features", features }: FeaturesSectionProps) {
  return (
    <section className="bg-muted/30 py-8 sm:py-10 md:py-14">
      <div className="container">
        <h2 className="mb-6 text-center text-lg font-bold sm:mb-8 sm:text-xl md:text-2xl">
          {title}
        </h2>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={`${feature.title}-${feature.description}`} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm sm:p-4">
      <div className="bg-primary/10 mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}
