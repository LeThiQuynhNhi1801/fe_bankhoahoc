<template>
  <div class="admin-courses">
    <div class="container">
      <div class="header">
        <h1>Quản Lý Khóa Học</h1>
        <div class="header-actions">
          <router-link to="/admin/create-course" class="btn-create">+ Tạo khóa học mới</router-link>
          <router-link to="/admin" class="btn-back">← Quay lại Dashboard</router-link>
        </div>
      </div>

      <div class="filters">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm theo tên khóa học..."
            @input="handleSearch"
          />
        </div>
        <div class="filter-group">
          <label>Lọc theo trạng thái:</label>
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
        <button @click="loadCourses" class="btn-refresh">🔄 Làm mới</button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h3>Tổng khóa học</h3>
          <p>{{ courses.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Đang hoạt động</h3>
          <p>{{ getActiveCourses() }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng học viên</h3>
          <p>{{ getTotalStudents() }}</p>
        </div>
        <div class="stat-card">
          <h3>Giá trị khóa học</h3>
          <p>{{ formatPrice(getTotalValue()) }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <p>Đang tải danh sách khóa học...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadCourses" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="filteredCourses.length === 0" class="no-data">
        <p>Không tìm thấy khóa học nào.</p>
      </div>

      <div v-else class="courses-grid">
        <div v-for="course in paginatedCourses" :key="course.id" class="course-card">
          <div class="course-image">
            <img :src="course.imageUrl || 'https://via.placeholder.com/300x200?text=Khóa+Học'" :alt="course.title" />
            <span :class="['status-badge', course.isActive ? 'active' : 'inactive']">
              {{ course.isActive ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </div>
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <p class="course-description">{{ course.description || 'Chưa có mô tả' }}</p>
            <div class="course-meta">
              <span class="meta-item">👤 {{ course.studentCount || 0 }} học viên</span>
              <span class="meta-item">📚 {{ course.chapterCount || 0 }} chương</span>
            </div>
            <div class="course-footer">
              <span class="course-price">{{ formatPrice(course.price) }}</span>
              <div class="course-actions">
                <router-link 
                  :to="`/course/${course.id}`" 
                  class="btn-view"
                  title="Xem chi tiết"
                  target="_blank"
                >
                  👁️
                </router-link>
                <router-link 
                  :to="`/admin/upload?courseId=${course.id}`" 
                  class="btn-upload"
                  title="Upload tài liệu"
                >
                  📤
                </router-link>
                <button 
                  @click="confirmDelete(course)" 
                  class="btn-delete"
                  title="Xóa khóa học"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && filteredCourses.length > 0" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          ← Trước
        </button>
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          Sau →
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmCourse" class="modal" @click="cancelDelete">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h2>Xác nhận xóa</h2>
          <button @click="cancelDelete" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa khóa học <strong>{{ deleteConfirmCourse.title }}</strong>?</p>
          <p class="warning">⚠️ Hành động này không thể hoàn tác! Tất cả dữ liệu liên quan sẽ bị xóa.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-cancel">Hủy</button>
          <button @click="deleteCourse" class="btn-confirm-delete" :disabled="isDeleting">
            {{ isDeleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../services/adminService'

export default {
  name: 'AdminCourses',
  setup() {
    const courses = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 12
    const deleteConfirmCourse = ref(null)
    const isDeleting = ref(false)

    const loadCourses = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await adminService.getAllCourses()
        courses.value = Array.isArray(response) ? response : (response.data || [])
        // Sort by created date (newest first)
        courses.value.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      } catch (err) {
        error.value = 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.'
        console.error('Load courses error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const filteredCourses = computed(() => {
      let filtered = courses.value

      // Filter by status
      if (statusFilter.value === 'active') {
        filtered = filtered.filter(course => course.isActive !== false)
      } else if (statusFilter.value === 'inactive') {
        filtered = filtered.filter(course => course.isActive === false)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course => 
          course.title?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredCourses.value.length / itemsPerPage)
    })

    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredCourses.value.slice(start, end)
    })

    const getActiveCourses = () => {
      return courses.value.filter(course => course.isActive !== false).length
    }

    const getTotalStudents = () => {
      return courses.value.reduce((sum, course) => sum + (course.studentCount || 0), 0)
    }

    const getTotalValue = () => {
      return courses.value.reduce((sum, course) => sum + ((course.price || 0) * (course.studentCount || 0)), 0)
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const handleFilter = () => {
      currentPage.value = 1
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const confirmDelete = (course) => {
      deleteConfirmCourse.value = course
    }

    const cancelDelete = () => {
      deleteConfirmCourse.value = null
    }

    const deleteCourse = async () => {
      try {
        isDeleting.value = true
        await adminService.deleteCourse(deleteConfirmCourse.value.id)
        // Remove course from list
        courses.value = courses.value.filter(c => c.id !== deleteConfirmCourse.value.id)
        cancelDelete()
        alert('Xóa khóa học thành công!')
      } catch (err) {
        console.error('Delete course error:', err)
        alert('Không thể xóa khóa học. Vui lòng thử lại sau.')
      } finally {
        isDeleting.value = false
      }
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price || 0)
    }

    onMounted(() => {
      loadCourses()
    })

    return {
      courses,
      isLoading,
      error,
      searchQuery,
      statusFilter,
      currentPage,
      filteredCourses,
      paginatedCourses,
      totalPages,
      deleteConfirmCourse,
      isDeleting,
      loadCourses,
      getActiveCourses,
      getTotalStudents,
      getTotalValue,
      handleSearch,
      handleFilter,
      prevPage,
      nextPage,
      confirmDelete,
      cancelDelete,
      deleteCourse,
      formatPrice
    }
  }
}
</script>

<style scoped>
.admin-courses {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
  font-weight: 500;
}

.btn-create:hover {
  background: #059669;
}

.btn-back {
  padding: 0.75rem 1rem;
  background: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #5a6268;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #555;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.btn-refresh {
  padding: 0.75rem 1rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-refresh:hover {
  background: #4338CA;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4F46E5;
  margin: 0;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #dc3545;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #4338CA;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.course-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.course-info {
  padding: 1.5rem;
}

.course-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.meta-item {
  color: #666;
  font-size: 0.875rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4F46E5;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-upload, .btn-delete {
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 4px;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-view:hover {
  background: #e0e7ff;
}

.btn-upload:hover {
  background: #fef3c7;
}

.btn-delete:hover {
  background: #fee2e2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: #4338CA;
}

.btn-page:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-info {
  color: #555;
  font-weight: 500;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.warning {
  color: #dc3545;
  font-weight: 500;
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 0.5rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm-delete {
  padding: 0.5rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #c82333;
}

.btn-confirm-delete:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
