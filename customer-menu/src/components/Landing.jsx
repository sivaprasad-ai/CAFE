import { useEffect, useState } from "react";
import { CATEGORY_META } from "../menuData";

// Real Raghuveer Cafe dish photos.
const FEATURED_CATEGORIES = [
  { name: "Burgers", img: "/images/dish-burger.jpg" },
  { name: "Pizza", img: "/images/dish-pizza.jpg" },
  { name: "Momos", img: "/images/dish-momos.jpg" },
  { name: "Sandwiches", img: "/images/dish-sandwich.jpg" },
  { name: "Maggi", img: "/images/dish-maggi.jpg" },
  { name: "Cad-B Shakes", img: "/images/dish-cadbshake.jpg" },
  { name: "Nuggets", img: "/images/dish-nuggets.jpg" },
  { name: "Mastani", img: "/images/dish-mastani.jpg" },
];

const BESTSELLERS = [
  { name: "Raghuveer Spl. Burger", price: 90, category: "Burgers" },
  { name: "Raghuveer Spl. Fries", price: 110, category: "French Fries" },
  { name: "Raghuveer Spl. Tandoor Burst Pizza", price: 210, category: "Pizza" },
  { name: "Raghuveer Spl. Cheese Grill Sandwich", price: 100, category: "Sandwiches" },
];

const WHATSAPP_NUMBER = "918123202170";
const INSTAGRAM_URL = "https://www.instagram.com/raghuveer_cafe";
const MAPS_URL =
  "https://www.google.com/maps/place/Raghuveer+Cafe/@16.2377271,74.6047265,20.33z/data=!4m14!1m7!3m6!1s0x3bae0d006047a089:0xaaf3340bea7b8c35!2sRaghuveer!8m2!3d12.9466071!4d77.7620871!16s%2Fg%2F11ysqhdkyh!3m5!1s0x3bc0bda3a0dd8859:0xc3c75d02047e2c94!8m2!3d16.2380078!4d74.6046948!16s%2Fg%2F11xmxh2x75?entry=ttu&g_ep=EgoyMDI2MDgyNS4wIKXMDSoASAFQAw%3D%3D";

