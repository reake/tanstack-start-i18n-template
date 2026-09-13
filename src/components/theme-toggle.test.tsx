import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

vi.mock("~/lib/i18n", () => ({
  useTranslations: () => ({
    theme: {
      toggle: "Toggle theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
  }),
}));

vi.mock("~/components/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("ThemeToggle motion classes", () => {
  it("avoids transition-all on toggle icons", () => {
    const { container } = render(<ThemeToggle />);
    screen.getByRole("button", { name: "Toggle theme" });

    const iconClasses = Array.from(container.querySelectorAll("svg"))
      .map((icon) => icon.getAttribute("class") ?? "")
      .join(" ");

    expect(iconClasses).not.toContain("transition-all");
  });
});
