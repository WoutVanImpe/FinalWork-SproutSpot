# SproutSpot

SproutSpot helps you grow vegetables and herbs at home by combining a **mobile gardening app**, a **cloud backend**, and **ESP32-C3 sensor probes**. The probes measure soil moisture, temperature, light, and battery level — the backend detects issues like dry soil, extreme temperatures, or low battery, and sends **Dutch push notifications** straight to your phone. The app gives you an interactive garden grid, a plant encyclopedia with 44+ species, a guided plant wizard, growth stage tracking, and detailed charts.

Whether you're growing tomatoes on a balcony or basil on a windowsill, SproutSpot tells you exactly when to water, when to harvest, and when your plants need attention.

---

## Features

### 🌱 Plant Discovery

**Encyclopedia, finder quiz, and setup wizard** — everything to find your next plant and add it to the garden.

#### Encyclopedia (44+ Plants)
Browse vegetables and herbs with detailed info. Search by name, filter by light/difficulty/placement/sunlight/care level. A **monthly candidates carousel** automatically shows plants whose sowing period matches the current month. Per-plant detail includes growth stages with duration, sowing period calendar, and requirements (light, water, difficulty, temperature, sowing depth, pot minimum).

#### Plant Finder Quiz
Answer 4 questions (placement, sunlight, month, care level) and SproutSpot filters all 44+ plants to show matching recommendations.

#### 5-Step Plant Wizard
Guided flow to add a plant: (1) checklist of what you need, (2) dynamic sowing instructions, (3) nickname, (4) pick or set up a probe, (5) charge, connect to WiFi via pairing code, name the probe, and place it — then navigates straight to the garden in placement mode.

--

### 🌿 Your Garden

**Dashboard, grid, and plant detail** — the core daily experience.

#### Home Dashboard
Animated carousel with swipe/arrow navigation through each plant. **Color-coded wave background** — green when all is well, red when there's an issue. Tap any card to jump to that plant on the garden grid.

#### Garden Grid
Interactive pannable/zoomable grid (0.5x–2x). Tap a plant to open a **quick-status bottom sheet** with moisture, light, temperature, battery, and coach advice. **Edit mode** lets you add/remove rows and columns, move/swap/delete plants with undo. **Placement mode** adds new wizard plants directly onto the grid.

#### Plant Detail Screen
Deep dive with real-time sensor data: **growth stage progress bar** with colored timeline (Zaaien → Kiem → Blad → Groeispurt → Bloei → Oogst), **requirements section** with optimal range markers and advice, **technical overview** (probe, battery, last reading), and an **interactive graph modal** for moisture/temperature/light over 24h, 1 week, or 3 weeks with optimal range shading.

--

### 🔔 Monitoring & Alerts

**Smart notifications and probe hardware** — know when your plants need attention.

#### Smart Alerts & Notifications
9 automated issue types in Dutch with anti-spam (3 consecutive bad readings for temp/light), auto-resolution, and quiet hours (08:00–22:00).

| Alert | Trigger | Auto-Resolve |
|---|---|---|
| **Grond te droog** | Moisture below threshold | When moisture recovers |
| **Grond te nat** | Moisture above threshold | When moisture recovers |
| **Temperatuur te hoog** | 3 consecutive above max (indoor/both) | When temp drops |
| **Temperatuur te laag** | < 2°C or daily avg < min | When avg recovers |
| **Te veel licht** | 3 consecutive above max | When lux drops |
| **Te weinig licht** | Cumulative daily sun < required | When sun hours met |
| **Batterij bijna leeg** | Voltage ≤ 3.5V (~22%) | When > 3.5V |
| **Batterij kritiek** | Voltage < 10% (~3.39V) | When above 10% |
| **Sonde reageert niet** | No data 3+ hours | On next data arrival |

In-app: acknowledge ("In orde"), snooze ("Herinner mij"), or validate milestones ("Valideer") with a guided growth-stage transition flow. History grouped by date, unacknowledged badge counter on the nav header.

#### Probes & Sensors
**ESP32-C3 soil probe** with moisture (capacitive), temperature (DS18B20), light (LDR), and battery sensors. Transmits 4 readings every 60 min via WiFi, deep-sleeps between cycles. Pairs via one-time Bluetooth code, charges at ≥ 4.21V detection, three states (available / paired / offline).

**App management screen**: list all probes with state badges (green=paired, orange=available, red=offline, charging), battery % with health labels, WiFi quality via RSSI, and linked plant name.

--

### ⚙️ Account

**Profile, preferences, and first-run experience.**

#### Onboarding & Auth
4-slide introduction carousel. Registration with progressive password validation (8 chars → capital → lowercase → digit → symbol) and repeat-match check. Login with JWT persistence via SecureStore. Post-signup wizard guides you through plant finder → selection → full setup before reaching the app.

#### Account & Settings
Profile (name, email, pairing code, password change), notification toggle, 24-hour quiet hours grid, notification history, and logout.

---

## Architecture

