<template>
  <div class="create-course">
    <div class="container">
      <h1>Tạo Khóa Học Mới</h1>
      
      <form @submit.prevent="handleSubmit" class="course-form">
        <div class="form-section">
          <h2>Thông Tin Cơ Bản</h2>
          
          <div class="form-group">
            <label>Tên Khóa Học *</label>
            <input 
              v-model="courseData.title" 
              type="text" 
              required 
              placeholder="Nhập tên khóa học"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Mô Tả Khóa Học</label>
            <textarea 
              v-model="courseData.description" 
              rows="5"
              placeholder="Nhập mô tả chi tiết về khóa học"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Danh Mục *</label>
              <select 
                v-model="courseData.categoryId" 
                required 
                class="form-select"
                :disabled="loadingCategories"
              >
                <option value="">-- Chọn danh mục --</option>
                <option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <p v-if="loadingCategories" class="loading-text">Đang tải danh mục...</p>
              <p v-if="categoryError" class="error-text">{{ categoryError }}</p>
            </div>

            <div class="form-group">
              <label>Mức Độ *</label>
              <select v-model="courseData.level" required class="form-select">
                <option value="">-- Chọn mức độ --</option>
                <option value="BEGINNER">Cơ Bản</option>
                <option value="INTERMEDIATE">Trung Bình</option>
                <option value="ADVANCED">Nâng Cao</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ngôn Ngữ</label>
              <input 
                v-model="courseData.language" 
                type="text" 
                placeholder="Ví dụ: Tiếng Việt, English"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Thời Lượng Ước Tính (phút)</label>
              <input 
                v-model.number="courseData.estimatedDuration" 
                type="number" 
                min="1"
                placeholder="Ví dụ: 120"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Giá (VND) *</label>
              <input 
                v-model.number="courseData.price" 
                type="number" 
                required 
                min="0"
                step="0.01"
                placeholder="0"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Giá Gốc (VND)</label>
              <input 
                v-model.number="courseData.originalPrice" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="Để trống nếu không có"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Hình Ảnh Khóa Học (URL)</label>
            <input 
              v-model="courseData.thumbnail" 
              type="url" 
              placeholder="https://example.com/image.jpg"
              class="form-input"
            />
            <div v-if="courseData.thumbnail" class="image-preview">
              <img :src="courseData.thumbnail" alt="Preview" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Quản Lý Chương</h2>
          
          <div v-for="(chapter, index) in chapters" :key="index" class="chapter-item">
            <div class="chapter-header">
              <h3>Chương {{ index + 1 }}: {{ chapter.title || 'Chưa đặt tên' }}</h3>
              <button type="button" @click="removeChapter(index)" class="btn-remove">Xóa</button>
            </div>
            
            <div class="form-group">
              <label>Tên Chương</label>
              <input 
                v-model="chapter.title" 
                type="text" 
                :placeholder="`Chương ${index + 1}`"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Bài Học</label>
              <div v-for="(lesson, lessonIndex) in chapter.lessons" :key="lessonIndex" class="lesson-row">
                <input 
                  v-model="lesson.title" 
                  type="text" 
                  placeholder="Tên bài học"
                  class="form-input lesson-input"
                />
                <input 
                  v-model="lesson.duration" 
                  type="text" 
                  placeholder="Thời lượng (VD: 15 phút)"
                  class="form-input duration-input"
                />
                <button type="button" @click="removeLesson(index, lessonIndex)" class="btn-small-remove">X</button>
              </div>
              <button type="button" @click="addLesson(index)" class="btn-add-lesson">+ Thêm Bài Học</button>
            </div>
          </div>

          <button type="button" @click="addChapter" class="btn btn-secondary">
            + Thêm Chương Mới
          </button>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleCancel" class="btn btn-secondary">
            Hủy
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang tạo...' : 'Tạo Khóa Học' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryService } from '../services/categoryService'
import { courseService } from '../services/courseService'
import { chapterService } from '../services/chapterService'

