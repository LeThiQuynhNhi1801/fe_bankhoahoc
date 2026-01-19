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
          <div class="action-card">
            <div class="action-icon">👥</div>
            <h3>Quản Lý Học Viên</h3>
            <p>Xem danh sách và quản lý học viên</p>
          </div>
          <div class="action-card">
            <div class="action-icon">💰</div>
            <h3>Quản Lý Đơn Hàng</h3>
            <p>Xem và xử lý đơn hàng</p>
          </div>
          <div class="action-card">
            <div class="action-icon">📊</div>
            <h3>Báo Cáo Thống Kê</h3>
            <p>Xem báo cáo và thống kê chi tiết</p>
          </div>
          <div class="action-card">
            <div class="action-icon">⚙️</div>
            <h3>Cài Đặt</h3>
            <p>Cấu hình hệ thống</p>
          </div>
        </div>
      </div>

      <div class="recent-orders">
        <h2>Đơn Hàng Gần Đây</h2>
        <div class="orders-table">
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

export default {
  name: 'AdminDashboard',
  setup() {
    const totalCourses = ref(24)
    const totalStudents = ref(1543)
    const totalRevenue = ref(125000000)
    const newOrders = ref(12)

    const recentOrders = ref([
      {
        id: 1001,
        customer: 'Nguyễn Văn A',
        amount: 499000,
        status: 'completed',
        statusText: 'Hoàn thành',
        date: '2024-01-20'
      },
      {
        id: 1002,
        customer: 'Trần Thị B',
        amount: 899000,
        status: 'pending',
        statusText: 'Đang xử lý',
        date: '2024-01-20'
      },
      {
        id: 1003,
        customer: 'Lê Văn C',
        amount: 549000,
        status: 'completed',
        statusText: 'Hoàn thành',
        date: '2024-01-19'
      }
    ])

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      newOrders,
      recentOrders,
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
