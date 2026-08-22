import React, { useState } from 'react'
import './AdminScreen.css'
import Button from '../components/Button.jsx'
import logo from '../assets/a_2.jpg'

export default function AdminScreen({
  dishes,
  setDishes,
  orders,
  setOrders,
  onBack,
  categories = []
}) {
  const [tab, setTab] = useState('dishes')
  const [modal, setModal] = useState(null) // 'add' | 'edit' | null
  const [editingDish, setEditingDish] = useState(null)

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const dishCount = dishes.length
  const availableCount = dishes.filter((d) => d.available !== false).length

  const handleSaveDish = (dish) => {
    if (dish.id) {
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? dish : d)))
    } else {
      const newId = Math.max(0, ...dishes.map((d) => d.id)) + 1
      setDishes((prev) => [...prev, { ...dish, id: newId }])
    }
    setModal(null)
    setEditingDish(null)
  }

  const handleDeleteDish = (id) => {
    setDishes((prev) => prev.filter((d) => d.id !== id))
  }

  const toggleAvailable = (id) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, available: d.available === false } : d))
    )
  }

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
  }

  return (
    <div className="admin-screen">
      {/* Top bar */}
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="home-hero__avatar">
            <img src={logo} alt="PAAROOT Logo" />
          </div>
          <h1 className="admin-topbar__title">PAAROOT — Admin</h1>
        </div>
        <div className="admin-topbar__actions">
          <button className="admin-topbar__back" onClick={onBack}>
            Exit to app
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Total Revenue</div>
          <div className="admin-stat__value">{totalRevenue.toLocaleString()} ETB</div>
          <div className="admin-stat__trend">+12% this week</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Orders</div>
          <div className="admin-stat__value">{orders.length}</div>
          <div className="admin-stat__trend">{pendingCount} pending</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Dishes</div>
          <div className="admin-stat__value">{dishCount}</div>
          <div className="admin-stat__trend">{availableCount} available</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Avg. Order</div>
          <div className="admin-stat__value">
            {orders.length ? Math.round(totalRevenue / orders.length).toLocaleString() : 0} ETB
          </div>
          <div className="admin-stat__trend">Steady</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'dishes' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('dishes')}
        >
          Manage Dishes
        </button>
        <button
          className={`admin-tab${tab === 'orders' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      <div className="admin-body">
        {tab === 'dishes' && (
          <>
            <div className="admin-section-header">
              <h2>All Dishes</h2>
              <Button variant="primary" size="sm" onClick={() => { setEditingDish(null); setModal('add') }}>
                + Add Dish
              </Button>
            </div>

            <div className="admin-dish-table">
              <div className="admin-dish-row admin-dish-row--header">
                <span>Image</span>
                <span>Name</span>
                <span>Category</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {dishes.map((dish) => {
                const isOn = dish.available !== false
                return (
                  <div key={dish.id} className="admin-dish-row">
                    <img className="admin-dish-row__thumb" src={dish.image} alt={dish.name} />
                    <span className="admin-dish-row__name">{dish.name}</span>
                    <span className="admin-dish-row__cat">{dish.category}</span>
                    <span className="admin-dish-row__price">{dish.price.toLocaleString()} ETB</span>
                    <span className={`admin-dish-row__avail${isOn ? ' admin-dish-row__avail--on' : ' admin-dish-row__avail--off'}`}>
                      {isOn ? 'Shown' : 'Hidden'}
                    </span>
                    <div className="admin-dish-row__actions">
                      <button
                        className="admin-icon-btn"
                        onClick={() => { setEditingDish(dish); setModal('edit') }}
                        aria-label="Edit dish"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="admin-icon-btn"
                        onClick={() => toggleAvailable(dish.id)}
                        aria-label="Toggle availability"
                      >
                        {isOn ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => handleDeleteDish(dish.id)}
                        aria-label="Delete dish"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <div className="admin-section-header">
              <h2>Recent Orders</h2>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state empty-state--large">
                <span className="empty-state__icon empty-state__icon--big">📦</span>
                <h3 className="empty-state__title">No orders yet</h3>
                <p className="empty-state__sub">Orders placed from the app will appear here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-card__top">
                    <span className="admin-order-card__id">Order #{order.id}</span>
                    <span className="admin-order-card__date">{order.date}</span>
                  </div>
                  <div className="admin-order-card__items">
                    {order.items.map((i, idx) => (
                      <span key={idx}>{i.name} × {i.qty}{idx < order.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                  <div className="admin-order-card__bottom">
                    <span className="admin-order-card__total">{order.total.toLocaleString()} ETB</span>
                    <select
                      className="admin-status-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <DishFormModal
          dish={editingDish}
          categories={categories}
          onClose={() => { setModal(null); setEditingDish(null) }}
          onSave={handleSaveDish}
        />
      )}
    </div>
  )
}

function DishFormModal({ dish, categories = [], onClose, onSave }) {
  const defaultCategory = categories[0]?.id || categories[0]?.name || 'traditional'

  const [form, setForm] = useState(
    dish || {
      name: '',
      category: defaultCategory,
      price: 0,
      portion: '',
      image: '',
      description: '',
      rating: 4.5,
      prepTime: 15,
      restaurant: 'PAAROOT Kitchen',
      gallery: [],
      available: true,
    }
  )

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddGalleryImage = () => {
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, prev.image],
      image: prev.image,
    }))
  }

  const handleSetMainImage = (url) => {
    setForm((prev) => ({ ...prev, image: url }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const gallery = form.gallery.length ? form.gallery : [form.image]
    onSave({ ...form, price: Number(form.price), gallery })
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <span className="admin-modal__title">{dish ? 'Edit Dish' : 'Add New Dish'}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body">
            {/* Image picker */}
            <div className="admin-field">
              <label className="admin-field__label">Dish Photo</label>
              <div className="admin-image-picker">
                <img
                  className="admin-image-picker__preview"
                  src={form.image || 'https://via.placeholder.com/72?text=Photo'}
                  alt="Preview"
                />
                <div className="admin-image-picker__actions">
                  <input
                    className="admin-field__input"
                    type="text"
                    placeholder="Paste image URL"
                    value={form.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                  />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={handleAddGalleryImage}>
                    Add to gallery
                  </button>
                </div>
              </div>
              {form.gallery.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {form.gallery.map((g, i) => (
                    <img
                      key={i}
                      src={g}
                      alt={`Gallery ${i}`}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: form.image === g ? '2px solid var(--green)' : '1px solid var(--line)' }}
                      onClick={() => handleSetMainImage(g)}
                    />
                  ))}
                </div>
              )}
              <p className="admin-field__hint">Paste a photo URL (e.g. from Pexels). Click a gallery image to set it as the main photo.</p>
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Dish Name</label>
              <input
                className="admin-field__input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Doro Wat"
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Category</label>
              <select
                className="admin-field__select"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const catVal = cat.id || cat.name || cat
                    const catName = cat.name || cat
                    return (
                      <option key={catVal} value={catVal}>
                        {catName}
                      </option>
                    )
                  })
                ) : (
                  <>
                    <option value="traditional">Traditional</option>
                    <option value="vegan">Vegan (Fasting)</option>
                    <option value="grilled">Grilled (Tibs)</option>
                    <option value="drinks">Coffee &amp; Drinks</option>
                    <option value="desserts">Desserts</option>
                  </>
                )}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Price (ETB)</label>
              <input
                className="admin-field__input"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Portion / Serving</label>
              <input
                className="admin-field__input"
                value={form.portion}
                onChange={(e) => handleChange('portion', e.target.value)}
                placeholder="e.g. Serves 1 • 420g"
              />
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Description</label>
              <textarea
                className="admin-field__textarea"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Short description of the dish..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="admin-field" style={{ flex: 1 }}>
                <label className="admin-field__label">Rating</label>
                <input
                  className="admin-field__input"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => handleChange('rating', Number(e.target.value))}
                />
              </div>
              <div className="admin-field" style={{ flex: 1 }}>
                <label className="admin-field__label">Prep time (min)</label>
                <input
                  className="admin-field__input"
                  type="number"
                  min="0"
                  value={form.prepTime}
                  onChange={(e) => handleChange('prepTime', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-field__label">Available for order</label>
              <div className="admin-toggle">
                <button
                  type="button"
                  className={`admin-toggle__switch${form.available !== false ? ' admin-toggle__switch--on' : ''}`}
                  onClick={() => handleChange('available', form.available === false)}
                >
                  <span className="admin-toggle__knob" />
                </button>
                <span className="admin-toggle__label">
                  {form.available !== false ? 'Shown in menu & cart' : 'Hidden — sold out'}
                </span>
              </div>
              <p className="admin-field__hint">When hidden, the dish disappears from the menu and its add-to-cart button is removed.</p>
            </div>
          </div>

          <div className="admin-modal__footer">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>{dish ? 'Save changes' : 'Add dish'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}