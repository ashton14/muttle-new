/**
 * Helper function to generate a short string id. This id is
 * not guaranteed to be unique and is generated based on the
 * time plus a random number. Don't use for sensitive data.
 * @link https://stackoverflow.com/a/57593036
 * @returns A short pseudorandom string
 */
export const shortId = (): string =>
  new Date().getTime().toString(36) + Math.random().toString(36).slice(2);
