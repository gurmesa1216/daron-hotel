import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

import HomeScreen from './screens/HomeScreen.jsx'
import MenuScreen from './screens/MenuScreen.jsx'
import DishDetailScreen from './screens/DishDetailScreen.jsx'
import CartScreen from './screens/CartScreen.jsx'
import CheckoutScreen from './screens/CheckoutScreen.jsx'

import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import MenuManager from './admin/MenuManager.jsx'
import AdminLogin from './admin/AdminLogin.jsx'

import BottomNav from './components/BottomNav.jsx'
import adminLogo from './assets/a.jpg'
import profileLogo from './assets/a.jpg'

const API_BASE = import.meta.env.VITE_API_URL || 'https://daron-hotel-1.onrender.com'

// Helper function to extract dish ID regardless of database format (_id vs id)
const getDishId = (item) => item?.id || item?._id

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // ADMIN STATE
  const [adminPage, setAdminPage] = useState('dashboard')
  const [adminLogged, setAdminLogged] = useState(
    Boolean(localStorage.getItem("admin"))
  )

  const [selectedDish, setSelectedDish] = useState(null)
  const [cart, setCart] = useState([])
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])

  const loadDishes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dishes`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setDishes(data)
      } else {
        console.error("Dishes response is not an array:", data)
        setDishes([])
      }
    } catch(err){
      console.error("Loading dishes failed:", err)
      setDishes([])
    }
  }

  useEffect(() => {
    loadDishes()
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error("Categories response is not an array:", data)
          setCategories([])
        }
      })
      .catch(err => {
        console.error("Category loading error:", err)
        setCategories([])
      })
  }, [])

  const addToCart = (dish) => {
    if (dish.available === false) return

    const targetId = getDishId(dish)

    setCart(prev => {
      const existing = prev.find(i => getDishId(i) === targetId)
      if (existing) {
        return prev.map(i =>
          getDishId(i) === targetId ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id: targetId,
          _id: targetId,
          name: dish.name,
          price: dish.price,
          portion: dish.portion,
          image: dish.image,
          qty: 1
        }
      ]
    })
  }

  const viewDish = (dish) => {
    setSelectedDish(dish)
    navigate('/detail')
  }

  const handleNavigate = (tab) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'menu') navigate('/menu')
    else if (tab === 'favorites') navigate('/favorites')
    else if (tab === 'cart') navigate('/cart')
    else if (tab === 'profile') navigate('/profile')
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/menu') return 'menu'
    if (path === '/favorites') return 'favorites'
    if (path === '/cart') return 'cart'
    if (path === '/profile') return 'profile'
    return 'home'
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeScreen
            dishes={dishes}
            categories={categories}
            onViewDish={viewDish}
            onAddToCart={addToCart}
            onNavigate={handleNavigate}
            activeScreen={getActiveTab()}
            cartCount={cartCount}
            onAdmin={() => navigate('/admin')}
          />
        }
      />

      <Route
        path="/menu"
        element={
          <MenuScreen
            dishes={dishes}
            categories={categories}
            onViewDish={viewDish}
            onAddToCart={addToCart}
            onNavigate={handleNavigate}
            activeScreen={getActiveTab()}
            cartCount={cartCount}
          />
        }
      />

      <Route
        path="/detail"
        element={
          selectedDish ? (
            <DishDetailScreen
              dish={selectedDish}
              onBack={() => navigate(-1)}
              onAddToCart={addToCart}
            />
          ) : (
            <HomeScreen
              dishes={dishes}
              categories={categories}
              onViewDish={viewDish}
              onAddToCart={addToCart}
              onNavigate={handleNavigate}
              activeScreen={getActiveTab()}
              cartCount={cartCount}
              onAdmin={() => navigate('/admin')}
            />
          )
        }
      />

      <Route
        path="/cart"
        element={
          <CartScreen
            cartItems={cart}
            setCartItems={setCart}
            onBack={() => navigate(-1)}
            onCheckout={() => navigate('/checkout')}
          />
        }
      />

      <Route
        path="/checkout"
        element={
          <CheckoutScreen
            cartItems={cart}
            onBack={() => navigate(-1)}
            onPlaceOrder={() => {
              setCart([])
              navigate('/')
            }}
          />
        }
      />

      <Route
        path="/profile"
        element={
          <div className="profile-screen">
            <div className="profile-header">
              <div className="profile-avatar">
                <img
                  src={profileLogo}
                  alt="profile"
                />
              </div>
              <h2>Welcome</h2>
            </div>
            <div className="profile-card">
              <button
                className="profile-item"
                onClick={() => navigate('/admin')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <img
                  src={adminLogo}
                  alt="Admin Logo"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #E50914'
                  }}
                />
                <div>
                  <h4>Admin Panel</h4>
                  <p>Restaurant management</p>
                </div>
              </button>
            </div>
            <BottomNav
              activeScreen={getActiveTab()}
              onNavigate={handleNavigate}
              cartCount={cartCount}
            />
          </div>
        }
      />

      <Route
        path="/admin"
        element={
          !adminLogged ? (
            <AdminLogin
              onLogin={() => {
                setAdminLogged(true)
                navigate('/admin')
              }}
            />
          ) : (
            <AdminLayout
              connected={true}
              activePage={adminPage}
              onNavigate={(page) => setAdminPage(page)}
              onExit={() => {
                localStorage.removeItem("admin")
                setAdminLogged(false)
                navigate('/')
              }}
            >
              {adminPage === 'dashboard' && <AdminDashboard />}
              {adminPage === "menu" && (
                <MenuManager refreshDishes={loadDishes} categories={categories} />
              )}
            </AdminLayout>
          )
        }
      />
    </Routes>
  )
}