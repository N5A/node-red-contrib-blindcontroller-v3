-# Changelog

## 3.0.0 - 2026-11-20
**Fork Maintainer:** Kolitar J'Odan (forked from original work by Alisdair Smyth)

### Changed
- **0–100% Cloud Coverage Scale:** Updated `payload.clouds` and `cloudsthreshold` validation and UI bounds from legacy `0`–`1` decimals to standard `0`–`100` percentages for direct compatibility with Home Assistant, OpenWeatherMap, Pirate Weather, and modern weather APIs without extra division logic.

### Fixed
- **Node.js v22+ Prototype Loop Guards:** Added `hasOwnProperty` checks to all `for (i in ...)` array iterations across both `blindcontroller` and `multiblindcontroller`. Resolves `Missing property: function (array) { ... }` and `Cannot read properties of undefined` crashes exposed on Node.js v22+ when third-party nodes extend `Array.prototype`.
- **Boolean Checkbox Validator (`blindcontroller.html`):** Fixed `opposite` ("0 is Closed") validation to accept boolean values (`true`/`false`) without throwing `TypeError: v.toLowerCase is not a function` in the browser editor.
- **Malformed HTML Cleanup (`blindcontroller.html`):** Removed a stray closing `</label>` tag in the temperature threshold form row.
- **Status Pill Output Alignment:** Updated `node.status` to display the actual output `blindPosition` (and align `shape: "dot"` with `blindPosition == 100`) instead of the pre-inversion `logicalBlindPosition`, ensuring the status pill matches downstream blind percentages when "0 is Closed" is enabled.

### Added
- **Persistent Season Mode (`Summer` / `Winter`):** Saved incoming `mode` updates to `node.context()` so the active season mode survives flow redeploys out of the box and full Node-RED / Home Assistant restarts when `localfilesystem` context storage is enabled.
- **Active Mode Status Pill Display:** Updated the status text under both `blindcontroller` and `multiblindcontroller` to display the active season mode alongside the calculated output percentage (e.g., `Winter • 100%`, `Summer • 64%`, or `Winter • Ch1:100% Ch2:64%`).
