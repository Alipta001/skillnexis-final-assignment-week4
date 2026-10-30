import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api, { getErrorMessage } from "../services/api";

const categoryDetails = [
  {
    name: "Home",
    note: "Objects for slower mornings",
    image: "photo-1600210492486-724fe5c67fb0",
  },
  {
    name: "Accessories",
    note: "Little things, well considered",
    image: "photo-1523275335684-37898b6baf30",
  },
  {
    name: "Lifestyle",
    note: "Make the everyday a ritual",
    image: "photo-1490312278390-ab64016e0aa9",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(data.products.slice(0, 4)))
      .catch((requestError) =>
        setError(
          getErrorMessage(requestError, "Featured products are unavailable."),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-rule" /> SMALL BATCH. EVERYDAY GOOD.
            </p>
            <h1>
              Make room
              <br />
              for <em>the good</em>
              <br />
              things.
            </h1>
            <p className="hero-description">
              Thoughtful objects for living well. A considered collection for
              the home, the everyday, and everything in between.
            </p>
            <Link className="button button-dark hero-button" to="/shop">
              Explore the collection <ArrowRight size={17} />
            </Link>
            <div className="hero-note">
              <ArrowDownRight size={16} /> Useful by design. Loved for longer.
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image" />
            <div className="hero-sticker">
              <Sparkles size={16} />
              <span>
                Fewer,
                <br />
                better things.
              </span>
            </div>
            <span className="hero-image-caption">
              Objects for the everyday / 001
            </span>
          </div>
        </section>

        <section className="promise-row">
          <div>
            <Leaf size={19} />
            <span>Made to be kept</span>
          </div>
          <div>
            <PackageCheck size={19} />
            <span>Carefully packed</span>
          </div>
          <div>
            <Sparkles size={19} />
            <span>Considered, always</span>
          </div>
        </section>

        <section className="category-section content-width">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">FIND YOUR EVERYDAY</p>
              <h2>Shop by feeling.</h2>
            </div>
            <Link className="text-link" to="/shop">
              All categories <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="category-grid">
            {categoryDetails.map((category, index) => (
              <Link
                className={`category-tile category-tile-${index + 1}`}
                key={category.name}
                style={{
                  "--category-image": `url(https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=1000&q=85)`,
                }}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
              >
                <span className="category-index">0{index + 1} / 03</span>
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.note}</p>
                </div>
                <span className="category-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured-section">
          <div className="content-width">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">A FEW GOOD THINGS</p>
                <h2>Worth knowing.</h2>
              </div>
              <Link className="text-link" to="/shop">
                See everything <ArrowUpRight size={15} />
              </Link>
            </div>
            {loading ? (
              <Loading label="Finding the good things..." />
            ) : error ? (
              <p className="notice">{error}</p>
            ) : products.length ? (
              <div className="product-grid">
                {products.map((product, index) => (
                  <ProductCard
                    index={index}
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h3>The shelves are being filled.</h3>
                <p>Check back soon for the first collection.</p>
              </div>
            )}
          </div>
        </section>

        <section className="closing-note content-width">
          <p className="eyebrow">A NOTE FROM US</p>
          <p>
            “A well-made everyday thing has a way of becoming part of your
            story.”
          </p>
          <Link className="text-link" to="/shop">
            Find your something <ArrowRight size={15} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
