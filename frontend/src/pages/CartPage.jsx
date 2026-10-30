import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, subtotal, updateQuantity, removeItem } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function changeQuantity(item, quantity) {
    try {
      await updateQuantity(item.product._id, quantity);
    } catch (error) {
      notify(getErrorMessage(error, "Could not update your bag."), "error");
    }
  }

  async function remove(productId) {
    try {
      await removeItem(productId);
      notify("Item removed from your bag.");
    } catch (error) {
      notify(getErrorMessage(error, "Could not remove that item."), "error");
    }
  }

  return (
    <>
      <Header />
      <main className="content-width standard-page">
        <div className="page-heading">
          <p className="eyebrow">YOUR GOOD FINDS</p>
          <h1>
            Your bag<span className="heading-period">.</span>
          </h1>
          <p>A few good things, all in one place.</p>
        </div>
        {!user ? (
          <div className="empty-panel">
            <ShoppingBag size={27} />
            <h2>Sign in to see your bag.</h2>
            <p>Your cart is saved to your account, ready when you are.</p>
            <button
              className="button button-dark"
              onClick={() => navigate("/login")}
              type="button"
            >
              Sign in
            </button>
          </div>
        ) : loading ? (
          <Loading label="Loading your bag..." />
        ) : !items.length ? (
          <div className="empty-panel">
            <ShoppingBag size={27} />
            <h2>Your bag is taking a breather.</h2>
            <p>Find something useful, beautiful, and made to be kept.</p>
            <Link className="button button-dark" to="/shop">
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-column-head">
                <span>ITEM</span>
                <span>QUANTITY</span>
                <span>TOTAL</span>
              </div>
              {items.map(
                (item) =>
                  item.product && (
                    <article className="cart-item" key={item.product._id}>
                      <Link
                        className="cart-item-image"
                        to={`/products/${item.product._id}`}
                      >
                        {item.product.image ? (
                          <img
                            alt={item.product.name}
                            src={getImageUrl(item.product.image)}
                          />
                        ) : (
                          <span>f.</span>
                        )}
                      </Link>
                      <div className="cart-item-info">
                        <p className="eyebrow">{item.product.category}</p>
                        <Link to={`/products/${item.product._id}`}>
                          {item.product.name}
                        </Link>
                        <span>{money.format(item.product.price)}</span>
                        {item.quantity > item.product.stock && (
                          <small className="stock-warning">
                            Only {item.product.stock} currently available.
                          </small>
                        )}
                      </div>
                      <div className="quantity-control">
                        <button
                          aria-label={`Decrease ${item.product.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            changeQuantity(item, item.quantity - 1)
                          }
                          type="button"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Increase ${item.product.name} quantity`}
                          disabled={item.quantity >= item.product.stock}
                          onClick={() =>
                            changeQuantity(item, item.quantity + 1)
                          }
                          type="button"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong className="cart-line-total">
                        {money.format(item.product.price * item.quantity)}
                      </strong>
                      <button
                        aria-label={`Remove ${item.product.name}`}
                        className="remove-item"
                        onClick={() => remove(item.product._id)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </article>
                  ),
              )}
              <Link className="text-link continue-shopping" to="/shop">
                Continue browsing <ArrowRight size={15} />
              </Link>
            </div>
            <aside className="order-summary">
              <p className="eyebrow">A QUICK RECAP</p>
              <h2>Order summary</h2>
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-total">
                <span>Estimated total</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <p className="summary-small">
                Your total is confirmed when your order is placed.
              </p>
              <button
                className="button button-dark checkout-button"
                disabled={items.some(
                  (item) => !item.product || item.quantity > item.product.stock,
                )}
                onClick={() => navigate("/checkout")}
                type="button"
              >
                Continue to checkout <ArrowRight size={16} />
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
