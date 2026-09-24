CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    full_name text,
    hashed_password text,
    role text DEFAULT 'viewer',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    last_login timestamptz
);

CREATE TABLE datasets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    scale text,
    status text,
    record_count integer,
    file_path text,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE analysis_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id uuid REFERENCES datasets(id),
    job_type text,
    status text CHECK (status IN ('queued','running','success','failed','cancelled')),
    start_time timestamptz,
    end_time timestamptz,
    duration_seconds float,
    records_processed integer,
    stage text,
    error_details text,
    logs text,
    created_by uuid REFERENCES users(id)
);

CREATE TABLE model_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    version text,
    pipeline text CHECK (pipeline IN ('spark','python')),
    algorithm text,
    feature_list jsonb,
    hyperparameters jsonb,
    dataset_version text,
    training_date timestamptz DEFAULT now(),
    train_metrics jsonb,
    validation_metrics jsonb,
    test_metrics jsonb,
    confusion_matrix jsonb,
    artifact_path text,
    creator text,
    is_active boolean DEFAULT false,
    sample_predictions jsonb
);

CREATE TABLE predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id uuid REFERENCES model_metadata(id),
    input_data jsonb,
    prediction jsonb,
    confidence float,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text,
    title text,
    content jsonb,
    dataset_id uuid REFERENCES datasets(id),
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    file_path text
);

CREATE TABLE recommendation_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation text,
    reason text,
    supporting_metrics jsonb,
    affected_route text,
    affected_time text,
    expected_impact text,
    confidence_level text,
    created_at timestamptz DEFAULT now(),
    dataset_id uuid REFERENCES datasets(id)
);

CREATE TABLE simulation_scenarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    parameters jsonb,
    results jsonb,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    dataset_id uuid REFERENCES datasets(id)
);

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text,
    entity_type text,
    entity_id text,
    details jsonb,
    ip_address text,
    timestamp timestamptz DEFAULT now()
);

CREATE TABLE data_quality_audits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id uuid REFERENCES datasets(id),
    record_id text,
    original_value text,
    issue_type text,
    affected_column text,
    cleaning_rule text,
    corrected_value text,
    status text CHECK (status IN ('VALID','CORRECTED','FLAGGED','QUARANTINED')),
    timestamp timestamptz DEFAULT now()
);

CREATE TABLE dual_pipeline_comparisons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id text,
    actual_result text,
    spark_result text,
    python_result text,
    spark_probability float,
    python_probability float,
    numerical_difference float,
    match_status boolean,
    consistency_status text,
    explanation text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE spark_job_monitor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name text,
    status text CHECK (status IN ('queued','running','success','failed','cancelled')),
    start_time timestamptz,
    end_time timestamptz,
    duration_seconds float,
    records_processed integer,
    stage text,
    error_details text,
    log_path text
);

CREATE TABLE performance_benchmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operation text,
    dataset_size integer,
    duration_seconds float,
    throughput_rps float,
    memory_mb float,
    timestamp timestamptz DEFAULT now(),
    notes text
);

CREATE TABLE configuration_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    setting_key text,
    old_value text,
    new_value text,
    timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dual_pipeline_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_job_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_changes ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Supabase Storage Setup: Avatars Bucket & Access Policies
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create the 'avatars' public bucket with 5MB size limit and image mime-types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Drop any previous policies to prevent duplicate policy errors
DROP POLICY IF EXISTS "Public View Access for Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;

-- 3. Policy: Allow anyone (public / anon) to view images in the 'avatars' bucket
CREATE POLICY "Public View Access for Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 4. Policy: Allow authenticated & anonymous app users to upload images to 'avatars'
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- 5. Policy: Allow users to overwrite/update their avatar images
CREATE POLICY "Anyone can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 6. Policy: Allow users to delete avatar images
CREATE POLICY "Anyone can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

