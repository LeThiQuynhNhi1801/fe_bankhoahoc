<template>
  <div class="admin-orders">
    <div class="container">
      <div class="header">
        <h1>Quản Lý Đơn Hàng</h1>
        <router-link to="/admin" class="btn-back">← Quay lại Dashboard</router-link>
      </div>

      <div class="filters">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, email..."
            @input="handleSearch"
          />
        </div>
        <div class="filter-group">
          <label>Lọc theo trạng thái:</label>
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">Tất cả</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>
        <button @click="loadOrders" class="btn-refresh">🔄 Làm mới</button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h3>Tổng đơn hàng</h3>
          <p>{{ orders.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Đang xử lý</h3>
          <p>{{ getOrderCountByStatus('PENDING') }}</p>
        </div>
        <div class="stat-card">
          <h3>Đã thanh toán</h3>
          <p>{{ getOrderCountByStatus('PAID') }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng doanh thu</h3>
          <p>{{ formatPrice(totalRevenue) }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <p>Đang tải danh sách đơn hàng...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadOrders" class="btn-retry">Thử lại</button>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="no-data">
        <p>Không tìm thấy đơn hàng nào.</p>
      </div>

      <div v-else class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Email</th>
              <th>Số lượng khóa học</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td><strong>#{{ order.id }}</strong></td>
              <td>{{ order.userName || 'N/A' }}</td>
              <td>{{ order.userEmail || 'N/A' }}</td>
              <td>{{ order.items?.length || 0 }}</td>
              <td><strong>{{ formatPrice(order.totalAmount) }}</strong></td>
              <td>
                <span :class="['status-badge', getStatusClass(order.status)]">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button 
                    @click="viewOrder(order.id)" 
                    class="btn-view"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button 
                    v-if="order.status === 'PENDING'"
                    @click="confirmOrder(order.id)" 
                    class="btn-approve"
                    title="Xác nhận đơn hàng"
                  >
                    ✓
                  </button>
                  <button 
                    v-if="order.status === 'PENDING' || order.status === 'PAID'"
                    @click="cancelOrder(order.id)" 
                    class="btn-cancel"
                    title="Hủy đơn hàng"
                  >
                    ✕
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

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Chi Tiết Đơn Hàng #{{ orderDetail?.id }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetail" class="loading">
            <p>Đang tải thông tin...</p>
          </div>
          <div v-else-if="orderDetail">
            <div class="detail-section">
              <h3>Thông tin chung</h3>
              <div class="detail-row">
                <label>Mã đơn hàng:</label>
                <span><strong>#{{ orderDetail.id }}</strong></span>
              </div>
              <div class="detail-row">
                <label>Khách hàng:</label>
                <span>{{ orderDetail.userName || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <label>Email:</label>
                <span>{{ orderDetail.userEmail || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <label>Trạng thái:</label>
                <span :class="['status-badge', getStatusClass(orderDetail.status)]">
                  {{ getStatusText(orderDetail.status) }}
                </span>
              </div>
              <div class="detail-row">
                <label>Ngày tạo:</label>
                <span>{{ formatDate(orderDetail.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <label>Cập nhật lần cuối:</label>
                <span>{{ formatDate(orderDetail.updatedAt) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Danh sách khóa học</h3>
              <div v-if="orderDetail.items && orderDetail.items.length > 0" class="items-list">
                <div v-for="item in orderDetail.items" :key="item.id" class="item-card">
                  <div class="item-info">
                    <h4>{{ item.courseName || item.courseTitle || 'N/A' }}</h4>
                    <p>Mã khóa học: #{{ item.courseId }}</p>
                  </div>
                  <div class="item-price">
                    {{ formatPrice(item.price) }}
                  </div>
                </div>
              </div>
              <p v-else class="no-items">Không có khóa học nào.</p>
            </div>

            <div class="detail-section">
              <h3>Thông tin thanh toán</h3>
              <div class="detail-row">
                <label>Tổng tiền:</label>
                <span class="total-amount"><strong>{{ formatPrice(orderDetail.totalAmount) }}</strong></span>
              </div>
              <div v-if="orderDetail.qrCodeImage" class="detail-row">
                <label>QR Code thanh toán:</label>
                <div class="qr-code">
                  <img :src="orderDetail.qrCodeImage" alt="QR Code" />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button 
                v-if="orderDetail.status === 'PENDING'"
                @click="confirmOrderFromDetail(orderDetail.id)" 
                class="btn-action approve"
                :disabled="isUpdatingStatus"
              >
                {{ isUpdatingStatus ? 'Đang xử lý...' : '✓ Xác nhận đơn hàng' }}
              </button>
              <button 
                v-if="orderDetail.status === 'PENDING' || orderDetail.status === 'PAID'"
                @click="cancelOrderFromDetail(orderDetail.id)" 
                class="btn-action cancel"
                :disabled="isUpdatingStatus"
              >
                {{ isUpdatingStatus ? 'Đang xử lý...' : '✕ Hủy đơn hàng' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../services/adminService'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const selectedOrder = ref(null)
    const orderDetail = ref(null)
    const isLoadingDetail = ref(false)
    const isUpdatingStatus = ref(false)

    const loadOrders = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await adminService.getAllOrders()
        const data = response?.data ?? response
        orders.value = Array.isArray(data) ? data : []
        // Sort by created date (newest first)
        orders.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } catch (err) {
        error.value = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.'
        console.error('Load orders error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const filteredOrders = computed(() => {
      let filtered = orders.value

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.status === statusFilter.value)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.id?.toString().includes(query) ||
          order.userName?.toLowerCase().includes(query) ||
          order.userEmail?.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / itemsPerPage)
    })

    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredOrders.value.slice(start, end)
    })

    const totalRevenue = computed(() => {
      return orders.value
        .filter(order => order.status === 'PAID')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    })

    const getOrderCountByStatus = (status) => {
      return orders.value.filter(order => order.status === status).length
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

    const viewOrder = async (orderId) => {
      try {
        isLoadingDetail.value = true
        selectedOrder.value = true
        orderDetail.value = null
        const response = await adminService.getOrderById(orderId)
        orderDetail.value = response?.data ?? response
      } catch (err) {
        console.error('Get order detail error:', err)
        alert('Không thể tải thông tin đơn hàng')
        selectedOrder.value = null
      } finally {
        isLoadingDetail.value = false
      }
    }

    const closeModal = () => {
      selectedOrder.value = null
      orderDetail.value = null
    }

    const confirmOrder = async (orderId) => {
      try {
        if (!confirm(`Bạn có chắc chắn muốn xác nhận đơn hàng #${orderId}?`)) {
          return
        }

        await adminService.confirmOrder(orderId)
        
        // Update order in list
        const orderIndex = orders.value.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'PAID'
        }
        
        alert('Xác nhận đơn hàng thành công!')
      } catch (err) {
        console.error('Confirm order error:', err)
        alert('Không thể xác nhận đơn hàng. Vui lòng thử lại sau.')
      }
    }

    const cancelOrder = async (orderId) => {
      try {
        if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) {
          return
        }

        await adminService.cancelOrder(orderId)
        
        // Update order in list
        const orderIndex = orders.value.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'CANCELLED'
        }
        
        alert('Hủy đơn hàng thành công!')
      } catch (err) {
        console.error('Cancel order error:', err)
        alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      }
    }

    const confirmOrderFromDetail = async (orderId) => {
      try {
        isUpdatingStatus.value = true
        await adminService.confirmOrder(orderId)
        
        // Update order in list
        const orderIndex = orders.value.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'PAID'
        }
        
        // Update detail
        if (orderDetail.value) {
          orderDetail.value.status = 'PAID'
        }
        
        alert('Xác nhận đơn hàng thành công!')
      } catch (err) {
        console.error('Confirm order error:', err)
        alert('Không thể xác nhận đơn hàng. Vui lòng thử lại sau.')
      } finally {
        isUpdatingStatus.value = false
      }
    }

    const cancelOrderFromDetail = async (orderId) => {
      try {
        isUpdatingStatus.value = true
        await adminService.cancelOrder(orderId)
        
        // Update order in list
        const orderIndex = orders.value.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'CANCELLED'
        }
        
        // Update detail
        if (orderDetail.value) {
          orderDetail.value.status = 'CANCELLED'
        }
        
        alert('Hủy đơn hàng thành công!')
      } catch (err) {
        console.error('Cancel order error:', err)
        alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      } finally {
        isUpdatingStatus.value = false
      }
    }

    const getStatusText = (status) => {
      const statusMap = {
        'PENDING': 'Đang xử lý',
        'PAID': 'Đã thanh toán',
        'CANCELLED': 'Đã hủy',
        'REFUNDED': 'Đã hoàn tiền'
      }
      return statusMap[status] || status
    }

    const getStatusClass = (status) => {
      return status?.toLowerCase() || 'pending'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price || 0)
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
      loadOrders()
    })

    return {
      orders,
      isLoading,
      error,
      searchQuery,
      statusFilter,
      currentPage,
      filteredOrders,
      paginatedOrders,
      totalPages,
      totalRevenue,
      selectedOrder,
      orderDetail,
      isLoadingDetail,
      isUpdatingStatus,
      loadOrders,
      getOrderCountByStatus,
      handleSearch,
      handleFilter,
      prevPage,
      nextPage,
      viewOrder,
      closeModal,
      confirmOrder,
      cancelOrder,
      confirmOrderFromDetail,
      cancelOrderFromDetail,
      getStatusText,
      getStatusClass,
      formatPrice,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-orders {
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
  margin-bottom: 1.5rem;
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

.orders-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
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
  white-space: nowrap;
}

tbody tr:hover {
  background: #f9fafb;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.refunded {
  background: #e0e7ff;
  color: #3730a3;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-approve, .btn-cancel {
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

.btn-approve:hover {
  background: #d1fae5;
}

.btn-cancel:hover {
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
  overflow-y: auto;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4F46E5;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row label {
  font-weight: 600;
  color: #555;
  min-width: 180px;
}

.detail-row span {
  color: #333;
}

.total-amount {
  color: #4F46E5;
  font-size: 1.2rem;
}

.qr-code {
  max-width: 300px;
}

.qr-code img {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.item-price {
  font-weight: bold;
  color: #4F46E5;
  font-size: 1.1rem;
}

.no-items {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-action.approve {
  background: #10b981;
  color: white;
}

.btn-action.approve:hover:not(:disabled) {
  background: #059669;
}

.btn-action.cancel {
  background: #dc3545;
  color: white;
}

.btn-action.cancel:hover:not(:disabled) {
  background: #c82333;
}

.btn-action:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
