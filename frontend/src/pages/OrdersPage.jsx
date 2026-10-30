import { ArrowLeft, ArrowRight, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import api, { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-card-top">
        <div>
          <p className="eyebrow">ORDER PLACED</p>
          <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
        </div>
        <div>
          <p className="eyebrow">ORDER TOTAL</p>
          <strong>{money.format(order.totalAmount)}</strong>
        </div>
        <span
          className={`order-status status-${order.orderStatus.toLowerCase()}`}
        >
          {order.orderStatus}
        </span>
      </div>
      <div className="order-card-bottom">
        <div className="order-thumbnails">
          {order.items.slice(0, 3).map((item, index) => (
            <span className="order-thumbnail" key={`${item.product}-${index}`}>
              {item.image ? <img alt="" src={getImageUrl(item.image)} /> : "f."}
            </span>
          ))}
        </div>
        <span>
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
        <Link className="text-link" to={`/orders/${order._id}`}>
          View order <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const request = id
      ? api.get(`/orders/${id}`)
      : api.get("/orders/my-orders");
    request
      .then(({ data }) => (id ? setOrder(data.order) : setOrders(data.orders)))
      .catch((requestError) =>
        setError(getErrorMessage(requestError, "Unable to load orders.")),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Header />
      <main className="content-width standard-page">
        <div className="page-heading">
          <p className="eyebrow">THE PAPER TRAIL</p>
          <h1>
            {id ? "Order details" : "Your orders"}
            <span className="heading-period">.</span>
          </h1>
          <p>
            {id
              ? "Everything you need to know about this delivery."
              : "A little history of the good things you've found."}
          </p>
        </div>
        {loading ? (
          <Loading label="Finding your orders..." />
        ) : error ? (
          <div className="empty-panel">
            <p className="notice">{error}</p>
            <Link className="text-link" to="/orders">
              Back to orders
            </Link>
          </div>
        ) : id && order ? (
          <section className="order-detail-card">
            <Link className="back-link" to="/orders">
              <ArrowLeft size={15} /> All orders
            </Link>
            <div className="order-detail-heading">
              <div>
                <p className="eyebrow">
                  PLACED {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>
              </div>
              <span
                className={`order-status status-${order.orderStatus.toLowerCase()}`}
              >
                {order.orderStatus}
              </span>
            </div>
            <div className="order-detail-items">
              {order.items.map((item, index) => (
                <div
                  className="order-detail-item"
                  key={`${item.product}-${index}`}
                >
                  <div className="order-detail-image">
                    {item.image ? (
                      <img alt="" src={getImageUrl(item.image)} />
                    ) : (
                      "f."
                    )}
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      Qty {item.quantity} · {money.format(item.price)} each
                    </span>
                  </div>
                  <b>{money.format(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="order-detail-meta">
              <div>
                <p className="eyebrow">DELIVER TO</p>
                <p>
                  {order.shippingAddress.customerName}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.phone}
                </p>
              </div>
              <div>
                <p className="eyebrow">PAYMENT</p>
                <p>{order.paymentMethod}</p>
              </div>
            </div>
            <div className="summary-total">
              <span>Order total</span>
              <strong>{money.format(order.totalAmount)}</strong>
            </div>
          </section>
        ) : orders.length ? (
          <div className="orders-list">
            {orders.map((item) => (
              <OrderCard key={item._id} order={item} />
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <PackageCheck size={29} />
            <h2>No orders here yet.</h2>
            <p>
              When something good finds its way into your bag, you'll find it
              here.
            </p>
            <Link className="button button-dark" to="/shop">
              Explore the collection
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
