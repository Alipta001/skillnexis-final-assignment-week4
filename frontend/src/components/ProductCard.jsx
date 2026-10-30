import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function addToCart() {
    if (!user) {
      notify("Log in to add items to your cart.", "error");
      navigate("/login");
      return;
    }
    try {
      await addItem(product);
      notify(`${product.name} added to your bag.`);
    } catch (error) {
      notify(getErrorMessage(error, "Could not add that item."), "error");
    }
  }

  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <Link
        aria-label={`View ${product.name}`}
        className="product-image-wrap"
        to={`/products/${product._id}`}
      >
        {product.image ? (
          <img
            alt={product.name}
            className="product-image"
            loading="lazy"
            src={getImageUrl(product.image)}
          />
        ) : (
          <div className="product-placeholder">
            <span>field&form</span>
          </div>
        )}
        <span className="product-category">{product.category}</span>
        <span className="product-arrow">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-card-info">
        <div>
          <Link className="product-name" to={`/products/${product._id}`}>
            {product.name}
          </Link>
          <span className="product-price">{money.format(product.price)}</span>
        </div>
        <button
          aria-label={`Add ${product.name} to cart`}
          className="product-add"
          disabled={product.stock < 1}
          onClick={addToCart}
          type="button"
        >
          <ShoppingBag size={16} />
          {product.stock < 1 ? "Sold out" : "Add"}
        </button>
      </div>
    </article>
  );
}
