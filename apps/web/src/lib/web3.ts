import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type EIP1193Provider
} from "viem";
import { avalancheFuji } from "viem/chains";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
    avalanche?: EIP1193Provider;
  }
}

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http("https://api.avax-test.network/ext/bc/C/rpc")
});

export function getWalletClient() {
  const provider = getWalletProvider();

  return createWalletClient({
    chain: avalancheFuji,
    transport: custom(provider)
  });
}

export function getWalletProvider() {
  const provider = window.ethereum ?? window.avalanche;
  if (!provider) {
    throw new Error("No se detecto una wallet compatible. Instala Core o MetaMask.");
  }

  return provider;
}

export async function connectWallet(): Promise<{ address: Address; chainId: number }> {
  const client = getWalletClient();
  const [address] = await client.requestAddresses();
  if (!address) throw new Error("La wallet no devolvio una direccion.");

  return { address, chainId: await client.getChainId() };
}

/**
 * Recupera una cuenta que la extensión ya autorizó, sin abrir el diálogo de
 * conexión ni almacenar direcciones o credenciales en la aplicación.
 */
export async function getConnectedWallet(): Promise<{ address: Address; chainId: number } | undefined> {
  const provider = window.ethereum ?? window.avalanche;
  if (!provider) return undefined;

  const client = createWalletClient({
    chain: avalancheFuji,
    transport: custom(provider)
  });
  const [address] = await client.getAddresses();
  if (!address) return undefined;

  return { address, chainId: await client.getChainId() };
}

export async function switchToFuji() {
  const provider = window.ethereum ?? window.avalanche;
  if (!provider) {
    throw new Error("No se detecto una wallet compatible.");
  }

  const chainId = "0xA869";

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
  } catch (error) {
    const providerError = error as { code?: number };
    if (providerError.code !== 4902) throw error;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: "Avalanche Fuji C-Chain",
          nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18
          },
          rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
          blockExplorerUrls: ["https://testnet.snowtrace.io"]
        }
      ]
    });
  }
}
