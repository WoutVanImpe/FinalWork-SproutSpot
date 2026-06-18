#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <time.h>
#include "SHT31.h"
#include <Digital_Light_TSL2561.h>

Preferences preferences;
DNSServer dnsServer;
WebServer server(80);
SHT31 sht31;

const char* AP_SSID = "SproutSpot-Setup";
const char* registerUrl = "http://178.104.50.231:5001/api/probes/register";
const char* telemetryUrl = "http://178.104.50.231:5001/api/telemetry/upload";
const char* syncUrl = "http://178.104.50.231:5001/api/probes/sync";

const int SOIL_AIR_VALUE = 2765;
const int SOIL_WATER_VALUE = 1880;
const int SOIL_PIN = A0;
const int BATTERY_PIN = A1;
const int RESET_BUTTON_PIN = D2;

#define DEV_MODE

#if defined(DEV_MODE)
  const unsigned long CHARGE_UPLOAD_INTERVAL = 30000;
  const uint64_t SLEEP_TIME_SECONDS = 2;
  const uint64_t INACTIVE_SLEEP_SECONDS = 2;
#else
  const unsigned long CHARGE_UPLOAD_INTERVAL = 180000;
  const uint64_t SLEEP_TIME_SECONDS = 900;
  const uint64_t INACTIVE_SLEEP_SECONDS = 3600;
#endif

const int MAX_MEASUREMENTS = 4;
RTC_DATA_ATTR int measurementCount = 0; 
RTC_DATA_ATTR bool isSondeActief = false; 
RTC_DATA_ATTR bool wasCharging = false; 
RTC_DATA_ATTR float previousSavedVoltage = 0.0;

struct Reading {
  time_t timestamp; 
  float temp;
  unsigned long lux;
  int soilRaw;  
  float battery;
  int rssi;
};
RTC_DATA_ATTR Reading batch[MAX_MEASUREMENTS]; 

unsigned long lastChargeUpload = 0;
unsigned long apStartTime = 0;

void sendTelemetryBatch();
void sendLiveChargingStatus();
void triggerManualSync();
int readSoilMoisture();
bool isPluggedIn();
float readBatteryVoltage();
int calculateBatteryPercentage(float voltage);

const float BATTERY_MIN_SAFE = 3.30;
const float CHARGING_ENTER_THRESHOLD = 4.20; 
const float CHARGING_EXIT_THRESHOLD = 4.18; 

float getRawBatteryVoltage() {
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogReadMilliVolts(BATTERY_PIN);
    delay(1);
  }
  float mv = sum / 16.0;
  return (mv / 1000.0) * 4.03;
}

bool isPluggedIn() {
  return wasCharging;
}

float readBatteryVoltage() {
  float v = getRawBatteryVoltage();

  if (previousSavedVoltage > 0.50 && (v - previousSavedVoltage) > 0.05) {
    wasCharging = true;
  }

  if (v >= CHARGING_ENTER_THRESHOLD) {
    wasCharging = true;
  }

  if (wasCharging) {
    if (v < CHARGING_EXIT_THRESHOLD || (previousSavedVoltage > 0.50 && (previousSavedVoltage - v) > 0.05)) {
      wasCharging = false;
    }
  }

  previousSavedVoltage = v;
  if (isPluggedIn()) {
    if (v > 4.35) return 4.35;
    return v;
  }

  if (v > 4.20) return 4.20;
  if (v < 0.50) return 0.00;
  return v;
}

int calculateBatteryPercentage(float voltage) {
  if (!isPluggedIn()) {
    if (voltage >= 4.15) return 100;
    if (voltage <= BATTERY_MIN_SAFE) return 0;
    return (int)(((voltage - BATTERY_MIN_SAFE) / (4.15 - BATTERY_MIN_SAFE)) * 100.0);
  }

  float minChargingVoltage = 3.65;
  float maxChargingVoltage = 4.30;

  if (voltage >= maxChargingVoltage) return 100;
  if (voltage <= minChargingVoltage) return 0;

  return (int)(((voltage - minChargingVoltage) / (maxChargingVoltage - minChargingVoltage)) * 100.0);
}

