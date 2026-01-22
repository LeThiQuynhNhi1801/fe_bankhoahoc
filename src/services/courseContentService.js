import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const courseContentService = {
  /**
   * Lấy chi tiết nội dung
   * @param {number} contentId - ID của content
   * @returns {Promise} Chi tiết content
   */
  async getById(contentId) {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSE_CONTENTS.GET(contentId))
    } catch (error) {
      console.error('Get course content error:', error)
      throw error
    }
  },

  /**
   * Lấy danh sách nội dung của chương
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Danh sách contents
   */
  async getByChapter(chapterId) {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSE_CONTENTS.GET_BY_CHAPTER(chapterId))
    } catch (error) {
      console.error('Get course contents by chapter error:', error)
      throw error
    }
  },

  /**
   * Tạo nội dung mới
   * @param {number} chapterId - ID của chương
   * @param {Object} contentData - Dữ liệu nội dung (title, description, orderIndex, etc.)
   * @returns {Promise} Content đã tạo
   */
  async create(chapterId, contentData) {
    try {
      return await httpClient.post(API_ENDPOINTS.COURSE_CONTENTS.CREATE(chapterId), contentData)
    } catch (error) {
      console.error('Create course content error:', error)
      throw error
    }
  },

  /**
   * Cập nhật nội dung
   * @param {number} contentId - ID của content
   * @param {Object} contentData - Dữ liệu cập nhật
   * @returns {Promise} Content đã cập nhật
   */
  async update(contentId, contentData) {
    try {
      return await httpClient.put(API_ENDPOINTS.COURSE_CONTENTS.UPDATE(contentId), contentData)
    } catch (error) {
      console.error('Update course content error:', error)
      throw error
    }
  },

  /**
   * Xóa nội dung
   * @param {number} contentId - ID của content
   * @returns {Promise}
   */
  async delete(contentId) {
    try {
      return await httpClient.delete(API_ENDPOINTS.COURSE_CONTENTS.DELETE(contentId))
    } catch (error) {
      console.error('Delete course content error:', error)
      throw error
    }
  },

  /**
   * Upload video cho nội dung
   * @param {number} contentId - ID của content
   * @param {FormData} formData - FormData chứa file video
   * @returns {Promise}
   */
  async uploadVideo(contentId, formData) {
    try {
      return await httpClient.upload(API_ENDPOINTS.COURSE_CONTENTS.UPLOAD_VIDEO(contentId), formData)
    } catch (error) {
      console.error('Upload video error:', error)
      throw error
    }
  }
}
