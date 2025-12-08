docker-compose logs --tail 100 backend worker
WARN[0000] /home/ubuntu/singalcraftapp/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
worker-1  | /usr/local/lib/python3.10/site-packages/pydantic/_internal/_fields.py:149: UserWarning: Field "model_preference" has conflict with protected namespace "model_".
worker-1  |
backend-1  | INFO:     Will watch for changes in these directories: ['/app']
backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
backend-1  | INFO:     Started reloader process [1] using WatchFiles
backend-1  | /usr/local/lib/python3.10/site-packages/pydantic/_internal/_fields.py:149: UserWarning: Field "model_preference" has conflict with protected namespace "model_".
backend-1  |
backend-1  | You may be able to resolve this warning by setting `model_config['protected_namespaces'] = ()`.
backend-1  |   warnings.warn(
backend-1  | /usr/local/lib/python3.10/site-packages/pydantic/_internal/_fields.py:149: UserWarning: Field "model_preference" has conflict with protected namespace "model_".
worker-1   | You may be able to resolve this warning by setting `model_config['protected_namespaces'] = ()`.
worker-1   |   warnings.warn(
worker-1   | /usr/local/lib/python3.10/site-packages/celery/platforms.py:829: SecurityWarning: You're running the worker with superuser privileges: this is
worker-1   | absolutely not recommended!
worker-1   |
worker-1   | Please specify a different user using the --uid option.
worker-1   |
worker-1   | User information: uid=0 euid=0 gid=0 egid=0
worker-1   |
worker-1   |   warnings.warn(SecurityWarning(ROOT_DISCOURAGED.format(
worker-1   | INFO:app.features.audio_analysis.anomaly_scorer:Isolation Forest model and scaler loaded successfully.
worker-1   | PipelineExecutor initialized on worker startup.
worker-1   |
worker-1   |  -------------- celery@c7e6d662beb7 v5.3.4 (emerald-rush)
worker-1   | --- ***** -----
worker-1   | -- ******* ---- Linux-6.14.0-1017-aws-x86_64-with-glibc2.41 2025-12-07 15:26:23
worker-1   | - *** --- * ---
worker-1   | - ** ---------- [config]
worker-1   | - ** ---------- .> app:         signalcraft_worker:0x7e46c0a1dcf0
worker-1   | - ** ---------- .> transport:   redis://redis:6379/0
worker-1   | - ** ---------- .> results:     redis://redis:6379/0
worker-1   | - *** --- * --- .> concurrency: 2 (prefork)
worker-1   | -- ******* ---- .> task events: OFF (enable -E to monitor tasks in this worker)
worker-1   | --- ***** -----
worker-1   |  -------------- [queues]
worker-1   |                 .> celery           exchange=celery(direct) key=celery
worker-1   |
worker-1   |
worker-1   | [tasks]
worker-1   |   . app.worker.analyze_audio_task
worker-1   |   . app.worker.test_task
worker-1   |
worker-1   | [2025-12-07 15:26:23,419: INFO/MainProcess] Connected to redis://redis:6379/0
worker-1   | [2025-12-07 15:26:23,424: INFO/MainProcess] mingle: searching for neighbors
worker-1   | [2025-12-07 15:26:24,435: INFO/MainProcess] mingle: all alone
worker-1   | [2025-12-07 15:26:24,447: INFO/MainProcess] celery@c7e6d662beb7 ready.
backend-1  |
backend-1  | You may be able to resolve this warning by setting `model_config['protected_namespaces'] = ()`.
backend-1  |   warnings.warn(
backend-1  | INFO:     Started server process [9]
backend-1  | INFO:     Waiting for application startup.
backend-1  | INFO:     Application startup complete.
backend-1  | 🚀 [Startup] Checking seed data...
backend-1  | ✅ [Startup] Seeding check complete.
backend-1  | INFO:     59.12.254.198:56090 - "POST /api/auth/login HTTP/1.1" 200 OK
backend-1  | INFO:     59.12.254.198:56090 - "GET /api/auth/me HTTP/1.1" 200 OK
backend-1  | INFO:     59.12.254.198:56102 - "GET /api/mobile/devices HTTP/1.1" 307 Temporary Redirect
backend-1  | INFO:     59.12.254.198:56102 - "GET /api/mobile/devices/ HTTP/1.1" 200 OK
backend-1  | INFO:app.features.audio_analysis.service:[ㅇㅇ] DB에서 최신 분석 결과 조회.
backend-1  | INFO:app.features.audio_analysis.service:[ㅇㅇ] 실제 분석 결과 찾음.
backend-1  | INFO:     59.12.254.198:56090 - "GET /api/mobile/report/%E3%85%87%E3%85%87 HTTP/1.1" 200 OK
backend-1  | INFO:app.features.audio_analysis.router:📁 Original file saved temporarily: /tmp/a019c022-a992-4517-b629-0a09cce92216.m4a
backend-1  | INFO:app.features.audio_analysis.converter:Converting M4A to WAV: /tmp/a019c022-a992-4517-b629-0a09cce92216.m4a → /tmp/a019c022-a992-4517-b629-0a09cce92216_converted.wav
backend-1  | INFO:app.features.audio_analysis.converter:✅ 변환 성공: /tmp/a019c022-a992-4517-b629-0a09cce92216_converted.wav
backend-1  | INFO:app.features.audio_analysis.router:🎵 WAV conversion completed: /tmp/a019c022-a992-4517-b629-0a09cce92216_converted.wav
backend-1  | INFO:app.features.audio_analysis.router:📊 Audio info: {'duration': 3.970612, 'sample_rate': 22050, 'channels': 1, 'codec': 'pcm_s16le', 'size_mb': 0.1670665740966797}
backend-1  | INFO:app.storage:✅ Uploaded /tmp/a019c022-a992-4517-b629-0a09cce92216_converted.wav to R2 as audio_files/a019c022-a992-4517-b629-0a09cce92216_converted.wav
backend-1  | ERROR:app.features.audio_analysis.router:❌ Task submission failed: analyze_audio_task() takes 1 positional argument but 2 were given
backend-1  | INFO:     59.12.254.198:49558 - "POST /api/mobile/upload HTTP/1.1" 500 Internal Server Error
backend-1  | ERROR:app.features.audio_analysis.router:❌ Upload Error:
backend-1  | INFO:app.features.audio_analysis.router:🧹 Cleaned up local temporary files