<template>
  <div class="order-success">
    <div class="container">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h1>Đặt Hàng Thành Công!</h1>
        <p class="success-message">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
        </p>
        
        <div class="order-info">
          <div class="info-box">
            <h3>Mã Đơn Hàng</h3>
            <p class="order-code">{{ orderCode }}</p>
          </div>
          
          <div v-if="order" class="order-details">
            <h3>Chi Tiết Đơn Hàng</h3>
            <div class="detail-section">
              <h4>Khóa Học Đã Mua:</h4>
              <div 
                v-for="item in order.items" 
                :key="item.id"
                class="order-item"
              >
                <img :src="item.image" :alt="item.title" class="item-thumb">
                <div class="item-info">
                  <h5>{{ item.title }}</h5>
                  <p>{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Thông Tin Khách Hàng:</h4>
              <p><strong>Họ tên:</strong> {{ order.customer.fullName }}</p>
              <p><strong>Email:</strong> {{ order.customer.email }}</p>
              <p><strong>Số điện thoại:</strong> {{ order.customer.phone }}</p>
              <p v-if="order.customer.address"><strong>Địa chỉ:</strong> {{ order.customer.address }}</p>
            </div>

            <div class="detail-section">
              <h4>Thông Tin Thanh Toán:</h4>
              <p><strong>Phương thức:</strong> {{ order.paymentMethod || 'QR Code' }}</p>
              <p><strong>Tạm tính:</strong> {{ formatPrice(order.subtotal) }}</p>
              <p v-if="order.discount > 0"><strong>Giảm giá:</strong> -{{ formatPrice(order.discount) }}</p>
              <p class="total"><strong>Tổng cộng:</strong> {{ formatPrice(order.total) }}</p>
              
              <!-- QR Code Display -->
              <div v-if="order.qrCodeUrl" class="qr-payment-section">
                <h4>Quét QR Code Để Thanh Toán</h4>
                <div class="qr-code-container">
                  <img :src="order.qrCodeUrl" alt="QR Code" class="qr-code-image" />
                  <p class="qr-amount">Số tiền: <strong>{{ formatPrice(order.total) }}</strong></p>
                  <p v-if="order.qrCodeContent" class="qr-content">
                    Hoặc copy nội dung: <code>{{ order.qrCodeContent }}</code>
                  </p>
                </div>
                
                <div v-if="order.bankName" class="bank-info">
                  <h5>Thông Tin Tài Khoản</h5>
                  <p><strong>Ngân hàng:</strong> {{ order.bankName }}</p>
                  <p><strong>Số tài khoản:</strong> {{ order.accountNumber }}</p>
                  <p><strong>Chủ tài khoản:</strong> {{ order.accountName }}</p>
                  <p><strong>Nội dung chuyển khoản:</strong> {{ order.orderNumber || orderCode }}</p>
                </div>
                
                <p v-if="order.status === 'PENDING'" class="payment-status">
                  ⏳ Đang chờ thanh toán. Vui lòng quét QR code để hoàn tất thanh toán.
                </p>
                <p v-else-if="order.status === 'PAID'" class="payment-status success">
                  ✅ Đã thanh toán thành công!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <router-link to="/courses" class="btn btn-primary">
            Tiếp Tục Mua Sắm
          </router-link>
          <button @click="downloadInvoice" class="btn btn-secondary">
            Tải Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderService } from '../services/orderService'

