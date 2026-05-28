# SproutSpot: Development History & Decisions

## 05/05/2026: Backend Boilerplate Generation

### Architecture Decision: Repository-Service-Controller Pattern

- Extended the RULES.md Controller/Service pattern with a Repository layer for explicit database abstraction
- **Repositories** handle direct Knex.js queries only
- **Services** contain all business logic (threshold evaluation, anti-spam, match calculation)
- **Controllers** handle HTTP status codes, request validation, and response formatting

### Type Convention

- `types/database/` - Database record types with `Record` suffix (e.g., `UserRecord`, `PlantRecord`, `ProbeRecord`)
- `types/dto/` - Data Transfer Objects with `Dto` suffix (e.g., `CreateUserDto`, `TelemetryPayloadDto`)
- `types/response/` - Response types with `Response` suffix (e.g., `IssueResultResponse`, `ProbeHealthResponse`)

### Module Structure

Created 7 modules following `[name].controller.ts`, `[name].service.ts`, `[name].repository.ts`, `[name].routes.ts` pattern:

- **UserModule**: Auth (signup/login), profile management, notification_window settings, push token
- **GardenModule**: Garden layouts, dimensions, position validation
- **PlantModule**: Read-only encyclopedia access, stage retrieval
- **UserPlantModule**: Active plants, growth stage progression, deactivation (harvested/died/removed/reused), Match% calculation
- **ProbeModule**: Hardware management, MAC pairing via `hardware_id` (string), health status (battery/WiFi)
- **TelemetryModule**: XIAO ESP32-C3 POST endpoint, soil mapping (dry_threshold=400, wet_threshold=200), 60-min deep sleep awareness
- **NotificationModule**: `active_issues` as source of truth, `pending_notifications` as communication log, snooze/dismiss/acknowledge logic

### Key Design Decisions

1. **Telemetry Anti-Spam**: Alerts only trigger after `ANTI_SPAM_MEASUREMENT_THRESHOLD` (3) consecutive measurements confirm an issue
2. **Coach Philosophy**: No automation logic. All issue messages use human-friendly language with actionable advice
3. **Deep Sleep Acknowledgment**: Telemetry service acknowledges the probe can only push data every 60 minutes
4. **Soil Mapping**: Raw capacitive soil values mapped linearly between WET_THRESHOLD (200) and DRY_THRESHOLD (400), inverted so higher = more moist
5. **Notification Window**: Notifications only sent within user's `notification_window_start` to `notification_window_end` (default 08:00-22:00)
6. **Match % Logic**: Based on difficulty weight, temperature range compatibility, and light level matching against user's existing garden telemetry averages
7. **Auth Placeholder**: Auth middleware currently passes through for development - JWT verification pending `jsonwebtoken` installation

### TODO Items

- [ ] Install `bcrypt` for password hashing
- [ ] Install `jsonwebtoken` for JWT authentication
- [ ] Implement actual JWT verification in auth middleware
- [ ] Add push notification service (FCM/APNs) integration
- [ ] Add scheduled job for probe health check (mark offline after 3x deep sleep intervals)
- [ ] Add seed data for plant encyclopedia
- [ ] Add rate limiting for telemetry ingest endpoint
- [ ] Add input sanitization for search queries

## 06/05/2026: Route Refactoring & Boilerplate Cleanup

### GardenModule Refactor: Single Garden per User
- Removed multi-garden logic. Each user has exactly one garden (auto-created if missing).
- `GET /api/gardens/` returns garden + all active plants in that garden.
- `PUT /api/gardens/` updates dimensions AND plant positions in a single atomic operation with position collision checking.
- Removed all `:id` params from garden routes.

### NotificationModule: Coach Feedback Loop
- `GET /api/notifications/` - defaults to unacknowledged only, `?all=true` returns all.
- `POST /api/notifications/:notificationId/acknowledge` - sets notification to acknowledged, also acknowledges linked active_issue.
- `POST /api/notifications/issues/:issueId/resolve` - sets `resolved_at` on active_issue.
- `POST /api/notifications/:notificationId/reset` - resets notification state to `sent`, clears `snoozed_until`.
- Removed snooze/dismiss endpoints. Enum is now `["sent", "acknowledged", "snoozed"]`.

### PlantModule: Encyclopedia
- `GET /api/plants/` - full list.
- `GET /api/plants/search?q=&light=&difficulty=&is_indoor=` - filters by text, light, difficulty, indoor/outdoor. Checks `planting_type` enum for `is_indoor` param.
- `GET /api/plants/:id` - single plant.
- `GET /api/plants/:id/stages?stage_order=` - all stages or specific one.
- Added `checkSowingPeriod()` utility for matching months against `sowing_period` JSON array.

### ProbeModule: Hardware Management
- `POST /api/probes/register` - create probe.
- `GET /api/probes/` - list user's probes with battery/WiFi health.
- `GET /api/probes/:id` - specific probe.
- `POST /api/probes/:id/pair` - links `hardware_id` to `user_plant.sonde_id`.
- `POST /api/probes/unpair/:userPlantId` - sets `sonde_id` to null.

### TelemetryModule: XIAO ESP32-C3 Ingest
- `POST /api/telemetry/upload` - creates probe_entry + updates probe battery/wifi in same call.
- `GET /api/telemetry/recent/:sondeId` - last 24 entries by default.

### UserPlantModule: Active Gardening
- `GET /api/user-plants/` - all plants (history).
- `GET /api/user-plants/active` - currently growing plants only.
- `POST /api/user-plants/:id/stage` - advances stage, returns new stage requirements.
- `GET /api/user-plants/:id/stage` - current stage info.
- `GET /api/user-plants/:id/readings` - latest 24 environmental readings from linked probe.

### Database Changes
- `notification_state` enum: `["sent", "acknowledged", "snoozed"]`
- Added `planting_type` enum (`indoor` | `outdoor` | `both`) to `plants` table.

## 06/05/2026: JSDoc Documentation Added

Added single-line JSDoc class documentation to all controllers, services, and repositories for quick reference:

### Controllers
- `UserController` - User authentication and profile management
- `GardenController` - User's single garden (dimensions and plant positions)
- `NotificationController` - Notifications and issue resolution (coach feedback loop)
- `PlantController` - Plant encyclopedia (read-only)
- `ProbeController` - Probe registration, pairing, and hardware health status
- `TelemetryController` - Telemetry uploads from XIAO ESP32-C3 probes
- `UserPlantController` - Active plants: listing, stage progression, probe readings

### Services
- `UserService` - Auth, profile management, push tokens
- `GardenService` - Auto-creation, dimensions, position collision checks
- `NotificationService` - Coach feedback loop: acknowledge, resolve, reset
- `PlantService` - Encyclopedia search, retrieval, sowing period matching
- `ProbeService` - Registration, pairing/unpairing, battery/WiFi health
- `TelemetryService` - Soil moisture mapping, probe health updates
- `UserPlantService` - Stage progression, activation/deactivation, readings

### Repositories
- `UserRepository` - User CRUD, profile updates, email lookups
- `GardenRepository` - Garden auto-creation, dimensions, positions
- `NotificationRepository` - Notification states, issue acknowledgment/resolution
- `PlantRepository` - Encyclopedia lookups, search filters, growth stages
- `ProbeRepository` - Probe creation, assignment, health, plant linking
- `TelemetryRepository` - Probe entries, health updates, recent telemetry
- `UserPlantRepository` - User plants: creation, stages, deactivation

## 08/05/2026: Hardware Pairing Code System

### Database Change
- Added `pairing_code` column to `users` table (`string`, `unique`, `notNullable`) — format: 2 uppercase letters + 6 digits (e.g., "AB123456")

### Flow
1. **Signup**: User creates account → auto-generated unique `pairing_code` is returned in the response
2. **Probe Registration**: `POST /api/probes/register` now requires `pairing_code` in the body → server looks up the user → creates probe linked to that user → **rotates** the old pairing code to a new unique value
3. **Security**: Old pairing code expires immediately after use. Uniqueness is enforced via DB constraint + collision-checked generation loop.

### Architecture Decisions
1. **Code rotation**: Once a pairing code is consumed during probe registration, a new random code replaces it. This prevents replay attacks.
2. **Conflict resolution**: Both `UserService` and `ProbeService` generate new codes with a DB uniqueness loop before assigning.
3. **User-probe link**: Probes are now created with `user_id` set (enforced via required `userId` param in `ProbeRepository.create()`). No more orphan probes.
4. **No auth on /register**: The endpoint remains outside the auth middleware — pairing code serves as the authentication mechanism for hardware.

### Probe Registration: Name Removed
- Probes are no longer named at registration time — `name` removed from required body params
- Probe is created with default name `"Unnamed Probe"` — can be renamed later via the new endpoint

### New Endpoint: Rename Probe
- `PUT /api/probes/:id/rename` (authenticated, `validateBody(["name"])`) — renames a probe
- Ownership check: only the probe's owning user can rename it
- Returns 404 if probe not found or doesn't belong to user

### Test Seed
- Created `seeds/001_test_user.ts` — inserts a test user with `pairing_code: "TE123456"`

### Files Modified
- `migrations/20260504095304_innit_migration.ts` — added `pairing_code` column
- `types/database/index.ts` — added field to `UserRecord`
- `types/dto/index.ts` — added `RenameProbeDto`
- `repositories/user.repository.ts` — updated `create()`, added `findByPairingCode()` and `updatePairingCode()`
- `repositories/probe.repository.ts` — `create()` no longer takes `name`; added `rename()`
- `services/user.service.ts` — generation logic, `findByPairingCode()`, `regeneratePairingCode()`
- `services/probe.service.ts` — `registerProbe()` takes `(hardwareId, pairingCode)`, added `renameProbe()`
- `controllers/probe.controller.ts` — handles `"Invalid pairing code"` as 401, added `renameProbe` handler
- `controllers/user.controller.ts` — includes `pairing_code` in signup response
- `routes/probe.routes.ts` — added `pairing_code` to `validateBody`; added `/rename` route
- `seeds/001_test_user.ts` — test user seed file

## 08/05/2026: Batch Telemetry Upload

### Payload Change
- The hardware now sends **4 entries at once** in an array, instead of 1 entry per request
- Each entry includes a `time_t` field (Unix epoch seconds) that replaces the auto-generated `created_at` timestamp

### New Payload Format
```json
{
  "hardware_id": "80:F1:B2:64:32:20",
  "entries": [
    { "temp_c": 20.8, "humidity_pct": 49.7, "light_lux": 110, "soil_raw": 2810, "battery_voltage": 4, "wifi_rssi": -79, "time_t": 1715097600 },
    ...
  ]
}
```

### Key Decisions
1. **Batch insert**: All 4 entries are inserted in a single `knex.insert(rows)` call for efficiency
2. **Probe health**: Updated once per batch using the **last entry's** `battery_voltage` / `wifi_rssi` (all 4 are from the same measurement cycle)
3. **Timestamp**: `time_t` is converted to `new Date(time_t * 1000)` and stored in `created_at` — overrides the DB default
4. **Soil mapping**: Applied per-entry inside the service loop before the batch insert

### Files Modified
- `types/dto/index.ts` — added `TelemetryEntryDto` and `TelemetryBatchUploadDto`
- `repositories/telemetry.repository.ts` — added `createEntries()` batch insert method
- `services/telemetry.service.ts` — `uploadTelemetry()` now accepts batch, maps soil per entry
- `controllers/telemetry.controller.ts` — extracts `entries` array, validates non-empty
- `routes/telemetry.routes.ts` — `validateBody` changed to `["hardware_id", "entries"]`

## 11/05/2026: Frontend Styling Overhaul & Custom Curved Tab Bar

### Styled Components Typing Fixes
- **StyledView**: Fixed `style` type from `string` to `ViewStyle`, made optional. Fixed `Children` → `children` bug.
- **StyledText**: Replaced `enum` with `as const` object for `TextType`, made `type` prop accept string keys that resolve to font sizes internally. Added optional `children`.

### Styling Constants Interface
- Created full `Styling` interface in `constants/Styling.ts` covering `Colors`, `Fonts` (Family, Size, Weight), `Spacing`, `Padding`, `BorderRadius`, `IconSize`, `Shadow`.

### Custom Font Loading
- Installed `expo-font`, loaded `SpaceGrotesk-Regular` and `SpaceGrotesk-Bold` static weights in `_layout.tsx` via `useFonts`.
- Added `Styling.Fonts.Family` constants for centralized font family references.

### SVG Icon System
- Installed `react-native-svg` and `react-native-svg-transformer`.
- Created `metro.config.js` for SVG transformation.
- Created `StyledIcon` component wrapping SVG imports with configurable `size` (sml/reg/med/lrg/xlg) and `fill` color.
- Externalized `IconSize` values to `Styling.IconSize`.
- Created `assets/icons/` folder for custom SVG icons.

### Custom Curved Tab Bar (Floating Notched Navbar)
- Replaced default `Tabs` tab bar with fully custom `CustomTabBar` via `tabBar` prop.
- **CurvedBackground** (SVG): Renders a white pill-shaped background with a smooth circular scoop indentation driven by a cubic bezier curve. Position moves to the active tab.
- **TabBarButton**: Animated floating button with green circle that scales up on focus and floats above the bar (`translateY: -40`).
- **Constants (`tabConfig`)**: Centralized all bar dimensions (`BAR_HEIGHT`, `BAR_MARGIN`, `TAB_WIDTH`, `TAB_GAP`), corner radius, scoop radius/depth, and route-to-icon mappings.
- **Layout**: Bar is absolutely positioned (`bottom: 25`, horizontally centered with 20px margin). Labels hidden. 3 tabs evenly distributed with gap.

### Animations
- **Scoop slide**: Uses `Animated.Value` with `Animated.spring` to smoothly interpolate SVG path scoop position when switching tabs.
- **Bubble spring**: Per-tab `Animated.Value` (0→1) drives `translateY` and `scale` via native driver interpolation. Inactive tabs spring back to 0.
- Both animations use `friction: 8, tension: 40` for a consistent feel.

### File Structure Created
- `components/style/StyledView.tsx` — Styled View wrapper
- `components/style/StyledText.tsx` — Styled Text with font sizing and fullCap
- `components/style/StyledButton.tsx` — Styled Button with inverted variant
- `components/style/StyledIcon.tsx` — SVG icon wrapper
- `components/shared/navbar/CurvedBackground.tsx` — SVG pill background with scoop
- `components/shared/navbar/TabBarButton.tsx` — Animated floating tab button
- `constants/tabConfig.ts` — Tab bar dimensions and route config
- `assets/icons/home.svg`, `garden.svg`, `explore.svg` — Custom tab icons

