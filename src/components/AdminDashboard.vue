<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1>Trang Quản Trị</h1>
      
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Tổng Khóa Học</h3>
          <p class="stat-number">{{ totalCourses }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng Học Viên</h3>
          <p class="stat-number">{{ totalStudents }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng Doanh Thu</h3>
          <p class="stat-number">{{ formatPrice(totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>Đơn Hàng Mới</h3>
          <p class="stat-number">{{ newOrders }}</p>
        </div>
      </div>

      <div class="admin-actions">
        <h2>Quản Lý</h2>
        <div class="action-grid">
          <router-link to="/admin/courses" class="action-card">
            <div class="action-icon">📚</div>
            <h3>Quản Lý Khóa Học</h3>
            <p>Thêm, sửa, xóa khóa học</p>
          </router-link>
          <router-link to="/admin/create-course" class="action-card">
            <div class="action-icon">➕</div>
            <h3>Tạo Khóa Học Mới</h3>
            <p>Tạo và thêm khóa học mới vào hệ thống</p>
          </router-link>
          <router-link to="/admin/upload" class="action-card">
            <div class="action-icon">📤</div>
            <h3>Upload Tài Liệu</h3>
            <p>Upload tài liệu cho các khóa học</p>
          </router-link>
          <router-link to="/admin/users" class="action-card">
            <div class="action-icon">👥</div>
            <h3>Quản Lý Người Dùng</h3>
            <p>Xem danh sách và quản lý người dùng</p>
          </router-link>
          <router-link to="/admin/orders" class="action-card">
            <div class="action-icon">💰</div>
            <h3>Quản Lý Đơn Hàng</h3>
            <p>Xem và xử lý đơn hàng</p>
          </router-link>
        </div>
      </div>

      <div class="recent-orders">
        <h2>Đơn Hàng Gần Đây</h2>
        <div v-if="isLoading" class="loading">
          <p>Đang tải đơn hàng...</p>
        </div>
        <div v-else-if="recentOrders.length === 0" class="no-orders">
          <p>Chưa có đơn hàng nào.</p>
        </div>
        <div v-else class="orders-table">
          <table>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày Đặt</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>{{ formatPrice(order.amount) }}</td>
                <td>
                  <span :class="['status', order.status]">{{ order.statusText }}</span>
                </td>
                <td>{{ order.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { adminService } from '../services/adminService'
import { courseService } from '../services/courseService'

export default {
  name: 'AdminDashboard',
  setup() {
    const totalCourses = ref(0)
    const totalStudents = ref(0)
    const totalRevenue = ref(0)
    const newOrders = ref(0)
    const recentOrders = ref([])
    const isLoading = ref(false)

    const loadStats = async () => {
      try {
        isLoading.value = true
        // Load stats từ API /api/admin/statistics (theo Swagger)
        try {
          const stats = await adminService.getStatistics()
          const statsData = stats?.data ?? stats
          totalCourses.value = statsData?.totalCourses || 0
          totalStudents.value = statsData?.totalStudents || 0
          totalRevenue.value = statsData?.totalRevenue || 0
          newOrders.value = statsData?.newOrders || 0
          recentOrders.value = statsData?.recentOrders || []
        } catch (error) {
          console.warn('Admin statistics API not available, calculating from data:', error)
          // Fallback: tính từ dữ liệu có sẵn
          const courses = await courseService.getList()
          const orders = await adminService.getAllOrders() // Dùng adminService để lấy tất cả orders
          const courseList = Array.isArray(courses) ? courses : (courses?.data || [])
          const orderList = Array.isArray(orders) ? orders : (orders?.data || [])
          
          totalCourses.value = courseList.length
          totalStudents.value = courseList.reduce((sum, c) => sum + (c.studentCount || 0), 0)
          
          // QUAN TRỌNG: Chỉ tính doanh thu từ đơn hàng đã thanh toán (PAID)
          totalRevenue.value = orderList
            .filter(o => o.status === 'PAID')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          
          newOrders.value = orderList.filter(o => o.status === 'PENDING').length
          recentOrders.value = orderList
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(order => ({
              id: order.id,
              customer: order.userName || 'N/A',
              amount: order.totalAmount || 0,
              status: order.status?.toLowerCase() || 'pending',
              statusText: getStatusText(order.status),
              date: new Date(order.createdAt).toLocaleDateString('vi-VN')
            }))
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error)
      } finally {
        isLoading.value = false
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

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    onMounted(() => {
      loadStats()
    })

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      newOrders,
      recentOrders,
      isLoading,
      formatPrice
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.admin-dashboard h1 {
  margin-bottom: 2rem;
  color: #333;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #4F46E5;
}

.admin-actions {
  margin-bottom: 3rem;
}

.admin-actions h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.action-card p {
  color: #666;
  font-size: 0.9rem;
}

.recent-orders {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-orders h2 {
  margin-bottom: 1rem;
  color: #333;
}

.orders-table {
  overflow-x: auto;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #555;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.completed {
  background: #d1fae5;
  color: #065f46;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}
</style>