int readSoilMoisture() {
  int rawSoil = analogRead(SOIL_PIN);
  rawSoil = constrain(rawSoil, min(SOIL_WATER_VALUE, SOIL_AIR_VALUE), max(SOIL_WATER_VALUE, SOIL_AIR_VALUE));
  return rawSoil;
}


String getHtmlHead() {
  float v = readBatteryVoltage();
  int pct = calculateBatteryPercentage(v);
  String batteryColor = "#00CA68";
  if (pct < 20) batteryColor = "#C44028";

  String html = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<link rel='preconnect' href='https://fonts.googleapis.com'>";
  html += "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>";
  html += "<link href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap' rel='stylesheet'>";
  html += "<style>";
  html += "* { box-sizing: border-box; }";
  html += "body { font-family: 'Space Grotesk', sans-serif; font-weight: 500; background: linear-gradient(25deg, rgba(109,118,126,1) 0%, rgba(69,78,86,1) 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; position: relative; }";
  html += ".card { background: #fff; padding: 24px 25px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 100%; max-width: 380px; }";
  html += ".battery-status { position: absolute; top: 24px; right: 24px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #fff; }";
  html += ".battery-icon { width: 26px; height: 14px; border: 2px solid #fff; border-radius: 4px; position: relative; padding: 1px; background: transparent; }";
  html += ".battery-icon::after { content: ''; position: absolute; right: -4px; top: 3px; width: 2px; height: 4px; background: #fff; border-radius: 0 1px 1px 0; }";
  html += ".battery-level { height: 100%; background: " + batteryColor + "; border-radius: 1px; width: " + String(pct) + "%; }"; 
  html += "h2 { color: #00CA68; text-align: center; font-weight: 700; font-size: 24px; margin: 0 0 8px 0; }";
  html += ".charging { color: #00CA68; font-size: 11px; font-weight: 700; text-align: right; margin-top: 2px; }";
  html += ".error { color: #C44028; background: #fdecea; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; text-align: center; }";
  html += "input { width: 100%; padding: 12px 0; margin: 8px 0 4px; border: none; border-bottom: 1px solid #00CA68; background: transparent; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 14px; color: #222; outline: none; }";
  html += "input:focus { border-bottom-color: #00CA68; }";
  html += ".btn-wrapper { margin-top: 20px; }";
  html += "button { width: 100%; padding: 12px 24px; background: #00CA68; color: #fff; border: none; border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; cursor: pointer; }";
  html += ".loading { text-align: center; padding: 40px 0; }";
  html += ".spinner { width: 40px; height: 40px; margin: 0 auto 16px; border: 4px solid #e0e0e0; border-top: 4px solid #00CA68; border-radius: 50%; animation: spin 0.8s linear infinite; }";
  html += "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
  html += ".loading p { color: #555; font-size: 14px; margin: 0; }";
  html += ".checkmark { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: #00CA68; display: flex; align-items: center; justify-content: center; }";
  html += ".checkmark svg { width: 32px; height: 32px; }";
  html += ".success-text { color: #555; font-size: 14px; text-align: center; margin: 0; }";
  html += "</style></head><body>";

  if (isPluggedIn()) {
    html += "<div class='battery-status'><div><div><span>" + String(pct) + "%</span></div><div class='charging'>Opladen...</div></div><div class='battery-icon'><div class='battery-level'></div></div></div>";
  } else {
    html += "<div class='battery-status'><span>" + String(pct) + "%</span><div class='battery-icon'><div class='battery-level'></div></div></div>";
  }
  return html;
}

String getHtmlForm(String error = "") {
  String html = getHtmlHead();
  html += "<div class='card'><h2>Sonde Registratie</h2><p style='color:#555; font-size:14px; text-align:center;'>Koppel je SproutSpot sonde aan je account</p>";
  
  if (error != "") html += "<div class='error'>" + error + "</div>";
  
  html += "<form method='POST' action='/save'>";
  html += "<input type='text' name='pairing_code' placeholder='Koppelcode (bv. AB123456)'>";
  html += "<p style='color:#888; font-size:12px; margin:0 0 8px 0;'>Al gekoppeld? Laat dit veld leeg</p>";
  html += "<input type='text' name='ssid' placeholder='WiFi Naam' required>";
  html += "<input type='password' name='pass' placeholder='Wachtwoord' required>";
  html += "<div class='btn-wrapper'><button type='submit'>Opslaan & Verbinden</button></div></form>";
  html += "<div id='loading' class='loading' style='display:none'><div class='spinner'></div><p>Bezig met verbinden...</p></div>";
  html += "<script>document.querySelector('form').onsubmit=function(){document.querySelector('form').style.display='none';document.getElementById('loading').style.display='block';}</script>";
  html += "</div></body></html>";
  return html;
}