### Key Design Decisions
1. **SVG over View hacks**: Used `react-native-svg` with `Path` + cubic bezier for the scoop indentation — more performant and visually accurate than overlay tricks.
2. **Animated.spring over timing**: Spring animation with `friction: 8, tension: 40` feels more organic than linear timing for UI transitions.
3. **Native driver for buttons**: Tab button animations use `useNativeDriver: true` for 60fps performance; scoop uses `false` since it drives SVG path updates.
4. **Separate tabConfig**: Centralizing dimensions avoids magic numbers spread across files and makes tweaking bar proportions easy.
5. **Shadow on View wrapper**: Pill-shaped shadow achieved by wrapping SVG in a `View` with `borderRadius: CORNER_RADIUS` and standard shadow props.

## 12/05/2026: StatusHeader Carousel Component

### Created
- `frontend/components/shared/home/statusHeader/StatusHeader.tsx` — A horizontally swipeable carousel displaying plant status items with an animated wave background.

### Carousel Logic
- **State**: `displayIndex` tracks the current item; `transition` holds leaving/entering items + direction during animation.
- **Slide animation**: `slideAnim` (Animated.Value, 0→1 via timing 300ms, native driver) drives the leaving item out (translateX 0→direction*SCREEN_WIDTH, opacity 1→0) and the entering item in (translateX -direction*SCREEN_WIDTH→0, opacity 0→1).
- **Transition guard**: `isAnimating` ref prevents concurrent transitions.
- **Navigation**: `TouchableOpacity` arrow buttons (`prevItem`/`nextItem`) and `PanResponder` swipe gesture on `centerSlideArea`.

### Wave Background
- **Static wave**: `WAVE_REST` SVG path drawn at `WAVE_W = SCREEN_WIDTH * 4`, `WAVE_H = 270`, viewBox `0 0 1284 256`, with `preserveAspectRatio="none"` for full-width stretch.
- **Color cross-fade**: A base green `<WaveShape>` is overlaid by an absolutely-positioned red `<WaveShape>` wrapped in `Animated.View` with `opacity: colorAnim`. When the warning status changes, `colorAnim` animates 0↔1 (timing 300ms, native driver).
- **Fake shadow**: 2 layers of black WaveShape at `top: 3` (opacity 0.15) and `top: 5` (opacity 0.08), absolutely positioned inside `svgWrapper`.
- **svgWrapper**: Absolutely positioned, `top: 35`, `left: -SCREEN_WIDTH + 60`, `zIndex: 1` so the wave protrudes from behind the content.

### Key Decisions
1. **PanResponder over gesture-handler**: Used React Native's built-in `PanResponder` instead of `react-native-gesture-handler` to avoid adding a new dependency.
2. **Fake shadow over View shadow**: Stacked black SVG layers at small vertical offsets provide more control and consistent rendering across platforms vs RN View shadow props.
3. **ColorAnim opacity cross-fade**: Two stacked SVGs (green base + red overlay with animated opacity) avoids re-animating SVG fill properties.
4. **Slide direction**: Leaving item slides towards the direction of navigation; entering item slides in from the opposite side.
5. **Swipe threshold**: 50px horizontal threshold with vertical drift rejection (`|dx| > |dy| * 1.5`).

### Revisions
- Removed SVG `<filter>` element from woosh2.svg (unsupported in react-native-svg)
- Removed woosh2.svg hardcoded `fill` so fill prop controls color
- Removed stale duplicate code block referencing non-existent `squiggleD` variable
- Added missing `shadowLayer3` style definition that was causing a layout-shift bug (green wave pushed out of view)

## 13/05/2026: Explore Page Build & Layout Fixes

### New Components
- **ExploreHeader** (`components/pages/explore/header/ExploreHeader.tsx`) — Wave background (always green), title (`head1`), and inverted button. Wave is flipped horizontally (`scale(-1,1)`) with a small rotation.
- **MonthlyCandidates** (`components/pages/explore/carousel/MonthlyCandidates.tsx`) — Horizontal carousel with 3.5 visible cards (4th peeks naturally via card sizing, no `paddingRight`). Full-width ScrollView breaks out of `StyledView` padding via negative margins.
- **VegetableList** (`components/pages/explore/vegetableList/VegetableList.tsx`) — "Alle groenten" title, search bar (white border, no background, SearchIcon + TextInput with bold font), and `CardContainer` grid.
- **ScrollContext** (`context/ScrollContext.ts`) — Provides `scrollTo` function from `StyledView`'s internal ScrollView to descendants via context.

### Layout Collapse Fix
- Added `width: "100%"` to all top-level children of `StyledView` (MonthlyCandidates container, VegetableList container) — `alignItems: "center"` on the ScrollView's `contentContainerStyle` collapses children without explicit width.
- Moved `paddingTop: 110` and `paddingHorizontal: BAR_MARGIN` from `StyledView`'s ScrollView `style` to a wrapper `<View>` inside the ScrollView to prevent scroll clipping.
- Added `keyboardShouldPersistTaps="handled"` to the ScrollView.

### Keyboard-Aware Scrolling
- `VegetableList` captures `containerY` and `searchBarY` via `onLayout`, scrolls to `containerY + searchBarY - 50` on TextInput focus.
- `useEffect` listener on `keyboardDidHide` blurs the TextInput so cursor disappears and `onFocus` fires again on next tap.

### Type Changes
- `VegetableCardProps.warning` made optional (`warning?: boolean`) — used for carousel items without warning state.
- `VegetableCard` card style gained `minHeight: 130` to prevent vertical collapse when container width is 0.

### Carousel Polish
- Removed `paddingRight` from scrollContent — prevents overscroll past the last item into empty space.
- Card width recalculated as `(SCREEN_WIDTH - BAR_MARGIN - 3 * gap) / 3.5` so the 4th card peeks naturally within the frame.

## 13/05/2026: Garden Page — Pannable Garden Grid

### New Components
- **GardenGridItem** (`components/shared/gardenGrid/GardenGridItem.tsx`) — Image-only plant renderer. `GardenPlant` interface now includes `x` and `y` grid coordinates.

### Garden Page Rework
- Replaced placeholder `app/(garden)/garden.tsx` with a pannable/zoomable grid:
  - **StyledView safe** with `scrollEnabled={false}` — uses safe area layout without ScrollView gestural conflict.
  - **Control Bar**: "Bewerken" pill button (lightGrey bg) + zoom out/in circular buttons (green bg, matching `StyledButton` color scheme).
  - **5x6 cell grid**: All cells rendered absolutely with `borderStyle: "dashed"` and `borderColor: Styling.Colors.green`. Empty cells show only the dashed border.
  - **Plant positioning**: Plants placed at `{ left: x * CELL, top: y * CELL }` via `plantMap` lookup from a `Map<string, GardenPlant>`.
  - **Pan**: `PanResponder` tracks drag to update `translateX`/`translateY` offset state. Stale closure fixed via `offsetRef` synced with `useEffect`.
  - **Zoom**: Buttons adjust `scale` state (0.5–2.0, step 0.2) applied via `transform: [{ translateX }, { translateY }, { scale }]`. Grid always has 5×6 cells regardless of zoom level.

### Clamping & Zoom-Centered Pan (13/05/2026)
- Added `clampOffset()` — constrains `offset` so empty space never appears inside the viewport. When the scaled grid fits, it's centered and immovable. When larger, edges stop at viewport edges.
- Added `viewportSize` state + `onLayout` on the viewport to get real dimensions for clamping.
- Fixed stale closures in PanResponder: added `scaleRef` and `viewportSizeRef` synced via `useEffect` so `onPanResponderMove` reads current values.
- **Zoom preserves center**: `recomputeOffsetForZoom` computes the grid coordinate at viewport center before zoom, then adjusts offset so the same coordinate stays centered after zoom.
- Centered initial offset so scrolling is possible in both directions from the start.

### Plant Detail Bottom Sheet (13/05/2026)
- Extended `GardenPlant` interface with `PlantStatusData` (water, light, temperature levels/labels/optimal ranges), `nickname`, `stage`, `advice`, `battery`.
- Created **PlantSheet** component (`components/pages/garden/PlantSheet.tsx`): Modal-based bottom sheet with manual `Animated.View` animations (backdrop fades in place, sheet slides up independently via `translateY`). `internalVisible` state keeps the Modal alive during the 200ms close animation.
- **StatusBar** sub-component: light gray track, dark gray fill width from `level%`, red vertical markers at `optimalMin`/`optimalMax`.
- **Rows** for Water/Licht/Warmte with label + value + StatusBar.
- Header with plant nickname (green `head1`) and circular X close button (green bg, `close.svg` icon).
- Subtitle shows growth stage e.g. "Stadium: Groeispurt (3/4)".
- Advice section + Sensor section (battery %).
- Footer "Bekijk in detail" pill button.
- Updated `GardenGridItem` to wrap in `TouchableOpacity` with `onPress` prop.
- Wired `selectedPlant` state + `PlantSheet` in `garden.tsx`; plant data includes all status fields with realistic values.

## 13/05/2026: Edit Mode & Garden Refactor

### Philosophy & Constraints
- "Coach" approach: advise don't automate; jargon-free UI for person "Anna"
- TypeScript everywhere; StyledView / StyledText / StyledIcon components
- Transform order `[scale, translate]` for zoom math
- All animations: `useNativeDriver: true`
- PanResponder callbacks: ref-based closures to avoid stale state
- Modal renders above floating tab bar (native layer) - no z-index needed
- All layout padding replaced with `<Spacer>` components

### Implemented: Full Edit Mode
- Edit entry: "Bewerken" button -> snapshots plants/cols/rows -> zoom-to-fit (`fitScale = max(MIN_SCALE, min(1, min(vw/w, vh/h) * 0.9))`) - restores on "Niet opslaan"
- Exit flow: Both hardware back button and "Klaar" call `confirmExit()` -> Alert with "Annuleren" / "Opslaan" / "Niet opslaan"
- Plant selection: Tap cell -> solid green border + overlay; deselect on second tap or empty tap
- Move mode: "Verplaats" -> green highlight on selected cell -> tap empty cell (move) or occupied cell (swap) -> "Annuleren" cancels
- Delete: "Verwijder" button (red pill, `delete.svg`) removes selected plant
- Row/column controls: `[- kol +]` / `[- rij +]` add/remove with Alert blocking removal of last occupied row/col
- Zoom in edit: `[zoom-] [zoom+]` on right side of LayoutControls bar

### Refactored garden.tsx -> Separate Files
- `constants/garden.ts` - CELL, MIN_SCALE, MAX_SCALE, SCALE_STEP, gridDimensions(), clampOffset()
- `data/gardenPlants.ts` - initialPlants mock data (8 plants)
- `components/pages/garden/editMode/EditTopBar.tsx` - back (undo icon) + "Klaar"
- `components/pages/garden/editMode/LayoutControls.tsx` - column/row add/remove + zoom on right
- `components/pages/garden/editMode/ViewTopBar.tsx` - "Bewerken" + zoom buttons
- `components/pages/garden/editMode/SelectionInfo.tsx` - selection status title
- `components/pages/garden/editMode/ActionRow.tsx` - "Verplaats" + "Verwijder", or "Annuleren" during move
- Icons: `delete.svg`, `move.svg`, `add.svg` in `assets/icons/`

### Final Layout
- Edit mode: EditTopBar -> LayoutControls (zoom right via `marginLeft: "auto"`) -> viewport (`flex: 1`, PanResponder active) -> SelectionInfo -> ActionRow placeholder (44px for stability)
- View mode: ViewTopBar -> viewport (`flex: 1`)
- No ScrollView (caused flex:1 viewport collapse) - plain `<View>` in both modes
- No tab bar hide (rejected: complexity + blocks tab-switching during edit)
- Page bg: `Styling.Colors.white`

### Key Design Decisions
1. PanResponder stale closure fix: `offsetRef.current` synced via `useEffect`; refs read in callbacks
2. Transform order `[scale, translate]`: scale first around element center, then translate - eliminates transformOrigin
3. clampOffset for `[scale, translate]`: edge = `cx*(1-s) + tx` (left), `left + GRID_W*s` (right). Fits grid: pin `tx = vw/2 - cx`. Scrolls: range `[vw - cx(1-s) - GRID_W*s, cx(s-1)]`
4. Zoom button sizing: `aspectRatio: 1` + `paddingVertical: sml` + icon `size="reg"` (24px) - consistent across modes
5. ActionRow placeholder: Always-rendered 44px View keeps SelectionInfo title stable
6. Grid flex: 1 in edit mode: No fixed heights - viewport fills remaining space; controls + ActionRow take natural height

### Files Created
- `frontend/constants/garden.ts`
- `frontend/data/gardenPlants.ts`
- `frontend/components/pages/garden/editMode/EditTopBar.tsx`
- `frontend/components/pages/garden/editMode/LayoutControls.tsx`
- `frontend/components/pages/garden/editMode/ViewTopBar.tsx`
- `frontend/components/pages/garden/editMode/SelectionInfo.tsx`
- `frontend/components/pages/garden/editMode/ActionRow.tsx`
- `frontend/assets/icons/add.svg`
- `frontend/assets/icons/delete.svg`
- `frontend/assets/icons/move.svg`

### Status
- All requested features implemented
- No pending or blocked items

## 14/05/2026: Edit Mode Bugs Fixed — Missing Import & Unused Props

### Found & Fixed
- **Missing `StyledText` import** in `garden.tsx` — hint text ("Tap een plant om te selecteren" / "Kies een nieuwe locatie...") would crash on render. Added `import StyledText from "../../components/style/StyledText"`.
- **Unused `cols`/`rows` destructuring** in `LayoutControls.tsx` — caused TS errors since props weren't in the type definition. Removed from both destructuring and type.

### Flow Testing
- Traced the full edit flow: select → sheet → Verplaats → hint → move → sheet re-opens — all logic correct.
- Delete, X close, backdrop close, re-tap deselect, empty cell tap, swap move — all handled correctly.
- TypeScript `--noEmit` and ESLint both pass cleanly.

### Files Modified
- `frontend/app/(garden)/garden.tsx` — added `StyledText` import
- `frontend/components/pages/garden/editMode/LayoutControls.tsx` — removed unused `cols`/`rows` props

## 14/05/2026: EditActionSheet — Overlay Context & Root-Level Rendering

### Problem
The edit action sheet (Verplaats/Verwijder) needed to render **above the tab bar** (like a modal) while still allowing touches to pass through to the garden grid behind it — impossible with React Native's native `Modal` which always captures all touches.

### Solution: Root-Level Overlay via Context
Created an `OverlayContext` + `OverlayProvider` in `context/OverlayContext.tsx`:
- Renders an absolutely positioned `<View>` at the **end** of the root layout tree (after `<Tabs>`), putting it above the tab bar in the z-order.
- Uses `pointerEvents="box-none"` so touches pass through empty areas to the tabs/grid below.
- Garden page calls `setOverlay(<EditActionSheet ...>)` via `useOverlay()` to push content into this overlay slot.

