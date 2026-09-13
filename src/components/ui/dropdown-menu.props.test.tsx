import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const rootSpy = vi.fn();

vi.mock("@base-ui/react/menu", () => ({
  Menu: {
    Root: (props: Record<string, unknown>) => {
      rootSpy(props);
      return <div data-testid="root">{props.children as React.ReactNode}</div>;
    },
    Portal: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children?: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
    Positioner: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Popup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
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

import { DropdownMenu } from "./dropdown-menu";

describe("DropdownMenu props", () => {
  it("defaults desktop dropdowns to non-modal behavior", () => {
    render(<DropdownMenu>content</DropdownMenu>);

    expect(rootSpy).toHaveBeenCalledWith(expect.objectContaining({ modal: false }));
  });
});
