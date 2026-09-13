import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function DropdownHarness() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button">Open menu</button>} />
      <DropdownMenuContent>
        <DropdownMenuItem>First item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("does not lock page scrolling when opened", () => {
    render(<DropdownHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });
});