### EditActionSheet Refactor
- Converted from `Modal` to a plain flex-based layout (flex: 1, justifyContent: flex-end).
- Wrapper has `pointerEvents="box-none"` — only the white sheet card captures touches.
- Slides up from off-screen using `Animated.Value` + `translateY`.
- Uses `insets.bottom` as `paddingBottom` on the sheet itself so the white background extends seamlessly into the safe area (hiding the page gradient behind it).

### View Hierarchy
```
OverlayProvider
  ├── StatusBar, NavHeader, Tabs (screens + CustomTabBar)
  └── overlay View (absoluteFill, pointerEvents="box-none")
        └── wrapper (flex:1, justifyContent:flex-end, pointerEvents="box-none")
              └── sheet (white card, paddingBottom includes insets.bottom)
```

### Files Created
- `frontend/context/OverlayContext.tsx` — OverlayProvider + useOverlay hook

### Files Modified
- `frontend/app/_layout.tsx` — wrapped in `<OverlayProvider>`
- `frontend/app/(garden)/garden.tsx` — replaced EditActionSheet usage with `useOverlay()` + `useEffect`; replaced hint text with inline `SelectionInfo`; removed unused imports/styles
- `frontend/components/pages/garden/editMode/EditActionSheet.tsx` — no-Modal refactor, flex-based layout, safe area padding, slide animation

## 14/05/2026: StyledAlert — Custom Popup Component

### Motivation
Replaced React Native's native `Alert.alert()` with a custom styled popup that matches the app's design language.

### Implementation
- Created `StyledAlert` component at `components/shared/StyledAlert.tsx`:
  - Uses `Modal` with transparent backdrop (`rgba(0,0,0,0.45)`)
  - White rounded card with green title, dark grey message
  - Three button styles: `"default"` (green fill), `"destructive"` (red fill), `"cancel"` (green outline)
  - 1-2 buttons render in a row with `flex: 1`; 3+ buttons stack vertically with natural height
  - `onDismiss` callback fires after any button press to clean up state
  - Includes `<StatusBar style="light" />` inside the Modal to prevent OS status bar from turning white

### Changes in garden.tsx
- Replaced all 5 `Alert.alert()` calls with `setAlertConfig()` state
- Added `alertConfig` state (`{ title, message, buttons? } | null`)
- Renders `<StyledAlert>` at the end of the component tree

### Files Created
- `frontend/components/shared/StyledAlert.tsx` — reusable styled alert component

### Files Modified
- `frontend/app/(garden)/garden.tsx` — replaced `Alert.alert()` with `StyledAlert` state-based usage

## 15/05/2026: Account Page Refactor & UI Polish

### StyledIcon: Number Size Support
- Added `getSize()` helper that resolves `size` prop — uses `Styling.IconSize[key]` for named keys, raw number for pixel values. Fixed TypeScript errors when passing numeric sizes like `size={300}`.

### StyledView: Squished Layout Fix
- Changed `contentContainerStyle` `alignItems` from `"center"` to `"stretch"` — the inner content wrapper was collapsing to content width instead of filling the screen, causing squished sub-views.

### Account Page: Back Button & Title Alignment
- Replaced `position: "absolute"` with `top: 70` on the back button with `position: "absolute"`, `top: 0`, `bottom: 0`, `justifyContent: "center"` — both the title (via `alignItems: "center"`) and back button now share the same vertical center.
- Removed `paddingBottom` from header to eliminate center-point discrepancy between the absolute-positioned back button and the flex-centered title.

### Account Page Refactor: 7 Components
- Split monolithic `account.tsx` (536 lines → ~120 lines) into separate components under `components/pages/account/`:
  - `header/AccountHeader.tsx` — Reusable back button + title header
  - `main/AccountMain.tsx` — Profile icon + menu navigation buttons
  - `notifications/NotificationsView.tsx` — Notification list with dismiss/snooze/validate
  - `validate/ValidateStep1.tsx` — "Hoe herken je het nieuwe stadium?" flow step 1
  - `validate/ValidateStep2.tsx` — "Wat verandert er in deze fase?" flow step 2
  - `history/HistoryView.tsx` — History entries grouped by date with vegetable images
  - `settings/SettingsView.tsx` — Push/reminder toggles + account info
- `account.tsx` now only manages state and routing — all rendering/styles moved to component files.

### Notifications: Image Sizing
- `plantThumb` increased from 48×48 to 64×64
- Added `resizeMode="contain"` to prevent image clipping

### History View: Date Grouping & Images
- Added `image` field to `HistoryEntry` interface
- Entries grouped by date with green `head3` date headers, sorted newest first
- Each row shows: time → vegetable image (36×36) → event text
- Removed date from individual rows (now only in group headers)

### NavHeader: Hidden on Account Pages
- Added `useSegments` from `expo-router` in `_layout.tsx`
- NavHeader (SproutSpot title + account icon) conditionally hidden via `{!isAccountPage && <NavHeader />}` when route contains "account"

### Account: Reset to Main View on Focus
- Added `useFocusEffect` from `@react-navigation/native` — resets `currentView` to `"main"` every time the account screen gains focus, ensuring users land on the main page when navigating via the tab/profile icon.

### Files Created
- `frontend/components/pages/account/header/AccountHeader.tsx`
- `frontend/components/pages/account/main/AccountMain.tsx`
- `frontend/components/pages/account/notifications/NotificationsView.tsx`
- `frontend/components/pages/account/validate/ValidateStep1.tsx`
- `frontend/components/pages/account/validate/ValidateStep2.tsx`
- `frontend/components/pages/account/history/HistoryView.tsx`
- `frontend/components/pages/account/settings/SettingsView.tsx`

### Files Modified
- `frontend/components/style/StyledIcon.tsx` — added `getSize()` for number support
- `frontend/components/style/StyledView.tsx` — changed `alignItems` to `"stretch"`
- `frontend/app/(account)/account.tsx` — refactored to use components, added `useFocusEffect`
- `frontend/app/_layout.tsx` — conditionally hide NavHeader on account routes
- `opencode/HISTORY.md` — updated with current session changes

## 15/05/2026: Settings Rework — Modals, Hour Grid, Splitting

### Settings Data Model Change
- Replaced `TimeWindow[]` (`{id, start, end}`) with flat `activeHours: number[]` — a toggle-based array of selected hours (0–23). Display groups consecutive hours into ranges (e.g. `"08:00-22:00"` or `"08:00-22:00 +1"` for multiple ranges).

### StyledAlert: Extended with Children + Close Button
- Added optional `children?: React.ReactNode` prop — when provided, renders children instead of `message` (backward compatible, garden alerts unaffected).
- Added optional `titleAlign?: "left" | "center"` prop — settings pass `"left"` with `paddingRight: 50` to clear the close button; garden alerts stay centered.
- Added close button (32×32 green circle, white X icon) at top-right of the card, taken from `EditActionSheet` styling.
- Buttons changed from row to column layout so "Annuleren"/"Opslaan" never overflow.
- Fixed pre-existing TS error on line 50 (style array with boolean short-circuit → ternary).

### Inline Editing → Custom Modals
- Removed all inline editing from SettingsView. Name, password, and time slots now each open a `StyledAlert` modal with the close button (dismiss = cancel).
- Name modal: single `TextInput`.
- Password modal: two `TextInput`s (current + new, `secureTextEntry`).
- Time slots modal: grid of 24 toggleable hour buttons (inactive: `#e8e8e8`, active: green `#00CA68`, white text when active).

### Split Into Components (settings/)
- `SettingsView.tsx` — slimmed from 310→130 lines, only manages state + renders rows + imports modals
- `NameEditModal.tsx` — StyledAlert with TextInput for name
- `PasswordEditModal.tsx` — StyledAlert with two TextInputs
- `TimeSlotsModal.tsx` — StyledAlert with hour grid + toggle logic + exports `formatActiveHours()`

### Color Fix
- `lightGrey` changed from `#a1a1a1` to `#c0c0c0` for readable contrast on dark background.

### Deleted
- `EditModal.tsx` — replaced by extended `StyledAlert`.

### Files Created
- `frontend/components/pages/account/settings/NameEditModal.tsx`
- `frontend/components/pages/account/settings/PasswordEditModal.tsx`
- `frontend/components/pages/account/settings/TimeSlotsModal.tsx`

### Files Modified
- `frontend/components/style/StyledAlert.tsx` — added `children`, `titleAlign`, close button, column buttons, fixed TS error
- `frontend/components/pages/account/settings/SettingsView.tsx` — uses new modals
- `frontend/app/(account)/account.tsx` — replaced `TimeWindow` state with `activeHours`
- `frontend/constants/Styling.ts` — `lightGrey` contrast bumped

### Files Deleted
- `frontend/components/pages/account/settings/EditModal.tsx`

### TypeScript
- Zero errors (including the previously pre-existing StyledAlert error).

## 16/05/2026: Plant Detail Page & Graph Modal

### New Page: Plant Detail
- Created `app/(garden)/plant-detail.tsx` — full detail page for a plant, navigated from "Bekijk in detail" button in PlantSheet.
- **Header**: Back button (left) + plant nickname (center) via `AccountHeader`-style layout.
- **Growth Stage Section** (`GrowthStageSection.tsx`): Horizontal progress bar showing full growth timeline with colored segments for each stage. Vertical markers separate stages. Stage labels rendered below the bar. "Day X/Y" counter on the right. Description text below for the current stage.
- **Requirements Section** (`RequirementsSection.tsx`): "Wat heeft [plant] nodig?" with Water/Light/Temperature rows showing optimal range as a green zone on a grey track bar, plus numeric range label.
- **Technical Overview** (`TechnicalOverview.tsx`): "Technisch overzicht" with probe name, battery %, last measurement timestamp, last moisture/light/temp values in a key-value list.
- **Graph Button**: "Bekijk grafieken" button at bottom → opens `GraphModal`.

### Graph Modal (`GraphModal.tsx`)
- **Dropdown**: Selector at top with Vocht/Temperatuur/Licht options (custom dropdown, no external library).
- **SVG Chart**: Hand-drawn line chart using `react-native-svg` with:
  - Green shaded band for optimal range (dashed border lines)
  - Horizontal grid lines with Y-axis labels
  - X-axis time labels
  - Colored line path with circle dots for data points
  - Legend below chart showing measurement color + optimal range meaning
- **Close button**: Green circle with X icon at top-right.

### Interface Changes
- Added `type: string` field to `GardenPlant` interface (e.g., "Tomaat", "Kool").
- Added `type` to all 8 mock plants in `gardenPlants.ts`.
- `StyledText` `style` prop changed from `TextStyle` to `StyleProp<TextStyle>` for array style support.

### Files Created
- `frontend/app/(garden)/plant-detail.tsx`
- `frontend/components/pages/garden/plantDetail/GrowthStageSection.tsx`
- `frontend/components/pages/garden/plantDetail/RequirementsSection.tsx`
- `frontend/components/pages/garden/plantDetail/TechnicalOverview.tsx`
- `frontend/components/pages/garden/plantDetail/GraphModal.tsx`

### Files Modified
- `frontend/components/pages/garden/gardenGrid/GardenGridItem.tsx` — added `type` to GardenPlant
- `frontend/data/gardenPlants.ts` — added `type` to all entries
- `frontend/components/pages/garden/plantSheet/PlantSheet.tsx` — added `router` navigation to detail page
- `frontend/components/style/StyledText.tsx` — `StyleProp<TextStyle>` for style prop
- `frontend/components/pages/garden/editMode/SelectionInfo.tsx` — removed unused import
- `frontend/opencode/HISTORY.md` — updated with current session

### Polish Round (16/05/2026 continued)
- **GrowthStageSection**: 
  - Removed stage labels beneath the bar
  - Bar restyled to match StatusBar from PlantSheet (height 8, green fill centered at height 6, `borderRadius: 4`, `overflow: visible`)
  - Completed stages merged into one continuous bar instead of individual segments
  - Past bar: `borderTopLeftRadius` + `borderBottomLeftRadius` only; Current stage: `borderTopRightRadius` + `borderBottomRightRadius` only
  - Added `left: 1` inset to completed bar for consistent background visibility
  - Day label alignment: `lineHeight: 14` to match fontSize for better vertical centering with 8px track
- **RequirementsSection**: StatusBar fill changed to `left: 1` with all-corners `borderRadius` — background grey equally visible on left, top, bottom
- **TechnicalOverview**: Restored `borderBottomWidth` lines between info rows
- **plant-detail.tsx**: Removed divider Views between growth/requirements/technical sections
- **PlantSheet.tsx**: Added `left: 1` to StatusBar fill inline style
- **GraphModal**:
  - Dropdown text centered (`justifyContent: "center"`, arrow positioned absolutely on right)
  - Dropdown options list changed to `position: "absolute"` overlay over graph (no longer pushes graph down)
  - Chart height reduced from 220 to 150, padding tightened (top 20→12, bottom 30→20, left 40→35, right 20→15)
  - All metrics updated to 24-hour data (00:00–23:00, hourly)
  - X-axis labels auto-filter to every 6 hours

### StyledText
- `style` prop changed from `TextStyle` to `StyleProp<TextStyle>` for array style support

## 16/05/2026: Home→Garden Navigation Wiring & Polish

### Home Page → Garden Navigation
- Created `data/vegetables.ts` — shared `VegetableInfo` catalog for future explore page use.
- Added `onPress?: () => void` to `VegetableCardProps` — wraps card in `TouchableOpacity` when provided.
- Added `onItemPress?: (id: string) => void` to `CardContainer` — passes `onPress` down to each card.
- Added `onItemPress?: (id: string) => void` to `StatusHeader` — wraps `CenterContent` in `TouchableOpacity` in all three render locations.
- Replaced inline mock data in `app/index.tsx` with `initialPlants` from `data/gardenPlants.ts`, mapped to display format with proper short messages (warning plants derive alert text from out-of-range metrics; non-warning show "niks nodig").
- Wired `onItemPress` → `router.push("/(garden)/garden?selectedPlantId=X")` for both `StatusHeader` and `CardContainer`.

### Garden Page: URL Param Handling
- Added `useLocalSearchParams` to read `selectedPlantId` from route params.
- `useEffect` auto-opens `PlantSheet` on param change.
- `onClose` clears URL param via `router.setParams({ selectedPlantId: undefined })` so re-clicking the same vegetable from home re-triggers navigation.

### PlantSheet Animation Fix
- Split open animation into two effects: first sets `internalVisible = true` (renders Modal at closed position), then separate `useEffect` on `internalVisible` starts the slide-up animation — fixes animation being invisible when it ran before the Modal rendered.

