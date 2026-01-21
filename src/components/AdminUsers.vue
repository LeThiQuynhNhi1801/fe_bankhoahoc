<template>
  <div class="admin-users">
    <div class="container">
      <div class="header">
        <h1>Quản Lý Người Dùng</h1>
        <router-link to="/admin" class="btn-back">← Quay lại Dashboard</router-link>
      </div>

      <div class="filters">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm theo tên, email..."
            @input="handleSearch"
          />
        </div>
        <div class="filter-group">
          <label>Lọc theo vai trò:</label>
          <select v-model="roleFilter" @change="handleFilter">
            <option value="">Tất cả</option>
            <option value="STUDENT">Học viên</option>
            <option value="INSTRUCTOR">Giảng viên</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <p>Đang tải danh sách người dùng...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadUsers" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="no-data">
        <p>Không tìm thấy người dùng nào.</p>
      </div>

      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>#{{ user.id }}</td>
              <td>{{ user.name || 'N/A' }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', user.role.toLowerCase()]">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <span :class="['status-badge', user.enabled ? 'active' : 'inactive']">
                  {{ user.enabled ? 'Hoạt động' : 'Vô hiệu hóa' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button 
                    @click="viewUser(user.id)" 
                    class="btn-view"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button 
                    v-if="user.id !== currentUserId"
                    @click="toggleStatus(user)" 
                    :class="['btn-toggle', user.enabled ? 'active' : 'inactive']"
                    :title="user.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'"
                  >
                    {{ user.enabled ? '🔒' : '🔓' }}
                  </button>
                  <button 
                    v-if="user.role !== 'ADMIN' || user.id !== currentUserId"
                    @click="confirmDelete(user)" 
                    class="btn-delete"
                    title="Xóa người dùng"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
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
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Chi Tiết Người Dùng</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetail" class="loading">
            <p>Đang tải thông tin...</p>
          </div>
          <div v-else-if="userDetail">
            <div class="detail-row">
              <label>ID:</label>
              <span>#{{ userDetail.id }}</span>
            </div>
            <div class="detail-row">
              <label>Tên:</label>
              <span>{{ userDetail.name || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <label>Email:</label>
              <span>{{ userDetail.email }}</span>
            </div>
            <div class="detail-row">
              <label>Vai trò:</label>
              <span :class="['role-badge', userDetail.role.toLowerCase()]">
                {{ getRoleText(userDetail.role) }}
              </span>
            </div>
            <div class="detail-row">
              <label>Trạng thái:</label>
              <span :class="['status-badge', userDetail.enabled ? 'active' : 'inactive']">
                {{ userDetail.enabled ? 'Hoạt động' : 'Vô hiệu hóa' }}
              </span>
            </div>
            <div class="detail-row">
              <label>Ngày tạo:</label>
              <span>{{ formatDate(userDetail.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <label>Cập nhật lần cuối:</label>
              <span>{{ formatDate(userDetail.updatedAt) }}</span>
            </div>
          </div>
          <div class="modal-actions" v-if="userDetail.id !== currentUserId">
            <button 
              @click="toggleStatusFromDetail" 
              :class="['btn-action', userDetail.enabled ? 'deactivate' : 'activate']"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Đang xử lý...' : (userDetail.enabled ? '🔒 Vô hiệu hóa' : '🔓 Kích hoạt') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmUser" class="modal" @click="cancelDelete">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h2>Xác nhận xóa</h2>
          <button @click="cancelDelete" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa người dùng <strong>{{ deleteConfirmUser.email }}</strong>?</p>
          <p class="warning">⚠️ Hành động này không thể hoàn tác!</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-cancel">Hủy</button>
          <button @click="deleteUser" class="btn-confirm-delete" :disabled="isDeleting">
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
  name: 'AdminUsers',
  setup() {
    const users = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const roleFilter = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const selectedUser = ref(null)
    const userDetail = ref(null)
    const isLoadingDetail = ref(false)
    const deleteConfirmUser = ref(null)
    const isDeleting = ref(false)
    const isUpdating = ref(false)
    const currentUserId = ref(null)

    const loadUsers = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await adminService.getAllUsers()
        const data = response?.data ?? response
        users.value = Array.isArray(data) ? data : []
        
        // Get current user ID from token
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            currentUserId.value = payload.userId || payload.sub
          } catch (e) {
            console.error('Failed to parse token:', e)
          }
        }
      } catch (err) {
        error.value = 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.'
        console.error('Load users error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const filteredUsers = computed(() => {
      let filtered = users.value

      // Filter by role
      if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / itemsPerPage)
    })

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredUsers.value.slice(start, end)
    })

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

    const viewUser = async (userId) => {
      try {
        isLoadingDetail.value = true
        selectedUser.value = true
        userDetail.value = null
        const response = await adminService.getUserById(userId)
        userDetail.value = response?.data ?? response
      } catch (err) {
        console.error('Get user detail error:', err)
        alert('Không thể tải thông tin người dùng')
        selectedUser.value = null
      } finally {
        isLoadingDetail.value = false
      }
    }

    const closeModal = () => {
      selectedUser.value = null
      userDetail.value = null
    }

    const confirmDelete = (user) => {
      deleteConfirmUser.value = user
    }

    const cancelDelete = () => {
      deleteConfirmUser.value = null
    }

    const deleteUser = async () => {
      try {
        isDeleting.value = true
        await adminService.deleteUser(deleteConfirmUser.value.id)
        // Remove user from list
        users.value = users.value.filter(u => u.id !== deleteConfirmUser.value.id)
        cancelDelete()
        alert('Xóa người dùng thành công!')
      } catch (err) {
        console.error('Delete user error:', err)
        alert('Không thể xóa người dùng. Vui lòng thử lại sau.')
      } finally {
        isDeleting.value = false
      }
    }

    const toggleStatus = async (user) => {
      try {
        const action = user.enabled ? 'vô hiệu hóa' : 'kích hoạt'
        if (!confirm(`Bạn có chắc chắn muốn ${action} người dùng ${user.email}?`)) {
          return
        }

        await adminService.toggleUserStatus(user.id)
        
        // Update user in list
        const userIndex = users.value.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          users.value[userIndex].enabled = !users.value[userIndex].enabled
        }
        
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công!`)
      } catch (err) {
        console.error('Toggle user status error:', err)
        alert('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.')
      }
    }

    const toggleStatusFromDetail = async () => {
      try {
        isUpdating.value = true
        await adminService.toggleUserStatus(userDetail.value.id)
        
        // Update detail
        userDetail.value.enabled = !userDetail.value.enabled
        
        // Update user in list
        const userIndex = users.value.findIndex(u => u.id === userDetail.value.id)
        if (userIndex !== -1) {
          users.value[userIndex].enabled = userDetail.value.enabled
        }
        
        const action = userDetail.value.enabled ? 'kích hoạt' : 'vô hiệu hóa'
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công!`)
      } catch (err) {
        console.error('Toggle user status error:', err)
        alert('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.')
      } finally {
        isUpdating.value = false
      }
    }

    const getRoleText = (role) => {
      const roleMap = {
        'STUDENT': 'Học viên',
        'INSTRUCTOR': 'Giảng viên',
        'ADMIN': 'Quản trị viên'
      }
      return roleMap[role] || role
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      isLoading,
      error,
      searchQuery,
      roleFilter,
      currentPage,
      filteredUsers,
      paginatedUsers,
      totalPages,
      selectedUser,
      userDetail,
      isLoadingDetail,
      deleteConfirmUser,
      isDeleting,
      isUpdating,
      currentUserId,
      loadUsers,
      handleSearch,
      handleFilter,
      prevPage,
      nextPage,
      viewUser,
      closeModal,
      confirmDelete,
      cancelDelete,
      deleteUser,
      toggleStatus,
      toggleStatusFromDetail,
      getRoleText,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-users {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #333;
  margin: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
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

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #555;
}

tbody tr:hover {
  background: #f9fafb;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.student {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.instructor {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.admin {
  background: #fce7f3;
  color: #9f1239;
}

.status-badge {
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-toggle, .btn-delete {
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #e0e7ff;
}

.btn-toggle:hover {
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
  padding: 1.5rem;
  border-top: 1px solid #eee;
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

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row label {
  font-weight: 600;
  color: #555;
  min-width: 150px;
}

.detail-row span {
  color: #333;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-action {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-action.activate {
  background: #10b981;
  color: white;
}

.btn-action.activate:hover:not(:disabled) {
  background: #059669;
}

.btn-action.deactivate {
  background: #f59e0b;
  color: white;
}

.btn-action.deactivate:hover:not(:disabled) {
  background: #d97706;
}

.btn-action:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
