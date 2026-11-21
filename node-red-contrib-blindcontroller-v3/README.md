# node-red-contrib-blindcontroller-v3

A updated fork of `node-red-contrib-blindcontroller` (originally created by Alisdair Smyth) updated for **Node.js v22+**, **0–100% cloud coverage**, **persistent season mode**, and **accurate status pill reporting**.

## What's New in v3.0.0
- **0–100% Cloud Coverage Support:** Accepts standard `0`–`100` cloud cover percentages directly in both `msg.payload.clouds` and the node's **Cloud Cover (%)** threshold—no `/ 100` math required for Home Assistant or modern weather integrations.
- **Node.js v22+ Compatibility:** Guards all internal array iterations against `Array.prototype` extensions (`Missing property: function (array)` fix) and fixes boolean checkbox validation in the node editor UI.
- **Accurate Status Pill Output:** Displays the actual output percentage (honoring the **"0 is Closed"** inversion setting) alongside the active season mode (e.g., `Winter • 100%` or `Summer • 64%`).
- **Persistent `Summer` / `Winter` Mode:** Stores runtime `mode` updates in `node.context()` so your active season survives flow redeploys automatically, and survives full Node-RED / Home Assistant restarts when `localfilesystem` context storage is enabled.

## Migration & Installation
Because this package registers the same `blindcontroller` and `multiblindcontroller` node types so your existing flows migrate seamlessly without rebuilding:
1. **Uninstall any previous version first** (`node-red-contrib-blindcontroller` or `node-red-contrib-blindcontroller-v2`) via **Manage Palette** or `npm uninstall`.
2. **Install `node-red-contrib-blindcontroller-v3`** via **Manage Palette → Install** or `npm install node-red-contrib-blindcontroller-v3`.
3. **Restart Node-RED.**

*(Note: If you previously divided cloud coverage by `100` or used a decimal threshold like `0.86`, update your `cloudsthreshold` to a `0`–`100` percentage such as `86` and pass `0`–`100` cloud coverage directly.)*

## Correct Flow Wiring (Parallel Inputs)
**Do NOT chain Weather into `sunpos` in series.** `sunpos` overwrites `msg.topic` and `msg.payload`, which discards any upstream weather properties. Wire `sunpos` (`topic: "sun"`) and your weather payload (`topic: "weather"`) **in parallel** into `Blind Controller`:

```text
[10M Timer] ──┬──► [sunpos (topic: "sun")] ──────────────────┐
              └──► [Weather Source (topic: "weather")] ──────┼──► [Blind Controller]
```

### Home Assistant Weather Wiring Tip
If you use a Home Assistant `current state` node (`weather.*`), you can pass `cloud_coverage` (`0`–`100`) directly to `blindcontroller` by setting its output properties to:
- `msg.topic` = `"weather"` (string)
- `msg.payload.clouds` = `data.attributes.cloud_coverage` (JSONata / expression)

## Season Mode Persistence Across Reboots
Runtime `topic: "mode"` messages (`{ "mode": "Winter" }` or `{ "mode": "Summer" }`) are saved in `node.context()`:
- **Flow Redeploys:** Persists automatically out of the box.
- **Full Node-RED / Home Assistant Restarts:** Enable `localfilesystem` context storage in your Node-RED `settings.js`:
  ```javascript
  contextStorage: {
      default: {
          module: "localfilesystem"
      }
  },
  ```
  *(If `localfilesystem` is not enabled, the node safely falls back to its configured default mode on startup.)*

## License
Apache-2.0 — Original work Copyright 2015, 2016 Alisdair Smyth; modifications Copyright 2026 Kolitar J'Odan.
