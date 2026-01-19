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
            <h2>Phương Thức Thanh Toán</h2>
            <div class="payment-methods">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                :class="['payment-method', { active: selectedPayment === method.id }]"
                @click="selectedPayment = method.id"
              >
                <input 
                  type="radio" 
                  :value="method.id" 
                  v-model="selectedPayment"
                  class="radio-input"
                >
                <div class="method-content">
                  <span class="method-icon">{{ method.icon }}</span>
                  <div>
                    <div class="method-name">{{ method.name }}</div>
                    <div class="method-desc">{{ method.description }}</div>
                  </div>
                </div>
              </label>
            </div>

            <!-- Credit Card Form -->
            <div v-if="selectedPayment === 'card'" class="card-form">
              <div class="form-group">
                <label>Số Thẻ *</label>
                <input 
                  v-model="cardData.cardNumber" 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  @input="formatCardNumber"
                >
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày Hết Hạn *</label>
                  <input 
                    v-model="cardData.expiryDate" 
                    type="text" 
                    placeholder="MM/YY"
                    maxlength="5"
                    @input="formatExpiryDate"
                  >
                </div>
                <div class="form-group">
                  <label>CVV *</label>
                  <input 
                    v-model="cardData.cvv" 
                    type="text" 
                    placeholder="123"
                    maxlength="3"
                  >
                </div>
              </div>
              <div class="form-group">
                <label>Tên Chủ Thẻ *</label>
                <input 
                  v-model="cardData.cardName" 
                  type="text" 
                  placeholder="NGUYEN VAN A"
                >
              </div>
            </div>

            <!-- Bank Transfer Info -->
            <div v-if="selectedPayment === 'bank'" class="bank-info">
              <div class="info-box">
                <h3>Thông Tin Chuyển Khoản</h3>
                <div class="bank-details">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số tài khoản:</strong> 1234567890</p>
                  <p><strong>Chủ tài khoản:</strong> CONG TY HOC ONLINE</p>
                  <p><strong>Nội dung chuyển khoản:</strong> {{ orderCode }}</p>
                </div>
                <p class="note">Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý nhanh chóng.</p>
              </div>
            </div>

            <!-- E-wallet Info -->
            <div v-if="selectedPayment === 'momo' || selectedPayment === 'zalopay'" class="ewallet-info">
              <div class="info-box">
                <p>Bạn sẽ được chuyển đến trang thanh toán của {{ selectedPayment === 'momo' ? 'MoMo' : 'ZaloPay' }} sau khi xác nhận đơn hàng.</p>
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
            @click="processPayment" 
            :disabled="isProcessing"
            class="btn btn-primary btn-large btn-block"
          >
            <span v-if="!isProcessing">Xác Nhận Thanh Toán</span>
            <span v-else>Đang xử lý...</span>
          </button>
          
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
    const selectedPayment = ref('card')
    const orderCode = ref('')

    const formData = ref({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    })

    const cardData = ref({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    })

    const paymentMethods = [
      {
        id: 'card',
        name: 'Thẻ Tín Dụng/Ghi Nợ',
        icon: '💳',
        description: 'Visa, Mastercard, JCB'
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        icon: '📱',
        description: 'Thanh toán nhanh qua MoMo'
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        icon: '💙',
        description: 'Thanh toán qua ZaloPay'
      },
      {
        id: 'bank',
        name: 'Chuyển Khoản Ngân Hàng',
        icon: '🏦',
        description: 'Chuyển khoản trực tiếp'
      }
    ]

    const loadCart = () => {
      cartItems.value = JSON.parse(localStorage.getItem('cart') || '[]')
      if (cartItems.value.length === 0) {
        router.push('/cart')
      }
      generateOrderCode()
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

    const formatCardNumber = (event) => {
      let value = event.target.value.replace(/\s/g, '')
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
      cardData.value.cardNumber = formattedValue
    }

    const formatExpiryDate = (event) => {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4)
      }
      cardData.value.expiryDate = value
    }

    const validateForm = () => {
      if (!formData.value.fullName || !formData.value.email || !formData.value.phone) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
        return false
      }

      if (selectedPayment.value === 'card') {
        if (!cardData.value.cardNumber || !cardData.value.expiryDate || 
            !cardData.value.cvv || !cardData.value.cardName) {
          alert('Vui lòng điền đầy đủ thông tin thẻ!')
          return false
        }
        if (cardData.value.cardNumber.replace(/\s/g, '').length < 16) {
          alert('Số thẻ không hợp lệ!')
          return false
        }
      }

      return true
    }

    const processPayment = async () => {
      if (!validateForm()) return

      isProcessing.value = true

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Save order to localStorage
      const order = {
        orderCode: orderCode.value,
        items: cartItems.value,
        customer: formData.value,
        paymentMethod: paymentMethods.find(m => m.id === selectedPayment.value)?.name,
        subtotal: subtotal.value,
        discount: discount.value,
        total: total.value,
        date: new Date().toISOString(),
        status: 'completed'
      }

      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push(order)
      localStorage.setItem('orders', JSON.stringify(orders))

      // Clear cart
      localStorage.removeItem('cart')

      // Redirect to success page
      router.push({
        path: '/order-success',
        query: { orderCode: orderCode.value }
      })
    }

    onMounted(() => {
      loadCart()
    })

    return {
      cartItems,
      formData,
      cardData,
      selectedPayment,
      paymentMethods,
      orderCode,
      subtotal,
      discount,
      total,
      isProcessing,
      formatPrice,
      formatCardNumber,
      formatExpiryDate,
      processPayment
    }
  }
}
</script>
