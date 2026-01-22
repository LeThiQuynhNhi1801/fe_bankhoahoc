import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const learningService = {
  /**
   * Lấy danh sách chương của khóa học đã mua
   * @param {number} courseId - ID của khóa học
   * @returns {Promise} Danh sách chapters với đầy đủ nội dung
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
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Chi tiết chapter với contents
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
   * Lấy danh sách nội dung của chương
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Danh sách contents (videos, bài giảng)
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