export default function Landing({ onOrderNow, tableNumber }) {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 0.55);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing">
      <div className="landing-hero-plain">
        <div className="hero-pattern" />
        <img className="landing-logo-badge" src="/images/logo.jpg" alt="Raghuveer Cafe logo" />
        <h1>Raghuveer Cafe</h1>
        <p className="landing-tagline">A Smile In Every Bite</p>

        {tableNumber && <span className="landing-table-badge">Table {tableNumber}</span>}

        <button className="landing-cta" onClick={onOrderNow}>
          Order Now <span className="arrow">→</span>
        </button>
      </div>

      <div className="landing-section">
        <h2 className="section-title">Take a Look Inside</h2>

        <div className="landing-gallery">
          <div className="landing-photo" style={{ animationDelay: "0.05s" }}>
            <div className="landing-photo-img landing-photo-hero" />
            <span className="landing-photo-caption">Our Storefront</span>
          </div>
          <div className="landing-photo" style={{ animationDelay: "0.15s" }}>
            <div className="landing-photo-img landing-photo-1" />
            <span className="landing-photo-caption">Our Vibe</span>
          </div>
          <div className="landing-photo" style={{ animationDelay: "0.25s" }}>
            <div className="landing-photo-img landing-photo-2" />
            <span className="landing-photo-caption">Storefront View</span>
          </div>
          <div className="landing-photo" style={{ animationDelay: "0.35s" }}>
            <div className="landing-photo-img landing-photo-3" />
            <span className="landing-photo-caption">Dine In</span>
          </div>
        </div>

        <div className="landing-info">
          <div className="landing-info-item" style={{ animationDelay: "0.1s" }}>
            <span className="landing-info-icon">⭐</span>
            <div>
              <strong>4.6 Rating</strong>
              <p>Loved by regulars</p>
            </div>
          </div>
          <div className="landing-info-item" style={{ animationDelay: "0.2s" }}>
            <span className="landing-info-icon">🌿</span>
            <div>
              <strong>100% Veg</strong>
              <p>Fresh, made to order</p>
            </div>
          </div>
          <div className="landing-info-item" style={{ animationDelay: "0.3s" }}>
            <span className="landing-info-icon">⏱</span>
            <div>
              <strong>10-15 min</strong>
              <p>Quick self-service</p>
            </div>
          </div>
        </div>

        <h2 className="section-title">Customer Favourites</h2>
        <div className="bestseller-grid">
          {BESTSELLERS.map((item, i) => {
            const meta = CATEGORY_META[item.category];
            return (
              <button
                key={item.name}
                className="bestseller-card"
                onClick={onOrderNow}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="bestseller-icon" style={{ background: meta.color, color: "white" }}>
                  {meta.icon}
                </span>
                <span className="bestseller-name">{item.name}</span>
                <span className="bestseller-price" style={{ color: meta.color }}>₹{item.price}</span>
              </button>
            );
          })}
        </div>

        <h2 className="section-title">How It Works</h2>
        <div className="timeline">
          <div className="timeline-step" style={{ animationDelay: "0.05s" }}>
            <span className="timeline-marker" style={{ background: "#3b82f6" }}>📱</span>
            <div className="timeline-content">
              <span className="timeline-label">Step 1</span>
              <h3>Scan the QR</h3>
              <p>Already done — you're here!</p>
            </div>
          </div>
          <div className="timeline-step" style={{ animationDelay: "0.15s" }}>
            <span className="timeline-marker" style={{ background: "#f97316" }}>🛒</span>
            <div className="timeline-content">
              <span className="timeline-label">Step 2</span>
              <h3>Browse & Add</h3>
              <p>Pick your favourites from the menu</p>
            </div>
          </div>
          <div className="timeline-step" style={{ animationDelay: "0.25s" }}>
            <span className="timeline-marker" style={{ background: "#22c55e" }}>🍽️</span>
            <div className="timeline-content">
              <span className="timeline-label">Step 3</span>
              <h3>We Serve Fresh</h3>
              <p>Sit back, we'll bring it to your table</p>
            </div>
          </div>
        </div>

        <h2 className="section-title">Explore the Menu</h2>
        <div className="category-photo-grid">
          {FEATURED_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="category-photo-tile"
              onClick={() => onOrderNow(cat.name)}
              style={{ backgroundImage: `url(${cat.img})` }}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <h2 className="section-title">Why You'll Love Us</h2>
        <div className="why-us-grid">
          <div className="why-us-card">
            <span className="why-us-icon" style={{ background: "#8b5cf61a", color: "#8b5cf6" }}>❄️</span>
            <div>
              <strong>AC Cafe</strong>
              <p>Cool, comfortable seating all day</p>
            </div>
          </div>
          <div className="why-us-card">
            <span className="why-us-icon" style={{ background: "#f973161a", color: "#f97316" }}>🙌</span>
            <div>
              <strong>Self Service</strong>
              <p>No waiting on a waiter — order straight from your phone</p>
            </div>
          </div>
          <div className="why-us-card">
            <span className="why-us-icon" style={{ background: "#14b8a61a", color: "#14b8a6" }}>🧼</span>
            <div>
              <strong>Hygienic Kitchen</strong>
              <p>Fresh ingredients, prepared to order every time</p>
            </div>
          </div>
          <div className="why-us-card">
            <span className="why-us-icon" style={{ background: "#ec48991a", color: "#ec4899" }}>📱</span>
            <div>
              <strong>Scan & Order</strong>
              <p>Browse, customize, and order without leaving your table</p>
            </div>
          </div>
        </div>

        <button className="landing-cta landing-cta-secondary" onClick={onOrderNow}>
          View Menu & Order
        </button>
      </div>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <img className="footer-logo" src="/images/logo.jpg" alt="Raghuveer Cafe logo" />
            <h3>Raghuveer Cafe</h3>
            <p className="footer-tagline-text">A Smile In Every Bite</p>
            <p className="footer-blurb">
              A 100% vegetarian, AC cafe serving fresh burgers, pizzas, shakes and more —
              now with self-service QR ordering right from your table.
            </p>
            <div className="footer-actions">
              <a
                className="footer-action-btn whatsapp"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp
              </a>
              <a className="footer-action-btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                📍 Directions
              </a>
              <a
                className="footer-action-btn instagram"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                📷 Instagram
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <button className="footer-link" onClick={onOrderNow}>Full Menu</button>
            <button className="footer-link" onClick={onOrderNow}>Today's Combos</button>
            <a className="footer-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Find Us on Maps
            </a>
            <a className="footer-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              Order via WhatsApp
            </a>
            <a className="footer-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Follow on Instagram
            </a>
          </div>

          <div className="footer-col">
            <h4>Visit Us</h4>
            <p className="footer-detail">📍 Asha hospital, Gokak - Senkeshwar Rd, Jaynagar, Hukkeri, Karnataka 591309</p>
            <a className="footer-detail footer-detail-link" href="tel:+918123202170">📞 +91 81232 02170</a>
            <p className="footer-detail">🕒 Open Daily · 10:00 AM – 10:30 PM</p>
            <p className="footer-detail">🌿 100% Vegetarian · ❄️ AC Seating</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Raghuveer Cafe. All rights reserved.</p>
          <p className="footer-note">For franchise enquiries, call us directly</p>
          <p className="footer-credit">Developed by Amit Savalagi &amp; Siva Prasad</p>
        </div>
      </footer>

      <a
        className={"whatsapp-fab" + (showSticky ? " visible" : "")}
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>

      <button
        className={"sticky-order-btn" + (showSticky ? " visible" : "")}
        onClick={onOrderNow}
      >
        Order Now <span className="arrow">→</span>
      </button>
    </div>
  );
}