String getHtmlSuccess() {
  String html = getHtmlHead();
  html += "<div class='card' style='text-align:center;'>";
  html += "<div class='checkmark'><svg viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg></div>";
  html += "<h2>Gekoppeld!</h2>";
  html += "<p class='success-text'>Sonde succesvol geregistreerd.<br>Herstarten...</p>";
  html += "</div></body></html>";
  return html;
}

void handleRoot() { server.send(200, "text/html", getHtmlForm()); }

void handleSave() {
  String n_ssid = server.arg("ssid");
  String n_pass = server.arg("pass");
  String n_pair = server.arg("pairing_code");

  WiFi.begin(n_ssid.c_str(), n_pass.c_str());
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) { delay(500); attempts++; }

  if (WiFi.status() != WL_CONNECTED) {
    server.send(200, "text/html", getHtmlForm("WiFi mislukt: Check je wachtwoord."));
    WiFi.disconnect();
    return;
  }

  HTTPClient http;
  http.begin(registerUrl);
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> regDoc;
  regDoc["hardware_id"] = WiFi.macAddress();
  regDoc["pairing_code"] = n_pair;
  
  String body;
  serializeJson(regDoc, body);
  int httpCode = http.POST(body);
  http.end();

  if (httpCode == 201 || httpCode == 200) {
    preferences.begin("wifi-config", false);
    preferences.putString("ssid", n_ssid);
    preferences.putString("pass", n_pass);
    preferences.end();
    
    isSondeActief = true; 
    
    server.send(200, "text/html", getHtmlSuccess());
    delay(3000);
    ESP.restart();
  } else {
    WiFi.disconnect();
    server.send(200, "text/html", getHtmlForm("Fout bij koppelen: " + String(httpCode)));
  }
}

void startAPMode() {
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(AP_SSID);
  dnsServer.start(53, "*", WiFi.softAPIP());
  server.on("/", handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.begin();
  Serial.println("[SETUP] Portal Actief (Conditie 3)");
}

void setup() {
  Serial.begin(115200);
  
  int timeout = 0;
  while (!Serial && timeout < 100) { 
    delay(10); 
    timeout++; 
  }
  
  Serial.println("\n--- SPROUTSPOT BOOTING ---");

  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);

  esp_deep_sleep_enable_gpio_wakeup(1ULL << RESET_BUTTON_PIN, ESP_GPIO_WAKEUP_GPIO_LOW);

  float batteryV = getRawBatteryVoltage();
  if (batteryV < BATTERY_MIN_SAFE) {
    Serial.printf("[BATTERY] Spanning te laag (%.2fV < %.2fV). Diepe slaap om batterij te beschermen.\n", batteryV, BATTERY_MIN_SAFE);
    esp_deep_sleep_start();
  }

  Wire.begin(6, 7); 
  sht31.begin();
  TSL2561.init();

  esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
  if (wakeup_reason == ESP_SLEEP_WAKEUP_GPIO) {
    Serial.println("[WAKEUP] Sonde succesvol GEWEKT door de fysieke drukknop!");
  } else if (wakeup_reason == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println("[WAKEUP] Sonde gewekt door de interne klok (30s timer).");
  }

  preferences.begin("wifi-config", true);
  String ssid = preferences.getString("ssid", "");
  String pass = preferences.getString("pass", "");
  preferences.end();

  readBatteryVoltage();
  Serial.printf("[BATTERY] Raw=%.2fV, PluggedIn=%s\n", getRawBatteryVoltage(), isPluggedIn() ? "ja" : "nee");

  bool buttonPressed = true;
  for (int i = 0; i < 5; i++) {
    if (digitalRead(RESET_BUTTON_PIN) != LOW) { buttonPressed = false; break; }
    delay(5);
  }
  if (buttonPressed) {
    Serial.println("[KNOP] Knop direct ingedrukt bij opstarten!");
    triggerManualSync();
  }

  if (isPluggedIn()) {
    if (ssid == "") {
      startAPMode(); 
    } else {
      Serial.println("[LADER] Actieve laadmodus. WiFi inschakelen...");
      WiFi.mode(WIFI_STA);
      WiFi.begin(ssid.c_str(), pass.c_str());
      
      int attempts = 0;
      #if defined(DEV_MODE)
        while (WiFi.status() != WL_CONNECTED && attempts < 10) { delay(500); attempts++; }
      #else
        while (WiFi.status() != WL_CONNECTED && attempts < 30) { delay(500); attempts++; }
      #endif
      
      if (WiFi.status() == WL_CONNECTED) {
        configTime(0, 0, "pool.ntp.org", "time.google.com");
        sendLiveChargingStatus(); 
      } else {
        Serial.println("[LADER] WiFi mislukt tijdens laden. Terugvallen naar AP modus.");
        startAPMode(); 
      }
    }
    return; 
  }

  if (ssid == "") {
    startAPMode();
    return;
  }
  
  if (ssid != "" && !isPluggedIn() && isSondeActief) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());
    int attempts = 0;
    #if defined(DEV_MODE)
      while (WiFi.status() != WL_CONNECTED && attempts < 10) { delay(500); attempts++; }
    #else
      while (WiFi.status() != WL_CONNECTED && attempts < 20) { delay(500); attempts++; }
    #endif
    if (WiFi.status() == WL_CONNECTED) {
      configTime(0, 0, "pool.ntp.org", "time.google.com");
      WiFi.disconnect();
    }
  }
}

