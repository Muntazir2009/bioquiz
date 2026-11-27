/**
 * Admin password resolution.
 *
 * Set ADMIN_PASSWORD in the environment to override it. Without that variable
 * the long-standing value is used so the existing admin panel keeps working;
 * a warning is logged once on the server when that fallback is in play.
 */
const configured = process.env.ADMIN_PASSWORD;
const DEV_DEFAULT = "0613";

export const ADMIN_PASSWORD =
  configured && configured.length > 0 ? configured : DEV_DEFAULT;

if (!configured && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn(
    "[admin-auth] ADMIN_PASSWORD is not set — using the default admin password. Set the ADMIN_PASSWORD environment variable to change it."
  );
}
