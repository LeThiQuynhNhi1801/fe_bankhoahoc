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
              <p><strong>Phương thức:</strong> {{ order.paymentMethod }}</p>
              <p><strong>Tạm tính:</strong> {{ formatPrice(order.subtotal) }}</p>
              <p v-if="order.discount > 0"><strong>Giảm giá:</strong> -{{ formatPrice(order.discount) }}</p>
              <p class="total"><strong>Tổng cộng:</strong> {{ formatPrice(order.total) }}</p>
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

export default {
  name: 'OrderSuccess',
  setup() {
    const route = useRoute()
    const orderCode = ref(route.query.orderCode || '')
    const order = ref(null)

    const loadOrder = () => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      order.value = orders.find(o => o.orderCode === orderCode.value)
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
      formatPrice,
      downloadInvoice
    }
  }
}
</script>