export default {
  name: 'OrderSuccess',
  setup() {
    const route = useRoute()
    const orderCode = ref(route.query.orderCode || route.query.orderNumber || '')
    const orderId = ref(route.query.orderId ? parseInt(route.query.orderId) : null)
    const order = ref(null)
    const isLoading = ref(false)

    const loadOrder = async () => {
      // Nếu có orderId, load từ API
      if (orderId.value) {
        try {
          isLoading.value = true
          const orderData = await orderService.getById(orderId.value)
          
          // Map API response sang format của component
          order.value = {
            id: orderData.id,
            orderNumber: orderData.orderNumber || orderCode.value,
            items: orderData.items || [],
            customer: {
              fullName: orderData.userName || 'N/A',
              email: '',
              phone: ''
            },
            paymentMethod: orderData.paymentMethod || 'QR Code',
            qrCodeUrl: orderData.qrCodeUrl,
            qrCodeContent: orderData.qrCodeContent,
            bankName: orderData.bankName,
            accountNumber: orderData.accountNumber,
            accountName: orderData.accountName,
            subtotal: orderData.totalAmount || 0,
            discount: 0,
            total: orderData.totalAmount || 0,
            date: orderData.createdAt,
            status: orderData.status || 'PENDING'
          }
          
          if (!orderCode.value && orderData.orderNumber) {
            orderCode.value = orderData.orderNumber
          }
        } catch (error) {
          console.error('Failed to load order from API:', error)
          // Fallback to localStorage
          loadOrderFromLocalStorage()
        } finally {
          isLoading.value = false
        }
      } else {
        // Load từ localStorage
        loadOrderFromLocalStorage()
      }
    }

    const loadOrderFromLocalStorage = () => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      if (orderCode.value) {
        order.value = orders.find(o => o.orderCode === orderCode.value || o.orderNumber === orderCode.value)
      } else if (orders.length > 0) {
        // Lấy order mới nhất
        order.value = orders[orders.length - 1]
        orderCode.value = order.value.orderCode || order.value.orderNumber || ''
      }
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const downloadInvoice = () => {
      // Create invoice content
      let invoiceContent = `
HÓA ĐƠN BÁN HÀNG
==================

Mã đơn hàng: ${order.value.orderCode}
Ngày đặt: ${new Date(order.value.date).toLocaleString('vi-VN')}

Khóa học:
${order.value.items.map(item => `- ${item.title} (${item.quantity}x) - ${formatPrice(item.price * item.quantity)}`).join('\n')}

Tạm tính: ${formatPrice(order.value.subtotal)}
${order.value.discount > 0 ? `Giảm giá: -${formatPrice(order.value.discount)}\n` : ''}
Tổng cộng: ${formatPrice(order.value.total)}

Khách hàng: ${order.value.customer.fullName}
Email: ${order.value.customer.email}
Số điện thoại: ${order.value.customer.phone}

Cảm ơn bạn đã mua hàng!
      `.trim()

      // Create and download file
      const blob = new Blob([invoiceContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HoaDon_${orderCode.value}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    onMounted(() => {
      loadOrder()
    })

    return {
      orderCode,
      order,
      isLoading,
      formatPrice,
      downloadInvoice
    }
  }
}
</script>

<style scoped>
.order-success {
  padding: 2rem 0;
}

.success-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-content h1 {
  color: #333;
  margin-bottom: 1rem;
}

.success-message {
  color: #666;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.order-info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: left;
}

.info-box {
  margin-bottom: 2rem;
}

.info-box h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.order-code {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4F46E5;
}

.order-details {
  margin-top: 2rem;
}

.order-details h3 {
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #333;
  margin-bottom: 1rem;
}

.detail-section h5 {
  color: #333;
  margin-bottom: 0.5rem;
}

.detail-section p {
  margin: 0.5rem 0;
  color: #555;
}

.detail-section .total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.item-info h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.qr-payment-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.qr-payment-section h4 {
  margin-top: 0;
  color: #333;
}

.qr-code-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.qr-code-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  margin-bottom: 1rem;
}

.qr-amount {
  font-size: 1.25rem;
  color: #333;
  margin: 1rem 0;
}

.qr-amount strong {
  color: #4F46E5;
  font-size: 1.5rem;
}

.qr-content {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.qr-content code {
  display: block;
  word-break: break-all;
  color: #4F46E5;
  font-family: monospace;
  font-size: 0.875rem;
}

.bank-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.bank-info h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.bank-info p {
  margin: 0.5rem 0;
  color: #555;
}

.payment-status {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 6px;
  color: #92400e;
  font-weight: 500;
}

.payment-status.success {
  background: #d1fae5;
  color: #065f46;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #4F46E5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
