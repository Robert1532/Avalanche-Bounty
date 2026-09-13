import { useCallback, useEffect, useState, type MouseEvent } from "react";
import type { Address } from "viem";
import { CreatePropertyModal } from "./components/CreatePropertyModal";
import { Navbar } from "./components/Navbar";
import { INITIAL_CATALOG, type ListedProperty } from "./lib/catalogData";
import { propertySharesAddress } from "./lib/contract";
import { propertySharesAbi } from "./lib/propertySharesAbi";
import { connectWallet, getConnectedWallet, publicClient } from "./lib/web3";

import { IndexPage } from "./pages/IndexPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ContactsPage } from "./pages/ContactsPage";

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

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

export function App() {
  const [address, setAddress] = useState<Address>();
  const [chainId, setChainId] = useState<number>();
  const [catalog, setCatalog] = useState<ListedProperty[]>(INITIAL_CATALOG);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [propertyOnChain, setPropertyOnChain] = useState<PropertyData>();
  const [portfolio, setPortfolio] = useState<PortfolioData>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocationVersion] = useState(0);

  // Sistema de Enrutamiento por URL nativo (window.location.pathname & search)
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("id") ?? "1";

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

      setPropertyOnChain({ reference, totalShares, pricePerShare, availableShares, saleOpen });

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
      console.error(readableError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    async function restoreConnection() {
      try {
        const connected = await getConnectedWallet();
        setAddress(connected?.address);
        setChainId(connected?.chainId);
      } catch (error) {
        console.error(readableError(error));
      }
    }

    void restoreConnection();

    const provider = window.ethereum ?? window.avalanche;
    if (!provider) return;

    const eventProvider = provider as typeof provider & {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };
    const handleAccountsChanged = (accounts: unknown) => {
      const nextAddress = Array.isArray(accounts) ? accounts[0] : undefined;
      setAddress(typeof nextAddress === "string" ? nextAddress as Address : undefined);
    };
    const handleChainChanged = (nextChainId: unknown) => {
      const parsedChainId = typeof nextChainId === "string" ? Number.parseInt(nextChainId, 16) : undefined;
      setChainId(Number.isFinite(parsedChainId) ? parsedChainId : undefined);
    };

    eventProvider.on?.("accountsChanged", handleAccountsChanged);
    eventProvider.on?.("chainChanged", handleChainChanged);
    return () => {
      eventProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      eventProvider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setLocationVersion((version) => version + 1);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(href: string) {
    window.history.pushState({}, "", href);
    setLocationVersion((version) => version + 1);
  }

  function handleInternalNavigation(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    const link = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  async function connect() {
    setIsConnecting(true);
    try {
      const connected = await connectWallet();
      setAddress(connected.address);
      setChainId(connected.chainId);
    } catch (error) {
      console.error(readableError(error));
    } finally {
      setIsConnecting(false);
    }
  }

  function handleCreateProperty(newProperty: ListedProperty) {
    setCatalog((prev) => [newProperty, ...prev]);
    setShowCreateModal(false);
    navigate(`/Product?id=${newProperty.id}`);
  }

  // Selección del componente de página según la RUTA / URL actual
  const currentPropertyInfo = catalog.find((p) => p.id === productId) ?? catalog[0];

  let PageComponent = <IndexPage catalog={catalog} />;

  if (pathname === "/products") {
    PageComponent = <ProductsPage address={address} catalog={catalog} />;
  } else if (pathname === "/product") {
    PageComponent = (
      <ProductDetailPage
        address={address}
        busy={isLoading}
        catalog={catalog}
        chainId={chainId}
        onRefresh={refresh}
        portfolio={portfolio}
        propertyInfo={currentPropertyInfo}
        propertyOnChainData={propertyOnChain}
      />
    );
  } else if (pathname === "/contacts") {
    PageComponent = <ContactsPage onOpenCreateModal={() => setShowCreateModal(true)} />;
  }

  return (
    <main onClick={handleInternalNavigation}>
      <Navbar
        address={address}
        isConnecting={isConnecting}
        onConnect={() => void connect()}
        onDisconnect={() => {
          setAddress(undefined);
          setChainId(undefined);
        }}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {PageComponent}

      {showCreateModal && address && (
        <CreatePropertyModal
          address={address}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProperty}
        />
      )}

      <footer className="container">
        <span>Fracciona RWA · Plataforma de Inversión Inmobiliaria sobre Avalanche</span>
        <span>Participación económica demostrativa para Hackathon 2026.</span>
      </footer>
    </main>
  );
}

export default App;
