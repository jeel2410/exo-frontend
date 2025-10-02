export type NormalizedPhone = {
  e164: string;
  national: string;
};

// Normalize a phone number for specific countries and return:
// - national: digits-only national number (with trunk prefix removed when applicable)
// - e164: +<country_code><national>
// Currently optimized for France (+33) and DR Congo (+243), both using trunk prefix 0.
export function normalizePhone(countryCode: string, nationalRaw: string): NormalizedPhone {
  const cc = (countryCode || "").trim();
  const code = cc.startsWith("+") ? cc : `+${cc}`;

  // Keep only digits from the input
  const digitsOnly = (nationalRaw || "").replace(/\D/g, "");

  // Countries where we should drop a single leading trunk '0'
  const TRUNK_ZERO_CODES = new Set(["+33", "+243"]);

  let national = digitsOnly;
  if (TRUNK_ZERO_CODES.has(code) && national.startsWith("0")) {
    // Remove one or more leading zeros, conservatively keep non-zero start
    national = national.replace(/^0+/, "");
  }

  const e164 = `${code}${national}`;
  return { e164, national };
}
