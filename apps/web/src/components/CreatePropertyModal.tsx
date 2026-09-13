import { useState, type FormEvent } from "react";
import type { Address } from "viem";
import type { ListedProperty, PropertyCategory } from "../lib/catalogData";
import { shortAddress } from "../lib/contract";

type CreateModalProps = {
  address: Address;
  onClose: () => void;
  onCreate: (property: ListedProperty) => void;
};

export function CreatePropertyModal({ address, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("Residencial");
  const [val, setVal] = useState("650000");
  const [shares, setShares] = useState("6500");
  const [price, setPrice] = useState("0.01");
  const [desc, setDesc] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const newId = String(Date.now());
    const newProp: ListedProperty = {
      id: newId,
      name: name || "Nuevo Inmueble Tokenizado",
      reference: ref || `BOL-007`,
      city: city || "La Paz, Bolivia",
      category,
      referenceValueBOB: Number(val) || 650000,
      totalShares: Number(shares) || 6500,
      availableSharesCount: Number(shares) || 6500,
      pricePerShareAvax: price || "0.01",
      expectedROI: "9.0% Anual",
      image: "/edificio-andino.jpg",
      description: desc || "Inmueble residencial recientemente tokenizado y disponible para participación económica directa.",
      ownerAddress: address,
      isRealOnChain: true,
      featuredBadge: "MI PROPIEDAD PUBLICADA",
      fundingProgress: 0
    };

    onCreate(newProp);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content panel">
        <div className="modal-header">
          <div>
            <span className="eyebrow">CREAR ACTIVO RWA</span>
            <h2>Tokenizar Nuevo Inmueble</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-lead">
          Publica tu propiedad inmobiliaria y emite participaciones divididas on-chain respaldadas por tu wallet ({shortAddress(address)}).
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div>
              <label>Nombre del Inmueble</label>
              <input
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Residencia El Lago"
                required
                value={name}
              />
            </div>
            <div>
              <label>Código Catastral / Ref</label>
              <input
                onChange={(e) => setRef(e.target.value)}
                placeholder="Ej. BOL-007"
                required
                value={ref}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label>Ciudad / Ubicación</label>
              <input
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Santa Cruz, Bolivia"
                value={city}
              />
            </div>
            <div>
              <label>Categoría</label>
              <select
                className="styled-select"
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                value={category}
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Desarrollos">Desarrollos</option>
                <option value="Hotelería">Hotelería</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div>
              <label>Valor Ref. (BOB)</label>
              <input
                onChange={(e) => setVal(e.target.value)}
                type="number"
                value={val}
              />
            </div>
            <div>
              <label>Participaciones</label>
              <input
                onChange={(e) => setShares(e.target.value)}
                type="number"
                value={shares}
              />
            </div>
            <div>
              <label>Precio/Parte (AVAX)</label>
              <input
                onChange={(e) => setPrice(e.target.value)}
                step="0.005"
                type="number"
                value={price}
              />
            </div>
          </div>

          <div>
            <label>Descripción del Inmueble</label>
            <textarea
              className="styled-textarea"
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Detalles sobre contratos de alquiler, ubicación y rentabilidad..."
              rows={3}
              value={desc}
            />
          </div>

          <div className="modal-footer">
            <button className="secondary-button" onClick={onClose} type="button">
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              Publicar e Iniciar Emisión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
