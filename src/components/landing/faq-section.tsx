import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  items: FAQItem[];
}

export function FAQSection({
  title = "Frequently Asked Questions",
  description,
  items,
}: FAQSectionProps) {
  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <h2 className="mb-8 text-center text-xl font-bold sm:mb-10 md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mx-auto mb-6 max-w-3xl text-center text-sm sm:text-base">
            {description}
          </p>
        )}
        <div className="mx-auto max-w-5xl space-y-3 sm:space-y-4">
          {items.map((item) => (
            <FAQItem key={`${item.question}-${item.answer}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: FAQItem) {
  return (
    <details className="bg-background rounded-lg border">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between p-3 text-left text-sm font-medium sm:p-4 sm:text-base [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="text-muted-foreground h-5 w-5" />
      </summary>
      <div className="text-muted-foreground px-3 pb-3 text-xs sm:px-4 sm:pb-4 sm:text-sm">
        {answer}
      </div>
    </details>
  );
}
