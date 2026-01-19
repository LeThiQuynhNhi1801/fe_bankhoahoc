import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import CourseList from './components/CourseList.vue'
import CourseDetail from './components/CourseDetail.vue'
import Cart from './components/Cart.vue'
import Checkout from './components/Checkout.vue'
import OrderSuccess from './components/OrderSuccess.vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import UploadDocument from './components/UploadDocument.vue'
import CreateCourse from './components/CreateCourse.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/courses', component: CourseList },
  { path: '/course/:id', component: CourseDetail, props: true },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/order-success', component: OrderSuccess },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/create-course', component: CreateCourse },
  { path: '/admin/upload', component: UploadDocument }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
