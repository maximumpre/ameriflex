/**
 * Resolved image URLs for the Astro pages.
 *
 * CRITICAL: Vite/Astro image imports return an ImageMetadata OBJECT, not a
 * URL string. Interpolating the object renders `src="[object Object]"`.
 * These exports are plain root-relative URL strings pointing at the ORIGINAL
 * Ameriflex assets downloaded from https://participant.myameriflex.com/
 * into `public/target-assets/` (see README asset manifest).
 */

export const toImageUrl = (asset: string | { src: string }): string =>
  typeof asset === "string" ? asset : encodeURI(asset.src)

/** White Ameriflex wordmark — shown above the login panel (logo, all viewports). */
export const BRAND_LOGO_SRC = "/target-assets/infinite-logo-white.svg"

/** Blue Ameriflex wordmark — navbar variant (used by other portal chrome). */
export const PARTNER_LOGO_SRC = "/target-assets/infinite-logo-blue.svg"

/** Desktop seasonal hero background (current season: Background4.jpg). */
export const HERO_IMAGE_SRC = "/target-assets/Background4.jpg"

/** Mobile/tablet default background body rule (below 992px). */
export const MOBILE_BACKGROUND_SRC = "/target-assets/Mountains_Mobile.jpg"
