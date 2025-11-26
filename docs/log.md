PS C:\Users\gmdqn\singalcraftapp> docker-compose up --build
time="2025-11-25T23:06:14+09:00" level=warning msg="C:\\Users\\gmdqn\\singalcraftapp\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
Compose can now delegate builds to bake for better performance.
 To do so, set COMPOSE_BAKE=true.
[+] Building 11.0s (20/20) FINISHED                                                                    docker:desktop-linux
 => [backend internal] load build definition from Dockerfile                                                           0.0s
 => => transferring dockerfile: 570B                                                                                   0.0s 
 => [worker internal] load metadata for docker.io/library/python:3.10-slim                                             1.0s 
 => [backend internal] load .dockerignore                                                                              0.0s
 => => transferring context: 2B                                                                                        0.0s 
 => [worker 1/6] FROM docker.io/library/python:3.10-slim@sha256:c299e10e0070171113f9a1f109dd05e7e634fa94589b056e0e87b  0.1s 
 => => resolve docker.io/library/python:3.10-slim@sha256:c299e10e0070171113f9a1f109dd05e7e634fa94589b056e0e87bb22b2b3  0.0s 
 => [backend internal] load build context                                                                              4.0s 
 => => transferring context: 6.47MB                                                                                    3.9s 
 => CACHED [worker 2/6] WORKDIR /app                                                                                   0.0s
 => CACHED [worker 3/6] RUN apt-get update && apt-get install -y     gcc     && rm -rf /var/lib/apt/lists/*            0.0s 
 => CACHED [backend 4/6] COPY requirements.txt .                                                                       0.0s
 => CACHED [backend 5/6] RUN pip install --no-cache-dir -r requirements.txt                                            0.0s 
 => CACHED [backend 6/6] COPY . .                                                                                      0.0s 
 => [backend] exporting to image                                                                                       0.1s 
 => => exporting layers                                                                                                0.0s 
 => => exporting manifest sha256:255fa1e791a05fe549d287b01106aacc03a2934d0f809803d6f1a7004ec84142                      0.0s 
 => => exporting config sha256:4ad5417cbe1aa53b6148a545d01b876df1828d53ea28b78698214e05a6ed4b3f                        0.0s 
 => => exporting attestation manifest sha256:12f69e205c4ece145242cb01042812ef24b7eae4d2435a94366ea5e5ca7e88c3          0.0s 
 => => exporting manifest list sha256:86a945ea64dbc48eff4daefd99592d116b22b3a5efae2b48a109a423426153d3                 0.0s 
 => => naming to docker.io/library/singalcraftapp-backend:latest                                                       0.0s 
 => => unpacking to docker.io/library/singalcraftapp-backend:latest                                                    0.0s 
 => [backend] resolving provenance for metadata file                                                                   0.0s 
 => [worker internal] load build definition from Dockerfile                                                            0.0s 
 => => transferring dockerfile: 570B                                                                                   0.0s 
 => [worker internal] load .dockerignore                                                                               0.0s 
 => => transferring context: 2B                                                                                        0.0s 
 => [worker internal] load build context                                                                               4.4s 
 => => transferring context: 6.47MB                                                                                    4.3s 
 => CACHED [worker 4/6] COPY requirements.txt .                                                                        0.0s 
 => CACHED [worker 5/6] RUN pip install --no-cache-dir -r requirements.txt                                             0.0s
 => CACHED [worker 6/6] COPY . .                                                                                       0.0s 
 => [worker] exporting to image                                                                                        0.1s 
 => => exporting layers                                                                                                0.0s 
 => => exporting manifest sha256:ffa40add61e8c60d82ee3a4a4e3d10c27a215e24fb4913da4fec108afa6776b1                      0.0s 
 => => exporting config sha256:e23175ac24d77968f43f1baecc0a44a97a8db1021b0ff9ac30675ea6a24c9c97                        0.0s 
 => => exporting attestation manifest sha256:2944c830a40aac0f8d1b2814b31156cc481bf0490af7a7a807ee31a386d93b93          0.0s 
 => => exporting manifest list sha256:6408c6f8a1d05ea0b4e0409bc469e4ebd7c927f3b8b01c8c2ed820dd296b72a7                 0.0s 
 => => naming to docker.io/library/singalcraftapp-worker:latest                                                        0.0s 
 => => unpacking to docker.io/library/singalcraftapp-worker:latest                                                     0.0s 
 => [worker] resolving provenance for metadata file                                                                    0.0s 
[+] Running 6/6
 ✔ backend                             Built                                                                           0.0s 
 ✔ worker                              Built                                                                           0.0s 
 ✔ Network singalcraftapp_default      Created                                                                         0.1s 
 ✔ Container singalcraftapp-redis-1    Created                                                                         0.1s 
 ✔ Container singalcraftapp-backend-1  Created                                                                         0.1s 
 ✔ Container singalcraftapp-worker-1   Created                                                                         0.2s 
Attaching to backend-1, redis-1, worker-1
redis-1    | Starting Redis Server
redis-1    | 1:C 25 Nov 2025 14:06:27.227 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis-1    | 1:C 25 Nov 2025 14:06:27.227 * Redis version=8.4.0, bits=64, commit=00000000, modified=1, pid=1, just started
redis-1    | 1:C 25 Nov 2025 14:06:27.227 * Configuration loaded                                                            
redis-1    | 1:M 25 Nov 2025 14:06:27.228 * monotonic clock: POSIX clock_gettime                                            
redis-1    | 1:M 25 Nov 2025 14:06:27.229 * Running mode=standalone, port=6379.
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf> RedisBloom version 8.4.0 (Git=unknown)                                     
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf> Registering configuration options: [                                       
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { bf-error-rate       :      0.01 }
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { bf-initial-size     :       100 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { bf-expansion-factor :         2 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { cf-bucket-size      :         2 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { cf-initial-size     :      1024 }
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { cf-max-iterations   :        20 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { cf-expansion-factor :         1 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf>        { cf-max-expansions   :        32 }                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.230 * <bf> ]                                                                          
redis-1    | 1:M 25 Nov 2025 14:06:27.231 * Module 'bf' loaded from /usr/local/lib/redis/modules//redisbloom.so
redis-1    | 1:M 25 Nov 2025 14:06:27.236 * <search> Redis version found by RedisSearch : 8.4.0 - oss                       
redis-1    | 1:M 25 Nov 2025 14:06:27.236 * <search> RediSearch version 8.4.2 (Git=9e2b676)                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.236 * <search> Low level api version 1 initialized successfully                       
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> gc: ON, prefix min length: 2, min word length to stem: 4, prefix max expansions: 200, query timeout (ms): 500, timeout policy: return, oom policy: return, cursor read size: 1000, cursor max idle (ms): 300000, max doctable size: 1000000, max number of search results:  1000000, default scorer: BM25STD,
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> Initialized thread pools!
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> Disabled workers threadpool of size 0                                  
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> Subscribe to config changes                                            
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> Subscribe to cluster slot migration events                             
redis-1    | 1:M 25 Nov 2025 14:06:27.237 * <search> Enabled role change notification                                       
redis-1    | 1:M 25 Nov 2025 14:06:27.238 * <search> Cluster configuration: AUTO partitions, type: 0, coordinator timeout: 0ms                                                                                                                          
redis-1    | 1:M 25 Nov 2025 14:06:27.239 * <search> Register write commands
redis-1    | 1:M 25 Nov 2025 14:06:27.239 * Module 'search' loaded from /usr/local/lib/redis/modules//redisearch.so
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries> RedisTimeSeries version 80400, git_sha=3520a1568ad69076d60885c70711fbdc9b448749                                                                                                                
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries> Redis version found by RedisTimeSeries : 8.4.0 - oss
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries> Registering configuration options: [                               
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-compaction-policy   :              }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-num-threads         :            3 }
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-retention-policy    :            0 }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-duplicate-policy    :        block }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-chunk-size-bytes    :         4096 }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.241 * <timeseries>        { ts-encoding            :   compressed }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.242 * <timeseries>        { ts-ignore-max-time-diff:            0 }
redis-1    | 1:M 25 Nov 2025 14:06:27.242 * <timeseries>        { ts-ignore-max-val-diff :     0.000000 }                   
redis-1    | 1:M 25 Nov 2025 14:06:27.242 * <timeseries> ]                                                                  
redis-1    | 1:M 25 Nov 2025 14:06:27.243 * <timeseries> Detected redis oss                                                 
redis-1    | 1:M 25 Nov 2025 14:06:27.244 * <timeseries> Subscribe to ASM events                                            
redis-1    | 1:M 25 Nov 2025 14:06:27.244 * <timeseries> Enabled diskless replication
redis-1    | 1:M 25 Nov 2025 14:06:27.244 * Module 'timeseries' loaded from /usr/local/lib/redis/modules//redistimeseries.so
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Created new data type 'ReJSON-RL'                                      
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> version: 80400 git sha: unknown branch: unknown                        
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V1 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V2 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V3 API
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V4 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V5 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Exported RedisJSON_V6 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Enabled diskless replication                                           
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <ReJSON> Initialized shared string cache, thread safe: true.                    
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * Module 'ReJSON' loaded from /usr/local/lib/redis/modules//rejson.so
redis-1    | 1:M 25 Nov 2025 14:06:27.246 * <search> Acquired RedisJSON_V6 API                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.294 * Server initialized                                                              
redis-1    | 1:M 25 Nov 2025 14:06:27.294 * Ready to accept connections tcp                                                 
backend-1  | INFO:     Will watch for changes in these directories: ['/app']                                                
backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
backend-1  | INFO:     Started reloader process [1] using WatchFiles                                                        
worker-1   | Usage: celery [OPTIONS] COMMAND [ARGS]...                                                                      
worker-1   | Try 'celery --help' for help.
worker-1   |                                                                                                                
worker-1   | Error: Invalid value for '-A' / '--app':                                                                       
worker-1   | Unable to load celery application.
worker-1   | While trying to load the module app.worker the following error occurred:
worker-1   | Traceback (most recent call last):                                                                             
worker-1   |   File "/usr/local/lib/python3.10/site-packages/celery/app/utils.py", line 383, in find_app                    
worker-1   |     sym = symbol_by_name(app, imp=imp)
worker-1   |   File "/usr/local/lib/python3.10/site-packages/kombu/utils/imports.py", line 64, in symbol_by_name            
worker-1   |     return getattr(module, cls_name) if cls_name else module
worker-1   | AttributeError: module 'app' has no attribute 'worker'                                                         
worker-1   | 
worker-1   | During handling of the above exception, another exception occurred:                                            
worker-1   |                                                                                                                
worker-1   | Traceback (most recent call last):
worker-1   |   File "/usr/local/lib/python3.10/site-packages/celery/bin/celery.py", line 58, in convert                     
worker-1   |     return find_app(value)                                                                                     
worker-1   |   File "/usr/local/lib/python3.10/site-packages/celery/app/utils.py", line 386, in find_app
worker-1   |     sym = imp(app)                                                                                             
worker-1   |   File "/usr/local/lib/python3.10/site-packages/celery/utils/imports.py", line 104, in import_from_cwd
worker-1   |     return imp(module, package=package)                                                                        
worker-1   |   File "/usr/local/lib/python3.10/importlib/__init__.py", line 126, in import_module                           
worker-1   |     return _bootstrap._gcd_import(name[level:], package, level)                                                
worker-1   |   File "<frozen importlib._bootstrap>", line 1050, in _gcd_import                                              
worker-1   |   File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
worker-1   |   File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked                                  
worker-1   |   File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
worker-1   |   File "<frozen importlib._bootstrap_external>", line 883, in exec_module                                      
worker-1   |   File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
worker-1   |   File "/app/app/worker.py", line 7, in <module>                                                               
worker-1   |     from app.database import SessionLocal
worker-1   |   File "/app/app/database.py", line 16, in <module>                                                            
worker-1   |     engine = create_async_engine(DATABASE_URL)                                                                 
worker-1   |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/ext/asyncio/engine.py", line 118, in create_async_engine                                                                                                                        
worker-1   |     return AsyncEngine(sync_engine)
worker-1   |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/ext/asyncio/engine.py", line 1029, in __init__
worker-1   |     raise exc.InvalidRequestError(                                                                             
worker-1   | sqlalchemy.exc.InvalidRequestError: The asyncio extension requires an async driver to be used. The loaded 'psycopg2' is not async.                                                                                                         
worker-1   | 
worker-1 exited with code 2
backend-1  | INFO:     Started server process [9]
backend-1  | INFO:     Waiting for application startup.
backend-1  | ERROR:    Traceback (most recent call last):                                                                   
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 557, in _prepare_and_execute                                                                                                              
backend-1  |     self._rows = await prepared_stmt.fetch(*parameters)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/asyncpg/prepared_stmt.py", line 176, in fetch                  
backend-1  |     data = await self.__bind_execute(args, 0, timeout)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/asyncpg/prepared_stmt.py", line 241, in __bind_execute         
backend-1  |     data, status, _ = await self.__do_execute(                                                                 
backend-1  |   File "/usr/local/lib/python3.10/site-packages/asyncpg/prepared_stmt.py", line 230, in __do_execute           
backend-1  |     return await executor(protocol)
backend-1  |   File "asyncpg/protocol/protocol.pyx", line 201, in bind_execute                                              
backend-1  | asyncpg.exceptions.InsufficientPrivilegeError: permission denied for schema public                             
backend-1  | 
backend-1  | The above exception was the direct cause of the following exception:                                           
backend-1  |                                                                                                                
backend-1  | Traceback (most recent call last):                                                                             
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1969, in _exec_single_context 
backend-1  |     self.dialect.do_execute(
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/default.py", line 922, in do_execute         
backend-1  |     cursor.execute(statement, parameters)                                                                      
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 591, in execute                                                                                                                           
backend-1  |     self._adapt_connection.await_(
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 125, in await_only
backend-1  |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]                                     
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 185, in greenlet_spawn                                                                                                                         
backend-1  |     value = await result
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 569, in _prepare_and_execute                                                                                                              
backend-1  |     self._handle_exception(error)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 520, in _handle_exception                                                                                                                 
backend-1  |     self._adapt_connection._handle_exception(error)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 808, in _handle_exception                                                                                                                 
backend-1  |     raise translated_error from error
backend-1  | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.InsufficientPrivilegeError'>: permission denied for schema public
backend-1  | 
backend-1  | The above exception was the direct cause of the following exception:                                           
backend-1  | 
backend-1  | Traceback (most recent call last):
backend-1  |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 677, in lifespan
backend-1  |     async with self.lifespan_context(app) as maybe_state:                                                      
backend-1  |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 566, in __aenter__                 
backend-1  |     await self._router.startup()                                                                               
backend-1  |   File "/usr/local/lib/python3.10/site-packages/starlette/routing.py", line 654, in startup
backend-1  |     await handler()                                                                                            
backend-1  |   File "/app/main.py", line 51, in startup_event                                                               
backend-1  |     await conn.run_sync(Base.metadata.create_all)                                                              
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/ext/asyncio/engine.py", line 886, in run_sync       
backend-1  |     return await greenlet_spawn(fn, self._proxied, *arg, **kw)                                                 
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 190, in greenlet_spawn                                                                                                                         
backend-1  |     result = context.throw(*sys.exc_info())
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/schema.py", line 5828, in create_all            
backend-1  |     bind._run_ddl_visitor(                                                                                     
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 2447, in _run_ddl_visitor     
backend-1  |     visitorcallable(self.dialect, self, **kwargs).traverse_single(element)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/visitors.py", line 671, in traverse_single      
backend-1  |     return meth(obj, **kw)                                                                                     
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/ddl.py", line 919, in visit_metadata            
backend-1  |     self.traverse_single(                                                                                      
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/visitors.py", line 671, in traverse_single      
backend-1  |     return meth(obj, **kw)                                                                                     
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/ddl.py", line 957, in visit_table
backend-1  |     )._invoke_with(self.connection)                                                                            
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/ddl.py", line 315, in _invoke_with              
backend-1  |     return bind.execute(self)                                                                                  
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1416, in execute              
backend-1  |     return meth(                                                                                               
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/sql/ddl.py", line 181, in _execute_on_connection
backend-1  |     return connection._execute_ddl(                                                                            
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1528, in _execute_ddl         
backend-1  |     ret = self._execute_context(                                                                               
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1848, in _execute_context     
backend-1  |     return self._exec_single_context(                                                                          
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1988, in _exec_single_context
backend-1  |     self._handle_dbapi_exception(                                                                              
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 2343, in _handle_dbapi_exception                                                                                                                          
backend-1  |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/base.py", line 1969, in _exec_single_context 
backend-1  |     self.dialect.do_execute(                                                                                   
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/engine/default.py", line 922, in do_execute         
backend-1  |     cursor.execute(statement, parameters)                                                                      
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 591, in execute                                                                                                                           
backend-1  |     self._adapt_connection.await_(
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 125, in await_only 
backend-1  |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]                                     
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 185, in greenlet_spawn                                                                                                                         
backend-1  |     value = await result
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 569, in _prepare_and_execute                                                                                                              
backend-1  |     self._handle_exception(error)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 520, in _handle_exception                                                                                                                 
backend-1  |     self._adapt_connection._handle_exception(error)
backend-1  |   File "/usr/local/lib/python3.10/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 808, in _handle_exception                                                                                                                 
backend-1  |     raise translated_error from error
backend-1  | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.InsufficientPrivilegeError'>: permission denied for schema public                                                    
backend-1  | [SQL: 
backend-1  | CREATE TABLE audio_files (                                                                                     
backend-1  |    id UUID NOT NULL,                                                                                           
backend-1  |    user_id INTEGER NOT NULL,                                                                                   
backend-1  |    file_path VARCHAR NOT NULL, 
backend-1  |    file_name VARCHAR NOT NULL,                                                                                 
backend-1  |    file_size INTEGER,                                                                                          
backend-1  |    duration_seconds INTEGER,                                                                                   
backend-1  |    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),                                                          
backend-1  |    PRIMARY KEY (id), 
backend-1  |    FOREIGN KEY(user_id) REFERENCES users (id)                                                                  
backend-1  | )                                                                                                              
backend-1  |                                                                                                                
backend-1  | ]                                                                                                              
backend-1  | (Background on this error at: https://sqlalche.me/e/20/f405)
backend-1  |                                                                                                                
backend-1  | ERROR:    Application startup failed. Exiting.                                                                 
                                                                                                                            

v View in Docker Desktop   o View Config   w Enable Watch