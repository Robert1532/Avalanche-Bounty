import type { ListedProperty } from "../lib/catalogData";
import { fujiExplorer } from "../lib/contract";

type IndexPageProps = {
  catalog: ListedProperty[];
};

export function IndexPage({ catalog }: IndexPageProps) {
  const featured = catalog[0];

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="pulse-dot" /> AVALANCHE REAL ESTATE PLATFORM
          </div>
          <h1>Mercado Institucional de Bienes Raíces Tokenizados.</h1>
          <p className="hero-lead">
            Democratizamos el acceso a la inversión en bienes raíces fraccionados sobre la blockchain de Avalanche Fuji. Seguridad inmutable, ingresos de alquiler en tiempo real e inversión desde montos accesibles.
          </p>
          <div className="hero-stats">
            <div>
              <strong>$4.2M+ BOB</strong>
              <span>Valor Total Listado</span>
            </div>
            <div>
              <strong>9.8%</strong>
              <span>ROI Promedio Anual</span>
            </div>
            <div>
              <strong>&lt; 2 Seg</strong>
              <span>Finalización Avalanche</span>
            </div>
          </div>
          <div className="hero-actions">
            <a className="primary-button link-button" href="/Products">
              Ver Catálogo Completo ➔
            </a>
            <a
              className="secondary-button"
              href={fujiExplorer + "/address/0x6E7631F8893B05D10409Bbe53fE3Fb36EDEbCE5c"}
              rel="noreferrer"
              target="_blank"
            >
              Contrato Verificado ↗
            </a>
          </div>
        </div>

        <aside className="property-card featured-card">
          <a href={`/Product?id=${featured.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div
              className="building-illustration"
              style={{ backgroundImage: `url(${featured.image})` }}
            >
              <div className="card-top-badges">
                <span className="category-pill">{featured.category}</span>
                <span className="status-pill highlight">{featured.featuredBadge}</span>
              </div>
            </div>
            <div className="card-content">
              <p className="property-tag">📍 OPORTUNIDAD DESTACADA · {featured.city}</p>
              <h2>{featured.name}</h2>

              <div className="funding-bar-wrapper">
                <div className="funding-label">
                  <span>Financiamiento completado</span>
                  <strong>{featured.fundingProgress}%</strong>
                </div>
                <div className="funding-bar">
                  <div className="funding-fill" style={{ width: `${featured.fundingProgress}%` }} />
                </div>
              </div>

              <dl className="property-facts">
                <div>
                  <dt>Valor Evaluado</dt>
                  <dd>Bs {featured.referenceValueBOB.toLocaleString("es-BO")}</dd>
                </div>
                <div>
                  <dt>Retorno Est.</dt>
                  <dd className="roi-highlight">{featured.expectedROI}</dd>
                </div>
                <div>
                  <dt>Precio/Parte</dt>
                  <dd>{featured.pricePerShareAvax} AVAX</dd>
                </div>
              </dl>
            </div>
          </a>
        </aside>
      </section>

      {/* SECCION DESTACADOS EN HOME */}
      <section className="container home-featured-section">
        <div className="catalog-header">
          <div>
            <p className="eyebrow">DESTACADOS EN TENDENCIA</p>
            <h2>Inmuebles Recomendados</h2>
          </div>
          <a className="text-link" href="/Products">
            Explorar todos los inmuebles ({catalog.length}) ➔
          </a>
        </div>

        <div className="catalog-grid">
          {catalog.slice(0, 3).map((item) => (
            <a className="catalog-card" href={`/Product?id=${item.id}`} key={item.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="catalog-thumb" style={{ backgroundImage: `url(${item.image})` }}>
                <span className="category-pill">{item.category}</span>
                {item.featuredBadge && <span className="onchain-badge live">{item.featuredBadge}</span>}
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
                <button className="secondary-button full-button" style={{ marginTop: "12px" }}>
                  Ver Ficha de Inversión ➔
                </button>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SECCION COMO FUNCIONA */}
      <section className="container how-it-works">
        <p className="eyebrow">INFRAESTRUCTURA AVALANCHE</p>
        <h2>Tokenización Transparente e Inmutable.</h2>
        <div className="steps">
          <div>
            <span>01</span>
            <h3>Smart Contract ERC-20</h3>
            <p>Cada inmueble cuenta con un suministro inmutable de participaciones. Sin emisión secundaria no autorizada.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Liquidación Atómica</h3>
            <p>El intercambio entre tokens y AVAX ocurre en una única transacción de C-Chain en menos de 2 segundos.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Reparto Proporcional de Rentas</h3>
            <p>Los alquileres depositados se calculan matemáticamente evitando trampas en transferencias posteriores.</p>
          </div>
        </div>
      </section>

      {/* SECCION NOSOTROS / VISION / MISION */}
      <section className="container about-preview-section">
        <div className="panel about-banner">
          <div>
            <p className="eyebrow">NUESTRA VISION</p>
            <h2>Transformando el Real Estate en Latinoamérica</h2>
            <p>
              Fracciona nace con el objetivo de eliminar las barreras de entrada al mercado inmobiliario. Combinamos la seguridad institucional de la red Avalanche con contratos legales estructurados para permitir que cualquier persona construya un portafolio diversificado de bienes raíces.
            </p>
            <a className="secondary-button link-button" href="/Contacts">
              Conocer Más Sobre Nosotros
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
