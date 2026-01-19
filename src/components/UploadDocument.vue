<template>
  <div class="upload-document">
    <div class="container">
      <h1>Upload Tài Liệu</h1>
      
      <div class="upload-form">
        <div class="form-section">
          <h2>Chọn Khóa Học</h2>
          <select v-model="selectedCourse" class="form-select">
            <option value="">-- Chọn khóa học --</option>
            <option 
              v-for="course in courses" 
              :key="course.id" 
              :value="course.id"
            >
              {{ course.title }}
            </option>
          </select>
        </div>

        <div class="form-section">
          <h2>Chọn Chương</h2>
          <select v-model="selectedChapter" class="form-select">
            <option value="">-- Chọn chương --</option>
            <option 
              v-for="(chapter, index) in chapters" 
              :key="index" 
              :value="index"
            >
              {{ chapter.title }}
            </option>
          </select>
          <button 
            v-if="selectedCourse" 
            @click="showAddChapter = true" 
            class="btn btn-secondary btn-small"
          >
            + Thêm Chương Mới
          </button>
        </div>

        <div v-if="showAddChapter" class="form-section">
          <h3>Thêm Chương Mới</h3>
          <input 
            v-model="newChapterTitle" 
            type="text" 
            placeholder="Tên chương"
            class="form-input"
          />
          <button @click="addChapter" class="btn btn-primary btn-small">
            Thêm Chương
          </button>
          <button @click="cancelAddChapter" class="btn btn-secondary btn-small">
            Hủy
          </button>
        </div>

        <div class="form-section">
          <h2>Upload Tài Liệu</h2>
          
          <div class="upload-types">
            <div class="upload-type">
              <label class="upload-label">
                <input 
                  type="file" 
                  accept=".doc,.docx"
                  @change="handleFileSelect('word', $event)"
                  hidden
                />
                <div class="upload-box">
                  <div class="upload-icon">📄</div>
                  <p>Word Document</p>
                  <span class="file-name">{{ selectedFiles.word?.name || 'Chọn file .doc/.docx' }}</span>
                </div>
              </label>
            </div>

            <div class="upload-type">
              <label class="upload-label">
                <input 
                  type="file" 
                  accept=".xls,.xlsx"
                  @change="handleFileSelect('excel', $event)"
                  hidden
                />
                <div class="upload-box">
                  <div class="upload-icon">📊</div>
                  <p>Excel Spreadsheet</p>
                  <span class="file-name">{{ selectedFiles.excel?.name || 'Chọn file .xls/.xlsx' }}</span>
                </div>
              </label>
            </div>

            <div class="upload-type">
              <label class="upload-label">
                <input 
                  type="file" 
                  accept=".pdf"
                  @change="handleFileSelect('pdf', $event)"
                  hidden
                />
                <div class="upload-box">
                  <div class="upload-icon">📕</div>
                  <p>PDF Document</p>
                  <span class="file-name">{{ selectedFiles.pdf?.name || 'Chọn file .pdf' }}</span>
                </div>
              </label>
            </div>

            <div class="upload-type">
              <label class="upload-label">
                <input 
                  type="file" 
                  accept="video/*"
                  @change="handleFileSelect('video', $event)"
                  hidden
                />
                <div class="upload-box">
                  <div class="upload-icon">🎥</div>
                  <p>Video</p>
                  <span class="file-name">{{ selectedFiles.video?.name || 'Chọn file video' }}</span>
                </div>
              </label>
            </div>
          </div>

          <div v-if="selectedFilesCount > 0" class="upload-actions">
            <button @click="uploadFiles" class="btn btn-primary">
              Upload {{ selectedFilesCount }} file(s)
            </button>
            <button @click="clearFiles" class="btn btn-secondary">
              Xóa Tất Cả
            </button>
          </div>
        </div>

        <div v-if="uploadedDocuments.length > 0" class="uploaded-list">
          <h2>Tài Liệu Đã Upload</h2>
          <div class="documents-grid">
            <div 
              v-for="(doc, index) in uploadedDocuments" 
              :key="index"
              class="document-item"
            >
              <div class="doc-icon">{{ getFileIcon(doc.type) }}</div>
              <div class="doc-info">
                <p class="doc-name">{{ doc.name }}</p>
                <p class="doc-meta">{{ doc.chapter }} • {{ doc.size }}</p>
              </div>
              <button @click="deleteDocument(index)" class="btn-delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'UploadDocument',
  setup() {
    const selectedCourse = ref('')
    const selectedChapter = ref('')
    const showAddChapter = ref(false)
    const newChapterTitle = ref('')
    
    const selectedFiles = ref({
      word: null,
      excel: null,
      pdf: null,
      video: null
    })

    const uploadedDocuments = ref([
      {
        name: 'Bai-giang-chuong-1.pdf',
        type: 'pdf',
        chapter: 'Chương 1: Giới thiệu',
        size: '2.5 MB'
      },
      {
        name: 'Video-bai-1.mp4',
        type: 'video',
        chapter: 'Chương 1: Giới thiệu',
        size: '125 MB'
      }
    ])

    const courses = ref([
      { id: 1, title: 'Lập Trình Web với Vue.js' },
      { id: 2, title: 'Python Cho Người Mới Bắt Đầu' },
      { id: 3, title: 'Thiết Kế UI/UX Chuyên Nghiệp' }
    ])

    const chapters = computed(() => {
      if (!selectedCourse.value) return []
      
      // Mock chapters data - trong thực tế sẽ lấy từ API
      return [
        { title: 'Chương 1: Giới thiệu' },
        { title: 'Chương 2: Cơ bản' },
        { title: 'Chương 3: Nâng cao' }
      ]
    })

    const selectedFilesCount = computed(() => {
      return Object.values(selectedFiles.value).filter(f => f !== null).length
    })

    const handleFileSelect = (type, event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFiles.value[type] = file
      }
    }

    const clearFiles = () => {
      selectedFiles.value = {
        word: null,
        excel: null,
        pdf: null,
        video: null
      }
    }

    const uploadFiles = () => {
      if (!selectedCourse.value || !selectedChapter.value) {
        alert('Vui lòng chọn khóa học và chương!')
        return
      }

      const courseTitle = courses.value.find(c => c.id === selectedCourse.value)?.title
      const chapterTitle = chapters.value[selectedChapter.value]?.title

      Object.entries(selectedFiles.value).forEach(([type, file]) => {
        if (file) {
          uploadedDocuments.value.push({
            name: file.name,
            type: type,
            chapter: chapterTitle,
            size: formatFileSize(file.size)
          })
        }
      })

      clearFiles()
      alert('Upload thành công!')
    }

    const addChapter = () => {
      if (newChapterTitle.value.trim()) {
        // Trong thực tế sẽ call API để thêm chương
        alert(`Đã thêm chương: ${newChapterTitle.value}`)
        newChapterTitle.value = ''
        showAddChapter.value = false
      }
    }

    const cancelAddChapter = () => {
      newChapterTitle.value = ''
      showAddChapter.value = false
    }

    const deleteDocument = (index) => {
      if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
        uploadedDocuments.value.splice(index, 1)
      }
    }

    const getFileIcon = (type) => {
      const icons = {
        word: '📄',
        excel: '📊',
        pdf: '📕',
        video: '🎥'
      }
      return icons[type] || '📁'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    watch(selectedCourse, () => {
      selectedChapter.value = ''
    })

    return {
      selectedCourse,
      selectedChapter,
      showAddChapter,
      newChapterTitle,
      selectedFiles,
      uploadedDocuments,
      courses,
      chapters,
      selectedFilesCount,
      handleFileSelect,
      clearFiles,
      uploadFiles,
      addChapter,
      cancelAddChapter,
      deleteDocument,
      getFileIcon
    }
  }
}
</script>

<style scoped>
.upload-document {
  padding: 2rem 0;
}

.upload-document h1 {
  margin-bottom: 2rem;
  color: #333;
}

.upload-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2,
.form-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.upload-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.upload-label {
  cursor: pointer;
}

.upload-box {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
}

.upload-box:hover {
  border-color: #4F46E5;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-box p {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.file-name {
  font-size: 0.875rem;
  color: #666;
  display: block;
  word-break: break-all;
}

.upload-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.uploaded-list {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.uploaded-list h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.documents-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  gap: 1rem;
}

.doc-icon {
  font-size: 2rem;
}

.doc-info {
  flex: 1;
}

.doc-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.doc-meta {
  font-size: 0.875rem;
  color: #666;
}

.btn-delete {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-delete:hover {
  opacity: 0.7;
}
</style>
