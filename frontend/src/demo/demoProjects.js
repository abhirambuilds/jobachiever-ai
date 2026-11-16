/**
 * Consistent Recommended Portfolio Project Blueprints for Alex Morgan
 */

export const DEMO_PROJECT_BLUEPRINTS = [
  {
    id: 'blueprint-demo-1',
    title: 'Distributed Event-Driven E-Commerce Pipeline',
    targetRole: 'Backend Software Engineer',
    targetMissingSkills: ['Kafka', 'Kubernetes', 'Redis'],
    description:
      'High-throughput microservices architecture with Spring Boot order and payment services connected via Apache Kafka, Redis rate limiting, and automated Helm deployment to Minikube.',
    architectureOverview:
      'Choreographed saga pattern ensuring transactional consistency across order and billing microservices with Kafka dead-letter handling.',
    keyDeliverables: [
      'Transactional outbox pattern implementation in Java 21 / Spring Boot 3.',
      'Kafka consumer with at-least-once idempotency guarantees.',
      'Helm chart packaging with rolling update zero-downtime manifests.',
    ],
    difficulty: 'Advanced',
    estimatedTime: '2–3 weeks',
    status: 'RECOMMENDED',
  },
  {
    id: 'blueprint-demo-2',
    title: 'Sliding-Window Token Bucket Rate Limiter',
    targetRole: 'Backend Software Engineer',
    targetMissingSkills: ['Redis', 'Distributed Systems'],
    description:
      'High-performance distributed API rate limiter implemented with Redis Lua scripts and Spring Cloud Gateway filter chains.',
    architectureOverview:
      'Atomic Redis sliding-window counter preventing traffic spikes across clustered gateway instances with sub-2ms evaluation overhead.',
    keyDeliverables: [
      'Lua script executing atomic counter increment with TTL expiry.',
      'Spring Cloud Gateway custom GlobalFilter with configurable headers.',
      'JMeter stress test verifying behavior under 20,000 req/sec bursts.',
    ],
    difficulty: 'Intermediate',
    estimatedTime: '1 week',
    status: 'RECOMMENDED',
  },
];
