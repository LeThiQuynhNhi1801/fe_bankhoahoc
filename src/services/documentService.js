import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const documentService = {
  /**
   * Upload tài liệu cho chương (Admin/Instructor)
   * @param {number} chapterId - ID của chương
   * @param {FormData} formData - FormData chứa file và type
   * @returns {Promise}
   */
  async upload(chapterId, formData) {
    try {
      return await httpClient.upload(API_ENDPOINTS.DOCUMENTS.UPLOAD(chapterId), formData)
    } catch (error) {
      console.error('Upload document error:', error)
      throw error
    }
  },

  /**
   * Xóa tài liệu (Admin/Instructor)
   * @param {number} chapterId - ID của chương
   * @param {number} docId - ID của document
   * @returns {Promise}
   */
  async delete(chapterId, docId) {
    try {
      return await httpClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(chapterId, docId))
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  },

  /**
   * Tải tài liệu (Admin/Instructor)
   * @param {number} chapterId - ID của chương
   * @param {number} docId - ID của document
   * @returns {Promise}
   */
  async download(chapterId, docId) {
    try {
      const url = API_ENDPOINTS.DOCUMENTS.DOWNLOAD(chapterId, docId)
      const token = localStorage.getItem('token')
      
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = docId
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      return true
    } catch (error) {
      console.error('Download document error:', error)
      throw error
    }
  },

  /**
   * Xem tài liệu của chapter (Student only)
   * @param {number} chapterId - ID của chương
   * @returns {Promise} Document data hoặc file
   */
  async getChapterDocument(chapterId) {
    try {
      return await httpClient.get(API_ENDPOINTS.FILES.GET_CHAPTER_DOCUMENT(chapterId))
    } catch (error) {
      console.error('Get chapter document error:', error)
      throw error
    }
  },

  /**
   * Tải file (Admin/Instructor only)
   * @param {string} filePath - Đường dẫn file
   * @returns {Promise}
   */
  async downloadFile(filePath) {
    try {
      const url = API_ENDPOINTS.FILES.DOWNLOAD + `?path=${encodeURIComponent(filePath)}`
      const token = localStorage.getItem('token')
      
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filePath.split('/').pop() || 'file'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      return true
    } catch (error) {
      console.error('Download file error:', error)
      throw error
    }
  }
}
