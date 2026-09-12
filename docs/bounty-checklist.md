# Checklist de entrega del bounty

## Requisito: Avalanche tiene un uso relevante

- El suministro fijo, compras, transferencias y reparto de ingresos viven en PropertyShares.sol.
- La interfaz envia transacciones y lee estado de Avalanche Fuji; no usa una base de datos para las tenencias.
- En la presentacion, explicar estas cuatro reglas y mostrar al menos una transaccion en explorador.

## Requisito: smart contract desplegado en Avalanche

- Desplegar en Fuji con pnpm contracts:deploy:fuji.
- Anotar direccion, chain ID y hash de despliegue.
- Confirmar que VITE_PROPERTY_SHARES_ADDRESS apunta a esa direccion.

## Requisito: contrato verificado

- Seguir docs/deployment.md.
- Guardar URL de la pagina de contrato verificado.
- Comprobar que el codigo, ABI y parametros son visibles.

## Requisito: MVP funcional

- Conectar wallet.
- Comprar 100 participaciones.
- Ver saldo y porcentaje.
- Depositar alquiler simulado con la wallet emisora.
- Reclamar ingreso con la wallet inversora.
- Transferir participaciones a otra wallet.

## Requisito: evidencia tecnica

- Repositorio con README, contrato, tests y frontend.
- Ejecutar pnpm test y pnpm build antes de entregar.
- Adjuntar hashes de transaccion y enlace del explorador.
- Incluir el aviso de participacion economica demo en toda presentacion.

## Criterios de evaluacion

La presentacion debe reservar tiempo para lo que mas pesa: integracion relevante con Avalanche, caso de uso, calidad tecnica del MVP y potencial. No describas Avalanche solo como almacenamiento; muestra las reglas que se ejecutan en el contrato.
