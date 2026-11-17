-- Ensure user exists and profile is updated for abhi@gmail.com
UPDATE users 
SET first_name = 'Abhiram', last_name = 'Reddy', email_verified = true, account_status = 'ACTIVE'
WHERE email = 'abhi@gmail.com';

DO $$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
    v_track_backend_id uuid;
    v_track_cloud_id uuid;
    v_track_ai_id uuid;
    v_job_stripe uuid;
    v_job_databricks uuid;
    v_job_servicenow uuid;
    v_job_microsoft uuid;
    v_job_razorpay uuid;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'abhi@gmail.com';
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User abhi@gmail.com not found';
    END IF;

    -- Ensure career profile exists
    SELECT id INTO v_profile_id FROM career_profiles WHERE user_id = v_user_id;
    IF v_profile_id IS NULL THEN
        INSERT INTO career_profiles (
            user_id, headline, summary, current_location, preferred_locations,
            linkedin_url, github_url, website_url, years_of_experience,
            career_stage, completion_percentage, is_verified, phone_number, country
        ) VALUES (
            v_user_id,
            'Senior Backend & Distributed Systems Engineer | Java 21 & Cloud Architecture',
            'Results-driven Backend Systems Engineer with deep expertise in Java 21, Spring Boot 3, PostgreSQL, Docker, and AWS. Proven track record reducing API response latency by 42% and architecting resilient services supporting 3,000+ active users with 99.95% uptime.',
            'Bengaluru, Karnataka', '["Bengaluru", "Hyderabad", "Remote"]'::jsonb,
            'https://linkedin.com/in/abhirambuilds', 'https://github.com/abhirambuilds', 'https://abhirambuilds.dev',
            2.0, 'ENTRY_LEVEL', 100, true, '+91 98765 43210', 'India'
        ) RETURNING id INTO v_profile_id;
    ELSE
        UPDATE career_profiles SET
            headline = 'Senior Backend & Distributed Systems Engineer | Java 21 & Cloud Architecture',
            summary = 'Results-driven Backend Systems Engineer with deep expertise in Java 21, Spring Boot 3, PostgreSQL, Docker, and AWS. Proven track record reducing API response latency by 42% and architecting resilient services supporting 3,000+ active users with 99.95% uptime.',
            current_location = 'Bengaluru, Karnataka',
            preferred_locations = '["Bengaluru", "Hyderabad", "Remote"]'::jsonb,
            linkedin_url = 'https://linkedin.com/in/abhirambuilds',
            github_url = 'https://github.com/abhirambuilds',
            website_url = 'https://abhirambuilds.dev',
            years_of_experience = 2.0,
            career_stage = 'ENTRY_LEVEL',
            completion_percentage = 100,
            is_verified = true
        WHERE id = v_profile_id;
    END IF;

    -- 1. Insert Career Tracks
    DELETE FROM career_tracks WHERE user_id = v_user_id;
    
    INSERT INTO career_tracks (
        user_id, profile_id, name, target_role, description,
        required_skills, target_companies, is_active, is_primary, priority, target_seniority
    ) VALUES (
        v_user_id, v_profile_id, 'Senior Backend Platform Engineer', 'Senior Backend Developer',
        'Scalable microservices, distributed transaction processing, and low-latency APIs in Java & Spring Boot.',
        '["Java 21", "Spring Boot 3", "PostgreSQL", "Kafka", "Docker", "AWS", "Redis"]'::jsonb,
        '["Stripe", "Razorpay", "Swiggy", "DE Shaw", "Microsoft"]'::jsonb,
        true, true, 1, 'ENTRY_LEVEL'
    ) RETURNING id INTO v_track_backend_id;

    INSERT INTO career_tracks (
        user_id, profile_id, name, target_role, description,
        required_skills, target_companies, is_active, is_primary, priority, target_seniority
    ) VALUES (
        v_user_id, v_profile_id, 'Cloud Infrastructure & DevOps', 'Junior Cloud Systems Engineer',
        'Container orchestration, CI/CD pipelines, and cloud platform automation with Docker & AWS.',
        '["Docker", "AWS", "Linux", "Kubernetes", "CI/CD", "PostgreSQL"]'::jsonb,
        '["ServiceNow", "AWS", "Databricks", "Microsoft IDC"]'::jsonb,
        true, false, 2, 'ENTRY_LEVEL'
    ) RETURNING id INTO v_track_cloud_id;

    INSERT INTO career_tracks (
        user_id, profile_id, name, target_role, description,
        required_skills, target_companies, is_active, is_primary, priority, target_seniority
    ) VALUES (
        v_user_id, v_profile_id, 'AI & Distributed Systems Engineer', 'AI Platform Engineer',
        'Semantic search, pgvector similarity indexing, and low-latency AI inference microservices.',
        '["Java", "Python", "pgvector", "FastAPI", "Docker", "RAG"]'::jsonb,
        '["Databricks", "Google", "Vercel"]'::jsonb,
        true, false, 3, 'ENTRY_LEVEL'
    ) RETURNING id INTO v_track_ai_id;

    -- 2. Insert Profile Experiences
    DELETE FROM profile_experiences WHERE profile_id = v_profile_id;
    
    INSERT INTO profile_experiences (
        profile_id, company_name, job_title, location, employment_type,
        start_date, end_date, is_current, description, achievements
    ) VALUES (
        v_profile_id, 'Corizo', 'Backend Developer Intern', 'Bengaluru, India', 'INTERNSHIP',
        '2024-05-01', '2024-08-01', false,
        'Engineered high-throughput transaction endpoints using Java 21 and Spring Boot 3. Optimized PostgreSQL database queries reducing API latency by 42%.',
        '["Reduced p99 API response latency by 42%", "Architected asynchronous job queue handling 10k+ daily events", "Automated integration testing suite with JUnit 5 and Testcontainers"]'::jsonb
    );

    INSERT INTO profile_experiences (
        profile_id, company_name, job_title, location, employment_type,
        start_date, end_date, is_current, description, achievements
    ) VALUES (
        v_profile_id, 'TechVanguard Labs', 'Freelance Software Developer', 'Remote, India', 'CONTRACT',
        '2023-01-01', NULL, true,
        'Delivered commercial full-stack web and backend deliverables across 10+ clients using React, Spring Boot, and PostgreSQL.',
        '["Built and deployed 10+ custom client platforms with 100% on-time delivery", "Designed schema migrations and ACID transaction pipelines", "Integrated Stripe & Razorpay payment webhooks with zero payment anomalies"]'::jsonb
    );

    -- 3. Insert Profile Projects
    DELETE FROM profile_projects WHERE profile_id = v_profile_id;

    INSERT INTO profile_projects (
        profile_id, title, role, start_date, end_date, is_current,
        description, technologies, project_url, github_url
    ) VALUES (
        v_profile_id, 'SRM Secure Exam Portal', 'Lead Architect & Developer', '2024-01-01', '2024-04-30', false,
        'High-concurrency university examination platform serving 3,000+ simultaneous students with zero downtime and real-time proctor telemetry.',
        '["Java 21", "Spring Boot", "React", "PostgreSQL", "Docker", "WebSocket"]'::jsonb,
        'https://exam.srmuniv.ac.in', 'https://github.com/abhirambuilds/srm-secure-exam'
    );

    INSERT INTO profile_projects (
        profile_id, title, role, start_date, end_date, is_current,
        description, technologies, project_url, github_url
    ) VALUES (
        v_profile_id, 'Financial Transaction Processing Service', 'Backend Systems Developer', '2024-06-01', '2024-09-30', false,
        'Idempotent transaction settlement engine handling 3,000+ operations/min with Redis distributed locks and ACID consistency.',
        '["Java 21", "Spring Boot 3", "PostgreSQL", "Redis", "Apache Kafka", "Docker"]'::jsonb,
        'https://stablepay.dev', 'https://github.com/abhirambuilds/financial-transaction-service'
    );

    INSERT INTO profile_projects (
        profile_id, title, role, start_date, end_date, is_current,
        description, technologies, project_url, github_url
    ) VALUES (
        v_profile_id, 'AegisCommerce AI', 'Full-Stack Developer', '2023-09-01', '2023-12-15', false,
        'High-conversion e-commerce platform with AI semantic vector search and sub-20ms product retrieval.',
        '["React 18", "Spring Boot", "pgvector", "Tailwind CSS", "Docker", "PostgreSQL"]'::jsonb,
        'https://aegiscommerce.dev', 'https://github.com/abhirambuilds/aegiscommerce-ai'
    );

    -- 4. Insert Profile Educations
    DELETE FROM profile_educations WHERE profile_id = v_profile_id;
    INSERT INTO profile_educations (
        profile_id, institution, degree, field_of_study,
        start_date, end_date, is_current, grade_or_gpa, description
    ) VALUES (
        v_profile_id, 'SRM Institute of Science and Technology (KTR)',
        'Bachelor of Technology', 'Computer Science and Engineering',
        '2021-08-01', '2025-05-01', false, '9.48 / 10.0 CGPA',
        'ACM Student Chapter Technical Head, Core Coding Club Lead'
    );

    -- 5. Insert Profile Certifications
    DELETE FROM profile_certifications WHERE profile_id = v_profile_id;
    INSERT INTO profile_certifications (
        profile_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url
    ) VALUES 
    (v_profile_id, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2024-02-15', '2027-02-15', 'AWS-CCP-928172', 'https://aws.amazon.com/verification'),
    (v_profile_id, 'MongoDB Associate Developer', 'MongoDB Inc.', '2024-04-10', NULL, 'MDB-DEV-44812', 'https://university.mongodb.com/certificates'),
    (v_profile_id, 'Programming in Java (Gold Medalist / Top 1%)', 'NPTEL / IIT Kharagpur', '2023-11-01', NULL, 'NPTEL23CS91S', 'https://nptel.ac.in/noc');

    -- 6. Insert Jobs & Job Applications
    -- Stripe
    SELECT id INTO v_job_stripe FROM jobs WHERE company_name = 'Stripe' LIMIT 1;
    IF v_job_stripe IS NULL THEN
        INSERT INTO jobs (title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency)
        VALUES ('Senior Backend Engineer — Payment Platform', 'Stripe', 'Architect and scale high-throughput payment ledgers using Java and distributed databases.', 'Bengaluru / Remote', 'HYBRID', 'FULL_TIME', 'MID_LEVEL', 2800000, 4500000, 'INR')
        RETURNING id INTO v_job_stripe;
    END IF;

    -- Databricks
    SELECT id INTO v_job_databricks FROM jobs WHERE company_name = 'Databricks' LIMIT 1;
    IF v_job_databricks IS NULL THEN
        INSERT INTO jobs (title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency)
        VALUES ('Distributed Systems Engineer', 'Databricks', 'Build high-volume streaming telemetry and scalable vector indexing services.', 'Bengaluru, India', 'HYBRID', 'FULL_TIME', 'MID_LEVEL', 3200000, 5200000, 'INR')
        RETURNING id INTO v_job_databricks;
    END IF;

    -- ServiceNow
    SELECT id INTO v_job_servicenow FROM jobs WHERE company_name = 'ServiceNow' LIMIT 1;
    IF v_job_servicenow IS NULL THEN
        INSERT INTO jobs (title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency)
        VALUES ('Software Engineering Intern — Enterprise Cloud', 'ServiceNow', 'Develop resilient enterprise workflow APIs and database performance optimization.', 'Hyderabad, India', 'HYBRID', 'INTERNSHIP', 'ENTRY_LEVEL', 65000, 80000, 'INR')
        RETURNING id INTO v_job_servicenow;
    END IF;

    -- Microsoft IDC
    SELECT id INTO v_job_microsoft FROM jobs WHERE company_name = 'Microsoft IDC' LIMIT 1;
    IF v_job_microsoft IS NULL THEN
        INSERT INTO jobs (title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency)
        VALUES ('Software Engineering Intern — Cloud & Platform', 'Microsoft IDC', 'Work on core Azure distributed platform infrastructure and telemetry.', 'Hyderabad, India', 'HYBRID', 'INTERNSHIP', 'ENTRY_LEVEL', 80000, 100000, 'INR')
        RETURNING id INTO v_job_microsoft;
    END IF;

    -- Razorpay
    SELECT id INTO v_job_razorpay FROM jobs WHERE company_name = 'Razorpay' LIMIT 1;
    IF v_job_razorpay IS NULL THEN
        INSERT INTO jobs (title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency)
        VALUES ('Backend Platform Developer', 'Razorpay', 'Scale high-concurrency payment switch microservices with 99.99% availability.', 'Bengaluru, India', 'ON_SITE', 'FULL_TIME', 'MID_LEVEL', 2400000, 3600000, 'INR')
        RETURNING id INTO v_job_razorpay;
    END IF;

    -- Insert Job Applications
    DELETE FROM job_applications WHERE user_id = v_user_id;

    INSERT INTO job_applications (user_id, job_id, career_track_id, status, applied_at, notes)
    VALUES (v_user_id, v_job_stripe, v_track_backend_id, 'INTERVIEW', NOW() - INTERVAL '5 days', 'Technical Round 2: System Design & Concurrency scheduled.');

    INSERT INTO job_applications (user_id, job_id, career_track_id, status, applied_at, notes)
    VALUES (v_user_id, v_job_razorpay, v_track_backend_id, 'OFFER', NOW() - INTERVAL '12 days', 'Received offer letter for Backend Platform Engineer (Bengaluru).');

    INSERT INTO job_applications (user_id, job_id, career_track_id, status, applied_at, notes)
    VALUES (v_user_id, v_job_microsoft, v_track_cloud_id, 'APPLIED', NOW() - INTERVAL '2 days', 'Submitted tailored ATS resume for Hyderabad Cloud & Platform track.');

    INSERT INTO job_applications (user_id, job_id, career_track_id, status, applied_at, notes)
    VALUES (v_user_id, v_job_servicenow, v_track_cloud_id, 'SAVED', NOW() - INTERVAL '1 day', 'Discovered via Job Opportunity Ingestion. Matched 91% with Master Profile.');

    INSERT INTO job_applications (user_id, job_id, career_track_id, status, applied_at, notes)
    VALUES (v_user_id, v_job_databricks, v_track_ai_id, 'ASSESSMENT', NOW() - INTERVAL '7 days', 'Completed HackerRank coding assessment on graphs and sliding windows.');

    RAISE NOTICE 'Successfully seeded all PostgreSQL tables for abhi@gmail.com!';
END $$;
