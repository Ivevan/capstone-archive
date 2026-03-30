import { describe, it, expect } from "vitest";
import { parseCSVLine, stripCsvBom, escapeCsvField } from "./csv";

describe("parseCSVLine", () => {
  it("parses quoted fields with commas", () => {
    const line =
      '"Title, with comma","Author A; Author B","Dr. X","Panel","January","2024","Coord","https://drive.google.com/drive/folders/abc123"';
    const cols = parseCSVLine(line);
    expect(cols).toHaveLength(8);
    expect(cols[0]).toBe("Title, with comma");
    expect(cols[7]).toBe("https://drive.google.com/drive/folders/abc123");
  });

  it("handles escaped quotes in fields", () => {
    const line = '"Say ""hello""","a","b","c","January","2024","coord",""';
    const cols = parseCSVLine(line);
    expect(cols[0]).toBe('Say "hello"');
  });
});

describe("stripCsvBom", () => {
  it("removes UTF-8 BOM", () => {
    expect(stripCsvBom("\uFEFFTitle,Authors")).toBe("Title,Authors");
  });
});

describe("escapeCsvField", () => {
  it("escapes quotes", () => {
    expect(escapeCsvField('a "b" c')).toBe('"a ""b"" c"');
  });
});
