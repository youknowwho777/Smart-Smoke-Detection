# Build a Complete IoT Smart Smoke Detection & Safety Monitoring System

Act as a senior full-stack developer. Build a complete, functional, full-stack web application for an **IoT-Based Smart Smoke Detection and Automated Safety Monitoring System**.

The application should be developed independently of physical hardware for now. We will integrate an ESP32 and MQ-2 smoke sensor later.

Do not just create a UI prototype. Build a working frontend, backend, database integration, APIs, and simulated sensor data.

## 1. Technology Stack

**Frontend**
- React.js (Vite)
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Recharts for graphs
- Lucide React for icons

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- REST APIs
- dotenv
- CORS

Use clean, modular, maintainable code.

## 2. Application Architecture

Build the application with two independent folders:

```text
smoke-detection-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── ...
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── server.js
│
└── README.md
```

You can improve this structure wherever necessary.

## 3. Frontend – Dashboard

Create a professional IoT monitoring dashboard.

**Design requirements:**
- Modern industrial / smart IoT monitoring appearance.
- Avoid generic violet-and-white AI dashboard designs.
- Use a dark charcoal background, subtle borders, and amber/orange warning accents with restrained teal or green for safe states.
- Responsive design.
- Professional typography.
- Clear visual hierarchy.
- Sidebar navigation.
- Consistent reusable components.
- Use appropriate icons and charts.

### Pages and features

**A. Overview Dashboard**

Display:

1. Current smoke detection status (SAFE / WARNING / CRITICAL).
2. Latest sensor reading.
3. Current device connectivity.
4. Total alerts today.
5. Fan status.
6. Buzzer status.
7. LED status.
8. Last sensor update time.

Include:
- Live sensor readings graph.
- Recent alerts section.
- Sensor reading history.
- Device status card.

**B. Live Monitoring**

- Display continuously updating sensor readings.
- Show a real-time line chart.
- Show current raw ADC value.
- Display sensor voltage if available.
- Display current safety status.
- Clearly distinguish safe and dangerous readings.

**C. Alerts and History**

- Display previous alerts.
- Include timestamps and severity.
- Support filtering by severity and date.
- Display acknowledged/unacknowledged status.
- Allow an alert to be acknowledged.
- Maintain alert history in MongoDB.

**D. Device Management**

- Device ID.
- Device connection status.
- Last communication time.
- Sensor type.
- Device information.
- Simulation/hardware operating mode.

**E. Settings**

- Configurable warning threshold.
- Configurable critical threshold.
- Sensor update interval.
- Simulation mode toggle.
- Device configuration.

Make sure threshold settings are actually connected to backend functionality.

## 4. Backend – Node.js + Express

Implement a complete REST API.

Create the following endpoints:

### Device APIs

- GET /api/devices
- GET /api/devices/:deviceId
- POST /api/devices/register

### Sensor APIs

- POST /api/telemetry

Receives sensor readings from the ESP32 in the future.

- GET /api/telemetry/latest
- GET /api/telemetry/history
- GET /api/telemetry/:deviceId

### Alert APIs

- GET /api/alerts
- GET /api/alerts/:id
- PATCH /api/alerts/:id/acknowledge

### Settings APIs

- GET /api/settings
- PUT /api/settings

### System API

- GET /api/health

Implement proper:
- Controllers.
- Routes.
- Mongoose models.
- Request validation.
- Error handling middleware.
- HTTP status codes.
- Database connection.
- Environment variables.

Avoid putting all business logic inside route files.

## 5. MongoDB Data Models

Create appropriate schemas.

**Device**
- deviceId
- deviceName
- sensorType
- status
- mode (simulation/hardware)
- lastSeen
- createdAt

**SensorReading**
- deviceId
- rawAdc
- voltage
- status
- fanStatus
- buzzerStatus
- ledStatus
- timestamp

**Alert**
- deviceId
- severity
- message
- sensorValue
- acknowledged
- timestamp

**Settings**
- warningThreshold
- criticalThreshold
- simulationInterval
- deviceId

Add suitable indexes, especially for frequently queried timestamps and device IDs.

## 6. Sensor Simulation – Very Important

Since actual hardware is not yet integrated, implement a backend-based sensor simulator.

It should generate realistic changing sensor readings automatically.

