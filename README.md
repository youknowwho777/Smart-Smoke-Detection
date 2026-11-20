# IoT-Based Smart Smoke Detection & Automated Safety Monitoring System

A full-stack, industrial-grade IoT safety monitoring platform engineered for real-time smoke detection, automated actuator intervention (ventilation fans, audio buzzers, warning LEDs), safety state transitions, and persistent incident auditing.

The system is built to operate immediately with an **autonomous backend sensor simulation engine**, and is architected to seamlessly transition to physical **ESP32 + MQ-2 smoke detector hardware** with zero backend code refactoring.

---

## 1. Project Architecture

The application is structured into two completely independent yet tightly integrated tiers:

```
Smoke Detection Project/
│
├── client/                     # Vite + React 18 + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/         # Reusable dashboard widgets (StatusCard, TrendChart, Actuators, etc.)
│   │   ├── layouts/            # MainLayout with responsive dark sidebar and navigation
│   │   ├── pages/              # Dashboard, Live Monitoring, Alerts & History, Devices, Settings
│   │   ├── services/           # Centralized Axios API service layer
│   │   ├── App.jsx             # React Router routing configuration
│   │   └── main.jsx            # Entry point
│   ├── .env.example
│   └── package.json
│
├── server/                     # Node.js + Express.js + Mongoose REST API backend
│   ├── config/                 # Database connection & resilient fallback engine
│   ├── controllers/            # Device, Telemetry, Alert, Settings, System controllers
│   ├── middleware/             # Error handling, 404 handler, request validation
│   ├── models/                 # Mongoose schemas (Device, SensorReading, Alert, Settings)
│   ├── routes/                 # REST API endpoints
│   ├── services/               # Telemetry ingestion engine & autonomous Sensor Simulator
│   ├── utils/                  # Unified data store abstraction (MongoDB with resilient in-memory fallback)
│   ├── test/                   # Automated API integration verification suite
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 2. Technology Stack

- **Frontend:**
  - React.js 18 (Vite 6)
  - JavaScript (ES Modules)
  - Tailwind CSS 3.4 (Industrial dark sidebar + high-contrast telemetry palette)
  - React Router DOM 7
  - Recharts 2.15 (Interactive real-time trend charts with threshold overlays)
  - Lucide React (High-fidelity IoT status icons)
  - Axios (HTTP client with global request handling)

- **Backend:**
  - Node.js (v20+ / v22+)
  - Express.js 4 (Modular REST API architecture)
  - MongoDB & Mongoose 8 (Persistent document store with indexed queries)
  - Morgan (HTTP request logging)
  - Dotenv (Environment configuration management)
  - CORS (Cross-Origin Resource Sharing)

---

## 3. Key Features

1. **Dashboard (Matching Primary UI Reference):**
   - **Current Status Card:** Dynamic `SAFE`, `WARNING`, or `CRITICAL` state with color-coded badges, shield icons, and glowing alert animations.
   - **Smoke Level Card:** Real-time 12-bit ADC value (0–4095) with voltage calculation (`(ADC / 4095) * 3.3V`) and range assessment pills.
   - **Automated Actuator Cards:** Instant visual state of the **Ventilation Fan** (animated spinning on high smoke), **Buzzer** (audible alarm indicator), and **Alert LED**.
   - **Smoke Level Trend Chart:** Live Recharts line graph plotted against dynamic **Warning (2000 ADC)** and **Critical (3000 ADC)** dashed threshold lines with historical timeframe filtering.
   - **Recent Alerts Card:** Live feed of warning and critical safety hazards with timestamps, sensor values, and one-click acknowledgment.
   - **Bottom Metrics Summary:** Real-time reading, active warning threshold, and critical threshold quick-look cards.

2. **Live Monitoring Page:**
   - Real-time ADC quantization meter (0 to 4095 scale).
   - Sensor analog voltage gauge (0.00V to 3.30V).
   - Configurable high-frequency polling intervals (1s, 2s, 5s).
   - Raw JSON telemetry inspector for validating incoming packets.

3. **Alerts & History:**
   - Chronological audit log of all safety state transitions stored in MongoDB.
   - Multi-parameter filtering by Severity (`CRITICAL`, `WARNING`, `INFO`) and Status (Acknowledged vs. Unacknowledged).
   - Real-time one-click acknowledgment (`PATCH /api/alerts/:id/acknowledge`) and batch acknowledge.

4. **Device Management:**
   - Registry of IoT nodes (e.g. `SMOKE-001`, `SMOKE-002`).
   - Device connection telemetry, IP address, sensor model (`MQ-2`), and operating mode (`simulation` vs. `hardware`).
   - Modal for provisioning new ESP32 nodes into the database.
   - One-click ping test tool to simulate hardware packet transmission.

5. **Settings & System Calibration:**
   - Configurable Warning ADC Threshold (default: 2000 ADC).
   - Configurable Critical ADC Threshold (default: 3000 ADC).
   - Configurable Simulator tick interval (500ms to 60,000ms).
   - Automatic sync with backend simulator and real-time database diagnostics.

6. **Autonomous Sensor Simulator (Backend-Owned):**
   - Runs completely inside the Node.js backend (`server/services/simulatorService.js`).
   - Generates realistic Gaussian Brownian drift and ambient noise instead of random numbers.
   - Naturally produces ambient safe levels (~350–550 ADC) with occasional elevated spikes.
   - Supports instant manual scenario triggering (`SAFE`, `WARNING`, `CRITICAL`) from the interactive demo bar.

---

## 4. Installation & Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (optional — the server includes an automatic resilient in-memory fallback for zero-setup local development)

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

---

### Step 2: Environment Configuration

The repository includes pre-configured `.env` and `.env.example` files:

#### `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smoke_detection
NODE_ENV=development
DEFAULT_DEVICE_ID=SMOKE-001
SIMULATION_ENABLED=true
SIMULATION_INTERVAL_MS=3000
WARNING_THRESHOLD=2000
CRITICAL_THRESHOLD=3000
```

#### `client/.env`
```env
VITE_API_BASE_URL=/api
VITE_DEFAULT_DEVICE_ID=SMOKE-001
VITE_POLL_INTERVAL_MS=3000
```

#### Using MongoDB Atlas (Cloud Database)
To connect to a remote MongoDB Atlas cluster:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for development).
4. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smoke_detection?retryWrites=true&w=majority
   ```

