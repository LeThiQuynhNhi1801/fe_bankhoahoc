<template>
  <div class="course-detail" v-if="course">
    <div class="container">
      <div class="course-header">
        <div class="course-main-info">
          <span class="course-category">{{ course.category }}</span>
          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-instructor">Giảng viên: {{ course.instructor }}</p>
          <div class="course-stats">
            <span>⭐ {{ course.rating }} ({{ course.reviews }} đánh giá)</span>
            <span>👥 {{ course.students }} học viên</span>
            <span>⏱️ {{ course.duration }}</span>
            <span>📅 Cập nhật: {{ course.lastUpdated }}</span>
          </div>
        </div>
        <div class="course-sidebar">
          <div class="course-preview">
            <img :src="course.image" :alt="course.title">
          </div>
          <div class="course-purchase">
            <div class="price-section">
              <span class="price">{{ formatPrice(course.price) }}</span>
              <span v-if="course.originalPrice" class="original-price">
                {{ formatPrice(course.originalPrice) }}
              </span>
            </div>
            <button @click="addToCart" class="btn btn-primary btn-large">
              Thêm Vào Giỏ Hàng
            </button>
            <button @click="buyNow" class="btn btn-secondary btn-large">
              Mua Ngay
            </button>
            <div class="guarantee">
              <p>✅ 30 ngày hoàn tiền</p>
              <p>✅ Truy cập trọn đời</p>
              <p>✅ Chứng chỉ hoàn thành</p>
            </div>
          </div>

        </div>
      </div>

      <div class="course-content">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'overview'" class="tab-panel">
            <h2>Mô Tả Khóa Học</h2>
            <p>{{ course.description }}</p>
            <h3>Bạn Sẽ Học Được Gì?</h3>
            <ul class="learning-points">
              <li v-for="point in course.learningPoints" :key="point">
                {{ point }}
              </li>
            </ul>
            <h3>Yêu Cầu</h3>
            <ul class="requirements">
              <li v-for="req in course.requirements" :key="req">
                {{ req }}
              </li>
            </ul>
          </div>

          <div v-if="activeTab === 'curriculum'" class="tab-panel">
            <div class="curriculum-header">
              <h2>Nội Dung Khóa Học</h2>
              <button 
                v-if="canManageCourse"
                @click="showAddChapterForm = !showAddChapterForm"
                class="btn btn-primary btn-small"
              >
                {{ showAddChapterForm ? 'Hủy' : '+ Thêm Chương Mới' }}
              </button>
            </div>

            <!-- Form thêm chương mới -->
            <div v-if="showAddChapterForm && canManageCourse" class="add-chapter-form">
              <h3>Thêm Chương Mới</h3>
              <div class="form-group">
                <label>Tên Chương *</label>
                <input 
                  v-model="newChapter.title" 
                  type="text" 
                  placeholder="Nhập tên chương"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Mô Tả</label>
                <textarea 
                  v-model="newChapter.description" 
                  rows="3"
                  placeholder="Nhập mô tả chương (tùy chọn)"
                  class="form-textarea"
                ></textarea>
              </div>
              <div class="form-group">
                <label>
                  <input 
                    v-model="newChapter.isPublished" 
                    type="checkbox"
                  />
                  Public ngay sau khi tạo
                </label>
              </div>
              <div class="form-actions">
                <button @click="addNewChapter" class="btn btn-primary" :disabled="isAddingChapter">
                  {{ isAddingChapter ? 'Đang thêm...' : 'Thêm Chương' }}
                </button>
                <button @click="cancelAddChapter" class="btn btn-secondary">Hủy</button>
              </div>
            </div>

            <div class="curriculum">
              <div 
                v-for="(chapter, chapterIndex) in course.chapters" 
                :key="chapter.id || chapterIndex"
                class="curriculum-chapter"
              >
                <div class="chapter-header" @click="toggleChapter(chapterIndex)">
                  <h3>{{ chapter.title }}</h3>
                  <div class="chapter-actions">
                    <span class="chapter-order">Chương {{ chapter.orderIndex || (chapterIndex + 1) }}</span>
                    <span class="chapter-toggle">{{ expandedChapters[chapterIndex] ? '▼' : '▶' }}</span>
                  </div>
                </div>
                
                <div v-if="expandedChapters[chapterIndex]" class="chapter-content">
                  <!-- Lessons/Bài học -->
                  <div v-if="chapter.lessons && chapter.lessons.length > 0" class="chapter-section">
                    <h4>📚 Bài Học</h4>
                    <div class="lessons">
                      <div 
                        v-for="(lesson, lessonIndex) in chapter.lessons" 
                        :key="lessonIndex"
                        class="lesson-item"
                      >
                        <span class="lesson-number">{{ lessonIndex + 1 }}</span>
                        <span class="lesson-title">{{ lesson.title }}</span>
                        <span class="lesson-duration">{{ lesson.duration }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Documents/Tài liệu -->
                  <div v-if="chapter.documentUrl || (chapter.documents && chapter.documents.length > 0)" class="chapter-section">
                    <h4>📄 Tài Liệu</h4>
                    <div class="documents-grid">
                      <!-- API mới: sử dụng documentUrl -->
                      <div v-if="chapter.documentUrl" class="document-item">
                        <div class="document-icon">📄</div>
                        <div class="document-info">
                          <p class="document-name">Tài liệu chương</p>
                          <p class="document-meta">Tài liệu đính kèm</p>
                        </div>
                        <button @click="downloadDocument({ documentUrl: chapter.documentUrl, name: 'Tài liệu chương' })" class="btn-download">⬇ Tải xuống</button>
                      </div>
                      <!-- Fallback: documents array -->
                      <div 
                        v-for="(doc, docIndex) in chapter.documents" 
                        :key="docIndex"
                        class="document-item"
                      >
                        <div class="document-icon">{{ getDocumentIcon(doc.type) }}</div>
                        <div class="document-info">
                          <p class="document-name">{{ doc.name || 'Tài liệu' }}</p>
                          <p class="document-meta">{{ doc.size ? doc.size + ' • ' : '' }}{{ doc.type ? doc.type.toUpperCase() : '' }}</p>
                        </div>
                        <button @click="downloadDocument(doc)" class="btn-download">⬇ Tải xuống</button>
                      </div>
                    </div>
                  </div>

                  <!-- Videos/Contents -->
                  <div v-if="(chapter.contents && chapter.contents.length > 0) || (chapter.videos && chapter.videos.length > 0)" class="chapter-section">
                    <h4>🎥 Video</h4>
                    <div class="videos-grid">
                      <!-- API mới: sử dụng contents array với videoUrl -->
                      <div 
                        v-for="(content, contentIndex) in chapter.contents" 
                        :key="contentIndex"
                        class="video-item"
                      >
                        <div class="video-icon">🎥</div>
                        <div class="video-info">
                          <p class="video-name">{{ content.title || 'Video' }}</p>
                          <p class="video-meta">
                            {{ content.duration ? formatDuration(content.duration) + ' • ' : '' }}
                            {{ content.isPreview ? 'Xem trước' : '' }}
                          </p>
                        </div>
                        <button @click="playVideo(content)" class="btn-play">▶ Xem</button>
                      </div>
                      <!-- Fallback: videos array -->
                      <div 
                        v-for="(video, videoIndex) in chapter.videos" 
                        :key="videoIndex"
                        class="video-item"
                      >
                        <div class="video-icon">🎥</div>
                        <div class="video-info">
                          <p class="video-name">{{ video.name || 'Video' }}</p>
                          <p class="video-meta">{{ video.duration ? video.duration + ' • ' : '' }}{{ video.size || '' }}</p>
                        </div>
                        <button @click="playVideo(video)" class="btn-play">▶ Xem</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <h2>Đánh Giá</h2>
            <div class="reviews">
              <div 
                v-for="review in course.reviewsList" 
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <strong>{{ review.user }}</strong>
                  <div class="review-rating">
                    ⭐ {{ review.rating }}/5
                  </div>
                </div>
                <p>{{ review.comment }}</p>
                <span class="review-date">{{ review.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="loading">
    <p>Đang tải...</p>
  </div>
  <div v-else-if="error" class="error-message">
    <p>{{ error }}</p>
    <button @click="loadCourse" class="btn btn-primary">Thử lại</button>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courseService } from '../services/courseService'
import { chapterService } from '../services/chapterService'
import { documentService } from '../services/documentService'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'CourseDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['add-to-cart'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const { isAdmin, isTeacher } = useAuth()
    const course = ref(null)
    const activeTab = ref('overview')
    const expandedChapters = reactive({})
    const isLoading = ref(false)
    const error = ref(null)
    const showAddChapterForm = ref(false)
    const isAddingChapter = ref(false)
    const newChapter = reactive({
      title: '',
      description: '',
      isPublished: false
    })

    const tabs = [
      { id: 'overview', label: 'Tổng Quan' },
      { id: 'curriculum', label: 'Nội Dung' },
      { id: 'reviews', label: 'Đánh Giá' }
    ]

    const canManageCourse = computed(() => {
      return isAdmin.value || isTeacher.value
    })


    const loadCourse = async () => {
      try {
        isLoading.value = true
        error.value = null
        const courseId = parseInt(props.id)
        
        const courseData = await courseService.getById(courseId)
        
        // Load chapters if not included
        if (!courseData.chapters || courseData.chapters.length === 0) {
          try {
            const chapters = await chapterService.getList(courseId)
            courseData.chapters = chapters
          } catch (err) {
            console.warn('Could not load chapters:', err)
            courseData.chapters = []
          }
        }
        
        course.value = courseData
        
        // Mở rộng chapter đầu tiên mặc định
        if (course.value && course.value.chapters && course.value.chapters.length > 0) {
          expandedChapters[0] = true
        }
      } catch (err) {
        console.error('Failed to load course:', err)
        error.value = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      loadCourse()
    })

    const toggleChapter = (index) => {
      expandedChapters[index] = !expandedChapters[index]
    }

    const getDocumentIcon = (type) => {
      const icons = {
        pdf: '📕',
        word: '📄',
        excel: '📊',
        video: '🎥'
      }
      return icons[type] || '📁'
    }

    const downloadDocument = async (doc) => {
      try {
        // API mới: sử dụng documentUrl
        if (doc.documentUrl) {
          documentService.viewDocument(doc.documentUrl)
          return
        }
        
        // Fallback: thử các cách khác
        if (doc.url) {
          documentService.viewDocument(doc.url)
          return
        }
        
        // Nếu không có URL, thử download từ API
        if (doc.id && doc.chapterId) {
          await documentService.download(doc.chapterId, doc.id)
          return
        }
        
        alert(`Đang tải xuống: ${doc.name || 'Tài liệu'}`)
      } catch (err) {
        console.error('Download document error:', err)
        alert('Không thể tải tài liệu. Vui lòng thử lại sau.')
      }
    }

    const playVideo = (video) => {
      // API mới: sử dụng videoUrl từ content
      if (video.videoUrl) {
        window.open(video.videoUrl, '_blank')
        return
      }
      
      // Fallback: thử url
      if (video.url) {
        window.open(video.url, '_blank')
        return
      }
      
      alert(`Đang phát video: ${video.title || video.name || 'Video'}`)
    }

    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const addToCart = async () => {
      // Kiểm tra token trước
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Vui lòng đăng nhập để thêm khóa học vào giỏ hàng!')
        router.push('/login')
        return
      }

      try {
        // Thử gọi API cart trước
        const { cartService } = await import('../services/cartService')
        await cartService.addItem(course.value.id)
        emit('add-to-cart')
        alert('Đã thêm vào giỏ hàng!')
      } catch (error) {
        console.error('Failed to add to cart via API:', error)
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          data: error.data
        })
        
        // Nếu API cart không tồn tại (404) hoặc lỗi khác, dùng localStorage làm fallback
        if (error.status === 404 || error.status === 500) {
          console.log('Cart API not available, using localStorage fallback')
          try {
            // Lấy cart từ localStorage
            let cart = JSON.parse(localStorage.getItem('cart') || '[]')
            
            // Kiểm tra xem course đã có trong cart chưa (kiểm tra cả ID và courseId)
            const courseId = course.value.id
            const existingIndex = cart.findIndex(item => {
              if (typeof item === 'number' || typeof item === 'string') {
                return parseInt(item) === courseId
              }
              return (item.id === courseId || item.courseId === courseId)
            })
            
            if (existingIndex === -1) {
              // Thêm course object đầy đủ vào cart
              const courseItem = {
                id: course.value.id,
                courseId: course.value.id,
                title: course.value.title,
                price: course.value.price || 0,
                thumbnail: course.value.thumbnail,
                image: course.value.thumbnail || course.value.image || '/placeholder-course.jpg',
                quantity: 1
              }
              cart.push(courseItem)
              localStorage.setItem('cart', JSON.stringify(cart))
              emit('add-to-cart')
              alert('Đã thêm vào giỏ hàng!')
            } else {
              // Nếu đã có, tăng quantity nếu là object, hoặc convert sang object
              if (typeof cart[existingIndex] === 'object') {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1
                localStorage.setItem('cart', JSON.stringify(cart))
                emit('add-to-cart')
                alert('Đã cập nhật số lượng trong giỏ hàng!')
              } else {
                // Convert ID thành object
                const courseItem = {
                  id: course.value.id,
                  courseId: course.value.id,
                  title: course.value.title,
                  price: course.value.price || 0,
                  thumbnail: course.value.thumbnail,
                  image: course.value.thumbnail || course.value.image || '/placeholder-course.jpg',
                  quantity: 2
                }
                cart[existingIndex] = courseItem
                localStorage.setItem('cart', JSON.stringify(cart))
                emit('add-to-cart')
                alert('Đã cập nhật số lượng trong giỏ hàng!')
              }
            }
          } catch (localError) {
            console.error('Failed to add to localStorage cart:', localError)
            alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại!')
          }
        } else if (error.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
          router.push('/login')
        } else if (error.status === 403) {
          alert('Bạn không có quyền thêm vào giỏ hàng.')
        } else if (error.data?.message) {
          alert(`Lỗi: ${error.data.message}`)
        } else {
          alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại!')
        }
      }
    }

    const buyNow = () => {
      addToCart()
      router.push('/checkout')
    }

    const addNewChapter = async () => {
      if (!newChapter.title || !newChapter.title.trim()) {
        alert('Vui lòng nhập tên chương!')
        return
      }

      if (!course.value || !course.value.id) {
        alert('Không tìm thấy thông tin khóa học!')
        return
      }

      try {
        isAddingChapter.value = true
        
        // Tính orderIndex: lấy max orderIndex hiện tại + 1
        const currentChapters = course.value.chapters || []
        const maxOrderIndex = currentChapters.length > 0
          ? Math.max(...currentChapters.map(c => c.orderIndex || 0))
          : 0
        const nextOrderIndex = maxOrderIndex + 1

        // ChapterCreateDTO: courseId, title, orderIndex (required), description, isPublished
        const chapterData = {
          courseId: course.value.id,
          title: newChapter.title.trim(),
          orderIndex: nextOrderIndex,
          description: newChapter.description?.trim() || null,
          isPublished: newChapter.isPublished || false
        }

        await chapterService.create(chapterData)
        
        // Reset form
        newChapter.title = ''
        newChapter.description = ''
        newChapter.isPublished = false
        showAddChapterForm.value = false

        // Reload course để lấy danh sách chương mới
        await loadCourse()
        
        alert('Thêm chương thành công!')
      } catch (error) {
        console.error('Failed to add chapter:', error)
        alert('Không thể thêm chương. Vui lòng kiểm tra quyền (INSTRUCTOR/ADMIN) và thử lại!')
      } finally {
        isAddingChapter.value = false
      }
    }

    const cancelAddChapter = () => {
      newChapter.title = ''
      newChapter.description = ''
      newChapter.isPublished = false
      showAddChapterForm.value = false
    }

    return {
      course,
      tabs,
      activeTab,
      expandedChapters,
      isLoading,
      error,
      canManageCourse,
      showAddChapterForm,
      newChapter,
      isAddingChapter,
      loadCourse,
      toggleChapter,
      getDocumentIcon,
      downloadDocument,
      playVideo,
      formatDuration,
      formatPrice,
      addToCart,
      buyNow,
      addNewChapter,
      cancelAddChapter
    }
  }
}
</script>

