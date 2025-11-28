LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=4분 전, last_reading_at=2025-11-28T10:45:18.989Z
 LOG  [Logic] Recording Status Changed: idle
 LOG  [Logic] Trigger Pressed. RecStatus: idle, UIStatus: idle, URI: Null
 LOG  [Logic] Starting new recording...
 LOG  Recording started
 LOG  [Logic] Recording Status Changed: recording
 LOG  [Logic] Trigger Pressed. RecStatus: recording, UIStatus: recording, URI: Null
 LOG  [Logic] Stopping recording...
 LOG  Recording stopped and stored at file:///data/user/0/com.gmdqn2tp.signalcraftmobile/cache/Audio/recording-db93437c-cec8-4af5-89c1-360b4bce2d7f.m4a
 LOG  Recording file info: {"exists": true, "isDirectory": false, "modificationTime": 1764326972.75, "size": 48490, "uri": "file:///data/user/0/com.gmdqn2tp.signalcraftmobile/cache/Audio/recording-db93437c-cec8-4af5-89c1-360b4bce2d7f.m4a"}
 LOG  [Logic] Recording Status Changed: stopped
 LOG  [Logic] Recording stopped. Ready to upload.
 LOG  [Logic] Trigger Pressed. RecStatus: stopped, UIStatus: idle, URI: Exists
 LOG  [Logic] Uploading existing recording...
 LOG  [Logic] Upload started. URI: file:///data/user/0/com.gmdqn2tp.signalcraftmobile/cache/Audio/recording-db93437c-cec8-4af5-89c1-360b4bce2d7f.m4a
 LOG  [Logic] Upload success. Task ID: 2beddd62-4888-4839-a43e-80127ef3b9a7
 LOG  [Logic] Starting Polling Interval...
 LOG  [Logic] Polling... TaskID: 2beddd62-4888-4839-a43e-80127ef3b9a7
 LOG  [API Request] GET /api/mobile/result/2beddd62-4888-4839-a43e-80127ef3b9a7
 LOG  [API Response] 200 /api/mobile/result/2beddd62-4888-4839-a43e-80127ef3b9a7
 LOG  [API Response Data] {
  "success": true,
  "task_id": "2beddd62-4888-4839-a43e-80127ef3b9a7",
  "status": "COMPLETED",
  "result": {
    "label": "NORMAL",
    "score": 0.1,
    "summary": "Audio levels are within normal operating range.",
    "details": {
      "noise_level": 0.003341872710734606,
      "frequency": 1653.2800038023363,
      "duration": 2.9257142857142857
    }
  },
  "created_at": "2025-11-28T10:49:33.482993+00:00",
  "completed_at": null
}
 LOG  [Logic] Polling Result: COMPLETED
 LOG  [Logic] Analysis Finished. Setting UI to result.
 LOG  [API Request] GET /api/mobile/report/dev_unknown
 LOG  [API Response] 200 /api/mobile/report/dev_unknown
 LOG  [API Response Data] {
  "success": true,
  "data_package": {
    "entity_type": "Device",
    "status": {
      "current_state": "NORMAL",
      "health_score": 90,
      "label": "NORMAL",
      "summary": "Audio levels are within normal operating range."
    },
    "ensemble_analysis": {
      "consensus_score": 0.1,
      "voting_result": {
        "Autoencoder": {
          "status": "NORMAL",
          "score": 0.1
        },
        "SVM": {
          "status": "NORMAL",
          "score": 0.1
        },
    ...
 LOG  Recorder reset to idle
 LOG  [Logic] Recording Status Changed: idle
 LOG  [DashboardScreen] Screen focused. Triggering fetchDevices...
 LOG  [useDeviceStore] Fetching devices...
 LOG  [DeviceCard] JBF-2000 압축기 (Demo): isOnline=true, lastReading=1분 전, last_reading_at=2025-11-28T10:48:18.989Z
 LOG  [DeviceCard] Main Pump A (Demo): isOnline=true, lastReading=2분 전, last_reading_at=2025-11-28T10:47:18.989Z
 LOG  [DeviceCard] Sub Generator (Demo): isOnline=true, lastReading=3분 전, last_reading_at=2025-11-28T10:46:18.989Z
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=4분 전, last_reading_at=2025-11-28T10:45:18.989Z
 LOG  [API Request] GET /api/mobile/devices
 LOG  [API Response] 200 /api/mobile/devices
 LOG  [API Response Data] [
  {
    "id": 1,
    "device_id": "MOCK-001",
    "name": "JBF-2000 압축기 (Demo)",
    "model": "JBF-Series X",
    "status": "normal",
    "store_id": null,
    "last_reading_at": null
  },
  {
    "id": 2,
    "device_id": "MOCK-002",
    "name": "Main Pump A (Demo)",
    "model": "Super-Pump v2",
    "status": "warning",
    "store_id": null,
    "last_reading_at": null
  },
  {
    "id": 3,
    "device_id": "MOCK-003",
    "name": "Sub Generator (Demo)",
    "model": "Elec-Gen 500",
    "sta...
 LOG  [useDeviceStore] DeviceService response: {
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "JBF-2000 압축기 (Demo)",
      "model": "JBF-Series X",
      "status": "NORMAL",
      "location": "Unknown Location",
      "audioLevel": 0,
      "lastReading": "1분 전",
      "last_reading_at": "2025-11-28T10:48:42.468Z",
      "isOnline": true
    },
    {
      "id": "2",
      "name": "Main Pump A (Demo)",
      "model": "Super-Pump v2",
      "status": "WARNING",
      "location": "Unknown Location",
      "audioLevel": 0,
      "lastReading": "2분 전",
      "last_reading_at": "2025-11-28T10:47:42.468Z",
      "isOnline": true
    },
    {
      "id": "3",
      "name": "Sub Generator (Demo)",
      "model": "Elec-Gen 500",
      "status": "CRITICAL",
      "location": "Unknown Location",
      "audioLevel": 0,
      "lastReading": "3분 전",
      "last_reading_at": "2025-11-28T10:46:42.468Z",
      "isOnline": true
    },
    {
      "id": "4",
      "name": "압축기 A-1 (DB)",
      "model": "SC-900X",
      "status": "NORMAL",
      "location": "Unknown Location",
      "audioLevel": 0,
      "lastReading": "4분 전",
      "last_reading_at": "2025-11-28T10:45:42.468Z",
      "isOnline": true
    }
  ]
}
 LOG  [useDeviceStore] Successfully fetched 4 devices.
 LOG  [DeviceCard] JBF-2000 압축기 (Demo): isOnline=true, lastReading=1분 전, last_reading_at=2025-11-28T10:48:42.468Z
 LOG  [DeviceCard] Main Pump A (Demo): isOnline=true, lastReading=2분 전, last_reading_at=2025-11-28T10:47:42.468Z
 LOG  [DeviceCard] Sub Generator (Demo): isOnline=true, lastReading=3분 전, last_reading_at=2025-11-28T10:46:42.468Z
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=4분 전, last_reading_at=2025-11-28T10:45:42.468Z
