interface StepItem {
  title: string;
  description: string;
}

interface StepsSectionProps {
  title: string;
  steps: StepItem[];
}

export function StepsSection({ title, steps }: StepsSectionProps) {
  if (!steps?.length) return null;

  return (
    <section className="py-8 sm:py-10 md:py-14">
      <div className="container">
        <h2 className="mb-6 text-center text-xl font-bold sm:mb-8 sm:text-xl md:text-2xl">
          {title}
        </h2>
        <div className="mx-auto grid max-w-3xl gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title ?? index} className="text-center">
              <div className="bg-primary text-primary-foreground mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full font-bold sm:h-10 sm:w-10">
                {index + 1}
              </div>
              <h3 className="mb-1 text-sm font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
