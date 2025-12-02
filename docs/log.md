LOG  [AnalysisService] Detailed Report received: {
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
      "RMS Level": {
        "status": "NORMAL",
        "score": 0.0008238363079726696
      },
      "Resonance": {
        "status": "NORMAL",
        "score": 0.97003573179245
      },
      "High Freq": {
        "status": "NORMAL",
        "score": 0.03052138350903988
      },
      "Freq Center": {
        "status": "NORMAL",
        "score": 0.4227699425738767
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
        "date": "2025-11-03",
        "value": 0.1
      },
      {
        "date": "2025-11-04",
        "value": 0.1
      },
      {
        "date": "2025-11-05",
        "value": 0.1
      },
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
      }
    ]
  },
  "original_analysis_result": {
    "label": "NORMAL",
    "score": 0.1,
    "summary": "Audio levels are within normal operating range.",
    "details": {
      "noise_level": 0.0004119181539863348,
      "frequency": 2113.8497128693834,
      "resonance_energy_ratio": 0.32334524393081665,
      "high_freq_energy_ratio": 0.01526069175451994,
      "duration": 2.995374149659864
    }
  },
  "analysis_details": {
    "noise_level": 0.0004119181539863348,
    "frequency": 2113.8497128693834,
    "resonance_energy_ratio": 0.32334524393081665,
    "high_freq_energy_ratio": 0.01526069175451994,
    "duration": 2.995374149659864
  }
}


ubuntu@ip-172-31-33-230:~/singalcraftapp$  docker logs --tail 200 singalcraftapp-worker-1
/usr/local/lib/python3.10/site-packages/celery/platforms.py:829: SecurityWarning: You're running the worker with superuser privileges: this is
absolutely not recommended!

Please specify a different user using the --uid option.

User information: uid=0 euid=0 gid=0 egid=0

  warnings.warn(SecurityWarning(ROOT_DISCOURAGED.format(

 -------------- celery@da332a7c2383 v5.3.4 (emerald-rush)
--- ***** -----
-- ******* ---- Linux-6.14.0-1017-aws-x86_64-with-glibc2.41 2025-12-02 12:24:30
- *** --- * ---
- ** ---------- [config]
- ** ---------- .> app:         signalcraft_worker:0x7763c7dddcf0
- ** ---------- .> transport:   redis://redis:6379/0
- ** ---------- .> results:     redis://redis:6379/0
- *** --- * --- .> concurrency: 2 (prefork)
-- ******* ---- .> task events: OFF (enable -E to monitor tasks in this worker)
--- ***** -----
 -------------- [queues]
                .> celery           exchange=celery(direct) key=celery


[tasks]
  . app.worker.analyze_audio_task
  . app.worker.test_task

[2025-12-02 12:24:30,474: INFO/MainProcess] Connected to redis://redis:6379/0
[2025-12-02 12:24:30,481: INFO/MainProcess] mingle: searching for neighbors
[2025-12-02 12:24:31,492: INFO/MainProcess] mingle: all alone
[2025-12-02 12:24:31,504: INFO/MainProcess] celery@da332a7c2383 ready.
[2025-12-02 12:25:41,674: INFO/MainProcess] Task app.worker.analyze_audio_task[5d461125-5e10-4cc2-be05-4b082ae94d97] received
[2025-12-02 12:25:41,730: WARNING/ForkPoolWorker-2] Starting real analysis for task eb18e265-a218-4449-b56b-f8c39de6eb3f, file: uploads/c929a6f8-e474-4261-a445-17f095bd71b6_converted.wav...
[2025-12-02 12:25:41,730: WARNING/ForkPoolWorker-2] Analyzing audio file: uploads/c929a6f8-e474-4261-a445-17f095bd71b6_converted.wav
[2025-12-02 12:26:03,606: WARNING/ForkPoolWorker-2]       Metrics for c929a6f8-e474-4261-a445-17f095bd71b6_converted.wav: avg_rms=0.0005, resonance_ratio=0.4686, high_freq_ratio=0.0217
[2025-12-02 12:26:03,612: WARNING/ForkPoolWorker-2] Deleted temporary file: uploads/c929a6f8-e474-4261-a445-17f095bd71b6_converted.wav
[2025-12-02 12:26:03,615: INFO/ForkPoolWorker-2] Task app.worker.analyze_audio_task[5d461125-5e10-4cc2-be05-4b082ae94d97] succeeded in 21.939709293001215s: 'Analysis Completed: CRITICAL'
[2025-12-02 12:29:35,910: INFO/MainProcess] Task app.worker.analyze_audio_task[a6699557-22ab-4ef7-837f-04a6f7f88c60] received
[2025-12-02 12:29:35,916: WARNING/ForkPoolWorker-2] Starting real analysis for task 96368eae-9fb9-42b2-b5ed-ccadc3bec280, file: uploads/7dc18ae9-4054-49a7-8e4d-97a88dd2139b_converted.wav...
[2025-12-02 12:29:35,916: WARNING/ForkPoolWorker-2] Analyzing audio file: uploads/7dc18ae9-4054-49a7-8e4d-97a88dd2139b_converted.wav
[2025-12-02 12:29:35,928: WARNING/ForkPoolWorker-2]       Metrics for 7dc18ae9-4054-49a7-8e4d-97a88dd2139b_converted.wav: avg_rms=0.0004, resonance_ratio=0.3233, high_freq_ratio=0.0153
[2025-12-02 12:29:35,933: WARNING/ForkPoolWorker-2] Deleted temporary file: uploads/7dc18ae9-4054-49a7-8e4d-97a88dd2139b_converted.wav
[2025-12-02 12:29:35,934: INFO/ForkPoolWorker-2] Task app.worker.analyze_audio_task[a6699557-22ab-4ef7-837f-04a6f7f88c60] succeeded in 0.023256989996298216s: 'Analysis Completed: NORMAL'
ubuntu@ip-172-31-33-230:~/singalcraftapp$