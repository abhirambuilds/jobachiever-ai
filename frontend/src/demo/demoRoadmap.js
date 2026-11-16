/**
 * Consistent Phased Learning Roadmap for Aarav Sharma (Indian Product Ecosystem)
 */

export const DEMO_ROADMAP = {
  id: 'demo-roadmap-aarav-001',
  careerTrackId: 'track-demo-backend',
  targetRole: 'Senior Backend Software Engineer',
  title: 'Senior Backend & Distributed Systems Advancement Roadmap',
  description:
    'Tailored 3-phase progression path addressing the exact skill gaps identified for Staff / Principal Backend roles at tier-1 Indian tech unicorns (Razorpay, CRED, Swiggy, PhonePe).',
  status: 'IN_PROGRESS',
  provider: 'GROQ',
  model: 'llama-3.3-70b-versatile',
  isSimulatedDemo: true,
  progressPercentage: 50,
  totalMilestones: 4,
  completedMilestones: 2,
  inProgressMilestones: 1,
  blockedMilestones: 0,
  phases: [
    {
      phaseNumber: 1,
      name: 'Phase 1: Multi-Region Kubernetes & Service Mesh',
      description: 'Solidify container infrastructure, local cluster provisioning, and declarative manifests.',
      milestones: [
        {
          id: 'demo-m-101',
          roadmapId: 'demo-roadmap-aarav-001',
          phaseNumber: 1,
          title: 'Docker Multi-Stage Builds & Distroless Base Images',
          description: 'Package Spring Boot 3 applications using optimized distroless base images with non-root security context.',
          priority: 'HIGH',
          status: 'COMPLETED',
          relatedSkills: ['Docker'],
          tasks: [
            { description: 'Optimize Spring Boot layer caching with multi-stage Dockerfile', taskType: 'PRACTICE', skills: ['Docker'] },
            { description: 'Enforce non-root user execution in production container spec', taskType: 'PRACTICE', skills: ['Docker'] },
          ],
          completionCriteria: ['Image footprint reduced below 120MB', 'Vulnerability scan shows zero critical findings'],
          startDate: '2026-11-01T00:00:00Z',
          completedAt: '2026-11-08T00:00:00Z',
        },
        {
          id: 'demo-m-102',
          roadmapId: 'demo-roadmap-aarav-001',
          phaseNumber: 1,
          title: 'Local Minikube Cluster Deployment & Helm Packaging',
          description: 'Deploy Order Processing microservices to a local Minikube cluster using Helm charts with Ingress routing.',
          priority: 'CRITICAL',
          status: 'COMPLETED',
          relatedSkills: ['Kubernetes', 'Helm'],
          tasks: [
            { description: 'Write Helm chart for Spring Boot deployment, service, and ingress', taskType: 'PRACTICE', skills: ['Kubernetes'] },
            { description: 'Configure liveness and readiness health probes', taskType: 'PRACTICE', skills: ['Kubernetes'] },
          ],
          completionCriteria: ['Pods pass zero-downtime rolling update deployment in Minikube', 'Health checks wire cleanly to Spring Boot Actuator'],
          startDate: '2026-11-09T00:00:00Z',
          completedAt: '2026-11-14T00:00:00Z',
        },
      ],
    },
    {
      phaseNumber: 2,
      name: 'Phase 2: High-Velocity Kafka Streaming & Financial Reconciliation',
      description: 'Master Apache Kafka partition semantics, consumer lag observability, and transactional event handling for UPI scale.',
      milestones: [
        {
          id: 'demo-m-201',
          roadmapId: 'demo-roadmap-aarav-001',
          phaseNumber: 2,
          title: 'Kafka Consumer Lag Telemetry & Rebalance Handling',
          description: 'Instrument consumer groups with Prometheus metrics to measure and mitigate lag during burst traffic.',
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
          relatedSkills: ['Kafka', 'Prometheus'],
          tasks: [
            { description: 'Configure micrometer-registry-prometheus for Kafka listener containers', taskType: 'PRACTICE', skills: ['Kafka'] },
            { description: 'Implement dead-letter topic retry handler with exponential backoff', taskType: 'PRACTICE', skills: ['Kafka'] },
          ],
          completionCriteria: ['Consumer lag dashboard rendered via Grafana', 'Poison-pill messages routed cleanly to DLT without blocking partition'],
          startDate: '2026-11-15T00:00:00Z',
          completedAt: null,
        },
      ],
    },
    {
      phaseNumber: 3,
      name: 'Phase 3: Database High Availability & Sharding',
      description: 'Design distributed PostgreSQL topologies with read replicas, connection pooling, and optimistic locking for 50M+ records.',
      milestones: [
        {
          id: 'demo-m-301',
          roadmapId: 'demo-roadmap-aarav-001',
          phaseNumber: 3,
          title: 'PostgreSQL Connection Pool Optimization with HikariCP',
          description: 'Tune connection pool parameters under 500 concurrent client simulations to prevent thread starvation during flash sales.',
          priority: 'HIGH',
          status: 'NOT_STARTED',
          relatedSkills: ['PostgreSQL', 'HikariCP'],
          tasks: [
            { description: 'Benchmark throughput differences between pool sizes 10, 20, 50', taskType: 'PRACTICE', skills: ['PostgreSQL'] },
          ],
          completionCriteria: ['Documented HikariCP latency sweet-spot benchmark table'],
          startDate: null,
          completedAt: null,
        },
      ],
    },
  ],
};
