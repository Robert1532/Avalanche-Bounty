# Limites y seguridad

Este repositorio es una base de hackathon, no software listo para manejar dinero o derechos sobre inmuebles.

## Supuestos del MVP

- La wallet emisora es el gestor simulado. Puede pausar compras y depositar el alquiler simulado.
- La emision es fija; no hay funcion para emitir mas tokens.
- El precio por token es fijo en el constructor.
- El contrato recibe AVAX de prueba. Los valores expresados en Bs no entran en la logica on-chain.
- Los tokens son libremente transferibles para hacer visible el flujo de demo.

## Riesgos a resolver antes de produccion

- Auditoria externa de contrato, modelo de reparto y recuperacion de fondos.
- Multi-sig, roles separados y gobernanza de la entidad emisora.
- KYC/AML, restricciones de transferibilidad y privacidad.
- Marco legal para el vehiculo que posee el inmueble y para la participacion economica.
- Registro y conciliacion verificable de alquileres, gastos, vacancia, impuestos y reservas.
- Politica para redondeos, perdidas, rescates, disputas y reportes.
- Stablecoin o infraestructura de pagos adecuada, oraculos y seguridad operacional.

No desplegar en Avalanche Mainnet ni aceptar fondos reales con esta version.
