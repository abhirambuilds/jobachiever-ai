/**
 * Master Career Profile & Track Service for JobAchiever AI.
 *
 * Defines the contract with the primary Spring Boot 3.x backend under /api/v1/profile
 * and /api/v1/career-tracks. In this milestone, non-sensitive drafts are saved locally
 * via ProfileContext to enable full offline testing without live database dependencies.
 */

export const PROFILE_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const profileService = {
  /**
   * Fetches the authenticated user's Master Career Profile.
   * Target endpoint: GET /api/v1/profile
   */
  async getProfile() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      source: 'local_draft',
    };
  },

  /**
   * Updates personal contact and headline information.
   * Target endpoint: PUT /api/v1/profile/personal
   */
  async updatePersonal(data) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data, isSimulated: true };
  },

  /**
   * Synchronizes career tracks with Spring Boot.
   * Target endpoint: POST /api/v1/career-tracks
   */
  async saveCareerTrack(track) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, track, isSimulated: true };
  },

  /**
   * Deletes a career track by ID.
   * Target endpoint: DELETE /api/v1/career-tracks/{id}
   */
  async deleteCareerTrack(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, id, isSimulated: true };
  },
};