### Layout Fixes
- **CardContainer**: Fixed double-subtraction in width calculation. Added invisible placeholder items to fill incomplete last row so `justifyContent: "space-between"` works correctly (last row items at positions 1 & 2 instead of 1 & 3).
- **VegetableCard**: Added `textAlign: "center"` on name text for explicit centering.
- **StatusHeader name**: Stripped vegetable type prefix from `nickname` (e.g. "Tomaat Toby" → "Toby") to avoid duplication in banner ("Tomaat Tomaat Toby" → "Tomaat Toby").

### Files Created
- `frontend/data/vegetables.ts`

### Files Modified
- `frontend/components/shared/vegetableCard/VegetableCard.tsx` — `onPress`, `textAlign`
- `frontend/components/shared/vegetableCard/CardContainer.tsx` — `onItemPress`, placeholder items, width calc
- `frontend/components/pages/home/statusHeader/StatusHeader.tsx` — `onItemPress` prop, tappable CenterContent
- `frontend/app/index.tsx` — `initialPlants` import, `router.push` navigation
- `frontend/app/(garden)/garden.tsx` — `selectedPlantId` param, auto-open, clear on close
- `frontend/components/pages/garden/plantSheet/PlantSheet.tsx` — split animation effects

### TypeScript
- Zero errors.

## 16/05/2026: Explore Sub-Pages, Plant Finder, Wave Background

### Sub-Page Navigation Pattern
- **Back button fix**: All sub-page back buttons use `router.navigate("/(group)/page")` instead of `router.back()` — expo-router tabs don't maintain reliable back stack for pushed routes.
- **Tab bar active state**: Uses `useSegments()` not `state.index` — `state.index` doesn't reflect sub-pages within a tab group.
- **Tab press on sub-page**: Navigates to tab's main page (e.g., tapping explore tab on vegetable-info goes to explore).

### Vegetable Info Page (`app/(explore)/vegetable-info.tsx`)
- 5-row layout: back button + title, image + general info (light/water/difficulty/temperature), sowing specifics, growth stages, action button.
- Shared `WaveBackground` component behind the image + info row.

### Plant Finder (`app/(explore)/plant-finder.tsx`)
- 4-question flow: placement (inside/outside/either), sunlight (full/partial/shade), month (grid of 12), care level (daily/weekly/either).
- **Option buttons**: Direct tappable pills (no dropdown). Non-month: full-width vertical list. Month: 3-column grid with `small` variant.
- **Progress bar**: Thin horizontal bar replacing dot indicators. `fraction = step / (totalSteps - 1)`.
- **Filter logic**: Matches `VEGETABLE_DETAILS` against all 4 answers, shows results in `CardContainer` grid.
- **Component split**: 4 files under `components/pages/explore/plantFinder/` — `OptionButton`, `ProgressBar`, `QuestionScreen`, `ResultsView`.
- `plant-finder.tsx` reduced from 353→~100 lines.

### Shared WaveBackground (`components/shared/WaveBackground.tsx`)
- Extracted from `ExploreHeader` — same SVG path, shadow layers, and positioning.
- Props: `leftOffset` (default `-SCREEN_WIDTH - 75`), `waveHeight` (default `300`), `widthMultiplier` (default `4`, SVG width = `SCREEN_WIDTH * n`), `style` (ViewStyle overrides).
- Both `ExploreHeader` and `vegetable-info.tsx` use the same component.

### Results Page Card Grid
- Replaced stacked column with `CardContainer` grid — same 3-column card layout as homepage and explore page.
- `ResultsView` imports `CardContainer` directly, passes `VegetableInfo[]` data.

### TypeScript
- Zero errors.

## 16/05/2026: Plant Flow (Step 1–5) & Garden Placement Mode

### 5-Step Plant Flow
Created 5 route files under `app/(explore)/`:

- **Step 1** (`plant-step1.tsx`): Ready checklist — vegetable image (left) + items list (right, no bullets), "Ja, laten we gaan!" button.
- **Step 2** (`plant-step2.tsx`): Sowing guide — white `"Stap X"` titles with description beneath, "Klaar!" button.
- **Step 3** (`plant-step3.tsx`): Name input — "Volgende" button disabled when empty.
- **Step 4** (`plant-step4.tsx`): Transitional "Koppel je sonde" page with "Start instellen" button.
- **Step 5** (`plant-step5.tsx`): 5 sub-steps (charge → WiFi setup with 4 guided substeps + pairing code box → switch back → name probe → plant probe). "Naar de tuin!" button disabled until probe name is filled. Generic placeholder (`"Naam van je sonde"`, no prefilled value).

### FlowLayout (`components/pages/explore/plantFlow/FlowLayout.tsx`)
Shared wizard page layout with `minHeight: 56` header (back arrow + centered title) for consistent alignment.

### Garden Placement Mode (`app/(garden)/garden.tsx`)
- Detects `placementMode=true&vegId=...&name=...` route params.
- Shows "Kies een plek voor {name}" banner above viewport.
- Tapping empty cell calls `makeNewPlant()` helper (constructs `GardenPlant` from `VEGETABLE_DETAILS`) and opens `PlantSheet`.
- `makeNewPlant` defined inline in garden.tsx.

### Vegetable Info → Plant Flow
- Action button on vegetable info page now pushes to `plant-step1?vegId={id}` instead of placeholder navigation.

### Dependencies
- Installed `expo-clipboard` (with `--legacy-peer-deps`) for pairing code copy-to-clipboard in step5.

### FlowLayout Header Alignment Fix
- Added `minHeight: 56` to ensure short titles don't sit awkwardly high vs the back button.

### Key Decisions
1. **Back navigation**: Uses `router.navigate` not `router.back()` — expo-router tabs don't have reliable back stack.
2. **Probe connection wizard**: Purely instructional — app cannot switch WiFi or open browser.
3. **Garden placement**: Uses route params (`vegId`, `name`) to pass data from flow into garden page.
4. **Step5 button guard**: "Naar de tuin!" is disabled at 40% opacity until a probe name is entered — prevents accidental skip.

### Files Created
- `frontend/app/(explore)/plant-step1.tsx`
- `frontend/app/(explore)/plant-step2.tsx`
- `frontend/app/(explore)/plant-step3.tsx`
- `frontend/app/(explore)/plant-step4.tsx`
- `frontend/app/(explore)/plant-step5.tsx`
- `frontend/components/pages/explore/plantFlow/FlowLayout.tsx`

### Files Modified
- `frontend/app/(garden)/garden.tsx` — placement mode params, banner, `makeNewPlant()` helper
- `frontend/app/(explore)/vegetable-info.tsx` — action button pushes to step1

### TypeScript
- Zero errors.

## 17/05/2026: Onboarding Carousel — 4-Screen Introduction Flow

### Implementation
- Created `OnboardingCarousel` component at `components/onboarding/OnboardingCarousel.tsx` — full-screen carousel with 4 onboarding slides.

### Slide Data
| Screen | Title | Text | Position | BG Image |
|---|---|---|---|---|
| 1 | Tuinieren tussen het beton! | Wil je groen op je balkon... | topLeft | onboarding1.png |
| 2 | Orde in je groene chaos! | Sleep je planten naar de juiste plek... | bottomRight | onboarding2.png |
| 3 | Krijg een gerust hart! | Krijg notificaties van de sensoren... | bottomLeft | onboarding3.png |
| 4 | Ontdek SproutSpot! | Maak een account aan en start... | bottomCenter (+ "Begin nu!" button) | onboarding4.png |

### Carousel Logic
- **Animation**: Uses `Animated.Value` + `slideAnim` (timing 300ms, native driver) — same pattern as `StatusHeader`. Leaving slide slides out (translateX 0→direction*SCREEN_WIDTH, opacity 1→0); entering slide slides in (translateX -direction*SCREEN_WIDTH→0, opacity 0→1).
- **PanResponder**: Horizontal swipe with 50px threshold and vertical drift rejection (`|dx| > |dy| * 1.5`). Swiping right on last screen calls `onComplete`.
- **Transition guard**: `isAnimating` ref prevents concurrent transitions.
- **Navigation**: Left/right chevron arrow buttons below content + swipe gestures.

### UI Elements
- **Background**: Full-screen `Image` with `resizeMode="cover"` for each slide.
- **Text overlay**: Positioned absolutely per slide spec (`topLeft` = `{top: insets.top+60, left: 24}`, `bottomRight` = `{bottom: 120, right: 24}`, etc.).
- **Progress dots**: 4 dots in bottom bar, active dot white, inactive at 40% opacity.
- **Skip button**: "Overslaan" link at top-right — calls `onComplete` immediately.
- **Start button**: White pill "Begin nu!" button on last screen only — calls `onComplete`.
- **Arrow buttons**: Left arrow hidden at slide 0, right arrow becomes "Start" text on last slide.

### Integration in Root Layout
- `_layout.tsx` now conditionally renders `<OnboardingCarousel>` before `<OverlayProvider>` + `<Tabs>`.
- State `showOnboarding` (default `true`) controls visibility. `onComplete` sets it to `false`.
- Onboarding is always shown on first launch. No persistence yet (no AsyncStorage — will be added when auth flow is built).

### Files Created
- `frontend/components/onboarding/OnboardingCarousel.tsx`

### Files Modified
- `frontend/app/_layout.tsx` — added import + conditional rendering

### TypeScript
- Zero errors.

## 17/05/2026: Onboarding Refactor, Auth Screen, Register Flow & Routing

### Onboarding Refactor (Components Split)
- Split monolithic `OnboardingCarousel.tsx` into 3 reusable pieces:
  - `data/onboardingSlides.ts` — slide data array (4 slides with title, text, position, bg image)
  - `components/shared/DotIndicator.tsx` — pagination dots (active white, inactive 40% opacity)
  - `components/onboarding/OnboardingSlide.tsx` — single slide renderer with lookup maps for `positionStyles` (topLeft/topRight/bottomLeft/topCenter), `textAlignStyles`, and `buttonVisibility`
- Main carousel now orchestrates animation + renders slides via map.

### Bugfix: Onboarding Slide Positioning
- **topRight slide**: Was missing `alignItems: "flex-end"` in refactored `positionStyles` lookup — caused title/description to stretch full width instead of right-aligning to the `right: 24` edge.
- **topCenter slide**: Had incorrect `marginHorizontal: "auto"` and `width: SCREEN_WIDTH` — replaced with `left: 0, right: 0, alignItems: "center", maxWidth: SCREEN_WIDTH` (matching original inline style).
- Removed `width: "80%"` from base title/description styles — text now sizes naturally.

### AuthScreen: Login/Register
- Created `components/auth/AuthScreen.tsx` with:
  - Toggle pill (Registreren / Inloggen) — defaults to register mode
  - Fields: name (≥2 letters, a-zA-Z only), email, password (with validation), repeat password
  - Password rules shown one at a time in progression (8 chars → capital → lowercase → digit → symbol)
  - `KeyboardAvoidingView` + `ScrollView` with `flexGrow: 1` for basic keyboard handling
  - Validation errors shown inline below each field (red text)
  - `onComplete` passes `"login"` or `"register"` to parent for routing decision
  - Auto-scroll logic removed for later clean-slate implementation

### RegisterFlow: Post-Registration Flow
- Created `components/auth/RegisterFlow.tsx` — state-machine steps:
  - `"intro"` → "We gaan de beste plant voor je zoeken" with green "Starten" button
  - `"finder"` → 4 plant-finder questions (location, sunlight, month grid, care level) with ProgressBar + OptionButtons
  - `"results"` → filtered `CardContainer` grid matching VEGETABLE_DETAILS against answers
  - `"step1"`–`"step4"` → planting checklist, sowing guide, name input, probe intro
  - `"step5"` (sub 0–3) → charge probe, WiFi setup with pairing code, switch back, name probe + plant
  - `"done"` → returns null (transition handled by parent)

### Bugfix: FinderStep Routing
- **Dual state conflict**: `finderStep` state and `step.type === "finder"` with `step.question` both tracked the question index but never synced — clicking "Volgende" changed `finderStep` but the render used `step.question` which stayed at 0.
- **Fix**: Changed `step` for finder from `{ type: "finder", question: number }` to just `"finder"` string — `finderStep` is now the single source of truth for the question index.

### Bugfix: GuideRow JSX in Strings
- Steps 2 and 3 of the probe WiFi setup had `StyledText` components embedded as literal strings inside the `text` prop of `GuideRow` (typed as `string`) — they rendered as raw source code.
- **Fix**: Inlined the two problematic steps as direct `View`/`StyledText` structure with proper nested `<StyledText>` for green-highlighted words (`SproutSpot-Setup`, `sproutspot.local`).

### Bugfix: Grey Screen After Registration
- "Naar de tuin!" button called `setStep("done")` which returned `null` (grey screen), but `onComplete` was never called — parent `_layout.tsx` never unmounted RegisterFlow.
- **Fix**: Button now calls `onComplete(selectedVeg.id, plantName)` + `setStep("done")`.

### Garden Placement Mode on Register Complete
- `RegisterFlow.onComplete` signature changed from `() => void` to `(vegId: string, name: string) => void`.
- `_layout.tsx` stores pending plant data in state, `useEffect` navigates to `/(garden)/garden?placementMode=true&vegId=...&name=...` after RegisterFlow unmounts — same flow as explore tab's plant wizard.

### RegisterFlow Month Button Sizing
- Month buttons replaced `OptionButton` with custom inline buttons: smaller font (10px vs 14px), tighter padding (4px vs 8px), 3-column grid with 4px gap.
- Later revisions: removed inner `paddingHorizontal`, increased font to 14px, removed `finderContentPad` paddingHorizontal for full-width grid.

### Files Created
- `frontend/components/onboarding/OnboardingSlide.tsx`
- `frontend/components/shared/DotIndicator.tsx`
- `frontend/data/onboardingSlides.ts`
- `frontend/components/auth/AuthScreen.tsx`
- `frontend/components/auth/RegisterFlow.tsx`

### Files Modified
- `frontend/components/onboarding/OnboardingCarousel.tsx` — uses new components
- `frontend/app/_layout.tsx` — onboarding → auth → RegisterFlow/tabs routing; pendingPlant state + useEffect for garden placement navigation after register flow
- `frontend/components/auth/AuthScreen.tsx` — keyboard handling (KeyboardAvoidingView + ScrollView), progressive password rules, validation

### TypeScript
- Zero errors.

## 17/05/2026: AuthScreen Keyboard Fix — Nested ScrollView & Auto-Scroll

### Problem
- `AuthScreen` wrapped content in a `StyledView` (ScrollView) around a `KeyboardAvoidingView` containing another `ScrollView` — double nesting broke keyboard-avoiding behavior.
- Inputs remained hidden behind the keyboard; no auto-scroll to focused field.

