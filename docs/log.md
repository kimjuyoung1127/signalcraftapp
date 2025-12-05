 LOG  [Logic] Polling Result: COMPLETED
 LOG  [Logic] Analysis Finished. Setting UI to result.
 LOG  [API Request] GET /api/mobile/report/아이스크림
 LOG  [API Response] 200 /api/mobile/report/아이스크림
 LOG  [AnalysisService] Detailed Report received: {
  "entity_type": "Device",
  "status": {
    "current_state": "NORMAL",
    "health_score": 90,
    "label": "NORMAL",
    "summary": "No analysis data available."
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
      "CNN": {
        "status": "NORMAL",
        "score": 0.1
      },
      "RandomForest": {
        "status": "NORMAL",
        "score": 0.1
      },
      "MIMII": {
        "status": "NORMAL",
        "score": 0.1
      }
    }
  },
  "frequency_analysis": {
    "bpfo_frequency": 0,
    "detected_peaks": [],
    "diagnosis": "Real-time analysis data not yet fully integrated."
  },
  "predictive_insight": {
    "rul_prediction_days": 365,
    "anomaly_score_history": [
      {
        "date": "2025-11-29",
        "value": 0.1
      },
      {
        "date": "2025-11-30",
        "value": 0.1
      },
      {
        "date": "2025-12-01",
        "value": 0.1
      },
      {
        "date": "2025-12-02",
        "value": 0.1
      },
      {
        "date": "2025-12-03",
        "value": 0.1
      },
      {
        "date": "2025-12-04",
        "value": 0.1
      },
      {
        "date": "2025-12-05",
        "value": 0.1
      }
    ]
  },
  "original_analysis_result": {
    "label": "NORMAL",
    "score": 0.1,
    "summary": "No analysis data available."
  }
}
 LOG  [useDeviceStore] Fetching devices...
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=16분 전, last_reading_at=2025-12-05T12:02:37.037099Z
 LOG  [API Request] GET /api/mobile/devices
 LOG  [API Response] 200 /api/mobile/devices
 LOG  [useDeviceStore] Successfully fetched 6 devices.
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=16분 전, last_reading_at=2025-12-05T12:02:37.037099Z
