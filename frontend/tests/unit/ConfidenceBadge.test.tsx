import { render, screen } from "@testing-library/react";
import { ConfidenceBadge } from "@/components/atoms/ConfidenceBadge";

describe("ConfidenceBadge", () => {
  it("renders 'High' label for high confidence", () => {
    render(<ConfidenceBadge level="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders 'Medium' label for medium confidence", () => {
    render(<ConfidenceBadge level="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders 'Review' label for low confidence", () => {
    render(<ConfidenceBadge level="low" />);
    expect(screen.getByText("Review")).toBeInTheDocument();
  });
});