### Fix: Removed StyledView, Single ScrollView + Keyboard Listeners
- Replaced outer `StyledView` (ScrollView) with a plain `<View>` with `gradGrey` background and safe area padding.
- Removed `KeyboardAvoidingView` (was causing grey bar overlap when adding padding).
- Added `Keyboard` event listeners (`keyboardDidShow`/`keyboardDidHide`) that set `keyboardPadding` state to `keyboardHeight + 20`.
- Applied `paddingBottom: keyboardPadding` to ScrollView's `contentContainerStyle` — positions content 20px above keyboard without exposing grey background.

### Auto-Scroll to Focused Input
- Each TextInput wrapped in `<View>` with `onLayout` capturing Y position relative to the `form` container.
- `form` container has `onLayout` tracking its offset within the ScrollView.
- `scrollToInput(field)` computes `formY + inputY - 160` and calls `scrollRef.scrollTo()` immediately (no delay).
- All TextInputs have `onFocus` wired to `scrollToInput` with their field key.

### Padding Fix
- Removed unnecessary `paddingTop` from container that was causing layout clipping.

### Files Modified
- `frontend/components/auth/AuthScreen.tsx` — full keyboard/scroll refactor
- `opencode/HISTORY.md` — updated

## 17/05/2026: Plant Images Moved to Backend — Static Serving + Seed Data

### Decision
- Plant images will be served from the backend (`backend/public/images/plants/`) as PNGs instead of bundled in frontend assets.
- Frontend keeps local `require()` images for now (mock data); API integration will use `{ uri }` format later.

### Backend: Static File Serving
- Created `backend/public/images/plants/` directory.
- Copied `tomato.png` and `cabbage.png` from `frontend/assets/vegetables/`.
- Added `app.use("/images", express.static(path.join(__dirname, "public")))` in `app.ts` — serves at `/images/plants/tomato.png`.

### Backend: Image URL Construction
- Added `buildImageUrl(req, filename)` helper in `PlantController` — builds full URL: `{protocol}://{host}/images/plants/{filename}`.
- Added `mapPlant(req, plant)` helper that spreads plant record and replaces `image` with the full URL.
- Applied mapping in `getAllPlants`, `getPlantById`, and `searchPlants`.

### Seed Data: Plants (002_plants.ts)
- 2 plants: Tomaat and Kool, mapped from frontend `VEGETABLE_DETAILS`.
- Fields: name, light, water, difficulty, temperature, planting_type, image (filename), sowing_depth, sowing_distance, pot_min_depth, sowing_period (JSONB array), germination_time, repotting_after, total_growth_time.
- Deletes existing plant_stages and plants before inserting.

### Seed Data: Plant Stages (003_plant_stages.ts)
- 6 stages for Tomaat (Zaaien → Kiem → Blad → Groeispurt → Bloei → Oogst).
- 5 stages for Kool (Zaaien → Kiem → Blad → Groeispurt → Oogst).
- Each stage includes `thresholds` JSONB (soil/temp/humidity/light min/max), duration_days, and validation_description.

### Files Created
- `backend/public/images/plants/tomato.png`
- `backend/public/images/plants/cabbage.png`
- `backend/seeds/002_plants.ts`
- `backend/seeds/003_plant_stages.ts`

### Files Modified
- `backend/app.ts` — added `path` import + `express.static` middleware for `/images`
- `backend/controllers/plant.controller.ts` — image URL construction helpers
- `opencode/HISTORY.md` — updated

## 18/05/2026: Data Format Alignment (Task 14)

### Problem
Backend returned raw DB records while frontend expected a specific shape (Dutch strings, camelCase keys, formatted units, combined objects). Missing frontend data files (`vegetables.ts`, `gardenPlants.ts`, `onboardingSlides.ts`) blocked compilation.

### Solution: Backend Plant Mapper
Created `backend/utils/plantMapper.ts` — centralized transformation layer:

| Frontend expects | Backend had | Translation |
|---|---|---|
| `id: string` ("veg_tomato") | `id: number` (1) | `"veg_" + plant.id` |
| `planting_type: "inside"/"outside"/"both"` | `planting_type: "indoor"/"outdoor"/"both"` | `PLACEMENT_MAP` |
| `temperature: { min, max }` | `temperature_min`, `temperature_max` | Combined into object |
| `sowingPeriod: { startMonth, endMonth }` | `sowing_period: string[]` | Month name → number lookup |
| `sowingDepth/Distance/potDepth: string` | `sowing_depth/distance/pot_min_depth: number` | `"${val} cm"` formatting |
| `light/water/difficulty: string` (Dutch) | DB stores English | `LIGHT_MAP`, `WATER_MAP`, `DIFFICULTY_MAP` translation |
| `careLevel: string` | `care_level: string` | camelCase rename |
| `totalDays: number` | `total_days: number` | camelCase rename |
| `stages: [{ label, durationDays }]` | `PlantStageRecord[]` | `toStageInfo()` transform |

### Controllers Updated
- `plant.controller.ts` — all 4 endpoints (`getAllPlants`, `getPlantById`, `searchPlants`, `getPlantStages`) now use the mapper, returning frontend-friendly shapes

### Frontend Data Files Restored
- `frontend/data/vegetables.ts` — `VegetableInfo` + `VegetableDetail` types, `VEGETABLES` + `VEGETABLE_DETAILS` mock data, `formatSowingPeriod()` + `formatTemperature()` utilities
- `frontend/data/gardenPlants.ts` — `initialPlants` mock data (8 plants matching frontend `GardenPlant` type)
- `frontend/data/onboardingSlides.ts` — `OnboardingSlide` type + `slides` array

### TypeScript
- Frontend: zero errors (`npx tsc --noEmit`)

### Files Created
- `backend/utils/plantMapper.ts`
- `frontend/data/vegetables.ts`
- `frontend/data/gardenPlants.ts`
- `frontend/data/onboardingSlides.ts`

### Files Modified
- `backend/controllers/plant.controller.ts`
- `opencode/HISTORY.md`
- `opencode/TODO.md` — Task 14 marked done

## 18/05/2026: Data Completeness Fixes — Garden Enrichment, Notifications, Profile, Search

### Problem (23 gaps found in audit)
The garden/home endpoints returned raw DB records without water/light/temperature levels, stage progress, warning status, or battery%. Notifications and profile responses also lacked critical fields.

### Solution 1: Plant Enricher (`backend/utils/plantEnricher.ts`)
New async enrichment pipeline for each garden plant:
- Fetches all stages for the plant type → computes `stage.max` (count) and `stage.label` (current stage name)
- Fetches latest telemetry from the linked probe → provides `soil_moist_pct`, `temp_c`, `light_lux`
- Fetches plant record → provides translated water/light labels + temperature range
- Computes `PlantStatusData` (level, label, optimalMin, optimalMax) for water, light, temperature
- Computes `warning: boolean` by comparing levels against stage thresholds
- Computes `advice: string` from threshold violations (e.g. "Geef wat meer water.")
- Converts raw `battery_voltage` → `battery` 0-100% percentage

### Solution 2: Garden Repository + Service Updated
- Added `up.nickname` and `up.plant_id` to the active plants query in `garden.repository.ts`
- `getUserGarden` and `getUserDashboard` both call `enrichPlants()` before returning

### Solution 3: Profile Endpoint
- Added `pairing_code` to `GET /api/user/profile` and `PUT /api/user/profile` responses

### Solution 4: Notification Response Shape
- `notification.repository.ts`: joined `user_plants` + `plants` to include `plant_image`
- `notification.controller.ts`: new `mapNotification()` transforms backend fields to frontend shape
- Type mapping: `"sensor_alert"` → `"problem"`, `"stage_validation"/"system_status"` → `"milestone"`
- Field mapping: `message` → `description`, added `image: { uri }`, added `snoozed: boolean`

### Solution 5: Plant Search Filters
- Added `sunlight` and `care_level` query params to `GET /api/plants/search`
- Updated controller, service, and repository to support the new filters

### Remaining (non-blocking for Task 9)
- Graph modal data is still hardcoded (needs frontend to consume readings endpoint)
- History view is mock-only (Task 13)
- Time slots format mismatch (frontend: hour array, backend: start/end strings)
- No push toggle boolean (infer from null check)

### Files Created
- `backend/utils/plantEnricher.ts`

### Files Modified
- `backend/repositories/garden.repository.ts`
- `backend/services/garden.service.ts`
- `backend/controllers/user.controller.ts`
- `backend/repositories/notification.repository.ts`
- `backend/controllers/notification.controller.ts`
- `backend/controllers/plant.controller.ts`
- `backend/services/plant.service.ts`
- `backend/repositories/plant.repository.ts`
- `opencode/HISTORY.md`
- `opencode/TODO.md` — Items 15-19 marked done

## 18/05/2026: Backend Connectivity Verified

### Done
- Restarted backend API server and verified all endpoints respond
- Fixed consolidated migration schema mismatch: rolled back and re-applied migration (was missing `sunlight`, `care_level`, `temperature_min`, `temperature_max`, `total_days` columns)
- Fixed test user password hash: re-ran all 3 seeds (test_user + 8 plants + 11 plant stages)
- Verified API responses:
  - `GET /api/plants/` → 8 plants (Basil, Cabbage, Carrot, Lettuce, Mint, Spinach, Strawberry, Tomato)
  - `POST /api/users/login` → JWT token returned for test user
  - `GET /api/gardens/status` → empty (no garden yet — expected)
  - `GET /api/notifications` → 0 notifications (no issues — expected)
- All endpoints authenticated and returning correct shapes

### Fixed: Image URLs in Garden Enricher & Notifications
- Garden enricher returned raw filenames (`"tomato.png"`) instead of full URLs — frontend produced invalid `{ uri: "tomato.png" }`. Fixed by threading `baseImageUrl` from controller → service → enricher, constructing URLs like `http://host:5001/images/plants/tomato.png`.
- Same issue in notification `mapNotification` — now accepts `baseImageUrl` and builds full URLs.

### All Response Shapes Verified
| Endpoint | Frontend Type | Status |
|---|---|---|
| `GET /api/plants/` | `PlantListItem[]` | ✅ |
| `GET /api/plants/:id` | `PlantDetail` | ✅ |
| `GET /api/plants/:id/stages` | `StageInfo[]` | ✅ |
| `POST /api/users/login` | `LoginResponse` (inside `ApiResult`) | ✅ |
| `POST /api/users/signup` | `SignupResponse` | ✅ |
| `GET /api/users/profile` | `UserProfile` | ✅ |
| `GET /api/gardens/` + `/status` | `EnrichedPlant[]` | ✅ (after fix) |
| `GET /api/notifications/` | `NotificationItem[]` | ✅ (after fix) |
| `GET /api/probes/` | probe list with battery/wifi | ✅ |

### Test Account Enriched
- Created `seeds/004_enrich_test_data.ts` — enriches the test user with realistic data:
  - Garden: 5x6 grid
  - 5 user plants: Toby (Tomato), Bas de Basilicum, Aardbei, Sla, Munt at distinct positions
  - 1 probe (Sonde 1) linked to Tomato with 49 telemetry entries (hourly for 48h)
  - 1 active issue (low_water) + 2 notifications (sensor_alert + stage_validation)
- Fixed seed deletion order in `001_test_user.ts` (pending_notifications → active_issues → probe_entries → user_plants → probes → users)
- All 4 seeds idempotent and runnable via `npx knex seed:run`

### Key Fixes
- `001_test_user.ts`: explicit `id: 1` in insert, proper FK-safe deletion order
- `004_enrich_test_data.ts`: resets sequences, uses explicit IDs, creates garden row
- `backend/controllers/garden.controller.ts`: `buildImagesBaseUrl()` passes to service
- `backend/controllers/notification.controller.ts`: `buildImagesBaseUrl()` passes to `mapNotification()`
- `backend/utils/plantEnricher.ts`: `baseImageUrl` param appended to filenames
- `backend/services/garden.service.ts`: passes `baseImageUrl` through to enricher
- `backend/utils/plantMapper.ts`: `buildImageUrl()` exportable for reuse
- `backend/seeds/001_test_user.ts`: FK-safe deletion order + explicit `id: 1`
- `backend/seeds/004_enrich_test_data.ts`: new seed for test data enrichment

## 19/05/2026: Day 2 Recap + Commits

### Session Overview
- Recapped all work done so far (goals, constraints, progress, key decisions, next steps)
- Review of plant mapper: confirmed all translations present (placement, months, light, water, difficulty)
- Fixed `backend/seeds/001_test_user.ts` — changed plain-text `password_hash: "test1234"` to use `bcrypt.hash("test1234", 10)` at seed time
- Clarified frontend password approach: no client-side hashing needed — HTTPS encrypts transport, bcrypt server-side is the standard

### Commits (8 total)
```
bd25805 install(auth): added bcrypt + jsonwebtoken for JWT
36bd0c1 feat(auth): added signup/login/profile/password routes
28eeb5e feat(user-plants): added createUserPlant + garden dashboard route
a302710 feat(schema): consolidated migration + added plant seed data
6329973 feat(api-alignment): added backend plant mapper for frontend shapes
c844f3d feat(api-alignment): enriched garden endpoints with full plant status data
830981f feat(api-alignment): aligned notification response with frontend shape
81ca0aa fix(mock-data): restored frontend data files
```

### Files Modified
- `backend/seeds/001_test_user.ts` — switched to bcrypt-hashed password
- `opencode/HISTORY.md` — updated
- `opencode/TODO.md` — updated

## 19/05/2026: Probe Choice — New or Existing in Plant Flow

### Feature
Step 4 of the plant flow ("Koppel je sonde") now offers a choice:
- **"Ik heb al een sonde"** — lists the user's unpaired probes (`state !== "paired"`), tapping one navigates to garden with `probeId` param
- **"Ik stel een nieuwe sonde in"** — goes to step 5 (existing wizard, unchanged)

During garden placement, if `probeId` is set:
- After `createUserPlant()` succeeds, `pairProbe(probeId, userPlantId)` is called automatically
- The probe is linked to the new plant immediately

### Backend requirement
None — `GET /api/probes`, `POST /api/probes/:id/pair`, and `POST /api/user-plants` (returns `id`) already exist.

### Files Modified
- `frontend/app/(explore)/plant-step4.tsx` — rewrite: choice screen, probe list, route with/without `probeId`
- `frontend/app/(garden)/garden.tsx` — accept `probeId` param, capture `createUserPlant` response ID, call `pairProbe`
- `frontend/services/garden.ts` — `createUserPlant` now returns `CreateUserPlantResult` with `id`
- `frontend/services/probes.ts` — added `state` field to `ProbeInfo` interface
- `frontend/assets/icons/probe.svg` — new icon for probe list rows

