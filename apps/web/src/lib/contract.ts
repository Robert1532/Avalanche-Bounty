import { isAddress, zeroAddress } from "viem";
import type { Address } from "viem";

const configuredAddress = import.meta.env.VITE_PROPERTY_SHARES_ADDRESS;

export const propertySharesAddress: Address | undefined =
  configuredAddress && configuredAddress !== zeroAddress && isAddress(configuredAddress)
    ? configuredAddress
    : undefined;

export const fujiExplorer = "https://testnet.snowtrace.io";

export function shortAddress(address: string) {
  return address.slice(0, 6) + "…" + address.slice(-4);
}

export function formatAvax(value: bigint | undefined, maximumFractionDigits = 4) {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits,
    minimumFractionDigits: 0
  }).format(Number(value) / 1e18);
}
