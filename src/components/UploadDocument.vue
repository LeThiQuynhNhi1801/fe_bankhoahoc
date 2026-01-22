<template>
  <div class="upload-document">
    <div class="container">
      <h1>Upload Tài Liệu</h1>
      
      <div class="upload-form">
        <div class="form-section">
          <h2>Chọn Khóa Học</h2>
          <select v-model="selectedCourse" class="form-select" :disabled="isLoadingCourses">
            <option value="">-- Chọn khóa học --</option>
            <option 
              v-for="course in courses" 
              :key="course.id" 
              :value="course.id"
            >
              {{ course.title }}
            </option>
          </select>
          <p v-if="isLoadingCourses" class="loading-text">Đang tải khóa học...</p>
          <p v-if="!isLoadingCourses && courses.length === 0" class="no-courses">Chưa có khóa học nào.</p>
        </div>

        <div class="form-section">
          <h2>Chọn Chương</h2>
          <select v-model="selectedChapter" class="form-select" :disabled="!selectedCourse || isLoadingChapters">
            <option value="">-- Chọn chương --</option>
            <option 
              v-for="chapter in chapters" 
              :key="chapter.id" 
              :value="chapter.id"
            >
              {{ chapter.title }}
            </option>
          </select>
          <p v-if="isLoadingChapters" class="loading-text">Đang tải chương...</p>
          <p v-if="selectedCourse && !isLoadingChapters && chapters.length === 0" class="no-chapters">
            Chưa có chương nào. Hãy thêm chương mới.
          </p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { courseService } from '../services/courseService'