## 19/05/2026: Explore Page Virtualization — FlatList Replaces CardContainer

### Problem
"Toon meer" pagination just deferred the issue — loading all 6-item pages eventually rendered all items, causing lag. The root cause was `CardContainer` rendering all items in a flexWrap `<View>` inside `StyledView`'s `ScrollView` — every image stayed mounted.

### Solution: FlatList with numColumns
Replaced the entire `StyledView` + `CardContainer` approach with a single `FlatList` using `numColumns={3}`:
- **Virtualization**: Only items visible on screen are rendered. Off-screen items are unmounted.
- **Single scroll**: The `FlatList` is the only scrollable element — no nested ScrollView.
- **Eliminated StyledView**: No more ScrollView wrapper. Safe area padding applied directly via `insets.top`.
- **Search + MonthlyCandidates** live in `ListHeaderComponent` — they scroll away naturally.
- **Keyboard dismiss**: `onScrollBeginDrag` blurs the search input.

### Files Modified
- `frontend/app/(explore)/explore.tsx` — full rewrite: no StyledView, no CardContainer, `FlatList` with `numColumns={3}`, search state, virtualized rendering
- `frontend/components/pages/explore/vegetableList/VegetableList.tsx` — no longer imported (kept as dead code)

## 19/05/2026: Explore Page Pagination + Search Implementation

### Pagination for VegetableList
- Added client-side pagination: 6 items per page (`PAGE_SIZE`)
- "Toon meer" button at bottom loads the next 6 items
- Total count shown at bottom when all items are visible
- "Geen groenten gevonden" message when search yields no results
- Reduced `marginBottom` on CardContainer from 300 to 20 (no longer needed for scroll hack)

### Search Now Functional
- `searchQuery` state wired to `TextInput` via `value`/`onChangeText`
- Filters `data` by plant name (case-insensitive `includes` match)
- Resets to page 1 on every search change
- Uses `useMemo` for both filtered and visible data — no re-filtering on unrelated re-renders

### Files Modified
- `frontend/components/pages/explore/vegetableList/VegetableList.tsx` — search state, `onChangeText`, pagination, load-more button, empty/count messages

## 19/05/2026: Explore Page Performance — Monthly Candidates + Image Optimization

### Monthly Candidates: Now Real
- Filter dynamically by current month: only plants whose `sowingPeriod` covers the current month are shown
- Title uses dynamic month name in Dutch ("Kanshebbers voor mei")
- Limited to max 6 items (was showing all 8+ plants)
- Section hidden entirely if no candidates match the current month

### Image Loading Optimization
- `VegetableCard` wrapped in `React.memo` — prevents re-renders when parent updates (e.g., search filtering)
- `fadeDuration={0}` on `<Image>` — removes the default 300ms fade-in animation, images appear instantly
- MonthlyCandidates renders 3-6 images instead of all 8, reducing concurrent network requests

### Files Modified
- `frontend/components/pages/explore/carousel/MonthlyCandidates.tsx` — real monthly filter, dynamic title, max 6 limit, proper typing
- `frontend/components/shared/vegetableCard/VegetableCard.tsx` — `React.memo` + `fadeDuration={0}`

## 19/05/2026: Auth Persistence Fix — Auto-Login on App Restart

### Problem
The app had `expo-secure-store` installed and `AuthContext.tsx` already saved/restored the JWT token, but the **component hierarchy** in `_layout.tsx` prevented it from working:
- `AuthProvider` was mounted **inside** the conditional that showed `AuthScreen`
- Token restore ran at the same time as `AuthScreen` rendering
- Even with a valid saved token, the login screen appeared every time

### Fix: Restructured Layout Hierarchy
- Moved `AuthProvider` to wrap the **entire** component tree
- Created `AppContent` inner component that uses `useAuth()` to read `loading`/`user`
- While token restore is in progress (`loading === true`): return null (wait)
- If token restored successfully (`user !== null`): skip onboarding + auth, go straight to tabs
- If no saved token: show onboarding → auth → register flow as before

### Files Modified
- `frontend/app/_layout.tsx` — restructured `NavOverlay` → `AuthProvider` wrapping `AppContent`

## 19/05/2026: Task 9 — Wire Frontend to Backend API

### What was done
Created a complete API service layer and wired every screen to real backend endpoints:

**New files created:**
- `frontend/services/api.ts` — base fetch wrapper with JWT token management
- `frontend/services/auth.ts` — login, signup, getProfile, updateProfile, changePassword
- `frontend/services/plants.ts` — getAllPlants, getPlantById, searchPlants, getPlantStages
- `frontend/services/garden.ts` — getGarden, getDashboard, createUserPlant, updateGarden, etc.
- `frontend/services/notifications.ts` — getNotifications, acknowledge, resolve, reset
- `frontend/services/probes.ts` — register, list, rename, pair, unpair
- `frontend/context/AuthContext.tsx` — AuthProvider + useAuth hook wrapping login/signup/logout

**Screens wired:**
- `AuthScreen.tsx` — calls `useAuth().login()` / `useAuth().signup()` instead of just notifying parent
- `app/(explore)/explore.tsx` — fetches plant list from `GET /api/plants/`
- `app/(explore)/vegetable-info.tsx` — fetches detail from `GET /api/plants/:id`
- `app/(explore)/plant-finder.tsx` — fetches plant list from API for client-side filtering
- `app/(explore)/plant-step1-5.tsx` — fetch plant details from API for display
- `app/(explore)/plant-step5.tsx` — pairing code from AuthContext instead of hardcoded
- `app/index.tsx` — fetches dashboard from `GET /api/gardens/status`
- `app/(garden)/garden.tsx` — fetches garden from `GET /api/gardens/`, calls `createUserPlant` on placement, `updateGarden` on save
- `app/(account)/account.tsx` — fetches notifications + profile from API, wires dismiss/snooze/logout
- `RegisterFlow.tsx` — pairing code from AuthContext

**Type updates:**
- `data/vegetables.ts` — `VegetableInfo.image` and `VegetableDetail.image` widened to `number | { uri: string }`
- `NotificationsView.tsx` — `NotificationItem.image` widened to `number | { uri: string } | null`

**Cleanup:**
- Deleted `frontend/data/gardenPlants.ts` (no longer imported)

### TypeScript
- Zero errors on `npx tsc --noEmit`

### Commit
```
d541a4e feat(api-alignment): wired frontend to backend API calls
```

## 19/05/2026: DB Sequence Fix — user_plants Auto-Increment

### Problem
Seed reset `ALTER SEQUENCE ... RESTART WITH 1` but inserted with explicit IDs (1-5), never advancing the sequence. Next API insert tried ID 1 → `duplicate key` error.

### Fix
Added `SELECT setval(...)` after all inserts in `004_enrich_test_data.ts` so sequences reflect actual max IDs.

### Files Modified
- `backend/seeds/004_enrich_test_data.ts` — setval calls for all 6 tables

## 19/05/2026: State Persistence Fix — useFocusEffect on Plant Steps

### Problem
Expo Router keeps screens mounted in the navigation stack. `useState` initial values only run on first mount, so navigating back and forward reused stale state (plant name, probe name, wizard step index).

### Fix
Added `useFocusEffect` to reset local state on every focus:
- `plant-step3.tsx` — resets `name` to `""`
- `plant-step4.tsx` — resets `showExisting` to `false`
- `plant-step5.tsx` — resets `step` to `0`, `probeName` to `""`, `probeId` to `null`, `renameError` to `""`

### Files Modified
- `frontend/app/(explore)/plant-step3.tsx`
- `frontend/app/(explore)/plant-step4.tsx`
- `frontend/app/(explore)/plant-step5.tsx`

## 19/05/2026: garden_id Passed to createUserPlant

### Problem
`createUserPlant` never sent `garden_id` to the backend — plants were created with `garden_id: null`, so they never appeared in the garden grid (query filters by `garden_id`).

### Fix
- Added `gardenId` state to garden screen, populated from `getGarden()` response
- Added optional `garden_id` param to `createUserPlant` service function
- Passed `gardenId` in the cell tap handler

### Files Modified
- `frontend/app/(garden)/garden.tsx` — `gardenId` state, passed to createUserPlant
- `frontend/services/garden.ts` — `garden_id` in CreateUserPlant params

## 19/05/2026: Probe Pairing Flow — pairing_code on Probes + rename-by-code

### Problem
- New probe path: `probeName` typed in step5 was never sent to API (probe stayed "Unnamed Probe")
- No `probeId` passed to garden, so no pairing happened → plant got `sonde_id: null`
- `pairProbe` never updated probe `state` to `"paired"` — stayed `"available"`
- No way to link a newly registered probe to the app (hardware registers via pairing_code but app never sees the probe ID)

### Solution: `probes.pairing_code` column
- Migration: added `pairing_code varchar(8) unique nullable` to probes table (merged into initial migration, standalone migration deleted)
- On hardware registration (`POST /api/probes/register`): store the pairing code on the probe record
- New endpoint `POST /api/probes/rename-by-code` (authenticated): accepts `pairing_code + name`, finds probe, renames it, returns `{ id }`
- `pairProbe` now also updates probe `state` to `"paired"`
- Frontend captures `user.pairing_code` in a `useRef` on mount (before rotation), uses it in rename-by-code call

### Flow
Step5 sub-step 3: user types name → "Geef naam" → `POST /api/probes/rename-by-code` with captured pairing code → renames probe → returns `probeId` → advances to sub-step 4 → "Naar de tuin!" → garden with `probeId` → tap cell → `createUserPlant(garden_id)` → `pairProbe(probeId, plantId)` → state set to `"paired"`

### Files Modified
- `backend/migrations/20260504095304_innit_migration.ts` — added `pairing_code` column to probes table
- `backend/types/database/index.ts` — `pairing_code` on `ProbeRecord`
- `backend/types/dto/index.ts` — `RenameProbeByCodeDto`
- `backend/repositories/probe.repository.ts` — stores code on create, `findByPairingCode()`, `updateState()`
- `backend/services/probe.service.ts` — register stores code, `renameByCode()`, pairProbe sets state=paired
- `backend/controllers/probe.controller.ts` — new `renameProbeByCode` endpoint
- `backend/routes/probe.routes.ts` — `POST /api/probes/rename-by-code`
- `frontend/services/probes.ts` — `renameProbeByCode()` function
- `frontend/app/(explore)/plant-step5.tsx` — 5 sub-steps: charge → connect+code → back to WiFi → **rename** → **plant instructions** → garden with `probeId`

## 19/05/2026: Real Probe Name in Plant Detail — probe_name Enriched

### Problem
Technical overview on plant detail page showed hardcoded `"Sonde " + plant.nickname` instead of the actual probe name from the database.

### Fix
- `garden.repository.ts` — selects `pr.name as probe_name` from the probes left join
- `plantEnricher.ts` — includes `probe_name` in `EnrichedGardenPlant` response
- `garden.ts` — `EnrichedPlant` interface gets `probe_name`
- `GardenGridItem.tsx` — `GardenPlant` gets `probeName`
- `garden.tsx` — `enrichedToGardenPlant` maps `probe_name` → `probeName`
- `plant-detail.tsx` — shows `plant.probeName || "Sonde " + plant.nickname`

### Files Modified
- `backend/repositories/garden.repository.ts`
- `backend/utils/plantEnricher.ts`
- `frontend/services/garden.ts`
- `frontend/components/pages/garden/gardenGrid/GardenGridItem.tsx`
- `frontend/app/(garden)/garden.tsx`
- `frontend/app/(garden)/plant-detail.tsx`

## 19/05/2026: Probe Icon Fix — SVGR replaceAttrValues

### Problem
The probe icon used `currentColor` in stroke/fill attributes, which `react-native-svg` doesn't support — always rendered black regardless of the `fill` prop passed by `StyledIcon`.

### Solution
- Created `frontend/.svgrrc` with `replaceAttrValues: { "#e3e3e3": "{props.fill}" }` — makes SVGR replace the placeholder color with the dynamic `fill` prop value in the generated component
- Restored probe.svg to original outline+fill design: rect with `stroke="#e3e3e3"` + `fill="none"` (outline body), circles with `fill="#e3e3e3"` (filled LEDs)
- Both stroke and fill now respond to the `fill` prop from `StyledIcon`

### Files Created
- `frontend/.svgrrc`

### Files Modified
- `frontend/assets/icons/probe.svg` — restored outline+fill design with `#e3e3e3` placeholder

## 19/05/2026: Backend Config — env vars for DB host/port

### Changes
- `backend/config/index.ts` — read `DB_HOST` and `DB_PORT` from env vars with defaults
- `backend/app.ts` — pass env config to Knex
- `docker-compose.yml` — set `DB_HOST=host.docker.internal` for container-to-localhost access

### Files Modified
- `backend/config/index.ts`
- `backend/app.ts`
- `docker-compose.yml`

## 19/05/2026: Postman Collection

### Added
- `SproutSpot.postman_collection.json` — full API collection with 31 endpoints across 7 folders (Auth, Plants, Garden, Probes, Telemetry, User Plants, Notifications)
- Uses `{{baseUrl}}` and `{{token}}` variables with auto-token extraction from login response

### Files Created
- `SproutSpot.postman_collection.json`

## 19/05/2026: Commits (11 total)

```
0184b08 fix(backend-seed): sync DB sequences after seed inserts
137caa2 feat(backend-probes): add pairing_code column and rename-by-code endpoint
0cef2e1 feat(backend-enricher): include probe_name in garden response
6b6d157 feat(backend-images): wire image URLs through garden and notification controllers
6e2ccb9 fix(backend-config): use env vars for database host and port
b5acc29 fix(frontend-auth): persist token via SecureStore and auto-login on restart
5c087b4 feat(frontend-explore): virtualize with FlatList and optimize image loading
fe44f9c feat(frontend-plant-flow): add probe choice, rename-by-code, and garden_id placement
3360ce8 chore(frontend-deps): add expo-clipboard and app.config.js
628690c chore(docs): add Postman collection
73ea3e6 chore(assets): add probe SVG icon and SVGR config
```

## 20/05/2026: High Priority Tasks — Time Slots, Push Toggle, Graph Modal

### Task 1: Time Slots Format Alignment
- **Problem**: Frontend used `activeHours: number[]` (e.g., `[8,9,...,22]`) but backend expects `notification_window_start` / `notification_window_end` (HH:mm strings). Changes were never persisted to API.
- **Fix**: Added `parseTimeRangeToHours()` and `hoursToTimeRange()` helpers in `account.tsx`
- Profile loading now converts `notification_window_start/end` → `activeHours`
- `handleActiveHoursChange` now converts `activeHours` → start/end and calls `updateProfile()`

