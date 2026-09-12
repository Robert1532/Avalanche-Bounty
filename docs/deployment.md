# Despliegue y verificacion en Avalanche Fuji

## Red objetivo

Usa Avalanche Fuji C-Chain:

- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Explorador: https://testnet.snowtrace.io

El contrato configura el objetivo Cancun porque esa es la version EVM requerida por la configuracion actual de Avalanche.

## Despliegue

1. Instala dependencias con pnpm install.
2. Copia .env.example a .env y completa PRIVATE_KEY con una wallet exclusiva de Fuji.
3. Pide AVAX de prueba desde la consola/faucet de Avalanche.
4. Ejecuta pnpm contracts:compile y luego pnpm contracts:deploy:fuji.
5. El script imprime la direccion, registra los parametros en packages/contracts/deployments/fuji/PropertyShares.json y aprueba las 7.000 participaciones para venta.
6. Copia la direccion a apps/web/.env.local:

    VITE_PROPERTY_SHARES_ADDRESS=0x...

7. Inicia la web con pnpm dev.

## Verificacion

El bounty exige contratos verificados. Antes de desplegar en una red real:

1. Ejecuta pnpm contracts:flatten.
2. Revisa packages/contracts/deployments/PropertyShares.flattened.sol. Conserva una sola licencia SPDX si el verificador lo solicita.
3. En el explorador de Fuji, abre la direccion del contrato y elige Verify and Publish.
4. Usa Solidity 0.8.30, optimizador activo con 200 ejecuciones y EVM Cancun.
5. Ingresa exactamente los argumentos del constructor impresos por el despliegue:

    propertyReference, tokenName, tokenSymbol, totalShares, pricePerShareWei, issuer

6. Guarda el enlace de verificacion y prueba el flujo completo despues de verificar.

La documentacion oficial de Avalanche tambien describe el flujo de verificacion mediante Snowtrace y su requerimiento de fuente plana.

## Separacion de secretos

PRIVATE_KEY es solo para Fuji, vive en .env y esta ignorada por Git. No se usa en el frontend y no se debe compartir en presentaciones, grabaciones ni mensajes.
