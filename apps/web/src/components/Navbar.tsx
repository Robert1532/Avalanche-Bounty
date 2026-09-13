import type { Address } from "viem";
import { shortAddress } from "../lib/contract";

type NavbarProps = {
  address?: Address;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onOpenCreateModal: () => void;
};

export function Navbar({ address, isConnecting, onConnect, onDisconnect, onOpenCreateModal }: NavbarProps) {
  return (
    <nav className="nav container">
      <a className="brand" href="/Index">
        <span className="brand-mark">F</span>
        <span>fracciona<span className="brand-sub">RWA</span></span>
      </a>

      <div className="nav-links">
        <a className="nav-link-btn" href="/Index">Inicio</a>
        <a className="nav-link-btn" href="/Products">Catálogo</a>
        <a className="nav-link-btn" href="/Contacts">Contacto & Nosotros</a>
      </div>

      <div className="nav-actions">
        <span className="network-pill">⚡ Avalanche Fuji</span>
        {address && (
          <button
            className="secondary-button create-btn"
            onClick={onOpenCreateModal}
          >
            + Listar Inmueble
          </button>
        )}
        {address ? (
          <button
            className="secondary-button wallet-btn"
            onClick={onDisconnect}
          >
            <span className="dot online" /> {shortAddress(address)}
          </button>
        ) : (
          <button className="primary-button" disabled={isConnecting} onClick={onConnect}>
            {isConnecting ? "Conectando…" : "Conectar Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
