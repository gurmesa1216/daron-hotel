import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const languages = [
    {
      code: "en",
      label: "English",
      
    },
    {
      code: "am",
      label: "አማርኛ",
      
    },
    {
      code: "om",
      label: "Afaan Oromo",
      
    }
  ];

  const current =
    languages.find((lang) => lang.code === language) || languages[0];

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    setOpen(!open);
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (open && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right
        });
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  return (
    <div className="language-switcher">
      <button
        ref={buttonRef}
        className="language-switcher__button"
        onClick={toggleDropdown}
      >
        {current.flag}
        <span>{current.label}</span>
        <span className="arrow">▼</span>
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            className="language-switcher__menu"
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              right: `${coords.right}px`
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={language === lang.code ? "active" : ""}
                onClick={() => {
                  changeLanguage(lang.code);
                  setOpen(false);
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}