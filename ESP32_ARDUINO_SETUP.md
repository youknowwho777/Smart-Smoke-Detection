# ESP32 + MQ-2 Smoke Detector & Alarm Firmware Guide

This document contains the complete, ready-to-flash C++ sketch for the **ESP32 microcontroller** configured with:
- **MQ-2 Gas / Smoke Sensor** (Analog ADC reading & Voltage)
- **Piezo Buzzer** (Audible Emergency Alarm)
- **Status LEDs** (Visual Warning / Safe Indicators)
- **HTTP REST Client** (Direct telemetry ingestion into the Web Dashboard)

---

## 1. Hardware Pinout & Wiring Diagram

| Component | Component Pin | ESP32 GPIO Pin | Wire Note |
|---|---|---|---|
| **MQ-2 Sensor** | **VCC** | **VIN (5V)** | MQ-2 internal heater requires 5V for proper sensitivity |
| **MQ-2 Sensor** | **GND** | **GND** | Common ground with ESP32 |
| **MQ-2 Sensor** | **AO (Analog Out)** | **GPIO 34** (ADC1_CH6) | *Critical: ADC1 pins (32–39) work reliably while Wi-Fi is active* |
| **Buzzer** | **Positive (+)** | **GPIO 26** | Active 5V/3.3V buzzer or transistor driver pin |
| **Buzzer** | **Negative (-)** | **GND** | Ground |
| **Alert LED (Red)** | **Anode (+)** | **GPIO 19** | Connect via 220Ω / 330Ω current limiting resistor |
| **Alert LED (Red)** | **Cathode (-)** | **GND** | Ground |
| **Safe LED (Green)** | **Anode (+)** | **GPIO 18** *(Optional)* | Connect via 220Ω / 330Ω resistor (Built-in LED `GPIO 2` also supported) |
| **Safe LED (Green)** | **Cathode (-)** | **GND** | Ground |

> [!IMPORTANT]
> **Preheating the MQ-2 Sensor:** When powering on an MQ-2 sensor for the first time, allow it to warm up for 1–2 minutes (initial burn-in) until the heater coil stabilizes and ambient readings settle around **300–600 ADC**.

---

## 2. Arduino IDE Setup Instructions

1. **Install ESP32 Board Package:**
   - In Arduino IDE, go to `File` → `Preferences`.
   - In "Additional Boards Manager URLs", paste:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to `Tools` → `Board` → `Boards Manager`, search for **esp32** by Espressif and click **Install**.
2. **Select Board:**
   - Go to `Tools` → `Board` → `ESP32 Arduino` → select **DOIT ESP32 DEVKIT V1** (or your specific ESP32 module).
3. **No External Libraries Required!**
   - This sketch uses only native ESP32 core libraries (`WiFi.h` and `HTTPClient.h`), so you do **not** need to install any third-party JSON or sensor libraries.
4. **Find Your Computer's Local IP Address:**
   - On Windows, open PowerShell/Command Prompt and run:
     ```cmd
     ipconfig
     ```
   - Look for **IPv4 Address** under your active Wi-Fi adapter (e.g., `192.168.1.105`).
   - Replace `<YOUR_COMPUTER_IP>` in the code below with this IP.

---

## 3. Complete Copy-Paste Arduino IDE Sketch (`esp32_smoke_monitor.ino`)

Copy and paste the entire code below into your Arduino IDE:

```cpp
/*
 * ===================================================================================
 * IoT Smart Smoke Detection & Safety Monitoring System - ESP32 Firmware
 * 
 * Hardware:
 *   - ESP32 Development Board (Wi-Fi 2.4 GHz)
 *   - MQ-2 Gas/Smoke Sensor (AO -> GPIO 34)
 *   - Piezo Buzzer (Positive -> GPIO 26)
 *   - Alert LED (Red) (Anode -> GPIO 19)
 *   - Safe LED (Green) (Anode -> GPIO 18)
 * 
 * Features:
 *   - 12-bit ADC quantization (0-4095) with multi-sample oversampling
 *   - Real-time voltage calculation ((ADC / 4095.0) * 3.3V)
 *   - Local safety threshold triggers for Buzzer and LEDs
 *   - Direct HTTP POST telemetry transmission to Node.js backend
 *   - Auto-reconnect Wi-Fi watchdog
 * ===================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// -----------------------------------------------------------------------------------
// 1. NETWORK & BACKEND CONFIGURATION (Update these with your details)
// -----------------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // 2.4GHz Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Wi-Fi Password

// Replace with your laptop/desktop local IP address where the backend server is running:
// Example: "http://192.168.1.105:5000/api/telemetry"
const char* SERVER_URL    = "http://192.168.1.105:5000/api/telemetry";

// Device identifier registered in the web dashboard
const char* DEVICE_ID     = "SMOKE-001";

// Transmission interval in milliseconds (3000ms = 3 seconds)
const unsigned long SEND_INTERVAL_MS = 3000;

// -----------------------------------------------------------------------------------
// 2. HARDWARE PIN DEFINITIONS
// -----------------------------------------------------------------------------------
const int PIN_MQ2_ANALOG   = 34;  // MQ-2 AO -> ADC1 Channel 6 (GPIO 34)
const int PIN_BUZZER       = 26;  // Buzzer Output Pin
const int PIN_LED_ALERT    = 19;  // Red Warning/Critical LED
const int PIN_LED_SAFE     = 18;  // Green Safe Status LED (Optional)

// -----------------------------------------------------------------------------------
// 3. SAFETY THRESHOLDS (ADC 12-bit: 0 - 4095)
// -----------------------------------------------------------------------------------
const int THRESHOLD_WARNING  = 2000;  // Threshold for Warning LED activation
const int THRESHOLD_CRITICAL = 3000;  // Threshold for Emergency Buzzer & Red Alert LED

// -----------------------------------------------------------------------------------
// 4. GLOBAL TIMERS
// -----------------------------------------------------------------------------------
unsigned long lastSendTime = 0;

// ===================================================================================
// SETUP
// ===================================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("🔥 IoT Smart Smoke Detection & Safety System - ESP32");
  Serial.println("=======================================================");

  // Initialize GPIO Modes
  pinMode(PIN_MQ2_ANALOG, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_ALERT, OUTPUT);
  pinMode(PIN_LED_SAFE, OUTPUT);

  // Initial State: Turn off alarms, turn on green safe LED
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_LED_ALERT, LOW);
  digitalWrite(PIN_LED_SAFE, HIGH);

  // Configure ADC resolution (12-bit: 0 - 4095)
  analogReadResolution(12);

  // Connect to Wi-Fi
  connectToWiFi();

  Serial.println("System initialized. Monitoring atmospheric smoke levels...\n");
}

// ===================================================================================
// MAIN LOOP
// ===================================================================================
void loop() {
  // Ensure Wi-Fi stays connected
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Sample the MQ-2 sensor
  int rawAdc = readAveragedADC(PIN_MQ2_ANALOG, 10);
  float voltage = (rawAdc / 4095.0) * 3.3;

  // Local Actuator Control Logic (Buzzer & LEDs)
  bool buzzerActive = false;
  bool ledActive = false;

  if (rawAdc >= THRESHOLD_CRITICAL) {
    // CRITICAL DANGER: Sound buzzer and illuminate alert LED
    buzzerActive = true;
    ledActive = true;
    digitalWrite(PIN_BUZZER, HIGH);
    digitalWrite(PIN_LED_ALERT, HIGH);
    digitalWrite(PIN_LED_SAFE, LOW);
  } 
  else if (rawAdc >= THRESHOLD_WARNING) {
    // WARNING: Illuminate warning alert LED, keep buzzer off
    buzzerActive = false;
    ledActive = true;
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_LED_ALERT, HIGH);
    digitalWrite(PIN_LED_SAFE, LOW);
  } 
  else {
    // SAFE: All alarms standby, green safe light on
    buzzerActive = false;
    ledActive = false;
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_LED_ALERT, LOW);
    digitalWrite(PIN_LED_SAFE, HIGH);
  }

  // Periodic Telemetry Transmission to Web Dashboard
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = currentMillis;

    // Send HTTP POST telemetry packet
    sendTelemetryPacket(rawAdc, voltage, buzzerActive, ledActive);
  }

  delay(200); // Small loop pacing delay
}

// ===================================================================================
// HELPER FUNCTIONS
// ===================================================================================

/**
 * Connects the ESP32 to local Wi-Fi with status reporting
 */
void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Wi-Fi Connected Successfully!");
    Serial.print("📡 ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n⚠ Wi-Fi Connection Failed. Will retry in background...");
  }
}

/**
 * Performs multi-sample averaging on ADC pin to filter out electrical noise
 */
int readAveragedADC(int pin, int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return (int)(sum / samples);
}

/**
 * Builds standard JSON payload and transmits HTTP POST to dashboard backend
 */
void sendTelemetryPacket(int rawAdc, float voltage, bool buzzer, bool led) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi not connected. Skipping telemetry transmission.");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload exactly matching backend schema
  char jsonPayload[256];
  snprintf(jsonPayload, sizeof(jsonPayload),
    "{"
      "\"deviceId\":\"%s\","
      "\"sensor\":{\"type\":\"MQ-2\",\"rawAdc\":%d,\"voltage\":%.2f},"
      "\"actuators\":{\"buzzer\":%s,\"led\":%s}"
    "}",
    DEVICE_ID,
    rawAdc,
    voltage,
    buzzer ? "true" : "false",
    led ? "true" : "false"
  );

  Serial.println("-------------------------------------------------------");
  Serial.print("📤 Transmitting Telemetry: ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("✓ Server Response Code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("📥 Server Feedback: ");
    Serial.println(response);
  } else {
    Serial.print("❌ HTTP POST Failed. Error: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
  }

  http.end();
  Serial.println("-------------------------------------------------------\n");
}
```

---

## 4. How to Verify ESP32 Live Telemetry on the Dashboard

1. **Start the Backend Server:**
   ```powershell
   cd "c:\Sem-5 Lab\IoT\Smoke Detection Project\server"
   npm start
   ```
2. **Start the React Frontend:**
   ```powershell
   cd "c:\Sem-5 Lab\IoT\Smoke Detection Project\client"
   npm run dev
   ```
3. **Turn Off Simulator (Optional):**
   - On the web dashboard, navigate to **Settings**.
   - Uncheck *"Enable Automatic Backend Sensor Simulator"* and click **Apply & Save Settings**.
   - *(Or set `SIMULATION_ENABLED=false` in `server/.env`)*.
4. **Power on the ESP32:**
   - Plug the ESP32 into USB and open the Arduino IDE **Serial Monitor** at **115200 baud**.
   - Once connected, you will see HTTP `201 Created` responses.
   - The web dashboard header badge will automatically switch to **Hardware Mode**, and your physical smoke sensor readings, buzzer alarms, and LED alerts will reflect on the live dashboard in real time!