### Task 2: Push Toggle Backend Support
- **Problem**: Settings UI had push toggle but no backend support — no `push_enabled` column, toggle only set local state.
- **Migration**: Added `push_enabled boolean default true` to `users` table
- **Backend**: `UpdateProfileDto`, `UserRecord`, and controller responses (getProfile, updateProfile) all include `push_enabled`
- **Frontend**: `UserProfile` interface, `updateProfile()` params, `AuthContext` (login/signup), and `account.tsx` all handle `push_enabled`
- Toggle now calls `updateProfile({ push_enabled: val })` to persist

### Task 3: Graph Modal Wired to Real Readings
- **Problem**: GraphModal used hardcoded mock data instead of real telemetry from `GET /api/user-plants/:id/readings`
- **Fix**: GraphModal now accepts `readings: ReadingRecord[]` and `optimalRanges` as props, builds chart metrics dynamically
- `plant-detail.tsx` fetches readings via `getReadings()` when modal opens
- Added `ReadingRecord` type to `frontend/services/garden.ts`

### Files Created
- `backend/migrations/20260520000000_add_push_enabled.ts`

### Files Modified
- `backend/types/dto/index.ts` — `push_enabled` in `UpdateProfileDto`
- `backend/types/database/index.ts` — `push_enabled` in `UserRecord`
- `backend/controllers/user.controller.ts` — `push_enabled` in getProfile + updateProfile
- `frontend/services/auth.ts` — `push_enabled` in `UserProfile` + `updateProfile()`
- `frontend/services/garden.ts` — `ReadingRecord` type, typed `getReadings()`
- `frontend/context/AuthContext.tsx` — `push_enabled` in login/signup user objects
- `frontend/app/(account)/account.tsx` — time range helpers, profile parsing, wired push/activeHours to API
- `frontend/app/(garden)/plant-detail.tsx` — fetches readings, passes to GraphModal
- `frontend/components/pages/garden/plantDetail/GraphModal.tsx` — accepts readings + optimalRanges props, dynamic metrics

### TypeScript
- Frontend: zero errors (`npx tsc --noEmit`)
- Backend: unchanged pre-existing errors (auth middleware, plantMapper)

## 21/05/2026: Animated Loading Screen

### Loading Screen Component
- Created `frontend/components/shared/LoadingScreen.tsx` — full-screen dark overlay with the SproutSpot SVG logo
- **Wave animation**: 5 empty (white outlined) squares fill with green one by one (staggered 200ms, 400ms each), then all unfill in the same staggered order — creates a continuous propagating wave via `Animated.loop`
- 4 permanently-green squares render statically (no pulse)
- Background matches the logo's gradient (`#3E4348`)

### Slide In/Out Transitions
- Loading screen accepts `visible` prop and manages its own mount/unmount with animation
- **Enter**: slides up from below (`translateY: screenHeight → 0`, 500ms, native driver)
- **Exit**: slides out to top (`translateY: 0 → -screenHeight`, 500ms, native driver)
- Mount state tracked via `useState` + `useRef` to allow exit animation to complete before unmounting

### Layout Restructure
- Changed `_layout.tsx` from early-return pattern to always-render structure
- App/onboarding/auth content renders underneath the loading screen as a `<View style={{flex:1}}>` with conditional content
- Loading screen rendered as absolutely-positioned overlay (`zIndex: 999`) on top of all content
- Loading state determined by `!fontsLoaded || loading`

### Files Created
- `frontend/components/shared/LoadingScreen.tsx` — animated loading screen component
- `frontend/assets/icon.svg` — app icon

### Files Modified
- `frontend/app/_layout.tsx` — removed early returns, wrapped content + LoadingScreen overlay

### TypeScript
- Frontend: zero errors (`npx tsc --noEmit`)

## 21/05/2026: Telemetry Pipeline — Steps 1–6 (Thresholds, Anti-Spam, Notifications)

### Steps 1 & 2: Probe Validation + Threshold Evaluation

**Probe & plant linkage check:**
- `telemetry.service.ts` — validates probe exists (throws 404 if unregistered), checks plant linkage via `user_plants.sonde_id = probes.hardware_id`, warns + skips threshold eval if unpaired
- `telemetry.repository.ts` — added `findActivePlantByProbe(hardwareId)` joining `user_plants` + `plant_stages` on `sonde_id`, parsing JSON thresholds
- `evaluateThresholds` private method returning anomaly array with type, metric, value, limit

### Steps 3 & 4: Factor-Specific Anti-Spam + Auto-Resolution

**Repository (5 new methods):**
- `getRecentEntriesBefore(hardwareId, beforeTimestamp, limit)` — fetches entries older than batch for persistence check
- `findOpenIssuesByUserPlant(userPlantId)` — unresolved issues for a plant
- `createIssue(userPlantId, issueType)` — inserts with `occurrence_count: 1`
- `incrementIssueOccurrence(issueId)` — bumps count + updates `last_seen`
- `resolveIssue(issueId)` — sets `resolved_at = NOW()`

**Service restructure:**
- **Soil**: instant trigger (no anti-spam)
- **Light & Temperature**: scans backwards for 3 consecutive out-of-range readings across batch + historical entries before escalating; logs filtered readings
- **Auto-resolution**: after anomaly processing, iterates open issues; if latest reading is back in range → `resolveIssue()`

### Steps 5 & 6: Notification Generation + Push Stub

**New file:**
- `push-notification.service.ts` — stub `send(userId, title, body)` that `console.log`s

**Service additions:**
- `upsertIssue` now returns `{ issue, isNew }`
- When `isNew === true`: dispatches notification via `dispatchNotificationForIssue()`
- Looks up user's `notification_window_start/end` from `users` table
- Inside window → inserts `sent` notification + calls push stub
- Outside window → inserts `snoozed` notification with `snoozed_until` set to next window start time
- Dutch notification titles/messages per issue type (e.g., `SOIL_TOO_DRY` → "Grond te droog" / "{plant} heeft water nodig!")

**Repository additions:**
- `findUserNotificationWindow(userId)` — queries `notification_window_start/end`
- `createNotification(params)` — inserts into `pending_notifications`

### Key Decisions
1. Out-of-window notifications reuse existing `snoozed` state + `snoozed_until` (no migration)
2. No FCM/Firebase setup yet — stub only
3. Existing `pending_notifications` schema used as-is
4. Only new issues (not increments) trigger notifications

### Files Created
- `backend/services/push-notification.service.ts`

### Files Modified
- `backend/repositories/telemetry.repository.ts` — 7 new methods
- `backend/services/telemetry.service.ts` — full restructure

### TypeScript
- Backend: zero new errors (only 4 pre-existing in `auth.middleware.ts` and `plantMapper.ts`)

## 21/05/2026: Seed Threshold Keys Fixed — soil_moist → soil, Added light + humidity

### Problem
The `003_plant_stages.ts` seed file used `soil_moist_min`/`soil_moist_max` keys in the JSON `thresholds` column, but the service (`telemetry.service.ts`) and `StageThresholdsRecord` type expect `soil_min`/`soil_max`. Additionally, `light_min`/`light_max` and `humidity_min`/`humidity_max` keys were entirely missing from all 207 threshold entries.

### Impact
- **Soil checks** (SOIL_TOO_DRY / SOIL_TOO_WET): silently skipped — `thresholds.soil_min` was `undefined`
- **Light checks** (LIGHT_TOO_LOW / LIGHT_TOO_HIGH): silently skipped — keys missing
- **Temperature checks**: worked fine (keys matched)

### Fix
- Renamed `soil_moist_min` → `soil_min` and `soil_moist_max` → `soil_max` across all 207 threshold entries
- Added `light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80` to every threshold entry
- All 4 metric checks (soil, temp, light, humidity) now function correctly

### Files Modified
- `backend/seeds/003_plant_stages.ts` — all 207 threshold JSON objects updated
- `opencode/TELEMETRY_POSTMAN_TESTS.md` — added soil test step, removed mismatch warning

### TypeScript
- Backend: zero new errors (same 4 pre-existing)

## 21/05/2026: Stale probe guardrail + BATTERY_LOW

### Added
- **BATTERY_LOW guardrail** (`telemetry.service.ts`):
  - `checkBattery()` — instant trigger when probe voltage < 3.12V (< 10%)
  - `BATTERY_LOW` issue + push notification (*"Batterij bijna leeg"*)
  - Auto-resolves when battery recovers to ≥ 10%
  - Skips issue creation when no plant is linked (only logs warning)
- **PROBE_STALE guardrail**:
  - `scheduler.service.ts` — background `setInterval` every 60 min
  - `findStaleProbes()` in `ProbeRepository` — queries paired probes with `last_seen > 3h`, battery ≥ 3.12V
  - `checkStaleProbes()` in `TelemetryService` — creates `PROBE_STALE` issue + notification (*"Sonde reageert niet"*), sets `probes.state = 'offline'`
  - Auto-resolves + sets `probes.state = 'paired'` when probe sends data again
- **Postman test doc** (`opencode/TELEMETRY_POSTMAN_TESTS.md`): battery test (step 8) + stale probe explanation (step 11)

### Fixed
- `findStaleProbes` SQL: `INTERVAL '? minutes'` → `INTERVAL '1 minute' * ?` (PostgreSQL parameter binding fix)
- `app.ts`: now runs from root `compose.yml` context for proper Docker rebuilds

## 21/05/2026: Seed threshold keys fix

### Fixed
- `backend/seeds/003_plant_stages.ts`: renamed `soil_moist_min` → `soil_min`, `soil_moist_max` → `soil_max`
- Added `light_min: 10000`, `light_max: 80000`, `humidity_min: 30`, `humidity_max: 80` to all 207 threshold entries
- Rebuilt Docker container to apply seed changes

## 21/05/2026: Telemetry anomaly pipeline

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

## 21/05/2026: Battery guardrail and stale probe detection

### Added
- `checkBattery()` — instant trigger when voltage < 3.12V (< 10%)
- `checkStaleProbes()` — background check every 60 min for probes silent 3+ hours
- `scheduler.service.ts` — centralized background job runner
- `findStaleProbes()` query in `ProbeRepository`
- BATTERY_LOW and PROBE_STALE notifications with Dutch localized messages

## 21/05/2026: Cumulative Daily Light Integral refactor

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

## 24/05/2026: Firebase to Expo Push API migration, Supabase DB, and deployment prep

### Changed
- **Push notifications**: replaced `firebase-admin` with `expo-server-sdk` on backend — Expo push tokens now properly routed through Expo Push API instead of incompatible FCM direct messaging
- **Push service** (`backend/services/push-notification.service.ts`): rewritten to use `Expo.sendPushNotificationsAsync()`, added `push_enabled` check, `Expo.isExpoPushToken()` validation, and `DeviceNotRegistered` error handling for token cleanup
- **Database**: migrated from local Docker Postgres to Supabase — updated `knexfile.ts` with SSL config, updated `.env` with Supabase credentials, ran migrations and seeds successfully
- **Config**: removed `FIREBASE_SERVICE_ACCOUNT_PATH` from config, cleaned up `docker-compose.yml` (removed local database/adminer services)
- **TypeScript**: fixed 4 pre-existing errors in `auth.middleware.ts` (JWT type cast + token null check) and `plantMapper.ts` (`MONTH_MAP` undefined index)

### Added
- **EAS project**: created `@woutvi/sproutspot` (ID: `2825dad0-affb-4704-b8d3-373135ca60e3`) for push notification support
- **Frontend push registration**: new `frontend/utils/notifications.ts` utility + `syncPushToken` in `AuthContext` — registers Expo push token on startup/login/signup
- **Notification tap handler**: `_layout.tsx` listener navigates to account screen when user taps a push notification
- **Backend `.env`**: cleaned up for production — points to Supabase and Hetzner server IP

### Fixed
- TypeScript: zero errors across entire backend
- Pre-existing: `auth.middleware.ts` unsafe cast + `plantMapper.ts` index bug

### Infrastructure
- Hetzner server (`178.104.50.231`) prepared with Node.js 22, PM2, Git
- Sparse checkout setup for selective repo deployment (backend only)
- PM2 configured for auto-restart on crash/reboot

## 24/05/2026: Supabase → Local Postgres, Build System Fixes & Package Pins

### Database Migration (Supabase → Local Docker)
- **Changed**: Replaced Supabase connection in `docker-compose.yml` with local Postgres container
- **Reason**: Avoid Supabase free-tier limits during development; local DB faster for iteration
- **Dead end**: Forgot to update `.env` — backend could not connect for 10 minutes until `DB_HOST=localhost` was set

### Build System Setup
- Created `frontend/eas.json` with preview build profile (APK, internal distribution)
- Added `android.package: "com.sproutspot.app"` to `app.json`
- Updated API base URL in `app.json` from Supabase staging to `178.104.50.231:5001`
- **Dead end**: `expo build:android` failed with "No Java compiler found" — JDK 21 was missing

### JDK 21 Installation
- Installed Eclipse Temurin JDK 21 (required by Gradle 8.x)
- Set `JAVA_HOME` in PowerShell profile: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"`
- Verified: `java -version` → OpenJDK 64-Bit 21.0.6

### Package Pins (First Round)
- Pinned `@expo/metro-runtime` to `6.1.1` via `overrides` — Expo SDK 54 bundles `6.4.x` which broke Metro bundling
- Pinned `react-native-safe-area-context` to `~5.6.1` — `5.7.0+` broke `useSafeAreaInsets` typing
- Ran `npm install --legacy-peer-deps` to apply pins

### Project Move (MAX_PATH Fix)
- **Problem**: `npx expo run:android` failed with Win32 `ENAMETOOLONG` in CMake/Ninja builds — the project path at `C:\Users\woutv\Documents\Multimedia\FINALWORK\FinalWork-SproutSpot\frontend` exceeded Windows 260-char MAX_PATH limit
- **Fix**: Copied entire `frontend/` to `C:\SproutSpot\frontend` — short flat path resolved all path-length errors
- **Sync procedure**: All edits applied to `C:\SproutSpot\frontend` (the build working copy), then manually synced to original repo path
- **Note**: `node_modules`, `/android`, `.expo` not copied — ran `npm install` + `npx expo prebuild` fresh in working copy

## 25/05/2026: Dependency Hell — React, react-native-svg, expo-clipboard

### React Version Mismatch
- **Problem**: `react@19.2.6` was installed but `react-native@0.81.5` bundles `react-native-renderer@19.1.0` — causing "React 19.2.6 vs 19.1.0" mismatch warnings and potential runtime instability
- **Fix**: Downgraded to `react@19.1.0`, added `react-dom@19.1.0` override
- **Verified**: `npm ls react` → `19.1.0` across all packages

