<template>
  <div class="checkout">
    <div class="container">
      <h1 class="page-title">Thanh Toán</h1>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>Giỏ hàng của bạn đang trống.</p>
        <router-link to="/courses" class="btn btn-primary">Xem Khóa Học</router-link>
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <div class="form-section">
            <h2>Thông Tin Khách Hàng</h2>
            <div class="form-group">
              <label>Họ và Tên *</label>
              <input 
                v-model="formData.fullName" 
                type="text" 
                placeholder="Nhập họ và tên"
                required
              >
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="formData.email" 
                type="email" 
                placeholder="email@example.com"
                required
              >
            </div>
            <div class="form-group">
              <label>Số Điện Thoại *</label>
              <input 
                v-model="formData.phone" 
                type="tel" 
                placeholder="0901234567"
                required
              >
            </div>
            <div class="form-group">
              <label>Địa Chỉ</label>
              <input 
                v-model="formData.address" 
                type="text" 
                placeholder="Nhập địa chỉ"
              >
            </div>
          </div>

          <div class="form-section">
            <h2>Thanh Toán Bằng QR Code</h2>
            <div class="qr-payment-info">
              <div class="info-box">
                <p class="info-text">
                  Sau khi xác nhận đơn hàng, hệ thống sẽ tự động tạo QR code thanh toán. 
                  Bạn chỉ cần quét QR code bằng ứng dụng ngân hàng để thanh toán.
                </p>
              </div>
            </div>

            <!-- QR Code Display (sau khi tạo order) -->
            <div v-if="orderResponse && orderResponse.qrCodeUrl" class="qr-code-section">
              <h3>Quét QR Code Để Thanh Toán</h3>
              <div class="qr-code-container">
                <img :src="orderResponse.qrCodeUrl" alt="QR Code" class="qr-code-image" />
                <p class="qr-amount">Số tiền: <strong>{{ formatPrice(orderResponse.totalAmount) }}</strong></p>
                <p v-if="orderResponse.qrCodeContent" class="qr-content">
                  Hoặc copy nội dung: <code>{{ orderResponse.qrCodeContent }}</code>
                </p>
              </div>
              
              <div v-if="orderResponse.bankName" class="bank-info">
                <h4>Thông Tin Tài Khoản</h4>
                <p><strong>Ngân hàng:</strong> {{ orderResponse.bankName }}</p>
                <p><strong>Số tài khoản:</strong> {{ orderResponse.accountNumber }}</p>
                <p><strong>Chủ tài khoản:</strong> {{ orderResponse.accountName }}</p>
                <p><strong>Nội dung chuyển khoản:</strong> {{ orderResponse.orderNumber || orderCode }}</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Ghi Chú Đơn Hàng</h2>
            <div class="form-group">
              <textarea 
                v-model="formData.notes" 
                rows="4" 
                placeholder="Ghi chú thêm (nếu có)..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>Đơn Hàng</h2>
          <div class="order-items">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="order-item"
            >
              <img :src="item.image" :alt="item.title" class="item-thumb">
              <div class="item-details">
                <h4>{{ item.title }}</h4>
                <p>{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
              </div>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-row">
              <span>Tạm tính:</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Giảm giá:</span>
              <span class="discount">-{{ formatPrice(discount) }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng cộng:</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
          </div>

          <button 
            v-if="!orderResponse"
            @click="processPayment" 
            :disabled="isProcessing"
            class="btn btn-primary btn-large btn-block"
          >
            <span v-if="!isProcessing">Tạo Đơn Hàng & Lấy QR Code</span>
            <span v-else>Đang tạo đơn hàng...</span>
          </button>
          
          <router-link 
            v-if="orderResponse"
            :to="{ path: '/order-success', query: { orderId: orderResponse.id, orderCode: orderResponse.orderNumber || orderCode } }"
            class="btn btn-success btn-large btn-block"
          >
            Xem Chi Tiết Đơn Hàng
          </router-link>
          
          <router-link to="/cart" class="back-link">
            ← Quay lại giỏ hàng
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Checkout',
  setup() {
    const router = useRouter()
    const cartItems = ref([])
    const isProcessing = ref(false)
    const orderCode = ref('')
    const orderResponse = ref(null)

    const formData = ref({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    })

    const loadCart = async () => {
      try {
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
        
        if (cartData.length === 0) {
          router.push('/cart')
          return
        }
        
        // Nếu cart chỉ chứa IDs (số hoặc chuỗi số), cần load course details
        if (typeof cartData[0] === 'number' || typeof cartData[0] === 'string') {
          // Cart chứa IDs, cần load course details
          const { courseService } = await import('../services/courseService')
          const courseIds = cartData.map(id => parseInt(id)).filter(id => !isNaN(id))
          
          // Load course details từ API
          const courses = await Promise.all(
            courseIds.map(async (courseId) => {
              try {
                const course = await courseService.getById(courseId)
                return {
                  id: course.id,
                  courseId: course.id,
                  title: course.title,
                  price: course.price || 0,
                  thumbnail: course.thumbnail,
                  image: course.thumbnail || course.image || '/placeholder-course.jpg',
                  quantity: 1
                }
              } catch (error) {
                console.error(`Failed to load course ${courseId}:`, error)
                return null
              }
            })
          )
          
          // Filter out null values và group by courseId để đếm quantity
          const courseMap = new Map()
          courses.filter(c => c !== null).forEach(course => {
            const existing = courseMap.get(course.id)
            if (existing) {
              existing.quantity += 1
            } else {
              courseMap.set(course.id, course)
            }
          })
          
          cartItems.value = Array.from(courseMap.values())
        } else {
          // Cart đã chứa full objects, nhưng cần đảm bảo có đủ fields
          cartItems.value = cartData.map(item => ({
            id: item.id || item.courseId,
            courseId: item.id || item.courseId,
            title: item.title || 'Khóa học',
            price: item.price || 0,
            thumbnail: item.thumbnail || item.image,
            image: item.thumbnail || item.image || '/placeholder-course.jpg',
            quantity: item.quantity || 1
          }))
        }
        
        generateOrderCode()
      } catch (error) {
        console.error('Failed to load cart:', error)
        cartItems.value = []
        router.push('/cart')
      }
    }

    const generateOrderCode = () => {
      const timestamp = Date.now()
      orderCode.value = `DH${timestamp.toString().slice(-8)}`
    }

    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const discount = computed(() => {
      return subtotal.value > 1000000 ? subtotal.value * 0.1 : 0
    })

    const total = computed(() => {
      return subtotal.value - discount.value
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }


    const validateForm = () => {
      if (!formData.value.fullName || !formData.value.email || !formData.value.phone) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
        return false
      }

      if (cartItems.value.length === 0) {
        alert('Giỏ hàng của bạn đang trống!')
        return false
      }

      return true
    }

    const processPayment = async () => {
      if (!validateForm()) return

      // Kiểm tra token
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Vui lòng đăng nhập để thanh toán!')
        router.push('/login')
        return
      }

      isProcessing.value = true

      try {
        // Gọi API tạo order với courseIds
        const { orderService } = await import('../services/orderService')
        
        // Lấy courseIds từ cartItems
        const courseIds = cartItems.value.map(item => item.id || item.courseId).filter(id => id)
        
        if (courseIds.length === 0) {
          alert('Không có khóa học nào trong giỏ hàng!')
          isProcessing.value = false
          return
        }

        // OrderCreateDTO: chỉ cần courseIds
        const orderData = {
          courseIds: courseIds
        }

        console.log('Creating order with data:', orderData)
        
        // Gọi API tạo order - response sẽ có QR code
        const response = await orderService.create(orderData)
        
        console.log('Order created:', response)
        
        // Lưu response để hiển thị QR code
        orderResponse.value = response
        
        // Lưu order vào localStorage để OrderSuccess có thể hiển thị
        const order = {
          id: response.id,
          orderNumber: response.orderNumber || orderCode.value,
          items: cartItems.value,
          customer: formData.value,
          paymentMethod: response.paymentMethod || 'QR Code',
          qrCodeUrl: response.qrCodeUrl,
          qrCodeContent: response.qrCodeContent,
          bankName: response.bankName,
          accountNumber: response.accountNumber,
          accountName: response.accountName,
          subtotal: subtotal.value,
          discount: discount.value,
          total: response.totalAmount || total.value,
          date: new Date().toISOString(),
          status: response.status || 'PENDING'
        }

        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        orders.push(order)
        localStorage.setItem('orders', JSON.stringify(orders))

        // Clear cart
        localStorage.removeItem('cart')

        // Hiển thị thông báo thành công
        alert('Đơn hàng đã được tạo! Vui lòng quét QR code để thanh toán.')
        
        // Scroll đến QR code
        setTimeout(() => {
          const qrSection = document.querySelector('.qr-code-section')
          if (qrSection) {
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

      } catch (error) {
        console.error('Failed to create order:', error)
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          data: error.data
        })
        
        let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại!'
        
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
          router.push('/login')
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền tạo đơn hàng.'
        } else if (error.data?.message) {
          errorMessage = error.data.message
        }
        
        alert(errorMessage)
      } finally {
        isProcessing.value = false
      }
    }

    onMounted(async () => {
      await loadCart()
    })

    return {
      cartItems,
      formData,
      orderCode,
      orderResponse,
      subtotal,
      discount,
      total,
      isProcessing,
      formatPrice,
      processPayment
    }
  }
}
</script>

<style scoped>
.checkout {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.checkout-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4F46E5;
}

.qr-payment-info {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.info-box {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-text {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.qr-code-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.qr-code-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
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

.bank-info h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.bank-info p {
  margin: 0.5rem 0;
  color: #555;
}

.order-summary {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-item:last-child {
  border-bottom: none;
}

.item-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.item-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
}

.item-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.summary-section {
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #555;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.discount {
  color: #10b981;
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
  text-align: center;
}

.btn-primary {
  background: #4F46E5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-block {
  width: 100%;
  display: block;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #4F46E5;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    position: static;
  }
}
</style>