```
┌──────────────┐    REST API   ┌──────────────────┐     ┌────────────┐
│  Mobile App  │◄─────────────►│  Backend API     │────►│ PostgreSQL │
│  (Expo RN)   │               │  (Express/Node)  │     │   (Knex)   │
└──────────────┘               └────────┬─────────┘     └────────────┘
                                        │
                          ┌─────────────▼─────────────┐
                          │     Scheduler (hourly)    │
                          │  ┌─────────────────────┐  │
                          │  │ • checkStaleProbes  │  │
                          │  │ • checkDailyLight   │  │
                          │  │ • checkDailyTemp    │  │
                          │  │ • processSnoozed    │  │
                          │  │ • processReminders  │  │
                          │  │ • checkStageAdvance │  │
                          │  └─────────────────────┘  │
                          └───────────────────────────┘

┌──────────────┐  POST /api/telemetry/upload  ┌──────────────────────┐
│ ESP32-C3     │─────────────────────────────►│ Anomaly Detection    │
│ Probe        │   (batch: 4 readings/cycle)  │ → evaluateThresholds │
│              │                              │ → anti-spam (3x)     │
│ • soil       │                              │ → upsertIssue        │
│ • temp/light │                              │ → dispatchNotif      │
│ • battery    │                              │ → auto-resolve       │
│ • WiFi RSSI  │                              └──────────────────────┘
└──────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 54, React Native 0.81, TypeScript, expo-router |
| Backend | Node.js 22, Express, TypeScript, Knex.js |
| Database | PostgreSQL 16 |
| Push | Expo Push API (FCM V1) |
| Infrastructure | Docker, Hetzner VPS, EAS for Android builds |
| Hardware | XIAO ESP32-C3 with capacitive soil moisture sensor |

### Project Structure

```
sproutspot/
├── frontend/
│   ├── app/                 # expo-router pages
│   │   ├── (account)/       # Account, settings, probes, notifications
│   │   ├── (explore)/       # Encyclopedia, plant finder, 5-step wizard
│   │   └── (garden)/        # Garden grid, plant detail
│   ├── components/
│   │   ├── auth/            # AuthScreen, RegisterFlow
│   │   ├── pages/           # Feature components (account, explore, garden, home)
│   │   ├── shared/          # CardContainer, NavHeader, TabBar, LoadingScreen, StyledAlert
│   │   └── style/           # StyledView, StyledText, StyledIcon, StyledButton
│   ├── services/            # API client (auth, garden, plants, probes, notifications)
│   ├── context/             # Auth, Overlay, Scroll
│   └── constants/           # Styling, tabConfig, garden dimensions
├── backend/
│   ├── controllers/         # HTTP handlers
│   ├── services/            # Business logic + scheduler
│   ├── repositories/        # Database queries (Knex)
│   ├── routes/              # Express route definitions
│   ├── middlewares/          # Auth JWT, validation, error handling
│   ├── types/               # database/, dto/, response/
│   ├── utils/               # Battery calc, plant enricher, plant mapper
│   ├── migrations/          # 1 migration (all 9 tables)
│   ├── seeds/               # 44 encyclopedia plants + growth stages
│   └── public/images/       # Static plant images
├── SproutSpot_Sonde.ino     # Probe firmware source (copy)
├── HISTORY.md               # Full development history (copy)
├── docker-compose.yml       # Postgres + backend + Adminer
└── SproutSpot.postman_collection.json
```

---

## API Overview

Full Postman collection at `SproutSpot.postman_collection.json` (30+ endpoints).

| Module | Key Endpoints | Auth |
|---|---|---|
| Auth | signup, login, profile, update, password, push-token | Bearer (except signup/login) |
| Garden | GET `/`, GET `/status`, GET `/:id`, PUT `/` | Bearer |
| Plants | GET `/`, GET `/search`, GET `/:id`, GET `/:id/stages` | None |
| Probes | register, sync (POST, no auth), list, rename, pair, unpair | Bearer (except register/sync) |
| Telemetry | POST `/upload`, GET `/recent/:sondeId` | None |
| User Plants | create, list (all/active), stage (get/advance), readings | Bearer |
| Notifications | list, count, acknowledge, resolve issue, snooze | Bearer |

---

## Development / Quick Start

### Setup

```bash
# Backend (Docker)
cd backend
docker compose up -d
docker compose exec backend npx knex migrate:latest
docker compose exec backend npx knex seed:run
# Test login: test@test.com / test1234

# Frontend (Expo)
cd frontend
npm install --legacy-peer-deps
npx expo run:android
```

### Configuration (`.env`)

```
API_PORT=5001
DATABASE_HOST=postgres       # or localhost
DATABASE_PORT=5432
MODE=production              # dev reduces intervals for testing
JWT_SECRET=<your-secret>
BACKEND_BASE_URL=http://localhost:5001
```

### Timing

| Constant | Production | Dev Mode |
|---|---|---|
| Scheduler interval | 60 min | 1 min |
| Stale probe threshold | 180 min (3h) | 5 min |
| Deep sleep interval | 60 min (4 readings) | same |

### Commands

```bash
cd backend && npm run dev           # Hot-reload dev server
cd backend && npx knex migrate:latest
cd backend && npx knex seed:run
cd frontend && npx tsc --noEmit     # Type check

# Database GUI via SSH tunnel
ssh -L 8080:localhost:8080 user@host
open http://localhost:8080          # Adminer
```

---

## Acknowledgments

This project was developed with the assistance of AI-powered tools (Opencode) to accelerate development, generate boilerplate, assist with debugging, and maintain consistency across the codebase. The full development history, including all AI-assisted decisions, is documented in [HISTORY.md](HISTORY.md).