void loop() {
  readBatteryVoltage();

  bool buttonPressed = true;
  for (int i = 0; i < 5; i++) {
    if (digitalRead(RESET_BUTTON_PIN) != LOW) { buttonPressed = false; break; }
    delay(5);
  }
  if (buttonPressed) {
    unsigned long pressStartTime = millis();
    bool longPressTriggered = false;
    delay(200); 
    
    Serial.println("[KNOP] Knop ingedrukt houden gedetecteerd...");
    
    while (digitalRead(RESET_BUTTON_PIN) == LOW) {
      unsigned long duration = millis() - pressStartTime;
      if (duration > 5000 && !longPressTriggered) {
        longPressTriggered = true;
        Serial.println("[RESET] Geheugen wissen en herstarten...");
        preferences.begin("wifi-config", false);
        preferences.clear();
        preferences.end();
        isSondeActief = false;
        measurementCount = 0;
        ESP.restart();
      }
      delay(50);
    }
    
    unsigned long totalDuration = millis() - pressStartTime;
    if (totalDuration < 2000 && !longPressTriggered) {
      Serial.println("[KNOP] Korte klik gedetecteerd! Sync endpoint starten.");
      triggerManualSync(); 
    }
  }

  if (WiFi.getMode() == WIFI_AP_STA || WiFi.getMode() == WIFI_AP) {
    dnsServer.processNextRequest();
    server.handleClient();

    if (apStartTime == 0) apStartTime = millis();
    if (millis() - apStartTime > 300000 && WiFi.softAPgetStationNum() == 0) {
      esp_sleep_enable_timer_wakeup(INACTIVE_SLEEP_SECONDS * 1000000ULL);
      esp_deep_sleep_start();
    }
    if (WiFi.softAPgetStationNum() > 0) apStartTime = millis();
    return;
  } 

  if (isPluggedIn() && WiFi.status() == WL_CONNECTED) {
    if (millis() - lastChargeUpload > CHARGE_UPLOAD_INTERVAL) {
      lastChargeUpload = millis();
      sendLiveChargingStatus(); 
    }
    delay(100);
    return; 
  }

  if (isSondeActief && !isPluggedIn()) {
    Serial.printf("[BATCH] Opslaan van meting %d/4 in RTC geheugen...\n", measurementCount + 1);
    
    time_t now;
    time(&now); 

    batch[measurementCount].timestamp = now; 
    batch[measurementCount].temp = sht31.getTemperature();
    batch[measurementCount].lux = TSL2561.readVisibleLux();
    batch[measurementCount].soilRaw = readSoilMoisture();
    Serial.printf("[SOIL] Raw ADC: %d\n", batch[measurementCount].soilRaw);
    batch[measurementCount].battery = readBatteryVoltage();
    batch[measurementCount].rssi = -50; 

    measurementCount++;

    if (measurementCount >= MAX_MEASUREMENTS) {
      sendTelemetryBatch(); 
    }
    
    esp_sleep_enable_timer_wakeup(SLEEP_TIME_SECONDS * 1000000ULL);
    esp_deep_sleep_start();
  } else {
    esp_sleep_enable_timer_wakeup(INACTIVE_SLEEP_SECONDS * 1000000ULL); 
    esp_deep_sleep_start();
  }
}

