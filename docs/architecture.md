# Arquitectura del MVP

## Alcance

Fracciona modela una participacion economica demostrativa vinculada a una propiedad ficticia. No tokeniza la escritura de un inmueble ni sustituye KYC, contratos legales, custodia, impuestos o regulacion.

El caso de demo usa 7.000 tokens enteros FRA-001. Cada token representa una fraccion economica de 1/7.000 para calcular ingresos dentro del contrato. El valor en Bs es solo una referencia de interfaz; el pago del MVP usa AVAX de prueba en Fuji.

## Componentes

    Wallet del inversor ── compra / reclama / transfiere ──> PropertyShares.sol
    Wallet emisora     ── lista acciones / deposita renta ──> PropertyShares.sol
    Aplicacion web     ── lecturas y transacciones ─────────> Avalanche Fuji C-Chain

El frontend no mantiene un registro paralelo de titularidades. Consulta el contrato para saldo, inventario, precio, estado de venta e ingreso reclamable.

## Contrato PropertyShares

El contrato es un ERC-20 con suministro definido una vez en el constructor. La wallet emisora recibe ese suministro, y lo lista mediante una aprobacion ERC-20 hacia el propio contrato. Este patron deja el inventario bajo custodia de la emisora hasta cada compra y hace visible la cantidad efectivamente ofertada.

Las funciones principales son:

- buyShares: acepta la cantidad exacta de AVAX indicada por el precio fijo y mueve los tokens listados al comprador.
- depositRental: solo la emisora acredita un ingreso de alquiler.
- claimRental: permite retirar el ingreso acumulado por la wallet.
- transfer: transferencia ERC-20 estandar entre wallets.
- setSaleOpen: detiene o reanuda compras; no altera suministro ni transferencias.

## Reparto de ingresos

Cada deposito aumenta un acumulador de renta por token. El contrato conserva correcciones por wallet cada vez que se transfieren participaciones. Asi, quien compra despues de un deposito no puede reclamar renta anterior, y quien vende conserva la renta que ya se habia acreditado.

La division se realiza en AVAX y puede dejar un residuo de redondeo de escala muy pequeno. Es adecuado para el MVP, pero una version de produccion debe definir el tratamiento contable de polvo, activos estables, auditoria y rescates.

## Invariantes para la demo

- El total de tokens no tiene funcion de mint posterior al constructor.
- Una compra exige el valor exacto: cantidad por precio.
- No se puede comprar mas que el minimo entre el saldo y la aprobacion de la emisora.
- Los ingresos solo se reclaman una vez por cada saldo historicamente atribuible.
- Pausar venta no congela las transferencias ERC-20.

## Siguiente etapa, fuera del hackathon

Una implementacion real requeriria una entidad vehiculo que posea el activo, documentos de oferta, elegibilidad y KYC/AML, reglas de transferencia, stablecoin regulada o rails de pago, oraculo o conciliacion de alquileres, control de acceso con multiples firmantes, auditoria independiente y revision legal local.
