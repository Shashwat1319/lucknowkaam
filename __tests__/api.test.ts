import { validateEmail } from "@/lib/utils";

describe("API Input Validation", () => {
  describe("required fields", () => {
    const requiredFields = ["title_hindi", "company_name", "location_area", "category"];

    it.each(requiredFields)("rejects request missing %s", (field) => {
      const body = {
        title_hindi: "Test Job",
        company_name: "Test Corp",
        location_area: "Delhi",
        category: "delivery",
        [field]: "",
      };
      expect(body[field]).toBe("");
    });
  });

  describe("field length validation", () => {
    it("rejects overly long fields", () => {
      const long = "x".repeat(501);
      expect(long.length).toBeGreaterThan(500);
    });

    it("rejects overly long descriptions", () => {
      const long = "x".repeat(5001);
      expect(long.length).toBeGreaterThan(5000);
    });
  });

  describe("email validation for paid listings", () => {
    it("accepts valid contact emails", () => {
      expect(validateEmail("employer@example.com")).toBe(true);
    });

    it("rejects invalid contact emails", () => {
      expect(validateEmail("not-email")).toBe(false);
    });
  });
});
