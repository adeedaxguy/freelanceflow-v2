import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NicheSelector from "@/components/NicheSelector";
import { NICHES } from "@/types";

describe("NicheSelector", () => {
  it("renders all niches", () => {
    render(<NicheSelector onChange={() => undefined} />);
    NICHES.forEach((niche) => {
      expect(screen.getByText(niche.label)).toBeInTheDocument();
    });
  });

  it("calls onChange with the correct niche id when clicked", () => {
    const handleChange = jest.fn();
    render(<NicheSelector onChange={handleChange} />);

    const webDevButton = screen.getByText("Web Development");
    fireEvent.click(webDevButton);

    expect(handleChange).toHaveBeenCalledWith("web-development");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("marks the selected niche with aria-checked=true", () => {
    render(<NicheSelector selected="ui-ux-design" onChange={() => undefined} />);

    const radioGroup = screen.getByRole("radiogroup");
    const checkedButtons = radioGroup.querySelectorAll('[aria-checked="true"]');
    expect(checkedButtons).toHaveLength(1);
  });

  it("marks non-selected niches with aria-checked=false", () => {
    render(<NicheSelector selected="web-development" onChange={() => undefined} />);

    const radioGroup = screen.getByRole("radiogroup");
    const uncheckedButtons = radioGroup.querySelectorAll('[aria-checked="false"]');
    expect(uncheckedButtons).toHaveLength(NICHES.length - 1);
  });

  it("renders no selected niche when selected is undefined", () => {
    render(<NicheSelector onChange={() => undefined} />);
    const checkedButtons = screen.queryAllByRole("radio", { checked: true });
    expect(checkedButtons).toHaveLength(0);
  });

  it("updates selection on repeated clicks", () => {
    const handleChange = jest.fn();
    render(<NicheSelector onChange={handleChange} />);

    fireEvent.click(screen.getByText("SEO & Content"));
    fireEvent.click(screen.getByText("Copywriting"));

    expect(handleChange).toHaveBeenNthCalledWith(1, "seo");
    expect(handleChange).toHaveBeenNthCalledWith(2, "copywriting");
  });
});
