import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import api, { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch((requestError) =>
        setError(getErrorMessage(requestError, "Product not found.")),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!user) {
      notify("Log in to add items to your cart.", "error");
      navigate("/login");
      return;
    }
    try {
      await addItem(product, quantity);
      notify("Added to your bag.");
    } catch (requestError) {
      notify(
        getErrorMessage(requestError, "Could not add that item."),
        "error",
      );
    }
  }

  return (
    <>
      <Header />
      <main className="content-width detail-page">
        <Link className="back-link" to="/shop">
          <ArrowLeft size={15} /> Back to the collection
        </Link>
        {loading ? (
          <Loading label="Finding your product..." />
        ) : error || !product ? (
          <div className="empty-panel">
            <h2>We couldn't find that item.</h2>
            <p>{error}</p>
            <Link className="button button-dark" to="/shop">
              Back to shop
            </Link>
          </div>
        ) : (
          <div className="product-detail">
            <div className="detail-image">
              {product.image ? (
                <img alt={product.name} src={getImageUrl(product.image)} />
              ) : (
                <div className="product-placeholder">
                  <span>ShopWithMe</span>
                </div>
              )}
            </div>
            <div className="detail-copy">
              <p className="eyebrow">{product.category}</p>
              <h1>{product.name}</h1>
              <p className="detail-price">{money.format(product.price)}</p>
              <div className="detail-rule" />
              <p className="detail-description">{product.description}</p>
              <p
                className={`stock-note${product.stock < 1 ? " stock-none" : ""}`}
              >
                <span />{" "}
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Currently unavailable"}
              </p>
              {product.stock > 0 && (
                <div className="detail-purchase">
                  <div className="quantity-control">
                    <button
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((value) => value - 1)}
                      type="button"
                    >
                      <Minus size={15} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((value) => value + 1)}
                      type="button"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    className="button button-dark detail-add"
                    onClick={addToCart}
                    type="button"
                  >
                    <ShoppingBag size={17} /> Add to bag
                  </button>
                </div>
              )}
              <p className="detail-footnote">
                Thoughtfully selected. Made to be part of your everyday.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
