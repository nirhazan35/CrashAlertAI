const formatDateTime = require("../../src/util/DateFormatting");

describe("DateFormatting Utility", () => {
  test("should format a Date object correctly", () => {
    // Create a fixed Date: March 6, 2023, 15:30:45 in local time.
    const fixedDate = new Date(2023, 2, 6, 15, 30, 45);
    const result = formatDateTime(fixedDate);
    expect(result.displayDate).toBe("06/03/2023");
    expect(result.displayTime).toBe("15:30:45");
  });

  test("should format a valid ISO date string correctly", () => {
    // Create a fixed Date and use its ISO string.
    const fixedDate = new Date(2023, 2, 6, 15, 30, 45);
    const isoString = fixedDate.toISOString();
    const result = formatDateTime(isoString);
    // Instead of comparing exact strings (which might vary with timezones),
    // we check that the result matches the expected pattern.
    expect(result.displayDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result.displayTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test("should return two-digit day, month, hour, minute, and second", () => {
    // Create a date with single-digit values.
    // Note: Months are zero-indexed so 0 = January.
    const date = new Date(2023, 0, 3, 4, 5, 6); // January 3, 2023, 04:05:06
    const result = formatDateTime(date);
    expect(result.displayDate).toBe("03/01/2023");
    expect(result.displayTime).toBe("04:05:06");
  });
});
