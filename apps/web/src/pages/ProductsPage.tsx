import { useState } from "react";
import type { Address } from "viem";
import type { ListedProperty, PropertyCategory } from "../lib/catalogData";

type ProductsPageProps = {
  catalog: ListedProperty[];
  address?: Address;
};

export function ProductsPage({ catalog, address }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMyProperties, setFilterMyProperties] = useState(false);

  const filteredCatalog = catalog.filter((p) => {
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMine = !filterMyProperties || (address && p.ownerAddress?.toLowerCase() === address.toLowerCase());
    return matchesCategory && matchesQuery && matchesMine;
  });

  return (
    <section className="container catalog-section page-view">
      <div className="catalog-header">
        <div>
          <p className="eyebrow">MERCADO RWA COMPLETO</p>
          <h2>Catálogo de Inmuebles Tokenizados</h2>
        </div>

        <div className="search-and-filter">
          <input
            className="search-input"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar por ciudad, código o nombre..."
            value={searchQuery}
          />
          {address && (
            <label className="filter-toggle">
              <input
                checked={filterMyProperties}
                onChange={(e) => setFilterMyProperties(e.target.checked)}
                type="checkbox"
              />
              <span>Mis Inmuebles Creados</span>
            </label>
          )}
        </div>
      </div>

      {/* BARRA DE CATEGORIAS */}
      <div className="category-bar">
        {(["Todas", "Residencial", "Comercial", "Hotelería", "Desarrollos"] as PropertyCategory[]).map((cat) => (
          <button
            className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
            key={cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {filteredCatalog.map((item) => (
          <a className="catalog-card" href={`/Product?id=${item.id}`} key={item.id} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="catalog-thumb" style={{ backgroundImage: `url(${item.image})` }}>
              <span className="category-pill">{item.category}</span>
              {item.featuredBadge && (
                <span className={`onchain-badge ${item.isRealOnChain ? "live" : ""}`}>
                  {item.featuredBadge}
                </span>
              )}
            </div>
            <div className="catalog-body">
              <span className="eyebrow">📍 {item.reference} · {item.city}</span>
              <h3>{item.name}</h3>

              <div className="card-funding">
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${item.fundingProgress}%` }} />
                </div>
                <div className="funding-text">
                  <span>{item.fundingProgress}% Vendido</span>
                  <span className="roi">{item.expectedROI}</span>
                </div>
              </div>

              <div className="catalog-stats">
                <div>
                  <span>Valor Est.</span>
                  <strong>Bs {item.referenceValueBOB.toLocaleString("es-BO")}</strong>
                </div>
                <div>
                  <span>Precio/Parte</span>
                  <strong>{item.pricePerShareAvax} AVAX</strong>
                </div>
              </div>
              <button className="primary-button full-button" style={{ marginTop: "14px" }}>
                Invertir en este Inmueble ➔
              </button>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
