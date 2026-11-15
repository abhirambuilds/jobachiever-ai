package ai.jobachiever.jobs.repository;

import ai.jobachiever.jobs.entity.Job;
import ai.jobachiever.jobs.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByJobStatus(JobStatus jobStatus);
}
