import { formatFileSize, sanitizeInput, capitalize, getFileExtension } from "@/utils";

describe("formatFileSize", () => {
  it("formats bytes", () => expect(formatFileSize(500)).toBe("500 B"));
  it("formats kilobytes", () => expect(formatFileSize(2048)).toBe("2.0 KB"));
  it("formats megabytes", () => expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB"));
});

describe("sanitizeInput", () => {
  it("escapes HTML special characters", () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });
  it("leaves clean strings unchanged", () => {
    expect(sanitizeInput("Hello World")).toBe("Hello World");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => expect(capitalize("hello")).toBe("Hello"));
  it("handles empty string", () => expect(capitalize("")).toBe(""));
});

describe("getFileExtension", () => {
  it("returns pdf for .pdf file", () => expect(getFileExtension("document.pdf")).toBe("pdf"));
  it("returns xlsx for .xlsx file", () => expect(getFileExtension("sheet.xlsx")).toBe("xlsx"));
  it("returns empty string for no extension", () => expect(getFileExtension("noext")).toBe(""));
});
