-- Seed rich, realistic Indian tech data for PostgreSQL Review & Evaluation
DO $$
DECLARE
    v_user_id UUID;
    v_profile_id UUID;
    v_job_razorpay UUID := gen_random_uuid();
    v_job_swiggy UUID := gen_random_uuid();
    v_job_flipkart UUID := gen_random_uuid();
    v_job_cred UUID := gen_random_uuid();
BEGIN
    -- Loop over all active users in the system to give each full data
    FOR v_user_id, v_profile_id IN 
        SELECT u.id, p.id FROM users u JOIN career_profiles p ON p.user_id = u.id
    LOOP
        -- 1. Update master career profile
        UPDATE career_profiles
        SET headline = 'Senior Backend & Distributed Systems Engineer | Ex-Razorpay, Ex-Swiggy | IIT Bombay',
            current_location = 'Bengaluru, Karnataka, India',
            phone_number = '+91 98765 43210',
            country = 'India',
            years_of_experience = 4.0,
            career_stage = 'MID_LEVEL',
            completion_percentage = 95,
            is_verified = true,
            summary = 'Experienced Distributed Systems & Backend Engineer with 4 years building high-throughput payment switches, transactional banking integrations, and event-driven message architectures at Razorpay and Swiggy.',
            career_preferences = jsonb_build_object(
                'target_roles', jsonb_build_array('Senior Backend Engineer', 'Distributed Systems Architect', 'Staff Software Engineer'),
                'target_locations', jsonb_build_array('Bengaluru', 'Remote (India)', 'Hyderabad'),
                'min_base_salary', 3500000,
                'target_ctc', 4500000,
                'currency', 'INR',
                'workplace_type', 'HYBRID'
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_profile_id;

        -- 2. Clear old children for clean idempotent re-seed
        DELETE FROM profile_experiences WHERE profile_id = v_profile_id;
        DELETE FROM profile_educations WHERE profile_id = v_profile_id;
        DELETE FROM profile_skills WHERE profile_id = v_profile_id;
        DELETE FROM profile_projects WHERE profile_id = v_profile_id;
        DELETE FROM profile_certifications WHERE profile_id = v_profile_id;
        DELETE FROM profile_achievements WHERE profile_id = v_profile_id;

        -- 3. Experiences
        INSERT INTO profile_experiences (id, profile_id, company_name, job_title, location, employment_type, start_date, end_date, is_current, description, achievements)
        VALUES 
        (gen_random_uuid(), v_profile_id, 'Razorpay', 'SDE-2 (Lead Backend Engineer)', 'Bengaluru, Karnataka', 'FULL_TIME', '2024-01-15', NULL, true,
         'Core Payments & UPI Switch Team. Architecting high-throughput financial transaction settlement engines.',
         jsonb_build_array(
            'Architected high-throughput payment settlement microservices processing ₹200+ Crore in daily GMV with sub-30ms p99 latency.',
            'Optimized partitioned PostgreSQL tables storing 50M+ payment records daily with 99.999% SLA.',
            'Scaled Apache Kafka event streaming pipelines for real-time webhook dispatch and banking reconciliation.'
         )),
        (gen_random_uuid(), v_profile_id, 'Swiggy', 'SDE-1 (Backend Platform Engineer)', 'Bengaluru, Karnataka', 'FULL_TIME', '2022-07-01', '2023-12-31', false,
         'Logistics Platform Team. Built real-time rider dispatch and order state management services.',
         jsonb_build_array(
            'Developed reactive microservices in Java 17 and Spring Boot handling 8,000 requests/sec during peak IPL order surges.',
            'Designed distributed Redis caching strategy reducing database query latency by 35% across merchant APIs.'
         ));

        -- 4. Educations
        INSERT INTO profile_educations (id, profile_id, institution, degree, field_of_study, start_date, end_date, is_current, grade_or_gpa, description)
        VALUES 
        (gen_random_uuid(), v_profile_id, 'Indian Institute of Technology Bombay', 'Bachelor of Technology (B.Tech)', 'Computer Science and Engineering', '2018-08-01', '2022-05-30', false, '9.2 / 10.0 CGPA',
         'Graduated with Department Honors. Coursework: Advanced Distributed Systems, Database Management Systems, System Design, Compilers, Computer Networks.');

        -- 5. Skills (category must be: TECHNICAL, SOFT, TOOL, LANGUAGE, DOMAIN)
        INSERT INTO profile_skills (id, profile_id, name, category, proficiency_level, is_verified)
        VALUES
        (gen_random_uuid(), v_profile_id, 'Java 21', 'LANGUAGE', 'EXPERT', true),
        (gen_random_uuid(), v_profile_id, 'Spring Boot 3', 'TECHNICAL', 'EXPERT', true),
        (gen_random_uuid(), v_profile_id, 'PostgreSQL', 'TECHNICAL', 'ADVANCED', true),
        (gen_random_uuid(), v_profile_id, 'Apache Kafka', 'TECHNICAL', 'ADVANCED', true),
        (gen_random_uuid(), v_profile_id, 'Redis', 'TECHNICAL', 'ADVANCED', true),
        (gen_random_uuid(), v_profile_id, 'Docker', 'TOOL', 'INTERMEDIATE', true),
        (gen_random_uuid(), v_profile_id, 'Kubernetes', 'TOOL', 'INTERMEDIATE', true),
        (gen_random_uuid(), v_profile_id, 'REST APIs', 'TECHNICAL', 'EXPERT', true),
        (gen_random_uuid(), v_profile_id, 'Microservices Architecture', 'DOMAIN', 'EXPERT', true),
        (gen_random_uuid(), v_profile_id, 'pgvector', 'TECHNICAL', 'INTERMEDIATE', true);

        -- 6. Projects
        INSERT INTO profile_projects (id, profile_id, title, role, start_date, end_date, is_current, description, technologies, project_url, github_url)
        VALUES
        (gen_random_uuid(), v_profile_id, 'High-Throughput UPI Settlement Engine', 'Lead Architect & Developer', '2024-03-01', '2024-09-30', false,
         'Production-grade financial transaction switch with distributed idempotency, 2-phase commit state machine, and automated double-spend prevention.',
         jsonb_build_array('Java 21', 'Spring Boot 3', 'PostgreSQL', 'Kafka', 'Redis', 'Docker'),
         'https://github.com/jobachiever/upi-switch', 'https://github.com/jobachiever/upi-switch'),
        (gen_random_uuid(), v_profile_id, 'Distributed Log Ingestion & Vector Search', 'Core Engineer', '2023-04-01', '2023-11-15', false,
         'Scalable inverted-index and semantic log search system capable of ingesting 10GB/hour of microservice telemetry with sub-second query latency.',
         jsonb_build_array('Java 21', 'pgvector', 'PostgreSQL', 'Kafka', 'FastAPI'),
         'https://github.com/jobachiever/vector-logs', 'https://github.com/jobachiever/vector-logs');

        -- 7. Certifications
        INSERT INTO profile_certifications (id, profile_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url)
        VALUES
        (gen_random_uuid(), v_profile_id, 'AWS Certified Solutions Architect – Associate', 'Amazon Web Services (AWS)', '2023-08-15', '2026-08-15', 'AWS-ARCH-99214', 'https://aws.amazon.com/verification'),
        (gen_random_uuid(), v_profile_id, 'Confluent Certified Developer for Apache Kafka', 'Confluent', '2024-02-20', '2026-02-20', 'CCDAK-77189', 'https://confluent.io/certification');

        -- 8. Achievements
        INSERT INTO profile_achievements (id, profile_id, title, description, achievement_date, issuer)
        VALUES
        (gen_random_uuid(), v_profile_id, 'All India Rank 142 — JEE Advanced', 'Secured 99.98th percentile among 200,000+ candidates in IIT JEE Advanced entrance examination.', '2018-06-10', 'IIT Joint Entrance Board'),
        (gen_random_uuid(), v_profile_id, 'Razorpay Engineering Spot Award', 'Awarded for leading zero-downtime database partitioning during Diwali festive surge.', '2024-11-05', 'Razorpay VP of Engineering');

        -- 9. Career Tracks
        DELETE FROM career_tracks WHERE user_id = v_user_id;

        INSERT INTO career_tracks (id, user_id, profile_id, name, target_role, target_seniority, priority, is_primary, is_active, description, created_at, updated_at)
        VALUES
        (gen_random_uuid(), v_user_id, v_profile_id, 'Senior Backend Platform Engineer', 'Senior Backend Engineer', 'SENIOR', 1, true, true,
         'Core high-throughput microservices, transaction processing, and database engineering.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, v_profile_id, 'Cloud & Distributed Systems Architect', 'Solutions Architect', 'SENIOR', 2, false, true,
         'Large-scale system design, Kafka event streams, fault-tolerant infrastructure.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, v_profile_id, 'Engineering Team Lead', 'Engineering Manager / Tech Lead', 'LEAD', 3, false, true,
         'Technical leadership, sprint architectural governance, and cross-functional delivery.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        -- 10. Resumes
        DELETE FROM resume_documents WHERE user_id = v_user_id;

        INSERT INTO resume_documents (id, user_id, title, document_type, is_master, is_primary, description, created_at, updated_at)
        VALUES
        (gen_random_uuid(), v_user_id, 'Aarav Sharma — Master Backend Systems Resume', 'GENERATED', true, true, 'Master resume optimized for Senior Backend & Distributed Systems engineering roles (94% ATS Score).', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, 'Aarav Sharma — Cloud & Distributed Systems Variant', 'TAILORED', false, false, 'Targeted for cloud infrastructure, Kafka pipelines, and AWS architectures (91% ATS Score).', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, 'Aarav Sharma — AI Systems Engineering Variant', 'TAILORED', false, false, 'Targeted for AI microservices, pgvector semantic search, and LLM orchestration (90% ATS Score).', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    END LOOP;

    -- 11. Populate Global Jobs
    DELETE FROM job_requirements WHERE job_id IN (SELECT id FROM jobs WHERE company_name IN ('Razorpay', 'Swiggy', 'Flipkart', 'CRED'));
    DELETE FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE company_name IN ('Razorpay', 'Swiggy', 'Flipkart', 'CRED'));
    DELETE FROM jobs WHERE company_name IN ('Razorpay', 'Swiggy', 'Flipkart', 'CRED');

    INSERT INTO jobs (id, title, company_name, description, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency, job_status, created_at, updated_at)
    VALUES
    (v_job_razorpay, 'Lead Backend Engineer — Core Payments & UPI Platform', 'Razorpay',
     'Architect high-availability financial settlement microservices in Java 21 & Spring Boot 3 handling ₹200+ Cr daily GMV.',
     'Bengaluru, Karnataka', 'HYBRID', 'FULL_TIME', 'SENIOR', 3200000, 4800000, 'INR', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (v_job_swiggy, 'Senior Platform Engineer — High-Scale Logistics', 'Swiggy',
     'Design and optimize distributed routing microservices handling 10M+ daily food delivery updates with Apache Kafka and Redis.',
     'Bengaluru, Karnataka', 'HYBRID', 'FULL_TIME', 'SENIOR', 3000000, 4500000, 'INR', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (v_job_flipkart, 'Staff Distributed Systems Engineer', 'Flipkart',
     'Scale core order processing switch and transactional database sharding across multi-region cloud clusters.',
     'Bengaluru, Karnataka', 'ON_SITE', 'FULL_TIME', 'LEAD', 3800000, 5200000, 'INR', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (v_job_cred, 'Senior Backend Engineer — Financial Ledger', 'CRED',
     'Build zero-loss accounting and payment reconciliation engines on PostgreSQL and event-driven architecture.',
     'Bengaluru, Karnataka', 'HYBRID', 'FULL_TIME', 'SENIOR', 3500000, 5000000, 'INR', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 12. Populate Job Applications for each user
    FOR v_user_id IN SELECT id FROM users LOOP
        INSERT INTO job_applications (id, user_id, job_id, status, applied_at, notes, created_at, updated_at)
        VALUES
        (gen_random_uuid(), v_user_id, v_job_razorpay, 'INTERVIEW', CURRENT_TIMESTAMP - interval '3 days',
         'Round 2 Technical Architecture Interview with Director of Payments Switch scheduled.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, v_job_swiggy, 'OFFER', CURRENT_TIMESTAMP - interval '14 days',
         'Offer received: ₹42,00,000 Base + ₹8,00,000 RSUs. Decision deadline: Dec 15.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, v_job_flipkart, 'APPLIED', CURRENT_TIMESTAMP - interval '2 days',
         'Application submitted with referral from Senior Staff SDE.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_user_id, v_job_cred, 'SAVED', NULL,
         'Wishlisted opportunity. Tailoring resume bullet points for financial ledger focus.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END LOOP;

END $$;
