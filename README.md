# node-red-contrib-blindcontroller-v3

A maintained fork of `node-red-contrib-blindcontroller` updated for **Node.js v22+**, **0–100% cloud coverage**, **persistent season mode**, and **accurate status pill reporting**.

## Credits & Acknowledgements
* **Original Author:** [Alisdair Smyth]([https://github.com](https://github.com/alisdairjsmyth/node-red-contrib-blindcontroller)) — creator of the original sun-shading geometry engine and Node-RED blind controller nodes.
* **V2 Reference:** [jncanches (`node-red-contrib-blindcontroller-v2`)](https://flows.nodered.org/node/node-red-contrib-blindcontroller-v2) — intermediate Node-RED v1+ and Home Assistant subflow adaptation.
* **V3 Maintainer:** Kolitar J'Odan ([://github.com](https://://github.com)) — Node.js v22+ compatibility fixes, native `0`–`100%` cloud coverage support, persistent season mode via `node.context()`, and output-aligned status pills.

---

## What's New in v3
* **0–100% Cloud Coverage Support:** Accepts standard `0`–`100` cloud cover percentages directly in both `msg.payload.clouds` and the node's **Cloud Cover (%)** threshold—no `/ 100` math required for Home Assistant or modern weather integrations.
* **Node.js v22+ Compatibility:** Guards all internal array iterations against `Array.prototype` extensions (`Missing property: function (array)` fix) and fixes boolean checkbox validation in the node editor UI.
* **Accurate Status Pill Output:** Displays the actual output percentage (honoring the **"0 is Closed"** inversion setting) alongside the active season mode (e.g., `Winter • 100%` or `Summer • 53%`).
* **Persistent `Summer` / `Winter` Mode:** Stores runtime `mode` updates in `node.context()` so your active season survives flow redeploys automatically, and survives full Node-RED / Home Assistant restarts when `localfilesystem` context storage is enabled.

---

## Window Dimensions & Sun Geometry Guide

All physical measurements (**Top**, **Bottom**, and **Depth**) are **unit-agnostic**—you can enter them in **inches**, **centimeters**, or **millimeters** as long as all three use the **same unit** (the units cancel out in the ratio).

* **Top:** Distance from the floor to the top of the window glass covered by the blind.
* **Bottom:** Distance from the floor to the bottom sill of the window glass covered by the blind.
* **Depth:** Maximum horizontal distance along the sunbeam's floor entry path that direct sunlight is allowed to travel into the room before the blind lowers to block it (used in **Summer** mode).
  * *Note on diagonal sun angles:* The shading formula calculates `height = tan(sunAltitude) × Depth` along the beam's entry path. When the sun is angled off-axis from your window's perpendicular heading, the beam travels diagonally across the floor (`Perpendicular Distance = Depth × cos(ΔAzimuth)`), so a slightly larger `Depth` may be desired if you want to block early-afternoon angled beams before the sun swings directly in front of the glass.
* **Orientation (`0°–360°`):** The compass bearing (from true north) that the exterior of the window faces (`0°` = North, `90°` = East, `180°` = South, `270°` = West).
* **- Offset / + Offset (`0°–90°`):** Counter-clockwise (`-`) and clockwise (`+`) horizontal angle limits from **Orientation** defining when direct sun can hit the glass (defaults to `90°` each for an unobstructed `180°` field of view). Narrow these offsets to account for roof overhangs, fences, trees, or adjacent walls that shade the window.

---

## Migration & Installation
Because this package registers the same `blindcontroller` and `multiblindcontroller` node types so your existing flows migrate seamlessly without rebuilding:
1. **Uninstall any previous version first** (`node-red-contrib-blindcontroller` or `node-red-contrib-blindcontroller-v2`) via **Manage Palette** or `npm uninstall`.
2. **Install `node-red-contrib-blindcontroller-v3`** via **Manage Palette → Install** or `npm install node-red-contrib-blindcontroller-v3`.
3. **Restart Node-RED.**

*(Note: If you previously divided cloud coverage by `100` or used a decimal threshold like `0.86`, update your `cloudsthreshold` to a `0`–`100` percentage such as `86` and pass `0`–`100` cloud coverage directly.)*

---

## Correct Flow Wiring (Parallel Inputs)
**Do NOT chain Weather into `sunpos` in series.** `sunpos` overwrites `msg.topic` and `msg.payload`, which discards any upstream weather properties. Wire `sunpos` (`topic: "sun"`) and your weather payload (`topic: "weather"`) **in parallel** into `Blind Controller`:

```text
[10M Timer] ──┬──► [sunpos (topic: "sun")] ──────────────────┐
              └──► [Weather Source (topic: "weather")] ──────┼──► [Blind Controller]
```

### Home Assistant Weather Wiring (No Function Node Needed)
When using a Home Assistant **current state** node on a `weather.*` entity, configure its **Output Properties** as:
* `msg.payload` = `{"clouds": $number(data.attributes.cloud_coverage)}` *(type: `J:` expression)*
* `msg.topic` = `weather` *(type: `az` string)*

---

## Season Mode Persistence Across Reboots
Runtime `topic: "mode"` messages (`{"mode": "Winter"}` or `{"mode": "Summer"}`) are saved in `node.context()`:
* **Flow Redeploys:** Persists automatically out of the box.
* **Full Node-RED / Home Assistant Restarts:** Enable `localfilesystem` context storage in your Node-RED `settings.js`:
  ```javascript
  contextStorage: {
      default: {
          module: "localfilesystem"
      }
  },
  ```
  *(If `localfilesystem` is not enabled, the node safely falls back to its configured default mode on startup.)*

---

## License
Apache-2.0 — Original work Copyright 2015, 2016 Alisdair Smyth; modifications Copyright 2026 Kolitar J'Odan.
