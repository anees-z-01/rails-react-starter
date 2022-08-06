import { dateHelper } from "./dateHelper";

describe("dateHelper", () => {
  it("formats ISO timestamps as UTC strings", () => {
    const value = "2022-08-06T10:30:00Z";

    expect(dateHelper(value)).toBe("Sat, 06 Aug 2022 10:30:00 GMT");
  });

  it("returns Invalid Date for invalid values", () => {
    expect(dateHelper("not-a-date")).toBe("Invalid Date");
  });
});
