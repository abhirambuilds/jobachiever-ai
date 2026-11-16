/**
 * Centralized Demo Mode Configuration for JobAchiever AI.
 *
 * Supports global activation via VITE_DEMO_MODE=true environment variable
 * or runtime activation via interactive user button stored in sessionStorage/localStorage.
 *
 * All demo fixtures and states are isolated under jobachiever_demo_* keys to
 * strictly prevent any pollution of real user credentials, drafts, or API records.
 */

export const DEMO_STORAGE_KEYS = {
  ACTIVE: 'jobachiever_demo_mode',
  USER: 'jobachiever_demo_user',
  PROFILE: 'jobachiever_demo_profile',
  RESUMES: 'jobachiever_demo_resumes',
  JOBS: 'jobachiever_demo_jobs',
  ROADMAP: 'jobachiever_demo_roadmap',
  APPLICATIONS: 'jobachiever_demo_applications',
  ACTIVITIES: 'jobachiever_demo_activities',
};

export const DEMO_CONFIG = {
  // Simulated network latency bounds in milliseconds for responsive demo feel
  minDelayMs: 200,
  maxDelayMs: 450,
  // Demo persona information
  personaName: 'Aarav Sharma',
  personaRole: 'Senior Backend Engineer (Bengaluru)',
  personaEmail: 'aarav.sharma@jobachiever.ai',
};

/**
 * Check if interactive demo presentation mode is currently active.
 * Controlled by:
 * 1. Environment variable VITE_DEMO_MODE === 'true'
 * 2. Session flag 'jobachiever_demo_mode' === 'true'
 * 3. LocalStorage flag 'jobachiever_demo_mode' === 'true'
 */
export function isDemoMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Check environment variable
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_DEMO_MODE === 'true'
  ) {
    return true;
  }

  // 2. Check sessionStorage (isolated per browser tab/session)
  try {
    if (sessionStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      return true;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }

  // 3. Check localStorage
  try {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      return true;
    }
  } catch {
    // Ignore storage errors
  }

  return false;
}

/**
 * Activates demo mode and emits an event for reactive components.
 */
export function enableDemoMode() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEYS.ACTIVE, 'true');
    localStorage.setItem(DEMO_STORAGE_KEYS.ACTIVE, 'true');
    window.dispatchEvent(new CustomEvent('jobachiever:demo-state-changed', { detail: { active: true } }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Disables demo mode and returns to normal application operation.
 */
export function disableDemoMode() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);
    localStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);
    window.dispatchEvent(new CustomEvent('jobachiever:demo-state-changed', { detail: { active: false } }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Simulates network delay within the configured bounds.
 */
export async function simulateDelay(customDelayMs = null) {
  const delay =
    customDelayMs !== null
      ? customDelayMs
      : Math.floor(
          Math.random() * (DEMO_CONFIG.maxDelayMs - DEMO_CONFIG.minDelayMs + 1) +
            DEMO_CONFIG.minDelayMs
        );
  await new Promise((resolve) => setTimeout(resolve, delay));
}
