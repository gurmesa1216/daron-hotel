import React, { useState } from 'react'
import './HomeScreen.css'
import { useLanguage } from "../i18n/LanguageContext"
import LanguageSwitcher from "../components/LanguageSwitcher.jsx"
import DishCard from '../components/DishCard.jsx'
import BottomNav from '../components/BottomNav.jsx'
import { Utensils, Leaf, Coffee, Wine, Grid } from 'lucide-react'

// 1. Import your logo image
import logoImg from '../assets/a.jpg' // Adjust path if stored elsewhere (e.g. '../assets/a.jpg')[cite: 6]

// Helper function to dynamically select icons based on category name
const getCategoryIcon = (categoryName) => {
  if (!categoryName) return <Grid size={18} />;
  const name = categoryName.toLowerCase();

  if (name.includes('nyaata') || name.includes('ምግብ')) {
    return <Utensils size={18} />;
  }
  if (name.includes('kansoomanaa') || name.includes('የጾም')) {
    return <Leaf size={18} className="icon-fasting" />;
  }
  if (name.includes('dhugaatii lallaafaa') || name.includes('ለስላሳ')) {
    return <Wine size={18} className="icon-soft-drink" />;
  }
  if (name.includes('dhugaatii') || name.includes('መጠጥ')) {
    return <Coffee size={18} className="icon-hot-drink" />;
  }

  return <Grid size={18} />;
};

export default function HomeScreen({
  dishes = [],
  categories = [],
  onViewDish,
  onAddToCart,
  onNavigate,
  activeScreen,
  cartCount,
  onAdmin
}) {
  const { t } = useLanguage()

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = dishes.filter((d) => {
    const matchesCategory =
      activeCategory === 'All' || d.category === activeCategory

    const matchesSearch = d.name
      ? d.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return matchesCategory && matchesSearch
  })

  return (
    <div className="screen">
      {/* ── Dark header card ── */}
      <div className="home-hero">
        <div className="home-hero__top-bar">
          <div className="home-hero__location">
            {/* 2. Updated Avatar Image */}
            <div className="home-hero__avatar">
              <img
                src={logoImg}
                alt="Daron Hotel Logo"
                style={{ objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <div className="home-hero__location-text">
              <span className="home-hero__delivery-label">Daron Hotel</span>
              <span className="home-hero__city">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 3 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z" />
                </svg>
                Dukem
              </span>
            </div>
          </div>
          <div className="home-actions">
            <LanguageSwitcher />

            <button className="home-hero__bell" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="home-hero__bell-dot" />
            </button>
          </div>
        </div>

        {/* Promo banner */}
        <div className="home-promo">
          <div className="home-promo__text">
            <span className="home-promo__badge">{t("limitedOffer")}</span>
            <h2 className="home-promo__title">{t("firstOrder")}</h2>
            <p className="home-promo__sub">{t("useCode")}</p>
          </div>
          <div className="home-promo__img-wrap">
            <img
              src="https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Doro Wat"
              className="home-promo__img"
            />
          </div>
        </div>
      </div>

      {/* ── Search bar (overlapping hero) ── */}
      <div className="search-row">
        <div className="search-bar">
          <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-bar__input"
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="search-filter-btn" aria-label="Filter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>

      <div className="screen__scroll">
        {/* ── Categories ── */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">{t("categories")}</h2>
            <button className="section__see-all">See all</button>
          </div>
          <div className="chips-scroll">
            {categories.map((cat) => (
              <button
                key={cat._id || cat.id}
                className={`chip${activeCategory === cat.name ? ' chip--active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <span className="chip__icon">{getCategoryIcon(cat.name)}</span>
                <span className="chip__label">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Popular Dishes ── */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">{t("popularDishes")}</h2>
            <button className="section__see-all">{t("seeAll")}</button>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon"></span>
              <p>{t("noDishes")}</p>
            </div>
          ) : (
            <div className="dish-grid">
              {filtered.map((dish) => (
                <DishCard
                  key={dish._id || dish.id}
                  dish={dish}
                  onAdd={onAddToCart}
                  onView={onViewDish}
                />
              ))}
            </div>
          )}
        </section>

        <div style={{ height: 90 }} />
      </div>

      <BottomNav activeScreen={activeScreen} onNavigate={onNavigate} cartCount={cartCount} />
    </div>
  )
}