Requirements:

1. Generate normal readings most of the time.
2. Occasionally generate warning-level readings.
3. Occasionally generate critical readings.
4. Simulate changing sensor values rather than completely random numbers.
5. Update fan, buzzer and LED states based on the configured thresholds.
6. Generate alerts when the system enters warning or critical states.
7. Avoid generating duplicate alerts on every polling cycle while the system remains in the same state.
8. Store simulated readings in MongoDB.
9. Make the simulation configurable and easy to stop or restart.
10. Clearly identify simulated readings in the application.

Provide a way to trigger SAFE, WARNING and CRITICAL scenarios manually for demonstrations.

The simulator must run on the backend, not just generate fake numbers inside React.

## 7. Hardware Integration Readiness

This is a critical requirement.

The backend must be designed so that simulated data can later be replaced by actual ESP32 sensor data without rewriting the application.

Use a consistent telemetry JSON format:

```json
{
  "deviceId": "SMOKE-001",
  "timestamp": "2026-11-07T18:00:00Z",
  "sensor": {
    "type": "MQ-2",
    "rawAdc": 1850,
    "voltage": 1.49
  },
  "actuators": {
    "buzzer": true,
    "led": true,
    "fan": true
  }
}
```

Implement a clean telemetry processing service.

The ESP32 should eventually be able to send readings through HTTP POST to `/api/telemetry`.

Keep hardware and simulation modes separate.

Do not assume raw ADC readings represent calibrated PPM values. Keep sensor calibration and threshold configuration separate so they can be adjusted after physical testing.

Do not implement unsafe direct fan or mains-power control from the web dashboard. Actuator states should initially be monitored and simulated.

## 8. Frontend and Backend Integration

Connect all frontend pages to the actual backend APIs.

Requirements:

- Use a centralized Axios instance.
- Keep API calls inside service files.
- Use reusable components.
- Implement loading states.
- Implement error states.
- Handle empty data.
- Show backend connection status.
- Refresh dashboard data automatically.
- Use a configurable polling interval.
- Avoid unnecessary API calls.
- Ensure charts use actual backend readings.

Do not hardcode dashboard values when backend data is available.

## 9. Testing and Reliability

Implement:

- Basic API testing.
- Input validation.
- Invalid request handling.
- MongoDB connection error handling.
- Simulation testing.
- Frontend integration testing.
- Proper empty-state handling.

Ensure the application can run locally without any physical ESP32 or MQ-2 sensor.

## 10. README and Setup Instructions

Write a complete README containing:

1. Project overview.
2. Architecture.
3. Technology stack.
4. Folder structure.
5. Installation instructions.
6. Environment variable configuration.
7. MongoDB Atlas setup.
8. How to start the backend.
9. How to start the frontend.
10. How to run sensor simulation.
11. API endpoint documentation.
12. How to switch from simulation mode to hardware mode.
13. Example ESP32 HTTP payload.

Include `.env.example` files for both frontend and backend.

## 11. Development Instructions

Follow these instructions carefully:

- First inspect the existing project directory.
- If the project is empty, initialize the application.
- If code already exists, preserve useful existing work.
- Build the frontend and backend together.
- Do not create disconnected demo pages.
- Do not leave important buttons non-functional.
- Do not use hardcoded mock data as a replacement for backend functionality.
- Use clean naming conventions.
- Add comments only where they improve understanding.
- Ensure all imports and dependencies are correct.
- Verify that both frontend and backend start successfully.
- Fix errors before declaring completion.

**Priority:** Complete as much of the working application as possible. Prioritize a functional end-to-end system over unnecessary animations or decorative elements.

If you cannot finish everything in one pass, prioritize in this order:

1. Backend architecture and MongoDB models.
2. Working sensor simulation.
3. Telemetry and alert APIs.
4. Frontend dashboard.
5. Live charts and history.
6. Settings and device management.
7. Documentation and tests.

At the end, provide a summary of:
- Files created and modified.
- Features implemented.
- APIs available.
- Dependencies installed.
- Commands to run the project.
- Remaining tasks, if any.

**Final objective:** Deliver a complete working IoT smoke detection monitoring platform that can run entirely on simulated data today and connect to our actual ESP32 + MQ-2 hardware later with minimal changes.