import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import LessonLoading from "../../../../../app/student/lesson/[lessonSlug]/loading";

describe("LessonLoading", () => {
  it("renders the lesson loading skeleton with three phase placeholders", () => {
    const { container } = render(<LessonLoading />);

    const phaseSkeletons = container.querySelectorAll(".border.rounded-lg.p-6.animate-pulse");
    expect(phaseSkeletons).toHaveLength(3);
  });
});
