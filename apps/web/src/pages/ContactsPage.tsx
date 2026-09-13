type ContactsPageProps = {
  onOpenCreateModal: () => void;
};

export function ContactsPage({ onOpenCreateModal }: ContactsPageProps) {
  return (
    <section className="container about-page-view">
      <div className="about-hero">
        <p className="eyebrow">SOBRE FRACCIONA RWA</p>
        <h1>Democratizando la Inversión Inmobiliaria en Latinoamérica</h1>
        <p className="hero-lead">
          Desarrollamos infraestructura descentralizada sobre la blockchain de Avalanche para conectar el mercado de bienes raíces tradicionales con inversionistas globales de forma transparente, rápida y sin intermediarios burocráticos.
        </p>
      </div>

      <div className="about-grid">
        <div className="panel about-card">
          <span className="about-icon">🎯</span>
          <h3>Nuestra Misión</h3>
          <p>
            Permitir que cualquier persona, independientemente de su capital, pueda invertir en participaciones fraccionadas de activos inmobiliarios de alta calidad y recibir rentas pasivas periódicas de forma automatizada.
          </p>
        </div>

        <div className="panel about-card">
          <span className="about-icon">🚀</span>
          <h3>Nuestra Visión</h3>
          <p>
            Convertirnos en el protocolo RWA (Real World Assets) líder en la región andina y Latinoamérica, impulsando la liquidez en mercados de capitales on-chain respaldados por vehículos legales transparentes.
          </p>
        </div>

        <div className="panel about-card">
          <span className="about-icon">🛡️</span>
          <h3>Por qué Avalanche</h3>
          <p>
            Aprovechamos la velocidad sub-segundo, las tarifas de gas ultra reducidas y la arquitectura de Subnets compatibles con EVM de Avalanche para brindar la mejor experiencia de usuario en inversiones descentralizadas.
          </p>
        </div>
      </div>

      <div className="panel team-banner">
        <h2>¿Eres propietario o desarrollador inmobiliario?</h2>
        <p>Tokeniza tu proyecto con nosotros y accede a financiamiento global directo en Avalanche.</p>
        <button className="primary-button" onClick={onOpenCreateModal}>
          Publicar Inmueble Ahora
        </button>
      </div>
    </section>
  );
}
