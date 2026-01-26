<template>
  <div class="course-learning">
    <div v-if="isLoading" class="loading">
      <p>Đang tải nội dung khóa học...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadCourse" class="btn-retry">Thử lại</button>
    </div>

    <div v-else-if="!course" class="no-course">
      <p>Khóa học không tồn tại hoặc bạn chưa mua khóa học này.</p>
      <router-link to="/my-courses" class="btn-back">Quay lại khóa học của tôi</router-link>
    </div>

    <div v-else class="learning-container">
      <!-- Sidebar với danh sách chapters -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3>{{ course.title }}</h3>
          <button @click="sidebarCollapsed = !sidebarCollapsed" class="btn-toggle-sidebar">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>
        <div class="progress-section">
          <div class="progress-info">
            <span>Tiến độ: {{ progress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
        <div class="chapters-list">
          <div v-if="chapters.length === 0" class="no-chapters">
            <p>Chưa có chương nào trong khóa học này.</p>
          </div>
          <div
            v-for="(chapter, index) in chapters"
            :key="chapter.id"
            :class="['chapter-item', { active: selectedChapter?.id === chapter.id }]"
            @click="selectChapter(chapter)"
          >
            <div class="chapter-header">
              <span class="chapter-number">{{ index + 1 }}</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <span v-if="isChapterCompleted(chapter)" class="chapter-check">✓</span>
            </div>
            <div class="chapter-meta-info">
              <span v-if="chapter.documents && chapter.documents.length > 0" class="chapter-docs-count">
                {{ chapter.documents.length }} tài liệu
              </span>
              <span v-if="chapter.contents && chapter.contents.length > 0" class="chapter-contents-count">
                {{ chapter.contents.length }} bài học
              </span>
              <span v-if="chapter.contentCount > 0" class="chapter-contents-count">
                {{ chapter.contentCount }} bài học
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content area -->
      <div class="main-content">
        <div v-if="!selectedChapter" class="welcome-screen">
          <h2>Chào mừng đến với khóa học!</h2>
          <p>Chọn một chương từ danh sách bên trái để bắt đầu học.</p>
        </div>

        <div v-else class="chapter-content">
          <div class="chapter-header-content">
            <button @click="goToPreviousChapter" class="btn-nav" :disabled="!hasPreviousChapter">
              ← Chương trước
            </button>
            <h2>{{ selectedChapter.title }}</h2>
            <button @click="goToNextChapter" class="btn-nav" :disabled="!hasNextChapter">
              Chương sau →
            </button>
          </div>

          <div v-if="selectedChapter.description" class="chapter-description">
            <p>{{ selectedChapter.description }}</p>
          </div>

          <!-- Documents Section - danh sách tài liệu của chương -->
          <div v-if="getChapterDocuments().length > 0" class="documents-section">
            <h3>📄 Tài Liệu</h3>
            <div class="documents-list">
              <div
                v-for="doc in getChapterDocuments()"
                :key="doc.id || doc.name"
                class="document-card"
                @click="viewDocument(doc)"
              >
                <div class="document-icon">📄</div>
                <div class="document-info">
                  <h4>{{ doc.title || doc.name || 'Tài liệu' }}</h4>
                  <p class="document-meta">
                    {{ doc.description || 'Tài liệu đính kèm' }}
                  </p>
                </div>
                <button 
                  type="button"
                  class="btn-download"
                >
                  📖 Xem trong khung
                </button>
              </div>
            </div>

            <!-- Khung hiển thị nội dung tài liệu -->
            <div v-if="selectedDocument" class="document-viewer">
              <h3>Nội dung tài liệu</h3>
              <div class="document-viewer-frame-wrapper">
                <iframe
                  v-if="getDocumentViewerUrl(selectedDocument)"
                  class="document-frame"
                  :src="getDocumentViewerUrl(selectedDocument)"
                  frameborder="0"
                ></iframe>
                <p v-else class="document-viewer-message">
                  Không thể hiển thị tài liệu này. Vui lòng liên hệ giảng viên.
                </p>
              </div>
            </div>
          </div>

          <!-- Contents Section (Videos với videoUrl) -->
          <div v-if="getChapterVideos().length > 0" class="contents-section">
            <h3>🎥 Video</h3>
            <div class="contents-list">
              <div
                v-for="content in getChapterVideos()"
                :key="content.id"
                class="content-card"
              >
                <div class="content-icon">🎥</div>
                <div class="content-info">
                  <h4>{{ content.title }}</h4>
                  <p class="content-meta">
                    {{ content.duration ? `⏱️ ${formatDuration(content.duration)}` : '' }}
                    {{ content.isPreview ? ' • Xem trước' : '' }}
                  </p>
                  <p v-if="content.description" class="content-description">
                    {{ content.description }}
                  </p>
                </div>
                <button 
                  @click="viewContent(content)" 
                  class="btn-view-content"
                  :disabled="isLoadingContent"
                >
                  {{ isLoadingContent ? 'Đang tải...' : '▶ Xem' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Mark as completed button -->
          <div class="chapter-actions">
            <button
              @click="markChapterCompleted"
              :class="['btn-complete', { completed: isChapterCompleted(selectedChapter) }]"
              :disabled="isUpdatingProgress"
            >
              {{ isChapterCompleted(selectedChapter) ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courseService } from '../services/courseService'
import { learningService } from '../services/learningService'
import { documentService } from '../services/documentService'
import { enrollmentService } from '../services/enrollmentService'

export default {
  name: 'CourseLearning',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseIdParam = route.params.id
    const courseId = courseIdParam ? parseInt(courseIdParam) : null
    
    // Validate courseId
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      console.error('Invalid courseId:', courseIdParam)
      // Redirect to my-courses if invalid
      setTimeout(() => {
        router.push('/my-courses')
      }, 100)
    }
    
    const course = ref(null)
    const chapters = ref([])
    const selectedChapter = ref(null)
    const chapterDocuments = ref([]) // Danh sách tài liệu từ API /api/learning/chapters/{chapterId}/contents
    const selectedDocument = ref(null) // Tài liệu đang được xem trong khung
    const isLoading = ref(false)
    const error = ref(null)
    const sidebarCollapsed = ref(false)
    const isUpdatingProgress = ref(false)
    const enrollment = ref(null)
    const progress = ref(0)
    const isLoadingContent = ref(false)
    const selectedContent = ref(null)

    const loadCourse = async () => {
      // Validate courseId before making requests
      if (!courseId || isNaN(courseId) || courseId <= 0) {
        error.value = 'ID khóa học không hợp lệ.'
        isLoading.value = false
        return
      }

      try {
        isLoading.value = true
        error.value = null

        // Load course detail
        const courseResponse = await courseService.getById(courseId)
        course.value = courseResponse?.data ?? courseResponse

        if (!course.value) {
          error.value = 'Khóa học không tồn tại.'
          isLoading.value = false
          return
        }

        // Load chapters - API: GET /api/chapters/course/{courseId}
        // API tự động phân biệt đã mua hay chưa dựa trên token
        try {
          const chaptersResponse = await learningService.getCourseChapters(courseId)
          console.log('Chapters response:', chaptersResponse)
          const chaptersData = chaptersResponse?.data ?? chaptersResponse
          console.log('Chapters data:', chaptersData)
          chapters.value = Array.isArray(chaptersData) ? chaptersData : []
          console.log('Chapters loaded:', chapters.value.length, 'chapters')
        } catch (err) {
          console.error('Failed to load chapters:', err)
          error.value = `Không thể tải danh sách chương: ${err?.message || 'Lỗi không xác định'}`
          chapters.value = []
        }

        // Load enrollment to get progress
        try {
          const enrollmentsResponse = await enrollmentService.getMyEnrollments()
          const enrollmentsData = enrollmentsResponse?.data ?? enrollmentsResponse
          const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : []
          enrollment.value = enrollments.find(e => {
            const eCourseId = e.course?.id || e.courseId
            return eCourseId && parseInt(eCourseId) === courseId
          })
          
          if (enrollment.value) {
            const progressValue = enrollment.value.progress
            progress.value = (progressValue && !isNaN(progressValue)) ? Math.max(0, Math.min(100, progressValue)) : 0
          }
        } catch (err) {
          console.warn('Could not load enrollment:', err)
        }

        // Select first chapter if available
        if (chapters.value.length > 0) {
          selectChapter(chapters.value[0])
        }
      } catch (err) {
        error.value = 'Không thể tải nội dung khóa học. Vui lòng thử lại sau.'
        console.error('Load course error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const selectChapter = async (chapter) => {
      selectedChapter.value = chapter
      
      // Load danh sách tài liệu từ API: GET /api/learning/chapters/{chapterId}/contents
      if (chapter.id) {
        try {
          const contentsResponse = await learningService.getChapterContents(chapter.id)
          const contentsData = contentsResponse?.data ?? contentsResponse
          const contents = Array.isArray(contentsData) ? contentsData : []
          
          // Lọc tài liệu (có fileUrl hoặc documentUrl, không có videoUrl)
          chapterDocuments.value = contents.filter(content => {
            return (content.fileUrl || content.documentUrl) && !content.videoUrl
          })
          
          // Load full chapter details with contents if not already loaded
          if (!chapter.contents || chapter.contents.length === 0) {
            try {
              const chapterDetail = await learningService.getChapterDetail(chapter.id)
              const chapterData = chapterDetail?.data ?? chapterDetail
              
              // Update chapter in list
              const index = chapters.value.findIndex(c => c.id === chapter.id)
              if (index !== -1 && chapterData) {
                chapters.value[index] = { ...chapters.value[index], ...chapterData }
                selectedChapter.value = chapters.value[index]
              }
            } catch (err) {
              console.warn('Could not load chapter detail:', err)
            }
          }
        } catch (err) {
          console.error('Could not load chapter contents:', err)
          chapterDocuments.value = []
        }
      } else {
        chapterDocuments.value = []
      }
    }

    const hasPreviousChapter = computed(() => {
      if (!selectedChapter.value) return false
      const index = chapters.value.findIndex(c => c.id === selectedChapter.value.id)
      return index > 0
    })

    const hasNextChapter = computed(() => {
      if (!selectedChapter.value) return false
      const index = chapters.value.findIndex(c => c.id === selectedChapter.value.id)
      return index < chapters.value.length - 1
    })

    const goToPreviousChapter = () => {
      if (!hasPreviousChapter.value) return
      const index = chapters.value.findIndex(c => c.id === selectedChapter.value.id)
      selectChapter(chapters.value[index - 1])
    }

    const goToNextChapter = () => {
      if (!hasNextChapter.value) return
      const index = chapters.value.findIndex(c => c.id === selectedChapter.value.id)
      selectChapter(chapters.value[index + 1])
    }

    const getDocumentViewerUrl = (doc) => {
      if (!doc) return ''

      const rawUrl = doc.fileUrl || doc.documentUrl || doc.url
      if (!rawUrl) return ''

      const url = String(rawUrl)
      const lower = url.toLowerCase()

      // Nếu là file Office (doc, docx, xls, xlsx, ppt, pptx) thì dùng Office Online Viewer để nhúng
      if (lower.endsWith('.doc') || lower.endsWith('.docx') ||
          lower.endsWith('.xls') || lower.endsWith('.xlsx') ||
          lower.endsWith('.ppt') || lower.endsWith('.pptx')) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
      }

      // Các loại file khác (pdf, hình ảnh, v.v.) hiển thị trực tiếp
      return url
    }

    const viewDocument = (doc) => {
      // Student chỉ được xem: lưu document đang chọn để hiển thị trong khung, không mở tab mới/không tải về
      selectedDocument.value = doc
    }

    const isChapterCompleted = (chapter) => {
      // This would need to be tracked - for now, we'll use a simple check
      // In a real app, this would come from the enrollment progress data
      return false // Placeholder
    }

    const markChapterCompleted = async () => {
      if (!enrollment.value) {
        alert('Không tìm thấy thông tin đăng ký khóa học.')
        return
      }

      const enrollmentId = enrollment.value.id
      if (!enrollmentId || isNaN(enrollmentId) || enrollmentId <= 0) {
        alert('Thông tin đăng ký không hợp lệ.')
        return
      }

      try {
        isUpdatingProgress.value = true
        
        // Calculate new progress
        const totalChapters = chapters.value.length
        if (totalChapters === 0) {
          alert('Khóa học chưa có chương nào.')
          return
        }
        
        const completedChapters = chapters.value.filter(c => isChapterCompleted(c)).length + 1
        const newProgress = Math.round((completedChapters / totalChapters) * 100)
        
        // Ensure progress is valid (0-100)
        const validProgress = Math.max(0, Math.min(100, newProgress))

        await enrollmentService.updateProgress(enrollmentId, validProgress)
        progress.value = validProgress
        
        alert('Đã đánh dấu chương hoàn thành!')
      } catch (err) {
        console.error('Update progress error:', err)
        alert('Không thể cập nhật tiến độ. Vui lòng thử lại sau.')
      } finally {
        isUpdatingProgress.value = false
      }
    }

    const getDocumentIcon = (type) => {
      const typeMap = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📊',
        'pptx': '📊',
        'video': '🎥',
        'mp4': '🎥',
        'zip': '📦',
        'rar': '📦'
      }
      return typeMap[type?.toLowerCase()] || '📄'
    }

    const getChapterDocuments = () => {
      // API: Lấy danh sách tài liệu từ /api/learning/chapters/{chapterId}/contents
      // Tài liệu đã được load trong selectChapter và lưu trong chapterDocuments
      return chapterDocuments.value || []
    }

    const getChapterVideos = () => {
      if (!selectedChapter.value) return []
      
      // API mới: Video là contents có videoUrl
      const contents = selectedChapter.value.contents || []
      return contents.filter(content => content.videoUrl)
    }

    const viewContent = async (content) => {
      try {
        isLoadingContent.value = true
        
        // API mới: sử dụng videoUrl trực tiếp từ content
        if (content.videoUrl) {
          window.open(content.videoUrl, '_blank')
          return
        }
        
        // Fallback: Load full content detail nếu chưa có videoUrl
        if (content.id) {
          const contentDetail = await learningService.getContentDetail(content.id)
          const contentData = contentDetail?.data ?? contentDetail
          selectedContent.value = contentData || content
          
          if (selectedContent.value.videoUrl) {
            window.open(selectedContent.value.videoUrl, '_blank')
            return
          }
        } else {
          selectedContent.value = content
        }
        
        // Nếu vẫn không có videoUrl
        if (!selectedContent.value.videoUrl) {
          alert('Nội dung chưa có video. Vui lòng liên hệ giảng viên.')
        }
      } catch (err) {
        console.error('View content error:', err)
        alert('Không thể tải nội dung. Vui lòng thử lại sau.')
      } finally {
        isLoadingContent.value = false
      }
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return ''
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    onMounted(() => {
      loadCourse()
    })

    return {
      course,
      chapters,
      selectedChapter,
      selectedDocument,
      isLoading,
      error,
      sidebarCollapsed,
      isUpdatingProgress,
      progress,
      isLoadingContent,
      selectedContent,
      hasPreviousChapter,
      hasNextChapter,
      loadCourse,
      selectChapter,
      goToPreviousChapter,
      goToNextChapter,
      getChapterDocuments,
      getChapterVideos,
      viewContent,
      viewDocument,
      getDocumentViewerUrl,
      isChapterCompleted,
      markChapterCompleted,
      getDocumentIcon,
      formatFileSize,
      formatDuration
    }
  }
}
</script>

<style scoped>
.course-learning {
  min-height: calc(100vh - 200px);
  background: #f9fafb;
}

.loading, .error, .no-course {
  text-align: center;
  padding: 3rem;
}

.error {
  color: #dc3545;
}

.btn-retry, .btn-back {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-retry:hover, .btn-back:hover {
  background: #4338CA;
}

.learning-container {
  display: flex;
  height: calc(100vh - 200px);
}

.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar.collapsed .sidebar-header h3 {
  display: none;
}

.btn-toggle-sidebar {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
}

.progress-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar.collapsed .progress-section {
  display: none;
}

.progress-info {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s;
}

.chapters-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.no-chapters {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.chapter-item {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.chapter-item:hover {
  background: #f9fafb;
}

.chapter-item.active {
  background: #eef2ff;
  border-left-color: #4F46E5;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chapter-number {
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.chapter-item.active .chapter-number {
  background: #4F46E5;
  color: white;
}

.chapter-title {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.chapter-check {
  color: #10b981;
  font-weight: bold;
}

.chapter-meta-info {
  margin-top: 0.5rem;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.chapter-docs-count,
.chapter-contents-count {
  font-size: 0.875rem;
  color: #666;
}

.sidebar.collapsed .chapter-title,
.sidebar.collapsed .chapter-check,
.sidebar.collapsed .chapter-meta-info {
  display: none;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.welcome-screen {
  text-align: center;
  padding: 4rem 2rem;
}

.welcome-screen h2 {
  color: #333;
  margin-bottom: 1rem;
}

.welcome-screen p {
  color: #666;
  font-size: 1.1rem;
}

.chapter-content {
  max-width: 900px;
  margin: 0 auto;
}

.chapter-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.chapter-header-content h2 {
  flex: 1;
  margin: 0;
  color: #333;
}

.btn-nav {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-nav:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chapter-description {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.documents-section {
  margin-bottom: 2rem;
}

.documents-section h3 {
  color: #333;
  margin-bottom: 1rem;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.document-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-icon {
  font-size: 2rem;
}

.document-info {
  flex: 1;
}

.document-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.document-meta {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.btn-download {
  padding: 0.5rem 1rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-download:hover:not(:disabled) {
  background: #4338CA;
}

.btn-download:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.document-viewer {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.document-viewer h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
}

.document-viewer-frame-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: white;
}

.document-frame {
  width: 100%;
  height: 600px;
  border: none;
}

.document-viewer-message {
  margin: 1rem;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.no-documents {
  padding: 2rem;
  text-align: center;
  color: #666;
  background: white;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
}

.contents-section {
  margin-bottom: 2rem;
}

.contents-section h3 {
  color: #333;
  margin-bottom: 1rem;
}

.contents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.content-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-icon {
  font-size: 2rem;
}

.content-info {
  flex: 1;
}

.content-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.content-meta {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.875rem;
}

.content-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-view-content {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-view-content:hover:not(:disabled) {
  background: #059669;
}

.btn-view-content:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.chapter-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-complete {
  padding: 0.75rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-complete:hover:not(:disabled) {
  background: #059669;
}

.btn-complete.completed {
  background: #6b7280;
}

.btn-complete:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
