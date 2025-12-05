LOG  [AnalysisService] Detailed Report received: {
  "entity_type": "Device",
  "status": {
    "current_state": "CRITICAL",
    "health_score": 33.734691274097926,
    "label": "CRITICAL",
    "summary": "Anomaly detected by ML model and/or bearing fault frequencies."
  },
  "ensemble_analysis": {
    "consensus_score": 0.6626530872590207,
    "voting_result": {
      "RMS Level": {
        "status": "CRITICAL",
        "score": 0.015202815644443035
      },
      "Resonance": {
        "status": "CRITICAL",
        "score": 1
      },
      "High Freq": {
        "status": "CRITICAL",
        "score": 0.030840544030070305
      },
      "Freq Center": {
        "status": "CRITICAL",
        "score": 0.5597083928830712
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
        "date": "2025-11-06",
        "value": 0.1
      },
      {
        "date": "2025-11-07",
        "value": 0.1
      },
      {
        "date": "2025-11-08",
        "value": 0.1
      },
      {
        "date": "2025-11-09",
        "value": 0.1
      },
      {
        "date": "2025-11-10",
        "value": 0.1
      },
      {
        "date": "2025-11-11",
        "value": 0.1
      },
      {
        "date": "2025-11-12",
        "value": 0.1
      },
      {
        "date": "2025-11-13",
        "value": 0.1
      },
      {
        "date": "2025-11-14",
        "value": 0.1
      },
      {
        "date": "2025-11-15",
        "value": 0.1
      },
      {
        "date": "2025-11-16",
        "value": 0.1
      },
      {
        "date": "2025-11-17",
        "value": 0.1
      },
      {
        "date": "2025-11-18",
        "value": 0.1
      },
      {
        "date": "2025-11-19",
        "value": 0.1
      },
      {
        "date": "2025-11-20",
        "value": 0.1
      },
      {
        "date": "2025-11-21",
        "value": 0.1
      },
      {
        "date": "2025-11-22",
        "value": 0.1
      },
      {
        "date": "2025-11-23",
        "value": 0.1
      },
      {
        "date": "2025-11-24",
        "value": 0.1
      },
      {
        "date": "2025-11-25",
        "value": 0.1
      },
      {
        "date": "2025-11-26",
        "value": 0.1
      },
      {
        "date": "2025-11-27",
        "value": 0.1
      },
      {
        "date": "2025-11-28",
        "value": 0.1
      },
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
    "label": "CRITICAL",
    "score": 0.6626530872590207,
    "summary": "Anomaly detected by ML model and/or bearing fault frequencies.",
    "details": {
      "method": "Hybrid ML",
      "ml_anomaly_score": -0.16265308725902072,
      "peak_frequencies": [
        0,
        105.2435302734375,
        192.9913330078125
      ],
      "noise_level": 0.0076014078222215176,
      "frequency": 2798.541964415356,
      "resonance_energy_ratio": 0.44180363416671753,
      "high_freq_energy_ratio": 0.015420272015035152,
      "duration": 3.7151927437641725
    }
  },
  "analysis_details": {
    "method": "Hybrid ML",
    "ml_anomaly_score": -0.16265308725902072,
    "peak_frequencies": [
      0,
      105.2435302734375,
      192.9913330078125
    ],
    "noise_level": 0.0076014078222215176,
    "frequency": 2798.541964415356,
    "resonance_energy_ratio": 0.44180363416671753,
    "high_freq_energy_ratio": 0.015420272015035152,
    "duration": 3.7151927437641725
  }
}
 LOG  [useDeviceStore] Fetching devices...
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=false, lastReading=5일 전, last_reading_at=2025-11-29T11:42:47.124406Z
 LOG  [API Request] GET /api/mobile/devices
 LOG  [API Response] 200 /api/mobile/devices
 LOG  [useDeviceStore] Successfully fetched 5 devices.
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=방금 전, last_reading_at=2025-12-05T10:43:58.324107Z
 LOG  Recorder reset to idle
 LOG  [Logic] Recording Status Changed: idle
 LOG  [API Request] GET /api/mobile/report/DB-001
 LOG  [API Response] 200 /api/mobile/report/DB-001
 LOG  [AnalysisService] Detailed Report received: {
  "entity_type": "Device",
  "status": {
    "current_state": "CRITICAL",
    "health_score": 33.734691274097926,
    "label": "CRITICAL",
    "summary": "Anomaly detected by ML model and/or bearing fault frequencies."
  },
  "ensemble_analysis": {
    "consensus_score": 0.6626530872590207,
    "voting_result": {
      "RMS Level": {
        "status": "CRITICAL",
        "score": 0.015202815644443035
      },
      "Resonance": {
        "status": "CRITICAL",
        "score": 1
      },
      "High Freq": {
        "status": "CRITICAL",
        "score": 0.030840544030070305
      },
      "Freq Center": {
        "status": "CRITICAL",
        "score": 0.5597083928830712
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
        "date": "2025-11-06",
        "value": 0.1
      },
      {
        "date": "2025-11-07",
        "value": 0.1
      },
      {
        "date": "2025-11-08",
        "value": 0.1
      },
      {
        "date": "2025-11-09",
        "value": 0.1
      },
      {
        "date": "2025-11-10",
        "value": 0.1
      },
      {
        "date": "2025-11-11",
        "value": 0.1
      },
      {
        "date": "2025-11-12",
        "value": 0.1
      },
      {
        "date": "2025-11-13",
        "value": 0.1
      },
      {
        "date": "2025-11-14",
        "value": 0.1
      },
      {
        "date": "2025-11-15",
        "value": 0.1
      },
      {
        "date": "2025-11-16",
        "value": 0.1
      },
      {
        "date": "2025-11-17",
        "value": 0.1
      },
      {
        "date": "2025-11-18",
        "value": 0.1
      },
      {
        "date": "2025-11-19",
        "value": 0.1
      },
      {
        "date": "2025-11-20",
        "value": 0.1
      },
      {
        "date": "2025-11-21",
        "value": 0.1
      },
      {
        "date": "2025-11-22",
        "value": 0.1
      },
      {
        "date": "2025-11-23",
        "value": 0.1
      },
      {
        "date": "2025-11-24",
        "value": 0.1
      },
      {
        "date": "2025-11-25",
        "value": 0.1
      },
      {
        "date": "2025-11-26",
        "value": 0.1
      },
      {
        "date": "2025-11-27",
        "value": 0.1
      },
      {
        "date": "2025-11-28",
        "value": 0.1
      },
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
    "label": "CRITICAL",
    "score": 0.6626530872590207,
    "summary": "Anomaly detected by ML model and/or bearing fault frequencies.",
    "details": {
      "method": "Hybrid ML",
      "ml_anomaly_score": -0.16265308725902072,
      "peak_frequencies": [
        0,
        105.2435302734375,
        192.9913330078125
      ],
      "noise_level": 0.0076014078222215176,
      "frequency": 2798.541964415356,
      "resonance_energy_ratio": 0.44180363416671753,
      "high_freq_energy_ratio": 0.015420272015035152,
      "duration": 3.7151927437641725
    }
  },
  "analysis_details": {
    "method": "Hybrid ML",
    "ml_anomaly_score": -0.16265308725902072,
    "peak_frequencies": [
      0,
      105.2435302734375,
      192.9913330078125
    ],
    "noise_level": 0.0076014078222215176,
    "frequency": 2798.541964415356,
    "resonance_energy_ratio": 0.44180363416671753,
    "high_freq_energy_ratio": 0.015420272015035152,
    "duration": 3.7151927437641725
  }
}
 LOG  [DashboardScreen] Screen focused. Triggering fetchDevices...
 LOG  [useDeviceStore] Fetching devices...
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=방금 전, last_reading_at=2025-12-05T10:43:58.324107Z
 LOG  [API Request] GET /api/mobile/devices
 LOG  [API Response] 200 /api/mobile/devices
 LOG  [useDeviceStore] Successfully fetched 5 devices.
 LOG  [DeviceCard] 압축기 A-1 (DB): isOnline=true, lastReading=방금 전, last_reading_at=2025-12-05T10:43:58.324107Z
