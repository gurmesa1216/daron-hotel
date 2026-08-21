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

const API_BASE = import.meta.env.VITE_API_URL || 'https://daron-hotel-1.onrender.com'[cite: 2]

// Helper function to extract dish ID regardless of database format (_id vs id)
const getDishId = (item) => item?.id || item?._id[cite: 2]

export default function App() {
  const navigate = useNavigate()[cite: 2]
  const location = useLocation()[cite: 2]

  // ADMIN STATE
  const [adminPage, setAdminPage] = useState('dashboard')[cite: 2]
  const [adminLogged, setAdminLogged] = useState(
    Boolean(localStorage.getItem("admin"))
  )[cite: 2]

  const [selectedDish, setSelectedDish] = useState(null)[cite: 2]
  const [cart, setCart] = useState([])[cite: 2]
  const [dishes, setDishes] = useState([])[cite: 2]
  const [categories, setCategories] = useState([])[cite: 2]

  const loadDishes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dishes`)
      const data = await res.json()
      // Guard against non-array responses (e.g. { error: "..." })
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
  }, [])[cite: 2]

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => {
        // Guard against non-array responses
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
  }, [])[cite: 2]

  const addToCart = (dish) => {
    if (dish.available === false) return[cite: 2]

    const targetId = getDishId(dish)[cite: 2]

    setCart(prev => {
      const existing = prev.find(i => getDishId(i) === targetId)[cite: 2]
      if (existing) {
        return prev.map(i =>
          getDishId(i) === targetId ? { ...i, qty: i.qty + 1 } : i[cite: 2]
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
      ][cite: 2]
    })
  }

  const viewDish = (dish) => {
    setSelectedDish(dish)[cite: 2]
    navigate('/detail')[cite: 2]
  }

  const handleNavigate = (tab) => {
    if (tab === 'home') navigate('/')[cite: 2]
    else if (tab === 'menu') navigate('/menu')[cite: 2]
    else if (tab === 'favorites') navigate('/favorites')[cite: 2]
    else if (tab === 'cart') navigate('/cart')[cite: 2]
    else if (tab === 'profile') navigate('/profile')[cite: 2]
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)[cite: 2]

  const getActiveTab = () => {
    const path = location.pathname[cite: 2]
    if (path === '/') return 'home'[cite: 2]
    if (path === '/menu') return 'menu'[cite: 2]
    if (path === '/favorites') return 'favorites'[cite: 2]
    if (path === '/cart') return 'cart'[cite: 2]
    if (path === '/profile') return 'profile'[cite: 2]
    return 'home'[cite: 2]
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
      />[cite: 2]

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
      />[cite: 2]

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
      />[cite: 2]

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
      />[cite: 2]

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
      />[cite: 2]

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
      />[cite: 2]

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
                <MenuManager refreshDishes={loadDishes} />
              )}
            </AdminLayout>
          )
        }
      />[cite: 2]
    </Routes>
  )
}