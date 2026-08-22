import React, { useState } from "react";
import "./MenuScreen.css";

import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

import DishCard from "../components/DishCard";
import BottomNav from "../components/BottomNav";

// 1. Import your custom logo image
import logoImg from "../assets/a.jpg";

export default function MenuScreen({
  dishes = [],
  categories = [],
  onViewDish,
  onAddToCart,
  onNavigate,
  activeScreen,
  cartCount,
}) {
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = dishes.filter((dish) => {
    const categoryMatch =
      activeCategory === "All" || dish.category === activeCategory;

    const searchMatch = dish.name
      ? dish.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return categoryMatch && searchMatch;
  });

  return (
    <div className="screen">
      {/* HEADER */}
      <div className="home-hero home-hero--menu">
        <div className="home-hero__top-bar">
          <div className="home-hero__location">
            {/* 2. Updated Avatar Image */}
            <div className="home-hero__avatar">
              <img
                src={logoImg}
                alt="Daron Hotel Logo"
              />
            </div>

            <div className="home-hero__location-text">
              <span className="home-hero__delivery-label">
                {t("deliveryLocation")}
              </span>

              <span className="home-hero__city">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ marginRight: 3 }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/>
                </svg>
                Dukem
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <LanguageSwitcher />

            <button
              className="home-hero__bell"
              aria-label="Notifications"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>

              <span className="home-hero__bell-dot"></span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-row">
        <div className="search-bar">
          <svg
            className="search-bar__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>

          <input
            className="search-bar__input"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="search-filter-btn">
          ☰
        </button>
      </div>

      <div className="screen__scroll">
        {/* CATEGORY */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">
              {t("categories")}
            </h2>

            <button className="section__see-all">
              {t("seeAll")}
            </button>
          </div>

          <div className="chips-scroll">
            {categories.map((cat) => (
              <button
                key={cat._id || cat.id}
                className={`chip ${
                  activeCategory === cat.name
                    ? "chip--active"
                    : ""
                }`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <span className="chip__label">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* DISHES */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">
              {t("popularDishes")}
            </h2>

            <button className="section__see-all">
              {t("seeAll")}
            </button>
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
                  onView={onViewDish}
                  onAdd={onAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        <div style={{ height: 90 }} />
      </div>

      <BottomNav
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        cartCount={cartCount}
      />
    </div>
  );
}