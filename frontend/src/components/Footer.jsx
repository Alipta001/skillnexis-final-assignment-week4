import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-symbol">S</span>
            <span>ShopWithMe</span>
          </Link>
          <p>Good things for the everyday.</p>
        </div>
        <div className="footer-links">
          <Link to="/shop">
            Shop everything <ArrowUpRight size={14} />
          </Link>
          <Link to="/orders">
            Order history <ArrowUpRight size={14} />
          </Link>
        </div>
        <small>© {new Date().getFullYear()} ShopWithMe</small>
      </div>
    </footer>
  );
}
