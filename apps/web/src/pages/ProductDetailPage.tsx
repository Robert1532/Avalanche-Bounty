import { type FormEvent, useState } from "react";
import { isAddress, parseEther, type Address, type Hex } from "viem";
import { avalancheFuji } from "viem/chains";
import type { ListedProperty } from "../lib/catalogData";
import { formatAvax, fujiExplorer, propertySharesAddress } from "../lib/contract";
import { propertySharesAbi } from "../lib/propertySharesAbi";
import { getWalletClient, publicClient } from "../lib/web3";

type ProductDetailPageProps = {
  propertyInfo: ListedProperty;
  catalog: ListedProperty[];
  address?: Address;
  chainId?: number;
  onRefresh: () => Promise<void>;
  busy: boolean;
  propertyOnChainData?: {
    reference: string;
    totalShares: bigint;
    pricePerShare: bigint;
    availableShares: bigint;
    saleOpen: boolean;
  };
  portfolio?: {
    shares: bigint;
    withdrawableRent: bigint;
  };
};

function integerInput(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0 ? BigInt(value) : undefined;
}

export function ProductDetailPage({
  propertyInfo,
  catalog,
  address,
  chainId,
  onRefresh,
  busy,
  propertyOnChainData,
  portfolio
}: ProductDetailPageProps) {
  const [buyAmount, setBuyAmount] = useState("100");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [rentalAmount, setRentalAmount] = useState("0.1");

  const [writeError, setWriteError] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<Hex>();
  const [transactionState, setTransactionState] = useState<"pending" | "confirmed">();
  const [isWriting, setIsWriting] = useState(false);

  const wrongNetwork = Boolean(address && chainId !== avalancheFuji.id);

  function requireReady() {
    return Boolean(propertySharesAddress && address && !wrongNetwork);
  }

  async function waitForTransaction(submit: () => Promise<Hex>) {
    setWriteError(undefined);
    setTransactionHash(undefined);
    setTransactionState(undefined);
    setIsWriting(true);

    try {
      const hash = await submit();
      setTransactionHash(hash);
      setTransactionState("pending");
      await publicClient.waitForTransactionReceipt({ hash });
      setTransactionState("confirmed");
      await onRefresh();
    } catch (error) {
      setWriteError(error instanceof Error ? error.message : "Error en transacción");
    } finally {
      setIsWriting(false);
    }
  }

  const purchaseShares = integerInput(buyAmount);
  const purchaseCost =
    purchaseShares !== undefined && propertyOnChainData
      ? purchaseShares * propertyOnChainData.pricePerShare
      : undefined;

  const percentage =
    portfolio && propertyOnChainData && propertyOnChainData.totalShares > 0n
      ? (Number(portfolio.shares) / Number(propertyOnChainData.totalShares)) * 100
      : 0;

  function handleBuy(event: FormEvent) {
    event.preventDefault();
    if (!requireReady() || purchaseShares === undefined || purchaseCost === undefined) return;

    void waitForTransaction(() =>
      getWalletClient().writeContract({
        account: address!,
        chain: avalancheFuji,
        address: propertySharesAddress!,
        abi: propertySharesAbi,
        functionName: "buyShares",
        args: [purchaseShares],
        value: purchaseCost
      })
    );
  }

  function handleClaim() {
    if (!requireReady()) return;
    void waitForTransaction(() =>
      getWalletClient().writeContract({
        account: address!,
        chain: avalancheFuji,
        address: propertySharesAddress!,
        abi: propertySharesAbi,
        functionName: "claimRental"
      })
    );
  }

  function handleTransfer(event: FormEvent) {
    event.preventDefault();
    const amount = integerInput(transferAmount);
    if (!requireReady() || !amount || !isAddress(transferAddress)) return;

    void waitForTransaction(() =>
      getWalletClient().writeContract({
        account: address!,
        chain: avalancheFuji,
        address: propertySharesAddress!,
        abi: propertySharesAbi,
        functionName: "transfer",
        args: [transferAddress, amount]
      })
    );
  }

  function handleDeposit(event: FormEvent) {
    event.preventDefault();
    if (!requireReady()) return;

    try {
      const value = parseEther(rentalAmount);
      void waitForTransaction(() =>
        getWalletClient().writeContract({
          account: address!,
          chain: avalancheFuji,
          address: propertySharesAddress!,
          abi: propertySharesAbi,
          functionName: "depositRental",
          value
        })
      );
    } catch {
      setWriteError("Ingresa una cantidad válida de AVAX.");
    }
  }

  const displayTotalShares = propertyInfo.isRealOnChain && propertyOnChainData
    ? propertyOnChainData.totalShares.toString()
    : propertyInfo.totalShares.toLocaleString("es-BO");

  return (
    <div className="container detail-page-view">
      <a className="back-link-btn" href="/Products" style={{ display: "inline-block", textDecoration: "none" }}>
        ← Volver al Catálogo
      </a>

      <section className="detail-hero-grid">
        <div className="detail-media">
          <img alt={propertyInfo.name} className="detail-image" src={propertyInfo.image} />
        </div>

        <div className="detail-info-panel panel">
          <div className="detail-header-badges">
            <span className="category-pill">{propertyInfo.category}</span>
            {propertyInfo.featuredBadge && <span className="status-pill highlight">{propertyInfo.featuredBadge}</span>}
          </div>
          <p className="property-tag">📍 {propertyInfo.reference} · {propertyInfo.city}</p>
          <h1>{propertyInfo.name}</h1>
          <p className="detail-description">{propertyInfo.description}</p>

          <div className="detail-stats-grid">
            <div>
              <span>Valor de Referencia</span>
              <strong>Bs {propertyInfo.referenceValueBOB.toLocaleString("es-BO")}</strong>
            </div>
            <div>
              <span>Total Participaciones</span>
              <strong>{displayTotalShares}</strong>
            </div>
            <div>
              <span>Precio / Participación</span>
              <strong>{propertyInfo.isRealOnChain && propertyOnChainData ? formatAvax(propertyOnChainData.pricePerShare) : propertyInfo.pricePerShareAvax} AVAX</strong>
            </div>
            <div>
              <span>Retorno Estimado</span>
              <strong className="roi-highlight">{propertyInfo.expectedROI}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics" style={{ marginTop: "30px" }}>
        <div>
          <span>Participaciones Disponibles On-Chain</span>
          <strong>{propertyInfo.isRealOnChain && propertyOnChainData ? propertyOnChainData.availableShares.toLocaleString("es-BO") : propertyInfo.availableSharesCount.toLocaleString("es-BO")}</strong>
        </div>
        <div>
          <span>Estado de Emisión</span>
          <strong>{propertyInfo.fundingProgress === 100 ? "Finalizada" : "Abierta para Inversión"}</strong>
        </div>
        <div>
          <span>Código Catastral</span>
          <strong>{propertyInfo.reference}</strong>
        </div>
      </section>

      {/* PANEL DE COMPRA Y PORTAFOLIO ON-CHAIN */}
      <section className="investment-layout" id="invertir">
        <article className="panel investment-panel">
          <p className="eyebrow">INVERTIR ON-CHAIN</p>
          <h2>Adquirir participaciones en {propertyInfo.name}</h2>
          <p>La transacción se ejecuta en Avalanche Fuji transfiendo la propiedad de los tokens a tu wallet de forma atómica.</p>
          <form onSubmit={handleBuy}>
            <label htmlFor="buy-amount">Cantidad de participaciones a comprar</label>
            <div className="input-row">
              <input
                id="buy-amount"
                inputMode="numeric"
                min="1"
                onChange={(event) => setBuyAmount(event.target.value)}
                type="number"
                value={buyAmount}
              />
              <span>ACCIONES</span>
            </div>
            <div className="cost-row">
              <span>Costo estimado de la transacción</span>
              <strong>{formatAvax(purchaseCost)} AVAX</strong>
            </div>
            <button className="primary-button full-button" disabled={!requireReady() || busy || isWriting || propertyInfo.fundingProgress === 100} type="submit">
              {isWriting ? "Confirmando transacción en Fuji…" : propertyInfo.fundingProgress === 100 ? "Inmueble 100% Agotado" : "Comprar Participaciones"}
            </button>
          </form>
        </article>

        <article className="panel portfolio-panel">
          <p className="eyebrow">MI PORTAFOLIO EN ESTE ACTIVO</p>
          <h2>Tu Tenencia Registrada</h2>
          <div className="ownership">
            <strong>{portfolio?.shares.toLocaleString("es-BO") ?? "0"}</strong>
            <span>participaciones activas</span>
            <div className="percentage">{percentage.toFixed(2)}% del Inmueble</div>
          </div>
          <div className="rent-box">
            <span>Ingresos de Alquiler Acumulados</span>
            <strong>{formatAvax(portfolio?.withdrawableRent, 6)} AVAX</strong>
            <button
              className="secondary-button full-button"
              disabled={!requireReady() || busy || isWriting || !portfolio?.withdrawableRent}
              onClick={handleClaim}
            >
              Reclamar Rentas a Mi Wallet
            </button>
          </div>
        </article>
      </section>

      <section className="operations-grid">
        <article className="panel compact-panel">
          <p className="eyebrow">TRANSFERIR TOKEN</p>
          <h2>Transferir Participaciones</h2>
          <form onSubmit={handleTransfer}>
            <label htmlFor="receiver">Wallet de Destino</label>
            <input
              id="receiver"
              onChange={(event) => setTransferAddress(event.target.value)}
              placeholder="0x…"
              value={transferAddress}
            />
            <label htmlFor="transfer-amount">Cantidad de Participaciones</label>
            <input
              id="transfer-amount"
              inputMode="numeric"
              min="1"
              onChange={(event) => setTransferAmount(event.target.value)}
              placeholder="10"
              type="number"
              value={transferAmount}
            />
            <button className="secondary-button full-button" disabled={!requireReady() || busy || isWriting} type="submit">
              Enviar Participaciones
            </button>
          </form>
        </article>

        <article className="panel compact-panel manager-panel">
          <p className="eyebrow">PANEL GESTOR / ADMINISTRADOR</p>
          <h2>Depositar Renta Mensual</h2>
          <p>Distribuye el alquiler recibido a todos los inversores en proporción exacta a su tenencia.</p>
          <form onSubmit={handleDeposit}>
            <label htmlFor="rental-amount">Monto del Alquiler en AVAX</label>
            <input
              id="rental-amount"
              min="0"
              onChange={(event) => setRentalAmount(event.target.value)}
              step="0.01"
              type="number"
              value={rentalAmount}
            />
            <button className="secondary-button full-button" disabled={!requireReady() || busy || isWriting} type="submit">
              Depositar y Repartir Renta
            </button>
          </form>
        </article>
      </section>

      {(writeError || transactionHash) && (
        <section className="transaction-status" style={{ marginTop: "24px" }}>
          {writeError ? (
            <span className="form-error">{writeError}</span>
          ) : (
            <a href={fujiExplorer + "/tx/" + transactionHash} rel="noreferrer" target="_blank">
              {transactionState === "confirmed"
                ? "Transacción confirmada en Avalanche Fuji"
                : "Ver transacción pendiente"}{" "}
              ↗
            </a>
          )}
        </section>
      )}

      {/* OTROS INMUEBLES RECOMENDADOS EN LA PAGINA DE DETALLE */}
      <section className="related-properties-section" style={{ marginTop: "60px" }}>
        <div className="catalog-header">
          <h2>Otras Oportunidades Inmobiliarias Recomendadas</h2>
        </div>
        <div className="catalog-grid">
          {catalog.filter((p) => p.id !== propertyInfo.id).slice(0, 3).map((item) => (
            <a className="catalog-card" href={`/Product?id=${item.id}`} key={item.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="catalog-thumb" style={{ backgroundImage: `url(${item.image})` }}>
                <span className="category-pill">{item.category}</span>
              </div>
              <div className="catalog-body">
                <span className="eyebrow">📍 {item.reference} · {item.city}</span>
                <h3>{item.name}</h3>
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
                <button className="secondary-button full-button" style={{ marginTop: "12px" }}>
                  Ver Ficha ➔
                </button>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
