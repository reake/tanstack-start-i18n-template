import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button motion classes", () => {
  it("uses scoped transition properties instead of transition-all", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    const className = button.getAttribute("class") ?? "";

    expect(className).not.toContain("transition-all");
    expect(className).toContain("transition-");
  });
});
