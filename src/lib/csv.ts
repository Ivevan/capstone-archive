/**
 * Parses one delimited line (RFC 4180-style): quoted fields may contain delimiters.
 */
export function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result.map((f) => f.trim());
}

/** Parses one comma-separated CSV line. */
export function parseCSVLine(line: string): string[] {
  return parseDelimitedLine(line, ",");
}

/** Parses one tab-separated TSV line. */
export function parseTSVLine(line: string): string[] {
  return parseDelimitedLine(line, "\t");
}

export function stripCsvBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** RFC 4180: quote fields that contain comma, quote, or newline */
export function escapeCsvField(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
