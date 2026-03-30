import { describe, it, expect } from "vitest";
import { normalizeDriveLink } from "./driveLink";

describe("normalizeDriveLink", () => {
  it("adds https to scheme-less drive URLs", () => {
    expect(normalizeDriveLink("drive.google.com/drive/folders/xyz")).toBe(
      "https://drive.google.com/drive/folders/xyz",
    );
  });

  it("leaves full https URLs unchanged", () => {
    const u = "https://drive.google.com/drive/folders/abc?usp=sharing";
    expect(normalizeDriveLink(u)).toBe(u);
  });

  it("extracts URL from Excel HYPERLINK formula", () => {
    expect(
      normalizeDriveLink('=HYPERLINK("https://drive.google.com/drive/folders/x","Open")'),
    ).toBe("https://drive.google.com/drive/folders/x");
  });
});
