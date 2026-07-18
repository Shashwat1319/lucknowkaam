import { generateSlug, timeAgo, formatDate, getAreaSlug, getCategoryNameHindi, getJobTypeHindi, truncateText, validateEmail } from "@/lib/utils";

describe("generateSlug", () => {
  it("converts Hindi title to English slug", () => {
    expect(generateSlug("डिलीवरी बॉय चाहिए")).toContain("delivery");
    expect(generateSlug("डेटा एंट्री ऑपरेटर")).toContain("data-entry");
  });

  it("strips special characters", () => {
    expect(generateSlug("Hello @World! #2024")).toBe("hello-world-2024");
  });

  it("truncates to 80 chars", () => {
    const long = "a".repeat(100);
    expect(generateSlug(long).length).toBeLessThanOrEqual(80);
  });
});

describe("timeAgo", () => {
  it('returns "अभी अभी" for recent dates', () => {
    expect(timeAgo(new Date().toISOString())).toBe("अभी अभी");
  });

  it('returns hours for <24h', () => {
    const fiveHrsAgo = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
    expect(timeAgo(fiveHrsAgo)).toContain("घंटे");
  });

  it('returns days for <7d', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toContain("दिन");
  });
});

describe("getCategoryNameHindi", () => {
  it("returns correct Hindi name for known slugs", () => {
    expect(getCategoryNameHindi("delivery")).toBe("डिलीवरी का काम");
    expect(getCategoryNameHindi("data-entry")).toBe("डेटा एंट्री");
    expect(getCategoryNameHindi("teaching")).toBe("टीचिंग जॉब");
  });

  it("returns slug back for unknown categories", () => {
    expect(getCategoryNameHindi("unknown-cat")).toBe("unknown-cat");
  });
});

describe("getJobTypeHindi", () => {
  it("returns correct Hindi for known types", () => {
    expect(getJobTypeHindi("full-time")).toBe("पूर्णकालिक");
    expect(getJobTypeHindi("part-time")).toBe("अंशकालिक");
  });

  it("returns input for unknown types", () => {
    expect(getJobTypeHindi("freelance")).toBe("freelance");
  });
});

describe("truncateText", () => {
  it("returns full text when under max", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("truncates with ellipsis when over max", () => {
    expect(truncateText("Hello World This Is Long", 10)).toBe("Hello Worl...");
  });
});

describe("validateEmail", () => {
  it("validates correct emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user+tag@domain.co.in")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("not-an-email")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
  });
});

describe("getAreaSlug", () => {
  it("converts area name to URL slug", () => {
    expect(getAreaSlug("Gomti Nagar")).toBe("gomti-nagar");
    expect(getAreaSlug("New Delhi")).toBe("new-delhi");
  });
});

describe("formatDate", () => {
  it("formats date in Hindi locale", () => {
    const result = formatDate("2025-01-15T00:00:00.000Z");
    expect(result).toContain("2025");
  });
});
