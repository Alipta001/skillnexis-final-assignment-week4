import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api, { getErrorMessage } from "../services/api";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      try {
        const { data } = await api.get("/products", { params });
        setProducts(data.products);
        setCategories(
          [...new Set(data.products.map((product) => product.category))].sort(),
        );
        const next = new URLSearchParams();
        if (search.trim()) next.set("search", search.trim());
        if (category) next.set("category", category);
        setSearchParams(next, { replace: true });
      } catch (requestError) {
        setError(getErrorMessage(requestError, "Could not load products."));
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, category, setSearchParams]);

  return (
    <>
      <Header />
      <main className="content-width shop-page">
        <div className="shop-heading">
          <p className="eyebrow">THE FIELD & FORM COLLECTION</p>
          <h1>
            Good things,
            <br />
            <em>well chosen.</em>
          </h1>
          <p>
            A growing collection of useful, beautiful things for everyday life.
          </p>
        </div>
        <div className="shop-toolbar">
          <label className="search-control">
            <Search size={17} />
            <span className="sr-only">Search products</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the collection"
              value={search}
            />
          </label>
          <label className="category-control">
            <SlidersHorizontal size={15} />
            <span className="sr-only">Filter by category</span>
            <select
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <span className="result-count">
            {loading
              ? "Loading"
              : `${products.length} ${products.length === 1 ? "piece" : "pieces"}`}
          </span>
        </div>
        {loading ? (
          <Loading label="Loading the collection..." />
        ) : error ? (
          <div className="empty-panel">
            <p className="notice">{error}</p>
          </div>
        ) : products.length ? (
          <div className="product-grid shop-product-grid">
            {products.map((product, index) => (
              <ProductCard index={index} key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>Nothing found just yet.</h3>
            <p>Try a different search or category.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