### expo-clipboard Version Conflict
- **Problem**: `expo-clipboard@^55.0.13` resolved to SDK 55+ (incompatible with SDK 54). Install failed with peer dep errors
- **Fix**: Pinned to `expo-clipboard@~8.0.8` (SDK 54 compatible)

### react-native-svg Crash (Legacy Architecture)
- **Problem**: `react-native-svg@15.15.5` (latest) caused `topSvgLayout` native crash on Android in Legacy Architecture
- **Attempt 1**: Pinned to `react-native-svg@~15.12.1` — crash persisted in Legacy mode
- **Attempt 2**: Enabled New Architecture (`newArchEnabled: true`) — `react-native-svg@15.12.1` worked without `topSvgLayout` crash
- **Root cause**: `topSvgLayout` is a Fabric (New Architecture) event that crashes when New Arch is partially enabled — `react-native-svg@15.15.5` had a regression, `15.12.1` is stable on Fabric
- **Dead end**: Legacy Architecture produces a persistent yellow-box warning ("expo-notifications: Legacy Architecture is deprecated") — acceptable, but New Architecture eliminates it entirely

### New Architecture Enabled
- Set `newArchEnabled: true` in both `app.json` and `android/gradle.properties`
- Rebuilt: `npx expo run:android` — app bundles 1386 modules (vs 1444 in Legacy)
- No runtime errors with pinned `react-native-svg@15.12.1`
- **Benefit**: Future-proofing for Expo SDK 55+ where New Architecture becomes default

## 25/05/2026: UI Layout Fixes for Edge-to-Edge Display

### BorderRadius.lrg Change
- **Problem**: `Styling.ts` had `BorderRadius.lrg: "50%"` — percentage borderRadius is not supported in Legacy Architecture, causing the warning icon background to render squared instead of circular
- **Fix**: Changed from `"50%"` (string) to `999` (number) — large enough to round any practical element
- **Note**: New Architecture supports percentage borderRadius, but using a fixed large number avoids the issue on both architectures

### Notification Handler Fix
- **Problem**: `_layout.tsx` notification handler returned `shouldShowBanner: false` and `shouldShowList: false` — suppressed all OS notification alerts even though push delivery was working
- **Fix**: Both set to `true`
- **Deep-link type fix**: Cast `response.notification.request.content.data` as `Record<string, string>` to resolve TypeScript error in `router.push(data.screen)`

### Tab Bar Bottom Spacing
- **Problem**: CustomTabBar used `bottom: insets.bottom` — with Android `edgeToEdgeEnabled: true` and gesture navigation, `insets.bottom` is often 0, pushing the tab bar flush against the screen edge
- **Fix**: Changed to `bottom: insets.bottom + 10`
- **Note**: Android `edgeToEdgeEnabled: true` means the app draws behind the navigation bar — manual bottom padding is required for all fixed-position UI

### Bottom Sheet Padding Fixes
- **PlantSheet.tsx**: Added `useSafeAreaInsets()`, replaced hardcoded `paddingBottom: Styling.Padding.xlg` with dynamic `paddingBottom: Styling.Padding.xlg + insets.bottom` — sheet content no longer hidden behind navigation bar
- **EditActionSheet.tsx**: Added `+ 30` to existing `insets.bottom` padding — extra space ensures action buttons are fully visible above gesture handle area

## 25/05/2026: FCM / Firebase Push Notification Configuration

### Firebase Setup
- Created Firebase project `sproutspot-f4b72` in Firebase Console
- Downloaded `google-services.json` — placed at `android/app/google-services.json`
- Added `expo.android.googleServicesFile: "./android/app/google-services.json"` to `app.json`
- Added `classpath("com.google.gms:google-services:4.4.2")` to `android/build.gradle` (root)
- Added `apply plugin: "com.google.gms.google-services"` to `android/app/build.gradle`
- **Result**: APK built successfully with Firebase/FCM support (`npx expo run:android`, ~4 min)
- **Dead end**: First build after Firebase config failed because `google-services.json` was missing the `package_name` field — re-downloaded from Firebase Console fixed it

### Push Token Registration
- App generates ExpoPushToken: `ExponentPushToken[pUVwlIFfW_-_lQn8SPaBj4]`
- Token stored in backend DB via `syncPushToken()` in `AuthContext.tsx`
- Added debug logging to `registerForPushNotificationsAsync()` and `syncPushToken()` for troubleshooting

### Push Notification Delivery Failure
- **Problem**: `POST https://exp.host/--/api/v2/push/send` returned `"Unable to retrieve the FCM server key for the recipient's app."`
- **Root cause**: Expo's push notification servers need Firebase Admin SDK credentials to forward pushes through FCM V1 (mandatory since June 2024). The `google-services.json` only configures the device side. Expo's servers need a separate Firebase Admin SDK service account private key JSON.
- **Attempt 1**: Used Expo Dashboard at `https://expo.dev/notifications` — this is just a test-send form, not credential management
- **Attempt 2**: Tried `eas credentials` CLI — requires interactive TTY, cannot be used via PowerShell piping (blocked by "stdin is not readable")
- **Fix**: Uploaded Firebase Admin SDK JSON via Expo Dashboard web UI under Project → Configuration → Credentials → Android → `com.sproutspot.app` → FCM V1 service account key → Add a service account key
- **Dead end**: First upload was placed in "Google Service Account Keys" section (for Play Store submissions) instead of "FCM V1 service account key" — pushed still failed with same error until re-uploaded to correct section

### Push Verification
- After correct upload: test push returns `"status": "ok"` (HTTP 200)
- Push appears as OS notification banner + vibration on Samsung SM-A556B (Android 14)
- Works with app in foreground, background, and killed state

## 25/05/2026: Git History Cleanup — Feature Branches

### Problem
Ten commits were made directly on the `development` branch and pushed to `origin/development`, breaking the project's PR-based workflow pattern (feature branches → PR → merge into `development`).

### Fix: Branched + Rebased
1. Created `feature/fcm-push-notifications` from `4510297` (last clean commit before our changes) — cherry-picked all 10 commits
2. Created `feature/fix-ui-layout` from same base — cherry-picked all 10 commits
3. Pushed both feature branches to `origin`
4. Reset `development` to `4510297` and force-pushed
5. Both branches merged into `development` via GitHub PRs (matching existing `Merge pull request #N` pattern)

### Commits (10 total, now on `development` via PR merge)
```
fix(frontend): sync package-lock.json with package.json
fix(frontend): add android package name and production api base url
fix(frontend): bump react to 19.2.6 to match react-dom peer dep
fix(frontend): add ts/tsx to metro sourceExts for metro-runtime package
fix(frontend): pin broken npm packages and clean-install for EAS build compatibility
fix(frontend): pin react to 19.1.0 and add overrides for react-native 0.81.5 compatibility
fix(frontend): add google-services config and fix notification handler for push notifications
fix(frontend): fix bottom sheet padding and border radius for edge-to-edge display
chore(frontend): add debug logging for push notification troubleshooting
chore(frontend): add firebase service account keys to gitignore
```

## 27/05/2026: Sync Endpoint, Charging Telemetry & Probes Overview

### Backend: Sync Endpoint
- **`POST /api/probes/sync`** — no auth, accepts `{ hardware_id, battery_voltage, wifi_rssi }`
- Updates `battery_voltage`, `wifi_rssi`, `last_seen` on matching probe
- Returns `{ paired: boolean, state: string }` — probe knows only if it's paired to an active plant
- If probe not found: returns `{ paired: false, state: "unregistered" }`

### Backend: Charging Telemetry
- `POST /api/telemetry/upload` now accepts `is_charging: true` payloads (no `entries` needed)
- On charging payload: updates probe `battery_voltage`, `wifi_rssi`, `last_seen`, sets `is_charging = true`
- On next normal telemetry batch: `is_charging` is automatically reset to `false`
- No `"charging"` state added to `probes.state` enum — probe keeps its original state (paired/available) while charging

### Database Migration
- Added `is_charging` (boolean, default false) column to `probes` table (in original migration file)

### Backend: GET /api/probes/ Enriched
- `ProbeRepository.findByUserId()` now LEFT JOINs `user_plants` + `plants` to include `linked_plant: { nickname, name } | null`

### Frontend: Probes Overview Page
- New `ProbesView` component at `components/pages/account/probes/ProbesView.tsx`
- Shows all user probes with: name, state badge (color-coded), hardware_id, battery %, WiFi quality, linked plant
- State colors: paired=green, available=orange, offline=red; charging shown as "Opladen" label
- Accessible via "Mijn sondes" button in AccountMain (between Historiek and Instellingen)

### Frontend: Service Updates
- `ProbeInfo` interface fixed to match actual backend response shape (`battery: { level, percentage }`, `wifi: { quality, advice }`, `linked_plant`)
- Added `syncProbe()` function

### Files Modified
- `backend/migrations/20260504095304_innit_migration.ts` — added `is_charging` column
- `backend/types/database/index.ts` — added `is_charging` to `ProbeRecord`
- `backend/types/dto/index.ts` — added `SyncProbeDto`, optional `is_charging` on `TelemetryBatchUploadDto`
- `backend/repositories/probe.repository.ts` — added `syncHealth()`, `updateCharging()`, `ProbeWithPlant` type, enriched `findByUserId()`
- `backend/services/probe.service.ts` — added `syncProbe()`
- `backend/services/telemetry.service.ts` — added `handleChargingUpdate()`, auto-reset `is_charging` on normal telemetry
- `backend/controllers/probe.controller.ts` — added `syncProbe` handler
- `backend/controllers/telemetry.controller.ts` — handles `is_charging` branch
- `backend/routes/probe.routes.ts` — added `POST /sync`
- `backend/routes/telemetry.routes.ts` — removed strict `validateBody(["hardware_id", "entries"])`
- `frontend/services/probes.ts` — fixed `ProbeInfo`, added `syncProbe()`
- `frontend/components/pages/account/main/AccountMain.tsx` — added "Mijn sondes" button
- `frontend/app/(account)/account.tsx` — added `"probes"` case

### Files Created
- `frontend/components/pages/account/probes/ProbesView.tsx`

## 26/05/2026: Adminer — Database GUI via Docker

### Toegevoegd
- Adminer service in `docker-compose.yml` — PostgreSQL web GUI
- **Port**: `127.0.0.1:${ADMINER_PORT}` (enkel localhost, niet publiek), variabele in `.env`

### Hoe bereik je Adminer?

**Via SSH-tunnel (aanbevolen):**
```bash
ssh -L 8080:localhost:8080 user@178.104.50.231
```
Open daarna `http://localhost:8080` in de browser.

**Inloggegevens:**
- **System**: PostgreSQL
- **Server**: `postgres` (Docker hostname, intern netwerk)
- **Username**: `${DATABASE_USER}` (uit `.env`)
- **Password**: `${DATABASE_PASSWORD}` (uit `.env`)
- **Database**: `${DATABASE_DB}` (uit `.env`)

### Waarom localhost-only?
- Adminer geeft volledige DB-toegang — publiek zetten is onnodig risico
- SSH-tunnel voegt een extra beveiligingslaag toe zonder gedoe
- Serverkosten: verwaarloosbaar (~10MB image, geen background load)

## 27/05/2026: Probe Registration Two-Option Flow — New Probe / WiFi Update

### Problem
When changing WiFi on an already-registered probe, the HTML form always required a pairing code and the backend rejected known `hardware_id`s with 409 Conflict — users had to re-enter their pairing code even though the probe was already linked to their account.

### Solution: Two-Option Setup Flow
Refactored `POST /api/probes/register` to handle both scenarios:

- **Option 1 — New Probe**: `hardware_id` not in DB + `pairing_code` provided → 201 Created (full registration, code rotation)
- **Option 2 — Existing Probe (WiFi Update)**: `hardware_id` already in DB → 200 OK (pairing_code ignored, no DB writes)
- **Security Guardrail**: `hardware_id` not in DB + no `pairing_code` → 400 Bad Request

### Files Modified
- `backend/routes/probe.routes.ts` — removed `pairing_code` from `validateBody` (now only requires `hardware_id`)
- `backend/controllers/probe.controller.ts` — simplified error handling (removed 409 catch, added 400 for missing pairing code on new probes); checks `result.existing` to return 200 vs 201
- `backend/services/probe.service.ts` — `registerProbe()` now checks `hardware_id` existence **first**; returns `{ existing: true }` for known probes; `pairingCode` made optional; removed "already exists" error
- `sonde/SproutSpot_Sonde/SproutSpot_Sonde.ino` — removed `required` attribute from `pairing_code` HTML input field so users can leave it blank when just changing WiFi

### No changes needed
- `frontend/services/probes.ts` — `registerProbe(hardware_id, pairing_code)` still works as-is for app-based registration

### TypeScript
- Backend: zero errors (`npx tsc --noEmit`)

## 28/05/2026: Registration Flow Fix — RegisterWizard Before Tabs, UI Padding Fixes

### Problem
1. **Wizard skipped**: After registration, `user` was set immediately, causing the `user ? tabs : ...` branch to render before `showRegisterFlow` could take effect — the 5-step plant wizard never appeared
2. **Navbar overlapped**: `bottom: insets.bottom` had no extra clearance — tab bar sat flush against system navigation bar
3. **Bottom sheets overlapped**: EditActionSheet and PlantSheet padding was static, not accounting for safe area bottom
4. **Empty state off-center**: `Spacer space={120}` with `justifyContent: "center"` pushed garden empty-state content 120px below vertical center
5. **BorderRadius regression**: Commit `75bddb6` (revert) undid `lrg: 999` back to `"50%"` — percentage borderRadius broken on old architecture

### Fixes
- `_layout.tsx`: Moved `showRegisterFlow` render to **before** `user` check — wizard renders even after `user` is non-null; existing users unaffected (their `showRegisterFlow` stays `false`)
- `_layout.tsx:83`: `bottom: insets.bottom` → `bottom: insets.bottom + 10`
- `EditActionSheet.tsx:49`: Added `+ 30` to `paddingBottom`
- `PlantSheet.tsx`: Added `useSafeAreaInsets()`, dynamic `paddingBottom: Styling.Padding.xlg + insets.bottom`, removed static style
- `garden.tsx`: Removed `Spacer space={120}` from empty state
- `Styling.ts`: `BorderRadius.lrg` changed from `"50%"` (string) to `999` (number); interface updated from `string` to `number`

### Files Modified
- `frontend/app/_layout.tsx` — render order swap + navbar bottom
- `frontend/app/(garden)/garden.tsx` — empty state layout
- `frontend/components/pages/garden/editMode/EditActionSheet.tsx` — bottom padding
- `frontend/components/pages/garden/plantSheet/PlantSheet.tsx` — bottom padding
- `frontend/constants/Styling.ts` — BorderRadius.lrg type + value

### TypeScript
- Frontend: zero errors (`npx tsc --noEmit`)
