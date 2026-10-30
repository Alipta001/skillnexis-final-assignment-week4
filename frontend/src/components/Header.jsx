import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navClass = ({ isActive }) =>
  `nav-link${isActive ? " nav-link-active" : ""}`;

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          aria-label="Field and Form home"
          className="brand"
          onClick={closeMenu}
          to="/"
        >
          <span className="brand-symbol">f.</span>
          <span>
            field<span className="brand-amp">&</span>form
          </span>
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${menuOpen ? " main-nav-open" : ""}`}>
          <NavLink className={navClass} onClick={closeMenu} to="/">
            Home
          </NavLink>
          <NavLink className={navClass} onClick={closeMenu} to="/shop">
            Shop
          </NavLink>
          {user?.role === "admin" && (
            <NavLink className={navClass} onClick={closeMenu} to="/admin">
              Admin
            </NavLink>
          )}
          {user && (
            <NavLink className={navClass} onClick={closeMenu} to="/orders">
              My orders
            </NavLink>
          )}
          <NavLink
            aria-label={`Cart, ${itemCount} items`}
            className={`${navClass({ isActive: false })} cart-nav`}
            onClick={closeMenu}
            to="/cart"
          >
            <ShoppingBag size={17} /> Cart{" "}
            <span className="cart-count">{itemCount}</span>
          </NavLink>
          {user ? (
            <button
              className="nav-login-button"
              onClick={() => {
                logout();
                closeMenu();
              }}
              type="button"
            >
              Sign out
            </button>
          ) : (
            <Link className="nav-login-button" onClick={closeMenu} to="/login">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
