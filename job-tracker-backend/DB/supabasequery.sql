-- CREATE TABLE job_status (
--     id SERIAL PRIMARY KEY,
--     status_name VARCHAR(50) NOT NULL UNIQUE
-- );

-- -- Seed some initial data
-- INSERT INTO job_status (status_name) VALUES 
-- ('Saved'), ('Applied'), ('Interviewing'), ('Offer'), ('Rejected');

-- CREATE TABLE user_job_data (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--     job_title TEXT NOT NULL,
--     job_company_name TEXT NOT NULL,
--     job_url TEXT,
--     job_salary TEXT, 
--     job_location TEXT,
--     job_description TEXT,
--     job_image_url TEXT,
--     status_id INTEGER REFERENCES job_status(id) DEFAULT 1, -- Defaults to 'Saved'
--     job_applieddate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     job_modified_date TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Initially empty
    
--     CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
-- );

-- CREATE TABLE job_status_history (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     job_id UUID REFERENCES user_job_data(id) ON DELETE CASCADE,
--     user_id UUID REFERENCES auth.users(id),
--     status_id INTEGER REFERENCES job_status(id),
--     status_change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );


-- CREATE TABLE job_source (
--     id SERIAL PRIMARY KEY,
--     source_name VARCHAR(50) NOT NULL UNIQUE
-- );

-- -- 2. Seed the sources
-- INSERT INTO job_source (source_name) VALUES 
-- ('Manual'), ('Extension'), ('Google');

-- ALTER TABLE user_job_data 
-- ADD COLUMN source_id INTEGER REFERENCES job_source(id) DEFAULT 1;

-- CREATE POLICY "Users can see their own jobs" 
-- ON user_job_data 
-- FOR SELECT 
-- USING (auth.uid() = user_id);

-- Enable RLS
-- ALTER TABLE job_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_source ENABLE ROW LEVEL SECURITY;

-- -- Policy: Anyone who is logged in can VIEW these (SELECT)
-- CREATE POLICY "Allow authenticated users to read statuses" 
-- ON job_status FOR SELECT 
-- TO authenticated 
-- USING (true);

-- CREATE POLICY "Allow authenticated users to read sources" 
-- ON job_source FOR SELECT 
-- TO authenticated 
-- USING (true);

-- Enable RLS
-- ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;

-- -- Policy: Users can only see/add their own timeline history
-- CREATE POLICY "Users can manage their own job history" 
-- ON job_status_history 
-- FOR ALL 
-- TO authenticated 
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- 1. Enable UPDATE policy
CREATE POLICY "Users can update their own jobs" 
ON user_job_data 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 2. Enable DELETE policy
CREATE POLICY "Users can delete their own jobs" 
ON user_job_data 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Repeat for the history table (if you ever need to update history)
CREATE POLICY "Users can update their own history" 
ON job_status_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
ON job_status_history FOR DELETE TO authenticated USING (auth.uid() = user_id);


select * from job_status 
select * from user_job_data
select * from job_status_history
select * from job_source

-- Correct way to query by UUID
SELECT * FROM user_job_data 
WHERE user_id = 'c382aed6-eb1c-4792-99a5-3ac5a9f7c614';

select * from job_status_history where job_id ='23fabb56-5f6e-459a-9f35-ac92af99b4d6';

select * from user_job_data where id = 'af2c0038-21a5-4cac-b34a-c609cbad8d81'