void sendTelemetryBatch() {
  preferences.begin("wifi-config", true);
  String ssid = preferences.getString("ssid", "");
  String pass = preferences.getString("pass", "");
  preferences.end();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  int attempts = 0;
  #if defined(DEV_MODE)
    while (WiFi.status() != WL_CONNECTED && attempts < 10) { delay(500); attempts++; }
  #else
    while (WiFi.status() != WL_CONNECTED && attempts < 30) { delay(500); attempts++; }
  #endif

  if (WiFi.status() != WL_CONNECTED) return; 

  DynamicJsonDocument doc(3000); 
  doc["hardware_id"] = WiFi.macAddress();
  doc["is_charging"] = false; 
  JsonArray entries = doc.createNestedArray("entries");

  for(int i = 0; i < MAX_MEASUREMENTS; i++) {
    JsonObject obj = entries.createNestedObject();
    obj["time_t"] = (long)batch[i].timestamp;
    obj["temp_c"] = batch[i].temp;
    obj["light_lux"] = batch[i].lux;
    obj["soil_raw"] = batch[i].soilRaw;
    obj["battery_voltage"] = batch[i].battery;
    obj["wifi_rssi"] = WiFi.RSSI();
  }

  String json; serializeJson(doc, json);

  HTTPClient http;
  http.begin(telemetryUrl);
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json);
  http.end();

  if (code == 200 || code == 201) {
    measurementCount = 0; 
  }
  WiFi.disconnect();
}

void sendLiveChargingStatus() {
  Serial.println("[LADER] Live accu-update verzenden...");
  float voltage = readBatteryVoltage();
  
  DynamicJsonDocument doc(500);
  doc["hardware_id"] = WiFi.macAddress();
  doc["is_charging"] = true; 
  doc["battery_voltage"] = voltage;
  doc["wifi_rssi"] = WiFi.RSSI();

  String json; serializeJson(doc, json);

  HTTPClient http;
  http.begin(telemetryUrl);
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json); 
  http.end();
  
  Serial.printf("[LADER] Response statuscode van backend: %d\n", code);
}

void triggerManualSync() {
  preferences.begin("wifi-config", true);
  String ssid = preferences.getString("ssid", "");
  String pass = preferences.getString("pass", "");
  preferences.end();

  if (ssid == "") return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  int attempts = 0;
  #if defined(DEV_MODE)
    while (WiFi.status() != WL_CONNECTED && attempts < 10) { delay(500); attempts++; }
  #else
    while (WiFi.status() != WL_CONNECTED && attempts < 30) { delay(500); attempts++; }
  #endif

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(syncUrl); 
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> reqDoc;
    reqDoc["hardware_id"] = WiFi.macAddress();
    reqDoc["battery_voltage"] = readBatteryVoltage();
    reqDoc["wifi_rssi"] = WiFi.RSSI();
    
    String body; serializeJson(reqDoc, body);
    int httpCode = http.POST(body);

    if (httpCode == 200 || httpCode == 201) {
      String response = http.getString();
      StaticJsonDocument<200> resDoc;
      deserializeJson(resDoc, response);
      
      if (resDoc.containsKey("data") && resDoc["data"]["paired"] == true) {
        isSondeActief = true;
        Serial.println("[SYNC] Paired = true via data wrapper!");
      } else {
        isSondeActief = false;
        measurementCount = 0; 
        Serial.println("[SYNC] Paired = false (Winterslaap).");
      }
    }
    http.end();
  }
  WiFi.disconnect();
}