<style scoped>
.curriculum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.curriculum-header h2 {
  margin: 0;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.add-chapter-form {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.add-chapter-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4F46E5;
}

.form-textarea {
  resize: vertical;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.curriculum {
  margin-top: 1rem;
}

.curriculum-chapter {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: #f9fafb;
  transition: background 0.2s;
}

.chapter-header:hover {
  background: #f3f4f6;
}

.chapter-header h3 {
  margin: 0;
  flex: 1;
  color: #333;
}

.chapter-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chapter-order {
  font-size: 0.875rem;
  color: #666;
}

.chapter-toggle {
  font-size: 0.875rem;
  color: #666;
}

.chapter-content {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.chapter-section {
  margin-bottom: 1.5rem;
}

.chapter-section:last-child {
  margin-bottom: 0;
}

.chapter-section h4 {
  margin-bottom: 1rem;
  color: #333;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.lesson-number {
  font-weight: 600;
  color: #4F46E5;
  min-width: 30px;
}

.lesson-title {
  flex: 1;
  color: #333;
}

.lesson-duration {
  color: #666;
  font-size: 0.875rem;
}

.documents-grid,
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.document-item,
.video-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.document-icon,
.video-icon {
  font-size: 2rem;
}

.document-info,
.video-info {
  flex: 1;
}

.document-name,
.video-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.document-meta,
.video-meta {
  font-size: 0.875rem;
  color: #666;
}

.btn-download,
.btn-play {
  padding: 0.5rem 1rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.btn-download:hover,
.btn-play:hover {
  background: #4338ca;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #4F46E5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
