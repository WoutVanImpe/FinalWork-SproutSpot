# Project History

## 2026-05-21 — Cumulative Daily Light Integral (DLI) refactor

### Changed
- **LIGHT_TOO_LOW**: removed from hourly 3-consecutive batch check (was causing false positives at night/cloudy intervals)
- **LIGHT_TOO_HIGH**: kept as 3-consecutive hourly protection (sunburn prevention)
- **New DLI architecture**: background scheduler (every 60 min) evaluates today's cumulative light hours where `light_lux >= light_min`
  - If cumulative >= `required_daily_sun_hours` → auto-resolve LIGHT_TOO_LOW
  - If cumulative < target AND it's 22:00+ → create LIGHT_TOO_LOW (end-of-day only)

### Added
- `required_daily_sun_hours` field to `StageThresholdsRecord` type
- `required_daily_sun_hours: 6` default to all 207 plant stage seed entries
- `getDailyLightSummary()` query in `TelemetryRepository`
- `checkDailyLightIntegral()` method in `TelemetryService`
- DLI check wired into scheduler alongside `checkStaleProbes()`
- `opencode/TELEMETRY_STEPS.md` Step 9 documentation

## 2026-05-21 — Battery guardrail + stale probe detection

### Added
- `checkBattery()` — instant trigger when voltage < 3.12V (< 10%)
- `checkStaleProbes()` — background check every 60 min for probes silent 3+ hours
- `scheduler.service.ts` — centralized background job runner
- `findStaleProbes()` query in `ProbeRepository`
- BATTERY_LOW and PROBE_STALE notifications with Dutch localized messages

## 2026-05-21 — Telemetry anomaly pipeline

### Added
- TelemetryRepository with full CRUD for entries, issues, notifications
- Soil/temp/light anomaly detection with anti-spam (instant for soil, 3-consecutive for temp/light)
- Auto-resolution when readings return to range
- PushNotificationService stub
- Notification dispatch with quiet-hours support
- Unregistered probe rejection

### Fixed
- Seed plant stage threshold keys (`soil_moist_min` → `soil_min`, etc.)
- Added missing `light_min/max` and `humidity_min/max` to seed thresholds
