import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import api, { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "Cash on Delivery",
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", form);
      clearCart();
      notify("Your order is on its way.");
      navigate(`/orders/${data.order._id}`, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't place your order."));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <Header />
      <main className="content-width standard-page checkout-page">
        <Link className="back-link" to="/cart">
          <ArrowLeft size={15} /> Back to your bag
        </Link>
        <div className="page-heading compact-heading">
          <p className="eyebrow">ALMOST YOURS</p>
          <h1>
            Checkout<span className="heading-period">.</span>
          </h1>
          <p>Tell us where to send your good finds.</p>
        </div>
        {!items.length ? (
          <div className="empty-panel">
            <h2>Your bag is empty.</h2>
            <Link className="button button-dark" to="/shop">
              Back to the collection
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={submit}>
              <section className="form-section">
                <p className="eyebrow">01 / DELIVERY DETAILS</p>
                <h2>Where should we send it?</h2>
                <div className="form-grid">
                  <label className="field-full">
                    Name
                    <input
                      autoComplete="name"
                      name="customerName"
                      onChange={update}
                      required
                      value={form.customerName}
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      autoComplete="tel"
                      name="phone"
                      onChange={update}
                      required
                      type="tel"
                      value={form.phone}
                    />
                  </label>
                  <label>
                    Postal code
                    <input
                      autoComplete="postal-code"
                      name="postalCode"
                      onChange={update}
                      required
                      value={form.postalCode}
                    />
                  </label>
                  <label className="field-full">
                    Street address
                    <textarea
                      autoComplete="street-address"
                      name="address"
                      onChange={update}
                      required
                      rows={3}
                      value={form.address}
                    />
                  </label>
                  <label className="field-full">
                    City
                    <input
                      autoComplete="address-level2"
                      name="city"
                      onChange={update}
                      required
                      value={form.city}
                    />
                  </label>
                </div>
              </section>
              <section className="form-section payment-section">
                <p className="eyebrow">02 / PAYMENT</p>
                <h2>Simple and straightforward.</h2>
                <label className="payment-option">
                  <input
                    checked
                    name="paymentMethod"
                    onChange={update}
                    type="radio"
                    value="Cash on Delivery"
                  />
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives.</small>
                  </span>
                </label>
              </section>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-dark place-order-button"
                disabled={placing}
                type="submit"
              >
                {placing ? "Placing your order..." : "Place order"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>

            <aside className="checkout-summary">
              <p className="eyebrow">IN YOUR BAG</p>
              <h2>Your order</h2>
              <div className="checkout-items">
                {items.map(
                  (item) =>
                    item.product && (
                      <div className="checkout-item" key={item.product._id}>
                        <div className="checkout-item-image">
                          {item.product.image ? (
                            <img alt="" src={getImageUrl(item.product.image)} />
                          ) : (
                            <span>f.</span>
                          )}
                          <small>{item.quantity}</small>
                        </div>
                        <div>
                          <strong>{item.product.name}</strong>
                          <span>{money.format(item.product.price)} each</span>
                        </div>
                        <b>
                          {money.format(item.product.price * item.quantity)}
                        </b>
                      </div>
                    ),
                )}
              </div>
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>Included</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <div className="secure-note">
                <ShieldCheck size={16} />
                <span>Your order is handled securely.</span>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
