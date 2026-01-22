import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const videoService = {
  /**
   * Upload video cho course content
   * @param {number} contentId - ID của course content
   * @param {FormData} formData - FormData chứa file video
   * @returns {Promise}
   */
  async upload(contentId, formData) {
    try {
      return await httpClient.upload(API_ENDPOINTS.VIDEOS.UPLOAD(contentId), formData)
    } catch (error) {
      console.error('Upload video error:', error)
      throw error
    }
  }
}
