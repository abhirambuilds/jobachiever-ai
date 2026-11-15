/**
 * Career Tracks Service Interface for JobAchiever AI.
 *
 * Defines the API client contract for primary Spring Boot backend endpoints
 * under /api/v1/career-tracks. Connects multi-track personas to the Master
 * Career Profile with deterministic skill match overview and offline fallback.
 */

export const CAREER_TRACKS_API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const careerTrackService = {
  /**
   * List all career tracks for the authenticated candidate.
   * Target endpoint: GET /api/v1/career-tracks?active={active}
   */
  async listTracks(active = null) {
    try {
      const url = new URL(`${CAREER_TRACKS_API_BASE}/career-tracks`);
      if (active !== null) {
        url.searchParams.append('active', String(active));
      }
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json.data || [];
      }
    } catch {
      // Fallback to local profile drafts if backend is unreachable
    }
    return null;
  },

  /**
   * Retrieve a specific career track by ID.
   * Target endpoint: GET /api/v1/career-tracks/{id}
   */
  async getTrack(trackId) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  /**
   * Create a new career track tied to Master Profile.
   * Target endpoint: POST /api/v1/career-tracks
   */
  async createTrack(trackData) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(trackData),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Simulated response in offline demo mode
    }
    return { ...trackData, id: trackData.id || `track-${Date.now()}` };
  },

  /**
   * Update an existing career track.
   * Target endpoint: PUT /api/v1/career-tracks/{id}
   */
  async updateTrack(trackId, trackData) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(trackData),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return { ...trackData, id: trackId };
  },

  /**
   * Toggle track active/inactive status.
   * Target endpoint: PATCH /api/v1/career-tracks/{id}/status
   */
  async updateStatus(trackId, active) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ active }),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return { id: trackId, active };
  },

  /**
   * Update track priority order.
   * Target endpoint: PATCH /api/v1/career-tracks/{id}/priority
   */
  async updatePriority(trackId, priority) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priority }),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return { id: trackId, priority };
  },

  /**
   * Delete a career track safely without touching master credentials.
   * Target endpoint: DELETE /api/v1/career-tracks/{id}
   */
  async deleteTrack(trackId) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        return true;
      }
    } catch {
      // Fallback
    }
    return true;
  },

  /**
   * Retrieve deterministic overview of skills match, missing skills, and relevant projects.
   * Target endpoint: GET /api/v1/career-tracks/{id}/overview
   */
  async getTrackOverview(trackId) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      const response = await fetch(`${CAREER_TRACKS_API_BASE}/career-tracks/${trackId}/overview`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return null;
  },
};
