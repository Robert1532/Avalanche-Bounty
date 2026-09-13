import type { Address } from "viem";
import { propertySharesAddress } from "./contract";

export type PropertyCategory = "Todas" | "Residencial" | "Comercial" | "Desarrollos" | "Hotelería";

export type ListedProperty = {
  id: string;
  name: string;
  reference: string;
  city: string;
  category: PropertyCategory;
  referenceValueBOB: number;
  totalShares: number;
  availableSharesCount: number;
  pricePerShareAvax: string;
  expectedROI: string;
  image: string;
  description: string;
  contractAddress?: Address;
  ownerAddress?: Address;
  isRealOnChain: boolean;
  featuredBadge?: string;
  fundingProgress: number;
};

export const INITIAL_CATALOG: ListedProperty[] = [
  {
    id: "1",
    name: "Edificio Andino",
    reference: "BOL-001",
    city: "La Paz, Bolivia",
    category: "Residencial",
    referenceValueBOB: 700000,
    totalShares: 7000,
    availableSharesCount: 6800,
    pricePerShareAvax: "0.01",
    expectedROI: "8.5% Anual",
    image: "/edificio-andino.jpg",
    description: "Edificio residencial premium ubicado en la zona central de La Paz. Genera ingresos de alquiler continuos y estables respaldados por contratos comerciales a largo plazo.",
    contractAddress: propertySharesAddress as Address | undefined,
    ownerAddress: "0x76000BC1aC382a24304D1b2aa60fA0cC321A25f4",
    isRealOnChain: true,
    featuredBadge: "EN VIVO ON-CHAIN FUJI",
    fundingProgress: 97
  },
  {
    id: "2",
    name: "Torre Empresarial Equipetrol",
    reference: "BOL-002",
    city: "Santa Cruz, Bolivia",
    category: "Comercial",
    referenceValueBOB: 1850000,
    totalShares: 18500,
    availableSharesCount: 2300,
    pricePerShareAvax: "0.025",
    expectedROI: "10.2% Anual",
    image: "/torre-equipetrol.jpg",
    description: "Rascacielos corporativo de oficinas de alta gama en la zona empresarial con mayor plusvalía de Santa Cruz. Arrendado a empresas multinacionales.",
    isRealOnChain: false,
    featuredBadge: "CASI AGOTADO (88%)",
    fundingProgress: 88
  },
  {
    id: "3",
    name: "Condominio Ecológico Uyuni",
    reference: "BOL-003",
    city: "Cochabamba, Bolivia",
    category: "Residencial",
    referenceValueBOB: 540000,
    totalShares: 5400,
    availableSharesCount: 3900,
    pricePerShareAvax: "0.015",
    expectedROI: "7.8% Anual",
    image: "/condominio-uyuni.jpg",
    description: "Complejo residencial autosostenible con paneles solares y jardines verticales. Alta demanda de alquiler por familias jóvenes y ejecutivos.",
    isRealOnChain: false,
    fundingProgress: 28
  },
  {
    id: "4",
    name: "Boutique Hotel & Spa Valle Sagrado",
    reference: "BOL-004",
    city: "Tarija, Bolivia",
    category: "Hotelería",
    referenceValueBOB: 2400000,
    totalShares: 24000,
    availableSharesCount: 1200,
    pricePerShareAvax: "0.04",
    expectedROI: "12.5% Anual",
    image: "/edificio-andino.jpg",
    description: "Hotel boutique vinícola de lujo enfocado en turismo internacional. Retorno de dividendos distribuido mensualmente según ocupación hotelera.",
    isRealOnChain: false,
    featuredBadge: "ALTA RENTABILIDAD",
    fundingProgress: 95
  },
  {
    id: "5",
    name: "Parque Industrial Hub Norte",
    reference: "BOL-005",
    city: "Warnes, Santa Cruz",
    category: "Desarrollos",
    referenceValueBOB: 3100000,
    totalShares: 31000,
    availableSharesCount: 28000,
    pricePerShareAvax: "0.03",
    expectedROI: "11.0% Anual",
    image: "/torre-equipetrol.jpg",
    description: "Naves industriales y centro logístico multimodal para distribución de carga pesada y comercio electrónico.",
    isRealOnChain: false,
    featuredBadge: "NUEVO LANZAMIENTO",
    fundingProgress: 10
  },
  {
    id: "6",
    name: "Plaza Comercial San Miguel",
    reference: "BOL-006",
    city: "Zona Sur, La Paz",
    category: "Comercial",
    referenceValueBOB: 980000,
    totalShares: 9800,
    availableSharesCount: 0,
    pricePerShareAvax: "0.02",
    expectedROI: "9.1% Anual",
    image: "/condominio-uyuni.jpg",
    description: "Centro de compras de alta afluencia peatonal con locales gastronómicos y retail. Financiamiento al 100% completado.",
    isRealOnChain: false,
    featuredBadge: "100% FINANCIADO (CERRADO)",
    fundingProgress: 100
  }
];
