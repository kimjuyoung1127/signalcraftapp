Table "public.users"
         Column          |           Type           | Collation | Nullable |               Default
-------------------------+--------------------------+-----------+----------+--------------------------------------
 id                      | integer                  |           | not null | nextval('users_id_seq'::regclass)
 username                | character varying(50)    |           | not null |
 email                   | character varying(255)   |           | not null |
 password_hash           | character varying(255)   |           | not null |
 full_name               | character varying(100)   |           |          |
 phone                   | character varying(20)    |           |          |
 role                    | character varying(20)    |           |          | 'user'::character varying
 additional_info         | jsonb                    |           |          |
 is_active               | boolean                  |           |          | true
 created_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 last_login              | timestamp with time zone |           |          |
 deleted_at              | timestamp with time zone |           |          |
 roles                   | character varying(50)[]  |           |          | ARRAY['user'::character varying(50)]
 subscription_tier       | character varying(20)    |           |          | 'free'::character varying
 subscription_expires_at | timestamp with time zone |           |          |
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "idx_users_email" btree (email)
    "idx_users_role" btree (role)
    "idx_users_username" btree (username)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_username_key" UNIQUE CONSTRAINT, btree (username)

                                               Table "public.devices"
         Column          |           Type           | Collation | Nullable |               Default
-------------------------+--------------------------+---------------------+--------------------------------------
 id                      | integer                  |           | not null | nextval('devices_id_seq'::regclass)
 device_id               | character varying        |           | not null |
 name                    | character varying        |           | not null |
 model                   | character varying        |           | not null |
 status                  | character varying        |           |          | 'normal'::character varying
 store_id                | integer                  |           |          |
 last_reading_at         | timestamp with time zone |           |          |
 location                | character varying(255)   |           |          | -- [NEW] Added 2025-12-05
 calibration_data        | jsonb                    |           |          | -- [NEW] Added 2025-12-07 (Phase K)
                         |                          |           |          | -- [UPDATE] Phase Q: 동적 Rule 설정 및 임계치 정보도 저장
Indexes:
    "devices_pkey" PRIMARY KEY, btree (id)
    "ix_devices_device_id" UNIQUE, btree (device_id)
    "ix_devices_id" btree (id)
Foreign-key constraints:
    "devices_store_id_fkey" FOREIGN KEY (store_id) REFERENCES stores(id)

                                               Table "public.user_store_access"
         Column          |           Type           | Collation | Nullable |               Default
-------------------------+--------------------------+---------------------+--------------------------------------
 id                      | integer                  |           | not null | nextval('user_store_access_id_seq'::regclass)
 user_id                 | integer                  |           | not null |
 store_id                | integer                  |           | not null |
 granted_by              | integer                  |           |          |
 granted_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 access_level            | character varying(50)    |           |          | 'read'::character varying
Indexes:
    "user_store_access_pkey" PRIMARY KEY, btree (id)
    "idx_user_store_user" btree (user_id)
    "idx_user_store_store" btree (store_id)
    "idx_user_store_access" btree (user_id, store_id)
Foreign-key constraints:
    "user_store_access_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES users(id)
    "user_store_access_store_id_fkey" FOREIGN KEY (store_id) REFERENCES stores(id)
    "user_store_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

                                               Table "public.audio_files"
         Column          |           Type           | Collation | Nullable |               Default
-------------------------+--------------------------+-----------+----------+--------------------------------------
 id                      | integer                  |           | not null | nextval('audio_files_id_seq'::regclass)
 user_id                 | integer                  |           |          |
 file_path               | character varying        |           | not null |
 filename                | character varying        |           | not null |
 file_size               | integer                  |           |          |
 mime_type               | character varying        |           |          |
 created_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 device_id               | character varying        |           |          |
Indexes:
    "audio_files_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "audio_files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
Referenced by:
    TABLE "ai_analysis_results" CONSTRAINT "ai_analysis_results_audio_file_id_fkey" FOREIGN KEY (audio_file_id) REFERENCES audio_files(id)

                                               Table "public.ai_analysis_results"
         Column          |           Type           | Collation | Nullable |               Default
-------------------------+--------------------------+-----------+----------+--------------------------------------
 id                      | character varying        |           | not null |
 audio_file_id           | integer                  |           |          |
 user_id                 | integer                  |           |          |
 status                  | character varying(20)    |           |          | 'PENDING'::character varying
 result_data             | jsonb                    |           |          |
 created_at              | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 completed_at            | timestamp with time zone |           |          |
 device_id               | character varying        |           |          |
 feedback_status         | character varying(50)    |           |          | -- [NEW] Phase Q: TRUE_POSITIVE, FALSE_POSITIVE, IGNORE
 feedback_comment        | text                     |           |          | -- [NEW] Phase Q: 사용자가 남긴 피드백 코멘트
 reviewed_by_user_id     | integer                  |           |          | -- [NEW] Phase Q: 피드백을 남긴 User ID
 reviewed_at             | timestamp with time zone |           |          | -- [NEW] Phase Q: 피드백이 기록된 시점
 is_retraining_candidate | boolean                  |           |          | false -- [NEW] Phase Q: 재학습 후보 여부
Indexes:
    "ai_analysis_results_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "ai_analysis_results_audio_file_id_fkey" FOREIGN KEY (audio_file_id) REFERENCES audio_files(id)
    "ai_analysis_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    "ai_analysis_results_reviewed_by_user_id_fkey" FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)