export default {
  name: 'CreateCourse',
  setup() {
    const router = useRouter()
    
    const categories = ref([])
    const loadingCategories = ref(false)
    const categoryError = ref('')
    const isSubmitting = ref(false)

    const courseData = reactive({
      title: '',
      description: '',
      thumbnail: '',
      price: null,
      originalPrice: null,
      level: '',
      language: '',
      estimatedDuration: null,
      categoryId: null
    })

    const chapters = reactive([
      {
        title: '',
        lessons: [
          { title: '', duration: '' }
        ]
      }
    ])

    const addChapter = () => {
      chapters.push({
        title: '',
        lessons: [
          { title: '', duration: '' }
        ]
      })
    }

    const removeChapter = (index) => {
      if (chapters.length > 1) {
        chapters.splice(index, 1)
      } else {
        alert('Khóa học phải có ít nhất 1 chương!')
      }
    }

    const addLesson = (chapterIndex) => {
      chapters[chapterIndex].lessons.push({
        title: '',
        duration: ''
      })
    }

    const removeLesson = (chapterIndex, lessonIndex) => {
      const chapter = chapters[chapterIndex]
      if (chapter.lessons.length > 1) {
        chapter.lessons.splice(lessonIndex, 1)
      } else {
        alert('Mỗi chương phải có ít nhất 1 bài học!')
      }
    }

    const loadCategories = async () => {
      loadingCategories.value = true
      categoryError.value = ''
      try {
        const response = await categoryService.getList()
        // Xử lý response có thể là array hoặc object có data
        categories.value = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Failed to load categories:', error)
        categoryError.value = 'Không thể tải danh mục. Vui lòng thử lại sau.'
      } finally {
        loadingCategories.value = false
      }
    }

    const handleSubmit = async () => {
      // Validate
      if (!courseData.title || !courseData.title.trim()) {
        alert('Vui lòng nhập tên khóa học!')
        return
      }

      if (!courseData.categoryId) {
        alert('Vui lòng chọn danh mục!')
        return
      }

      if (!courseData.price || courseData.price <= 0) {
        alert('Vui lòng nhập giá hợp lệ (lớn hơn 0)!')
        return
      }

      if (!courseData.level) {
        alert('Vui lòng chọn mức độ!')
        return
      }

      isSubmitting.value = true

      try {
        // Kiểm tra token và quyền
        const token = localStorage.getItem('token')
        if (!token) {
          alert('Bạn cần đăng nhập để tạo khóa học!')
          router.push('/login')
          return
        }

        console.log('Token exists:', !!token)
        console.log('Token preview:', token.substring(0, 20) + '...')

        // Chuẩn bị dữ liệu theo DTO
        const requestData = {
          title: courseData.title.trim(),
          description: courseData.description?.trim() || null,
          thumbnail: courseData.thumbnail?.trim() || null,
          price: courseData.price,
          originalPrice: courseData.originalPrice || null,
          level: courseData.level,
          language: courseData.language?.trim() || null,
          estimatedDuration: courseData.estimatedDuration || null,
          categoryId: courseData.categoryId
        }

        console.log('Creating course with data:', requestData)
        console.log('API endpoint:', '/api/courses')

        // Gọi API để tạo khóa học
        const response = await courseService.create(requestData)
        
        const courseId = response.id || response.data?.id

        // Tạo các chương sau khi tạo khóa học thành công
        if (courseId && chapters.length > 0) {
          try {
            for (let index = 0; index < chapters.length; index++) {
              const chapter = chapters[index]
              if (chapter.title && chapter.title.trim()) {
                // ChapterCreateDTO: courseId, title, orderIndex (required), description, isPublished
                const chapterData = {
                  courseId: courseId,
                  title: chapter.title.trim(),
                  orderIndex: index + 1, // Thứ tự chương (bắt đầu từ 1)
                  description: null, // Có thể thêm description sau
                  isPublished: false // Mặc định chưa publish
                }
                
                await chapterService.create(chapterData)
              }
            }
            console.log('All chapters created successfully')
          } catch (chapterError) {
            console.error('Failed to create some chapters:', chapterError)
            // Vẫn tiếp tục dù có lỗi tạo chương
          }
        }

        // Trigger custom event để CourseList reload
        window.dispatchEvent(new Event('coursesUpdated'))

        alert('Tạo khóa học thành công!')
        router.push(`/course/${courseId}`)
      } catch (error) {
        console.error('Failed to create course:', error)
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          data: error.data,
          message: error.message
        })
        
        let errorMessage = 'Không thể tạo khóa học. Vui lòng thử lại!'
        
        if (error.status === 403 || error.status === 401) {
          errorMessage = 'Bạn không có quyền tạo khóa học. Chỉ ADMIN hoặc INSTRUCTOR mới có quyền này!'
        } else if (error.data?.message) {
          errorMessage = error.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        alert(`Lỗi: ${errorMessage}`)
      } finally {
        isSubmitting.value = false
      }
    }

    const handleCancel = () => {
      if (confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
        router.push('/admin')
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      courseData,
      categories,
      loadingCategories,
      categoryError,
      isSubmitting,
      chapters,
      addChapter,
      removeChapter,
      addLesson,
      removeLesson,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.create-course {
  padding: 2rem 0;
}

.create-course h1 {
  margin-bottom: 2rem;
  color: #333;
}

.course-form {
  max-width: 1000px;
  margin: 0 auto;
}

.form-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4F46E5;
}

.form-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.image-preview {
  margin-top: 1rem;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.loading-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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

.chapter-item {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chapter-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.btn-remove {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-remove:hover {
  background: #dc2626;
}

.lesson-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.lesson-input {
  flex: 2;
}

.duration-input {
  flex: 1;
  max-width: 200px;
}

.btn-small-remove {
  padding: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-small-remove:hover {
  background: #dc2626;
}

.btn-add-lesson {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-add-lesson:hover {
  background: #059669;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .lesson-row {
    flex-direction: column;
  }
  
  .duration-input {
    max-width: 100%;
  }
}
</style>
