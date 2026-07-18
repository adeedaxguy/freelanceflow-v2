import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NicheSelector from "@/components/NicheSelector";
import { NICHES } from "@/types";

describe("NicheSelector", () => {
  it("renders all niches", () => {
    render(<NicheSelector onChange={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));

    NICHES.forEach((niche) => {
      expect(screen.getByText(niche.label)).toBeInTheDocument();
    });
  });

  it("calls onChange with the correct niche id when clicked", () => {
    const handleChange = jest.fn();
    render(<NicheSelector onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));

    const webDevButton = screen.getByText("Web Development");
    fireEvent.click(webDevButton);

    expect(handleChange).toHaveBeenCalledWith(["web-development"]);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("marks the selected niche with aria-selected=true", () => {
    render(<NicheSelector selected={["ui-ux-design"]} onChange={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));

    const listbox = screen.getByRole("listbox");
    const selectedOptions = listbox.querySelectorAll('[aria-selected="true"]');
    expect(selectedOptions).toHaveLength(1);
  });

  it("marks non-selected niches with aria-selected=false", () => {
    render(<NicheSelector selected={["web-development"]} onChange={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));

    const listbox = screen.getByRole("listbox");
    const unselectedOptions = listbox.querySelectorAll('[aria-selected="false"]');
    expect(unselectedOptions).toHaveLength(NICHES.length - 1);
  });

  it("renders no selected niche when selected is undefined", () => {
    render(<NicheSelector onChange={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));

    const selectedOptions = screen.queryAllByRole("option", { selected: true });
    expect(selectedOptions).toHaveLength(0);
  });

  it("updates selection on repeated clicks", () => {
    const handleChange = jest.fn();
    render(<NicheSelector onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Select niches" }));
    fireEvent.click(screen.getByText("SEO & Content"));
    fireEvent.click(screen.getByText("Copywriting"));

    expect(handleChange).toHaveBeenNthCalledWith(1, ["seo"]);
    expect(handleChange).toHaveBeenNthCalledWith(2, ["copywriting"]);
  });
});