*(Note: If no MongoDB instance is running, the backend seamlessly falls back to an embedded in-memory data store so everything works immediately out-of-the-box!)*

---

### Step 3: Run the Backend Server

In your first terminal:

```bash
cd server
npm start
```
The backend API will start on **http://localhost:5000**.
The built-in simulator will automatically begin generating realistic smoke telemetry.

---

### Step 4: Run the Frontend Application

In a second terminal:

```bash
cd client
npm run dev
```
Open **http://localhost:3000** in your browser. The dashboard will instantly connect to the backend, display live telemetry, and reflect automated safety state transitions.

---

## 5. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/health` | System uptime, Node.js version, and database status |
| **GET** | `/api/devices` | List all registered IoT devices |
| **GET** | `/api/devices/:deviceId` | Retrieve specific device details |
| **POST** | `/api/devices/register` | Register or update an IoT sensor device |
| **POST** | `/api/telemetry` | Ingest sensor readings (used by ESP32 or simulator) |
| **GET** | `/api/telemetry/latest` | Retrieve latest sensor reading for device |
| **GET** | `/api/telemetry/history` | Historical telemetry records (query: `limit`, `hours`) |
| **GET** | `/api/telemetry/:deviceId` | Historical telemetry for specific device |
| **GET** | `/api/alerts` | Filtered safety alerts (`severity`, `acknowledged`, `limit`) |
| **GET** | `/api/alerts/:id` | Retrieve specific alert details |
| **PATCH**| `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| **GET** | `/api/settings` | Retrieve active safety thresholds and simulator status |
| **PUT** | `/api/settings` | Update thresholds, polling intervals, and simulation toggle |
| **POST** | `/api/settings/simulation/scenario`| Trigger test scenario (`SAFE`, `WARNING`, `CRITICAL`) |
| **POST** | `/api/settings/simulation/toggle` | Start or pause backend simulation engine |

---

## 6. Hardware Integration Readiness (ESP32 + MQ-2)

The system is 100% prepared to receive real sensor readings from an ESP32 microcontroller.

### Standard Telemetry JSON Payload
The ESP32 sends an HTTP POST request to `http://<SERVER_IP>:5000/api/telemetry`:

```json
{
  "deviceId": "SMOKE-001",
  "timestamp": "2026-11-13T19:30:00.000Z",
  "sensor": {
    "type": "MQ-2",
    "rawAdc": 2450,
    "voltage": 1.97
  },
  "actuators": {
    "fan": true,
    "buzzer": false,
    "led": true
  }
}
```

### Transitioning from Simulation Mode to Hardware Mode
1. **Disable Simulator:** In `server/.env`, set `SIMULATION_ENABLED=false` (or toggle it off from the web dashboard under **Settings**).
2. **Flash ESP32 Sketch:** Configure the ESP32 with your local Wi-Fi credentials and target the backend's IP address.
3. **Automatic Device Registration:** When the ESP32 transmits its first HTTP POST to `/api/telemetry`, the backend automatically registers the device, switches its operating mode to `hardware`, and routes all live readings into MongoDB.

---

## 7. Automated Testing

An automated verification test script is included in `server/test/api.test.js`. To execute tests:

```bash
cd server
node test/api.test.js
```

All 8 core test suites verify health checks, device registration, telemetry ingestion, threshold evaluation, alert generation, alert acknowledgment, and scenario triggers.
