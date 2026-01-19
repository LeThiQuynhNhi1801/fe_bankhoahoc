<template>
  <div class="cart">
    <div class="container">
      <h1 class="page-title">Giỏ Hàng</h1>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>Giỏ hàng của bạn đang trống.</p>
        <router-link to="/courses" class="btn btn-primary">Xem Khóa Học</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartItems" 
            :key="item.id"
            class="cart-item"
          >
            <img :src="item.image" :alt="item.title" class="item-image">
            <div class="item-info">
              <h3>{{ item.title }}</h3>
              <p class="item-price">{{ formatPrice(item.price) }}</p>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item.id)" class="quantity-btn">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.id)" class="quantity-btn">+</button>
            </div>
            <div class="item-total">
              <p class="total-price">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
            <button @click="removeItem(item.id)" class="remove-btn">🗑️</button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Tổng Kết</h2>
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
          <button @click="checkout" class="btn btn-primary btn-large btn-block">
            Thanh Toán
          </button>
          <router-link to="/courses" class="continue-shopping">
            ← Tiếp tục mua sắm
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
  name: 'Cart',
  setup() {
    const router = useRouter()
    const cartItems = ref([])

    const loadCart = () => {
      cartItems.value = JSON.parse(localStorage.getItem('cart') || '[]')
    }

    const saveCart = () => {
      localStorage.setItem('cart', JSON.stringify(cartItems.value))
    }

    const increaseQuantity = (id) => {
      const item = cartItems.value.find(item => item.id === id)
      if (item) {
        item.quantity += 1
        saveCart()
      }
    }

    const decreaseQuantity = (id) => {
      const item = cartItems.value.find(item => item.id === id)
      if (item && item.quantity > 1) {
        item.quantity -= 1
        saveCart()
      }
    }

    const removeItem = (id) => {
      cartItems.value = cartItems.value.filter(item => item.id !== id)
      saveCart()
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

    const checkout = () => {
      router.push('/checkout')
    }

    onMounted(() => {
      loadCart()
    })

    return {
      cartItems,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      subtotal,
      discount,
      total,
      formatPrice,
      checkout
    }
  }
}
</script>
