import { type FormEvent, useCallback, useEffect, useState } from "react";
import { isAddress, parseEther, type Address, type Hex } from "viem";
import { avalancheFuji } from "viem/chains";
import {
  formatAvax,
  fujiExplorer,
  propertySharesAddress,
  shortAddress
} from "./lib/contract";
import { propertySharesAbi } from "./lib/propertySharesAbi";
import { connectWallet, getWalletClient, publicClient, switchToFuji } from "./lib/web3";

const DEMO_TOTAL_SHARES = 7_000;
const DEMO_REFERENCE_VALUE = 700_000;

type PropertyData = {
  reference: string;
  totalShares: bigint;
  pricePerShare: bigint;
  availableShares: bigint;
  saleOpen: boolean;
};

type PortfolioData = {
  shares: bigint;
  withdrawableRent: bigint;
};

function integerInput(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0 ? BigInt(value) : undefined;
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar la operacion.";
}

function App() {
  const [address, setAddress] = useState<Address>();
  const [chainId, setChainId] = useState<number>();
  const [property, setProperty] = useState<PropertyData>();
  const [portfolio, setPortfolio] = useState<PortfolioData>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [connectError, setConnectError] = useState<string>();
  const [writeError, setWriteError] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<Hex>();
  const [transactionState, setTransactionState] = useState<"pending" | "confirmed">();
  const [buyAmount, setBuyAmount] = useState("100");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [rentalAmount, setRentalAmount] = useState("0.1");

  const refresh = useCallback(async () => {
    if (!propertySharesAddress) return;

    setIsLoading(true);
    try {
      const [reference, totalShares, pricePerShare, availableShares, saleOpen] = await Promise.all([
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "propertyReference"
        }),
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "totalSupply"
        }),
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "pricePerShare"
        }),
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "availableShares"
        }),
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "saleOpen"
        })
      ]);

      setProperty({ reference, totalShares, pricePerShare, availableShares, saleOpen });

      if (!address) {
        setPortfolio(undefined);
        return;
      }

      const [shares, withdrawableRent] = await Promise.all([
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "balanceOf",
          args: [address]
        }),
        publicClient.readContract({
          address: propertySharesAddress,
          abi: propertySharesAbi,
          functionName: "withdrawableRentalOf",
          args: [address]
        })
      ]);

      setPortfolio({ shares, withdrawableRent });
    } catch (error) {
      setWriteError("No se pudieron leer los datos del contrato: " + readableError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const purchaseShares = integerInput(buyAmount);
  const purchaseCost =
    purchaseShares !== undefined && property
      ? purchaseShares * property.pricePerShare
      : undefined;
  const percentage =
    portfolio && property && property.totalShares > 0n
      ? (Number(portfolio.shares) / Number(property.totalShares)) * 100
      : 0;
  const isConnected = Boolean(address);
  const wrongNetwork = isConnected && chainId !== avalancheFuji.id;
  const busy = isWriting || isLoading;

  function requireReady() {
    return Boolean(propertySharesAddress && address && !wrongNetwork);
  }

  async function connect() {
    setIsConnecting(true);
    setConnectError(undefined);
    try {
      const connected = await connectWallet();
      setAddress(connected.address);
      setChainId(connected.chainId);
    } catch (error) {
      setConnectError(readableError(error));
    } finally {
      setIsConnecting(false);
    }
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
      await refresh();
    } catch (error) {
      setWriteError(readableError(error));
    } finally {
      setIsWriting(false);
    }
  }

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
      setWriteError("Ingresa una cantidad valida de AVAX.");
    }
  }

  async function changeNetwork() {
    try {
      await switchToFuji();
      setChainId(avalancheFuji.id);
    } catch (error) {
      setConnectError(readableError(error));
    }
  }

  return (
    <main>
      <nav className="nav container">
        <a className="brand" href="#inicio">
          <span className="brand-mark">F</span>
          <span>fracciona</span>
        </a>
        <div className="nav-actions">
          <span className="network-pill">Avalanche Fuji</span>
          {isConnected ? (
            <button
              className="secondary-button"
              onClick={() => {
                setAddress(undefined);
                setChainId(undefined);
              }}
            >
              {shortAddress(address!)}
            </button>
          ) : (
            <button className="primary-button" disabled={isConnecting} onClick={() => void connect()}>
              {isConnecting ? "Conectando…" : "Conectar wallet"}
            </button>
          )}
        </div>
      </nav>

      <section className="hero container" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">MVP · PARTICIPACION ECONOMICA TOKENIZADA</p>
          <h1>Invierte en una fraccion, participa de los ingresos.</h1>
          <p className="hero-lead">
            Una demo transparente para representar participaciones economicas de un inmueble
            ficticio y distribuir sus ingresos sobre Avalanche.
          </p>
          <div className="hero-actions">
            <a className="primary-button link-button" href="#invertir">
              Ver oportunidad
            </a>
            {propertySharesAddress && (
              <a
                className="text-link"
                href={fujiExplorer + "/address/" + propertySharesAddress}
                rel="noreferrer"
                target="_blank"
              >
                Ver contrato ↗
              </a>
            )}
          </div>
        </div>

        <aside className="property-card">
          <div className="building-illustration">
            <span className="window one" />
            <span className="window two" />
            <span className="window three" />
            <span className="window four" />
            <span className="door" />
          </div>
          <p className="property-tag">PROPIEDAD FICTICIA #001</p>
          <h2>Edificio Andino</h2>
          <dl className="property-facts">
            <div>
              <dt>Valor de referencia</dt>
              <dd>Bs {DEMO_REFERENCE_VALUE.toLocaleString("es-BO")}</dd>
            </div>
            <div>
              <dt>Participaciones</dt>
              <dd>{(property?.totalShares ?? BigInt(DEMO_TOTAL_SHARES)).toLocaleString("es-BO")}</dd>
            </div>
            <div>
              <dt>Precio en demo</dt>
              <dd>{formatAvax(property?.pricePerShare)} AVAX</dd>
            </div>
          </dl>
        </aside>
      </section>

      {!propertySharesAddress && (
        <section className="container setup-notice">
          <strong>Demo aun no configurada.</strong>
          <span>
            Despliega el contrato en Fuji y agrega VITE_PROPERTY_SHARES_ADDRESS en
            apps/web/.env.local.
          </span>
        </section>
      )}

      {wrongNetwork && (
        <section className="container setup-notice warning">
          <span>Conecta tu wallet a Avalanche Fuji (chain ID 43113) para operar.</span>
          <button className="secondary-button" onClick={() => void changeNetwork()}>
            Cambiar red
          </button>
        </section>
      )}

      {connectError && <p className="container form-error">{connectError}</p>}

      <section className="container metrics">
        <div>
          <span>Participaciones disponibles</span>
          <strong>{property?.availableShares.toLocaleString("es-BO") ?? "—"}</strong>
        </div>
        <div>
          <span>Estado de venta</span>
          <strong>{property === undefined ? "—" : property.saleOpen ? "Abierta" : "Pausada"}</strong>
        </div>
        <div>
          <span>Referencia on-chain</span>
          <strong>{property?.reference ?? "Pendiente"}</strong>
        </div>
      </section>

      <section className="container investment-layout" id="invertir">
        <article className="panel investment-panel">
          <p className="eyebrow">TU INVERSION</p>
          <h2>Compra participaciones</h2>
          <p>El contrato exige el importe exacto y registra la transferencia en Avalanche Fuji.</p>
          <form onSubmit={handleBuy}>
            <label htmlFor="buy-amount">Cantidad de participaciones</label>
            <div className="input-row">
              <input
                id="buy-amount"
                inputMode="numeric"
                min="1"
                onChange={(event) => setBuyAmount(event.target.value)}
                type="number"
                value={buyAmount}
              />
              <span>FRA-001</span>
            </div>
            <div className="cost-row">
              <span>Costo de la transaccion</span>
              <strong>{formatAvax(purchaseCost)} AVAX</strong>
            </div>
            <button className="primary-button full-button" disabled={!requireReady() || busy} type="submit">
              {isWriting ? "Confirmando transaccion…" : "Comprar participaciones"}
            </button>
          </form>
        </article>

        <article className="panel portfolio-panel">
          <p className="eyebrow">TU PORTAFOLIO</p>
          <h2>Participacion registrada</h2>
          <div className="ownership">
            <strong>{portfolio?.shares.toLocaleString("es-BO") ?? "0"}</strong>
            <span>participaciones</span>
            <div className="percentage">{percentage.toFixed(2)}%</div>
          </div>
          <div className="rent-box">
            <span>Ingreso disponible para reclamar</span>
            <strong>{formatAvax(portfolio?.withdrawableRent, 6)} AVAX</strong>
            <button
              className="secondary-button full-button"
              disabled={!requireReady() || busy || !portfolio?.withdrawableRent}
              onClick={handleClaim}
            >
              Reclamar ingresos
            </button>
          </div>
        </article>
      </section>

      <section className="container operations-grid">
        <article className="panel compact-panel">
          <p className="eyebrow">TRANSFERIR</p>
          <h2>Mueve tu participacion</h2>
          <form onSubmit={handleTransfer}>
            <label htmlFor="receiver">Wallet de destino</label>
            <input
              id="receiver"
              onChange={(event) => setTransferAddress(event.target.value)}
              placeholder="0x…"
              value={transferAddress}
            />
            <label htmlFor="transfer-amount">Participaciones</label>
            <input
              id="transfer-amount"
              inputMode="numeric"
              min="1"
              onChange={(event) => setTransferAmount(event.target.value)}
              placeholder="10"
              type="number"
              value={transferAmount}
            />
            <button className="secondary-button full-button" disabled={!requireReady() || busy} type="submit">
              Transferir
            </button>
          </form>
        </article>

        <article className="panel compact-panel manager-panel">
          <p className="eyebrow">SIMULACION DE GESTOR</p>
          <h2>Depositar alquiler</h2>
          <p>Solo la wallet emisora puede acreditar un ingreso de alquiler para repartirlo.</p>
          <form onSubmit={handleDeposit}>
            <label htmlFor="rental-amount">AVAX de prueba</label>
            <input
              id="rental-amount"
              min="0"
              onChange={(event) => setRentalAmount(event.target.value)}
              step="0.01"
              type="number"
              value={rentalAmount}
            />
            <button className="secondary-button full-button" disabled={!requireReady() || busy} type="submit">
              Depositar ingreso
            </button>
          </form>
        </article>
      </section>

      {(writeError || transactionHash) && (
        <section className="container transaction-status">
          {writeError ? (
            <span className="form-error">{writeError}</span>
          ) : (
            <a href={fujiExplorer + "/tx/" + transactionHash} rel="noreferrer" target="_blank">
              {transactionState === "confirmed"
                ? "Transaccion confirmada"
                : "Ver transaccion pendiente"}{" "}
              ↗
            </a>
          )}
        </section>
      )}

      <section className="container how-it-works">
        <p className="eyebrow">COMO FUNCIONA</p>
        <h2>Reglas visibles y ejecutables.</h2>
        <div className="steps">
          <div>
            <span>01</span>
            <h3>Emision fija</h3>
            <p>Se crean 7.000 unidades. El suministro no se puede incrementar.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Compra y transferencia</h3>
            <p>La wallet recibe tokens y puede transferirlos con una transaccion real.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Ingreso proporcional</h3>
            <p>Los alquileres depositados se acreditan segun las participaciones al momento del deposito.</p>
          </div>
        </div>
      </section>

      <footer className="container">
        <span>Fracciona · MVP para Avalanche Fuji</span>
        <span>Participacion economica demo, no propiedad inmobiliaria legal.</span>
      </footer>
    </main>
  );
}

export default App;
