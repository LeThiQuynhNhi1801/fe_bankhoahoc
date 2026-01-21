<template>
  <div class="cart">
    <div class="container">
      <h1 class="page-title">Giỏ Hàng</h1>
      
      <div v-if="isLoading" class="loading">
        <p>Đang tải giỏ hàng...</p>
      </div>
      
      <div v-else-if="cartItems.length === 0" class="empty-cart">
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
import { courseService } from '../services/courseService'

export default {
  name: 'Cart',
  setup() {
    const router = useRouter()
    const cartItems = ref([])
    const isLoading = ref(false)

    const loadCart = async () => {
      try {
        isLoading.value = true
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
        
        // Nếu cart chỉ chứa IDs (số hoặc chuỗi số), cần load course details
        if (cartData.length > 0 && (typeof cartData[0] === 'number' || typeof cartData[0] === 'string')) {
          // Cart chứa IDs, cần load course details
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
        
        // Lưu lại cart với format đầy đủ
        saveCart()
      } catch (error) {
        console.error('Failed to load cart:', error)
        cartItems.value = []
      } finally {
        isLoading.value = false
      }
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
      isLoading,
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

<style scoped>
.cart {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading p {
  color: #666;
  font-size: 1.125rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.cart-items {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.125rem;
}

.item-price {
  margin: 0;
  color: #4F46E5;
  font-weight: 600;
  font-size: 1.125rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.quantity-btn:hover {
  border-color: #4F46E5;
  color: #4F46E5;
}

.item-total {
  min-width: 120px;
  text-align: right;
}

.total-price {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 1.125rem;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.2);
}

.cart-summary {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.cart-summary h2 {
  margin-bottom: 1.5rem;
  color: #333;
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

.btn-primary:hover {
  background: #4338ca;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-block {
  width: 100%;
  display: block;
}

.continue-shopping {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #4F46E5;
  text-decoration: none;
}

.continue-shopping:hover {
  text-decoration: underline;
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}
</style>
