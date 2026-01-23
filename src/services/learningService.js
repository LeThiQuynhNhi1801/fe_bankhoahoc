import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const learningService = {
  /**
   * Lấy danh sách chương của khóa học
   * API: GET /api/chapters/course/{courseId}
   * - Ai cũng có thể xem, nhưng chỉ học viên đã mua mới thấy nội dung chi tiết
   * @param {number} courseId - ID của khóa học
   * @returns {Promise} Danh sách chapters (với đầy đủ nội dung nếu đã mua)
   */
  async getCourseChapters(courseId) {
    try {
      return await httpClient.get(API_ENDPOINTS.LEARNING.GET_COURSE_CHAPTERS(courseId))
    } catch (error) {
      console.error('Get course chapters (learning) error:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết chương để học
   * API: GET /api/chapters/{id}
   * - Nếu đã mua khóa học sẽ thấy đầy đủ nội dung, nếu chưa chỉ thấy thông tin cơ bản
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Chi tiết chapter với contents (nếu đã mua)
   */
  async getChapterDetail(chapterId) {
    try {
      return await httpClient.get(API_ENDPOINTS.LEARNING.GET_CHAPTER_DETAIL(chapterId))
    } catch (error) {
      console.error('Get chapter detail (learning) error:', error)
      throw error
    }
  },

  /**
   * Lấy danh sách tài liệu/nội dung của chương (cho học viên)
   * API: GET /api/learning/chapters/{chapterId}/contents
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Danh sách contents (tài liệu, videos)
   */
  async getChapterContents(chapterId) {
    try {
      return await httpClient.get(API_ENDPOINTS.LEARNING.GET_CHAPTER_CONTENTS(chapterId))
    } catch (error) {
      console.error('Get chapter contents (learning) error:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết nội dung học (video, bài giảng)
   * API: GET /api/course-contents/{contentId}
   * @param {number} contentId - ID của content
   * @returns {Promise} Chi tiết content với videoUrl, description, etc.
   */
  async getContentDetail(contentId) {
    try {
      return await httpClient.get(API_ENDPOINTS.LEARNING.GET_CONTENT_DETAIL(contentId))
    } catch (error) {
      console.error('Get content detail (learning) error:', error)
      throw error
    }
  }
}
