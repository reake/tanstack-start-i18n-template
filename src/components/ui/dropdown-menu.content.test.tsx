import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const popupSpy = vi.fn();
const positionerSpy = vi.fn();

vi.mock("@base-ui/react/menu", () => ({
  Menu: {
    Root: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Portal: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children?: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
    Positioner: (props: Record<string, unknown>) => {
      positionerSpy(props);
      return <div>{props.children as React.ReactNode}</div>;
    },
    Popup: (props: Record<string, unknown>) => {
      popupSpy(props);
      return <div>{props.children as React.ReactNode}</div>;
    },
    Item: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Group: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    GroupLabel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SubmenuRoot: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SubmenuTrigger: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    CheckboxItem: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    CheckboxItemIndicator: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    RadioGroup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    RadioItem: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    RadioItemIndicator: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Separator: () => <div />,
  },
}));

import { DropdownMenuContent } from "./dropdown-menu";

describe("DropdownMenuContent classes", () => {
  it("avoids anchor-width sizing and disables pointer events when closed", () => {
    render(<DropdownMenuContent>content</DropdownMenuContent>);

    expect(positionerSpy).toHaveBeenCalled();
    expect(popupSpy).toHaveBeenCalled();

    const popupProps = popupSpy.mock.calls[0]?.[0] as { className?: string };
    expect(popupProps.className).not.toContain("w-(--anchor-width)");
    expect(popupProps.className).toContain("data-closed:pointer-events-none");
  });
});
