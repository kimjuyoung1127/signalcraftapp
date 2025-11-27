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
Referenced by:
    TABLE "ai_analysis_results" CONSTRAINT "ai_analysis_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "anomalies" CONSTRAINT "anomalies_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES users(id)
    TABLE "audio_files" CONSTRAINT "audio_files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "labels" CONSTRAINT "labels_labeler_user_fk" FOREIGN KEY (labeler_user_id) REFERENCES users(id) ON DELETE SET NULL
    TABLE "monitoring_data" CONSTRAINT "monitoring_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "stores" CONSTRAINT "stores_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
    TABLE "user_store_access" CONSTRAINT "user_store_access_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES users(id)
    TABLE "user_store_access" CONSTRAINT "user_store_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
Triggers:
    update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()

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
Indexes:
    "ai_analysis_results_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "ai_analysis_results_audio_file_id_fkey" FOREIGN KEY (audio_file_id) REFERENCES audio_files(id)
    "ai_analysis_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)