import { chapterService } from '../services/chapterService'
import { documentService } from '../services/documentService'
import { videoService } from '../services/videoService'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'UploadDocument',
  setup() {
    const { isAdmin, isTeacher } = useAuth()
    const selectedCourse = ref(null)
    const selectedChapter = ref(null)
    const showAddChapter = ref(false)
    const newChapterTitle = ref('')
    
    const selectedFiles = ref({
      word: null,
      excel: null,
      pdf: null,
      video: null
    })

    // Danh sách tài liệu đã upload (sẽ lấy từ API khi có endpoint)
    const uploadedDocuments = ref([])

    const courses = ref([])
    const chapters = ref([])
    const isLoadingCourses = ref(false)
    const isLoadingChapters = ref(false)

    const loadCourses = async () => {
      isLoadingCourses.value = true
      courses.value = []

      try {
        // Admin: luôn lấy tất cả khóa học đã publish (public list)
        if (isAdmin.value) {
          const response = await courseService.getList()
          courses.value = Array.isArray(response) ? response : (response?.data || response?.courses || [])
          return
        }

        // Instructor: ưu tiên my-courses, nếu rỗng hoặc lỗi thì fallback public
        if (isTeacher.value) {
          try {
            const responseMy = await courseService.getMyCourses()
            const myCourses = Array.isArray(responseMy) ? responseMy : (responseMy?.data || [])
            if (myCourses && myCourses.length > 0) {
              courses.value = myCourses
              return
            }
          } catch (err) {
            console.warn('getMyCourses failed or empty, fallback to public courses:', err)
          }
        }

        // Các role khác: dùng public list
        const response = await courseService.getList()
        courses.value = Array.isArray(response) ? response : (response?.data || response?.courses || [])
      } catch (error) {
        console.error('Failed to load courses:', error)
        courses.value = []
      } finally {
        isLoadingCourses.value = false
      }
    }

    const loadChapters = async (courseId) => {
      const courseIdNum = courseId ? parseInt(courseId) : null
      if (!courseIdNum) {
        chapters.value = []
        return
      }
      
      try {
        isLoadingChapters.value = true
        const response = await chapterService.getList(courseIdNum)
        const normalize = (res) => {
          if (Array.isArray(res)) return res
          return res?.data || res?.content || []
        }
        chapters.value = normalize(response)
        console.log('[UploadDocument] chapters loaded:', chapters.value?.length, 'for course', courseIdNum)
      } catch (error) {
        console.error('Failed to load chapters:', error)
        chapters.value = []
      } finally {
        isLoadingChapters.value = false
      }
    }

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

    const uploadFiles = async () => {
      if (!selectedCourse.value || !selectedChapter.value) {
        alert('Vui lòng chọn khóa học và chương!')
        return
      }

      const courseIdNum = parseInt(selectedCourse.value)
      const chapterIdNum = parseInt(selectedChapter.value)
      const courseTitle = courses.value.find(c => c.id === courseIdNum)?.title
      const chapter = chapters.value.find(c => c.id === chapterIdNum)
      
      if (!chapter) {
        alert('Chương không hợp lệ!')
        return
      }

      try {
        // Tách riêng documents và videos - QUAN TRỌNG: Video là API riêng!
        const documentFiles = {}
        const videoFile = selectedFiles.value.video
        
        // Lấy các file documents (word, excel, pdf) - KHÔNG BAO GỒM VIDEO
        // VIDEO KHÔNG BAO GIỜ được thêm vào documentFiles!
        if (selectedFiles.value.word) documentFiles.word = selectedFiles.value.word
        if (selectedFiles.value.excel) documentFiles.excel = selectedFiles.value.excel
        if (selectedFiles.value.pdf) documentFiles.pdf = selectedFiles.value.pdf
        
        // Đảm bảo video KHÔNG có trong documentFiles
        if (documentFiles.video) {
          delete documentFiles.video
        }
        
        console.log('[Upload] Documents to upload:', Object.keys(documentFiles))
        console.log('[Upload] Video to upload:', videoFile ? videoFile.name : 'none')
        console.log('[Upload] Video sẽ KHÔNG đi qua document API!')
        
        // Upload documents vào chapter - API: POST /api/chapters/{chapterId}/documents
        // CHỈ upload word, excel, pdf - KHÔNG BAO GỒM VIDEO
        for (const [type, file] of Object.entries(documentFiles)) {
          if (file && type !== 'video') { // Đảm bảo video không đi qua đây
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type.toUpperCase())
            
            try {
              console.log(`[Upload] Uploading document ${type} to chapter ${chapterIdNum} via /api/chapters/${chapterIdNum}/documents`)
              await documentService.upload(chapterIdNum, formData)
              
              uploadedDocuments.value.push({
                name: file.name,
                type: type,
                chapter: chapter.title,
                size: formatFileSize(file.size)
              })
            } catch (err) {
              console.error(`Upload document ${type} error:`, err)
              alert(`Không thể upload ${type}. Vui lòng thử lại!`)
              throw err
            }
          }
        }
        
        // Upload video - CHỈ GỌI API VIDEO: POST /api/course-contents/{contentId}/video
        // NẾU LÀ VIDEO → GỌI API /video, KHÔNG GỌI /chapters
        if (videoFile) {
          try {
            console.log('[Upload] ===== VIDEO FILE DETECTED - GỌI API VIDEO =====')
            console.log('[Upload] Video file:', videoFile.name)
            
            // TẠO CONTENT TRƯỚC ĐỂ LẤY contentId (API cần contentId)
            const { courseContentService } = await import('../services/courseContentService')
            
            // Lấy contents để tính orderIndex
            const existingContents = await courseContentService.getByChapter(chapterIdNum)
            const contents = Array.isArray(existingContents?.data ?? existingContents) 
              ? (existingContents?.data ?? existingContents) 
              : []
            const nextOrderIndex = contents.length > 0 
              ? Math.max(...contents.map(c => c.orderIndex || 0)) + 1 
              : 1
            
            // Tạo title - NẾU RỖNG THÌ FIX CỨNG "title1"
            let title = videoFile.name
            const dotIndex = title.lastIndexOf('.')
            if (dotIndex > 0) {
              title = title.substring(0, dotIndex)
            }
            title = title.trim()
            // Nếu title rỗng thì fix cứng "title1" để tránh lỗi 400
            if (!title || title.length === 0) {
              title = 'title1'
            }
            
            // TẠO CONTENT (API /chapters - chỉ để lấy ID)
            // Đảm bảo tất cả các field đều có giá trị hợp lệ
            const contentData = {
              chapterId: Number(chapterIdNum),
              title: String(title).trim() || 'title1', // Đảm bảo title là string và không rỗng
              description: String(`Video: ${videoFile.name}`).trim(),
              orderIndex: Number(nextOrderIndex),
              isPreview: Boolean(false)
            }
            
            // Validate title trước khi gửi - nếu vẫn rỗng thì fix cứng "title1"
            if (!contentData.title || typeof contentData.title !== 'string' || contentData.title.trim().length === 0) {
              contentData.title = 'title1'
            }
            
            // Đảm bảo title không null/undefined
            contentData.title = contentData.title || 'title1'
            
            console.log('[Upload] Tạo content với title:', contentData.title, 'Type:', typeof contentData.title, 'Length:', contentData.title.length)
            console.log('[Upload] ContentData:', JSON.stringify(contentData))
            console.log('[Upload] ContentData title check:', {
              hasTitle: !!contentData.title,
              titleValue: contentData.title,
              titleType: typeof contentData.title,
              titleLength: contentData.title?.length
            })
            const contentRes = await courseContentService.create(chapterIdNum, contentData)
            const content = contentRes?.data ?? contentRes
            
            if (!content?.id) {
              throw new Error('Không tạo được content')
            }
            
            console.log('[Upload] ✅ ContentId:', content.id)
            
            // UPLOAD VIDEO - GỌI API VIDEO (API TRÊN)
            console.log(`[Upload] ===== GỌI API VIDEO: POST /api/course-contents/${content.id}/video =====`)
            
            const formData = new FormData()
            formData.append('file', videoFile)
            
            await videoService.upload(content.id, formData)
            console.log('[Upload] ✅✅✅ VIDEO UPLOADED VIA API /video!')
            
            uploadedDocuments.value.push({
              name: videoFile.name,
              type: 'video',
              chapter: chapter.title,
              size: formatFileSize(videoFile.size),
              contentId: content.id
            })
            
            console.log('[Upload] ✅ Video uploaded successfully via API TRÊN (VIDEO UPLOAD API)')
          } catch (err) {
            console.error('[Upload] ❌ Upload video error:', err)
            console.error('[Upload] Error stack:', err.stack)
            // Không alert ở đây, để catch ngoài xử lý
            throw err
          }
        } else {
          console.log('[Upload] ⚠️ Không có video file để upload')
        }

        clearFiles()
        alert('Upload thành công!')
      } catch (error) {
        console.error('Failed to upload files:', error)
        // Chỉ alert 1 lần ở đây
        const errorMessage = error?.message || 'Không thể upload tài liệu. Vui lòng thử lại!'
        alert(errorMessage)
      }
    }

    const addChapter = async () => {
      if (!newChapterTitle.value.trim()) {
        alert('Vui lòng nhập tên chương!')
        return
      }

      if (!selectedCourse.value) {
        alert('Vui lòng chọn khóa học trước!')
        return
      }

      try {
        isLoadingChapters.value = true
        
        // Lấy danh sách chương hiện tại để tính orderIndex
        const currentChapters = chapters.value
        const nextOrderIndex = currentChapters.length > 0 
          ? Math.max(...currentChapters.map(c => c.orderIndex || 0)) + 1 
          : 1
        
        // ChapterCreateDTO: courseId, title, orderIndex (required), description, isPublished
        const chapterData = {
          courseId: selectedCourse.value,
          title: newChapterTitle.value.trim(),
          orderIndex: nextOrderIndex,
          description: null,
          isPublished: false
        }
        
        const response = await chapterService.create(chapterData)
        console.log('Chapter created:', response)
        
        // Reload chapters
        await loadChapters(selectedCourse.value)
        
        // Select chapter mới tạo
        const newChapter = chapters.value.find(c => c.title === newChapterTitle.value.trim())
        if (newChapter) {
          selectedChapter.value = newChapter.id
        }
        
        newChapterTitle.value = ''
        showAddChapter.value = false
        alert('Thêm chương thành công!')
      } catch (error) {
        console.error('Failed to create chapter:', error)
        alert('Không thể thêm chương. Vui lòng thử lại!')
      } finally {
        isLoadingChapters.value = false
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

    watch(selectedCourse, (newCourseId) => {
      selectedChapter.value = null
      loadChapters(newCourseId)
    })

    onMounted(() => {
      loadCourses()
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
      isLoadingCourses,
      isLoadingChapters,
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
