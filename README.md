# Fracciona

MVP para el ETH Bolivia Buildathon 2026: participaciones economicas tokenizadas de un inmueble ficticio sobre Avalanche Fuji.

Fracciona permite demostrar el ciclo completo de una propiedad de referencia:

- Emitir una cantidad fija de participaciones ERC-20.
- Comprar participaciones en AVAX de prueba.
- Consultar el porcentaje economico representado por la tenencia.
- Depositar ingresos de alquiler y reclamarlos proporcionalmente.
- Transferir participaciones a otra wallet.

La demo usa la Propiedad #001 como caso ficticio: valor de referencia Bs 700.000, 7.000 participaciones y referencia de Bs 100 por participacion. En cadena el precio de demo se expresa en AVAX de prueba, no en bolivianos.

> Aviso importante: este MVP representa participaciones economicas para una demostracion tecnologica. No constituye titulo de propiedad inmobiliaria, oferta publica, valor negociable ni asesoramiento legal o financiero.

## Por que Avalanche es central

Avalanche C-Chain ejecuta las reglas que importan para la demo: suministro fijo, compras, transferencias, registro verificable de tenencias y reparto proporcional de ingresos. No es una base de datos adicional: las operaciones de la demo terminan en transacciones on-chain.

El repositorio esta orientado a Fuji Testnet (chain ID 43113) para el hackathon. La red de produccion no forma parte de esta base.

## Estructura

    apps/web/                 Aplicacion React para la demo y conexion de wallet
    packages/contracts/       Contrato Solidity, tests, despliegue y exportacion de ABI
    docs/                     Arquitectura, guion de demo, despliegue y checklist del bounty
    .github/workflows/        Validacion automatica

## Inicio rapido

Requisitos: Node.js 22 o posterior y pnpm 11.

    pnpm install
    Copy-Item .env.example .env
    Copy-Item apps/web/.env.example apps/web/.env.local
    pnpm contracts:compile
    pnpm test
    pnpm dev

La interfaz mostrara datos on-chain cuando VITE_PROPERTY_SHARES_ADDRESS apunte a un contrato desplegado. Antes de desplegar, se muestra una guia de configuracion en lugar de simular transacciones.

## Flujo de despliegue para la demo

1. Crear una wallet exclusiva de testnet y pedir AVAX de prueba para Fuji.
2. Completar PRIVATE_KEY en .env. Nunca subir ese archivo al repositorio.
3. Ejecutar pnpm contracts:deploy:fuji.
4. Copiar la direccion indicada a apps/web/.env.local como VITE_PROPERTY_SHARES_ADDRESS.
5. Ejecutar pnpm contracts:flatten para preparar el contrato para verificacion.
6. Verificarlo en el explorador de Fuji y guardar la URL en la entrega.
7. Ejecutar pnpm dev y realizar las transacciones del guion de docs/demo-script.md.

Las instrucciones y la evidencia esperada estan en docs/deployment.md y docs/bounty-checklist.md.

## Comandos

    pnpm dev                     Inicia la aplicacion web
    pnpm build                   Compila contrato y frontend
    pnpm test                    Ejecuta las pruebas del contrato
    pnpm contracts:compile       Compila Solidity y sincroniza el ABI al frontend
    pnpm contracts:deploy:fuji   Despliega el contrato en Fuji
    pnpm contracts:flatten       Genera una fuente plana para verificacion

## Estado de esta base

El contrato esta preparado y cubierto por pruebas locales. Aun no hay una direccion desplegada ni un contrato verificado: esas son acciones deliberadamente separadas porque requieren una wallet de prueba controlada por el equipo y una transaccion real.

Consulta docs/architecture.md para las decisiones del modelo y docs/security.md antes de ampliar o presentar el proyecto.

LINK CONTRATOS: https://testnet.snowtrace.io/address/0x8c5Ab83f8541E927B8Ec3aBbdE04ccB07d69A66c
