import {
  ArrowRight,
  Eye,
  PackagePlus,
  Pencil,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useToast } from "../context/ToastContext";
import api, { getErrorMessage, getImageUrl } from "../services/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
};

function ProductEditor({ product, onCancel, onSaved, notify }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image: product.image || "",
        }
      : emptyProduct,
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    product?.image ? getImageUrl(product.image) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function selectImage(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(selected.type) ||
      selected.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPEG, PNG or WEBP image under 5 MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      let image = form.image;
      if (file) {
        const body = new FormData();
        body.append("image", file);
        const { data } = await api.post("/uploads/image", body);
        image = data.image;
      }
      const payload = {
        ...form,
        image,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (product) await api.put(`/products/${product._id}`, payload);
      else await api.post("/products", payload);
      notify(product ? "Product updated." : "Product added.");
      onSaved();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not save product."));
    } finally {
      setSaving(false);
    }
  }

  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="admin-editor-heading">
        <div>
          <p className="eyebrow">
            {product ? "PRODUCT DETAILS" : "ADD TO THE COLLECTION"}
          </p>
          <h2>{product ? "Edit product" : "New product"}</h2>
        </div>
        <button className="text-button" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
      <div className="admin-form-grid">
        <label>
          Product name
          <input
            maxLength={120}
            name="name"
            onChange={update}
            required
            value={form.name}
          />
        </label>
        <label>
          Category
          <input
            maxLength={60}
            name="category"
            onChange={update}
            placeholder="Home, Accessories..."
            required
            value={form.category}
          />
        </label>
        <label>
          Price
          <input
            min="0"
            name="price"
            onChange={update}
            required
            step="0.01"
            type="number"
            value={form.price}
          />
        </label>
        <label>
          Stock
          <input
            min="0"
            name="stock"
            onChange={update}
            required
            step="1"
            type="number"
            value={form.stock}
          />
        </label>
        <label className="admin-field-wide">
          Description
          <textarea
            maxLength={3000}
            name="description"
            onChange={update}
            required
            rows={4}
            value={form.description}
          />
        </label>
        <label className="admin-field-wide">
          Product image
          <input
            accept="image/jpeg,image/png,image/webp"
            onChange={selectImage}
            type="file"
          />
        </label>
      </div>
      {preview && (
        <img
          alt="Product preview"
          className="admin-image-preview"
          src={preview}
        />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark" disabled={saving} type="submit">
        {saving ? "Saving..." : product ? "Save product" : "Add product"}
      </button>
    </form>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { notify } = useToast();

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, productResponse, orderResponse] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/products"),
          api.get("/admin/orders"),
        ]);
      setStats(dashboardResponse.data.stats);
      setProducts(productResponse.data.products);
      setOrders(orderResponse.data.orders);
    } catch (error) {
      notify(getErrorMessage(error, "Could not load dashboard."), "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      notify("Product deleted.");
      await loadAdminData();
    } catch (error) {
      notify(getErrorMessage(error, "Could not delete product."), "error");
    }
  }

  async function changeStatus(order, orderStatus) {
    try {
      await api.put(`/admin/orders/${order._id}`, { orderStatus });
      notify("Order status updated.");
      await loadAdminData();
    } catch (error) {
      notify(getErrorMessage(error, "Could not update order."), "error");
    }
  }

  return (
    <>
      <Header />
      <main className="admin-page">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">FIELD & FORM / ADMIN</p>
            <h1>A little overview.</h1>
            <p>Keep the collection and customer orders in good shape.</p>
          </div>
          <button
            className="button button-dark"
            onClick={() => {
              setEditing(null);
              setShowEditor(true);
              setTab("products");
            }}
            type="button"
          >
            <PackagePlus size={16} /> Add product
          </button>
        </div>
        {loading && !stats ? (
          <Loading label="Loading your dashboard..." />
        ) : (
          <>
            <div className="admin-stats">
              <div>
                <span className="admin-stat-icon">
                  <ShoppingBag size={18} />
                </span>
                <p>Products</p>
                <strong>{stats?.totalProducts ?? 0}</strong>
              </div>
              <div>
                <span className="admin-stat-icon">
                  <PackagePlus size={18} />
                </span>
                <p>Orders</p>
                <strong>{stats?.totalOrders ?? 0}</strong>
              </div>
              <div>
                <span className="admin-stat-icon">
                  <Users size={18} />
                </span>
                <p>Customers</p>
                <strong>{stats?.totalUsers ?? 0}</strong>
              </div>
            </div>
            <div className="admin-workspace">
              <div className="admin-tabs">
                <button
                  className={tab === "products" ? "admin-tab-active" : ""}
                  onClick={() => {
                    setTab("products");
                    setShowEditor(false);
                  }}
                  type="button"
                >
                  Products <span>{products.length}</span>
                </button>
                <button
                  className={tab === "orders" ? "admin-tab-active" : ""}
                  onClick={() => {
                    setTab("orders");
                    setShowEditor(false);
                  }}
                  type="button"
                >
                  Orders <span>{orders.length}</span>
                </button>
              </div>
              {showEditor ? (
                <ProductEditor
                  key={editing?._id || "new"}
                  notify={notify}
                  onCancel={() => {
                    setShowEditor(false);
                    setEditing(null);
                  }}
                  onSaved={async () => {
                    setShowEditor(false);
                    setEditing(null);
                    await loadAdminData();
                  }}
                  product={editing}
                />
              ) : tab === "products" ? (
                <div className="admin-table-wrap">
                  {products.length ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>CATEGORY</th>
                          <th>PRICE</th>
                          <th>STOCK</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="admin-product-cell">
                                <span className="admin-product-thumb">
                                  {product.image ? (
                                    <img
                                      alt=""
                                      src={getImageUrl(product.image)}
                                    />
                                  ) : (
                                    "f."
                                  )}
                                </span>
                                <strong>{product.name}</strong>
                              </div>
                            </td>
                            <td>{product.category}</td>
                            <td>{money.format(product.price)}</td>
                            <td>{product.stock}</td>
                            <td>
                              <div className="admin-actions">
                                <button
                                  aria-label={`Edit ${product.name}`}
                                  onClick={() => {
                                    setEditing(product);
                                    setShowEditor(true);
                                  }}
                                  type="button"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  aria-label={`Delete ${product.name}`}
                                  onClick={() => deleteProduct(product)}
                                  type="button"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-panel">
                      <h3>Your collection is ready for its first piece.</h3>
                      <button
                        className="button button-dark"
                        onClick={() => setShowEditor(true)}
                        type="button"
                      >
                        Add a product <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-table-wrap">
                  {orders.length ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ORDER</th>
                          <th>CUSTOMER</th>
                          <th>DATE</th>
                          <th>TOTAL</th>
                          <th>STATUS</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-7).toUpperCase()}</td>
                            <td>
                              <strong>
                                {order.shippingAddress.customerName}
                              </strong>
                              <small className="table-subtext">
                                {order.user?.email}
                              </small>
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td>{money.format(order.totalAmount)}</td>
                            <td>
                              <select
                                aria-label={`Status for order ${order._id}`}
                                className="status-select"
                                onChange={(event) =>
                                  changeStatus(order, event.target.value)
                                }
                                value={order.orderStatus}
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button
                                aria-label={`View order ${order._id}`}
                                className="admin-view-button"
                                onClick={() => setSelectedOrder(order)}
                                type="button"
                              >
                                <Eye size={15} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-panel">
                      <h3>No orders to review yet.</h3>
                      <p>Orders will appear here when customers check out.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {selectedOrder && (
          <div
            className="admin-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedOrder(null);
            }}
          >
            <section
              aria-labelledby="admin-order-title"
              aria-modal="true"
              className="admin-order-modal"
              role="dialog"
            >
              <div className="admin-editor-heading">
                <div>
                  <p className="eyebrow">
                    ORDER / {selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                  <h2 id="admin-order-title">Order details</h2>
                </div>
                <button
                  aria-label="Close order details"
                  className="icon-button"
                  onClick={() => setSelectedOrder(null)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="admin-order-customer">
                <div>
                  <p className="eyebrow">CUSTOMER</p>
                  <strong>{selectedOrder.shippingAddress.customerName}</strong>
                  <span>{selectedOrder.user?.email}</span>
                  <span>{selectedOrder.phone}</span>
                </div>
                <div>
                  <p className="eyebrow">DELIVERY ADDRESS</p>
                  <span>{selectedOrder.shippingAddress.address}</span>
                  <span>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </span>
                </div>
              </div>
              <div className="admin-order-items">
                {selectedOrder.items.map((item, index) => (
                  <div
                    className="admin-order-item"
                    key={`${item.product}-${index}`}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <strong>{money.format(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-line">
                <span>{selectedOrder.paymentMethod}</span>
                <strong>{money.format(selectedOrder.totalAmount)}</strong>
              </div>
              <p className="admin-order-status">
                Current status: <strong>{selectedOrder.orderStatus}</strong>
              </p>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
