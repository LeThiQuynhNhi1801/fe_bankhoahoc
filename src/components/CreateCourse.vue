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
            <label>Mô Tả Khóa Học *</label>
            <textarea 
              v-model="courseData.description" 
              required 
              rows="5"
              placeholder="Nhập mô tả chi tiết về khóa học"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Giảng Viên *</label>
              <input 
                v-model="courseData.instructor" 
                type="text" 
                required 
                placeholder="Tên giảng viên"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Danh Mục *</label>
              <select v-model="courseData.category" required class="form-select">
                <option value="">-- Chọn danh mục --</option>
                <option value="Lập trình Web">Lập trình Web</option>
                <option value="Lập trình Mobile">Lập trình Mobile</option>
                <option value="Thiết Kế UI/UX">Thiết Kế UI/UX</option>
                <option value="Khoa Học Dữ Liệu">Khoa Học Dữ Liệu</option>
                <option value="Marketing">Marketing</option>
                <option value="Kinh Doanh">Kinh Doanh</option>
              </select>
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
                placeholder="Để trống nếu không có"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Hình Ảnh Khóa Học (URL)</label>
            <input 
              v-model="courseData.image" 
              type="url" 
              placeholder="https://example.com/image.jpg"
              class="form-input"
            />
            <div v-if="courseData.image" class="image-preview">
              <img :src="courseData.image" alt="Preview" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Nội Dung Khóa Học</h2>
          
          <div class="form-group">
            <label>Điểm Nổi Bật (Mỗi điểm một dòng)</label>
            <textarea 
              v-model="learningPointsText" 
              rows="5"
              placeholder="Học viên sẽ học được gì?&#10;Điểm 1&#10;Điểm 2&#10;..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Yêu Cầu (Mỗi yêu cầu một dòng)</label>
            <textarea 
              v-model="requirementsText" 
              rows="5"
              placeholder="Yêu cầu kiến thức trước khi học&#10;Yêu cầu 1&#10;Yêu cầu 2&#10;..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Thời Lượng (Ví dụ: 12 giờ)</label>
            <input 
              v-model="courseData.duration" 
              type="text" 
              placeholder="12 giờ"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Quản Lý Chương</h2>
          
          <div v-for="(chapter, index) in courseData.chapters" :key="index" class="chapter-item">
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
          <button type="submit" class="btn btn-primary">
            Tạo Khóa Học
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CreateCourse',
  setup() {
    const router = useRouter()
    
    const learningPointsText = ref('')
    const requirementsText = ref('')

    const courseData = reactive({
      title: '',
      description: '',
      instructor: '',
      category: '',
      price: 0,
      originalPrice: null,
      image: '',
      duration: '',
      chapters: [
        {
          title: '',
          lessons: [
            { title: '', duration: '' }
          ]
        }
      ]
    })

    const addChapter = () => {
      courseData.chapters.push({
        title: '',
        lessons: [
          { title: '', duration: '' }
        ]
      })
    }

    const removeChapter = (index) => {
      if (courseData.chapters.length > 1) {
        courseData.chapters.splice(index, 1)
      } else {
        alert('Khóa học phải có ít nhất 1 chương!')
      }
    }

    const addLesson = (chapterIndex) => {
      courseData.chapters[chapterIndex].lessons.push({
        title: '',
        duration: ''
      })
    }

    const removeLesson = (chapterIndex, lessonIndex) => {
      const chapter = courseData.chapters[chapterIndex]
      if (chapter.lessons.length > 1) {
        chapter.lessons.splice(lessonIndex, 1)
      } else {
        alert('Mỗi chương phải có ít nhất 1 bài học!')
      }
    }

    const handleSubmit = () => {
      // Xử lý learning points và requirements
      const learningPoints = learningPointsText.value
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
      
      const requirements = requirementsText.value
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())

      // Lọc bỏ các lesson trống
      courseData.chapters.forEach(chapter => {
        chapter.lessons = chapter.lessons.filter(lesson => lesson.title.trim() || lesson.duration.trim())
      })

      // Tạo dữ liệu khóa học hoàn chỉnh
      const newCourse = {
        ...courseData,
        learningPoints,
        requirements,
        rating: 0,
        reviews: 0,
        students: 0,
        lastUpdated: new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
        reviewsList: []
      }

      // Lưu vào localStorage (trong thực tế sẽ call API)
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 7 // Bắt đầu từ 7 vì có 6 courses mặc định
      newCourse.id = newId
      
      courses.push(newCourse)
      localStorage.setItem('courses', JSON.stringify(courses))

      // Trigger custom event để CourseList reload
      window.dispatchEvent(new Event('coursesUpdated'))

      alert('Tạo khóa học thành công!')
      router.push(`/course/${newId}`)
    }

    const handleCancel = () => {
      if (confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
        router.push('/admin')
      }
    }

    return {
      courseData,
      learningPointsText,
      requirementsText,
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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
