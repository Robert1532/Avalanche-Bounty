# Guion de demo

Duracion objetivo: 3 minutos. Usa dos wallets de Fuji: Emisora y Inversor. Una tercera wallet hace mas clara la transferencia.

## Preparacion

1. Desplegar PropertyShares en Fuji y verificar la fuente.
2. Configurar VITE_PROPERTY_SHARES_ADDRESS en la web.
3. Conectar la wallet Emisora y luego una wallet Inversor, ambas con AVAX de prueba.
4. Tener abierta la pagina del contrato en el explorador de Fuji.

## Narrativa

1. Presentar el problema: una persona no necesita comprar un inmueble entero de Bs 700.000 para participar economicamente.
2. Mostrar la Propiedad #001: 7.000 participaciones, con valor de referencia de Bs 100 cada una.
3. Conectar la wallet Inversor en Avalanche Fuji. Explicar que la compra no se registra en una base de datos privada: finaliza en una transaccion de C-Chain.
4. Comprar 100 participaciones. Mostrar que el portafolio pasa a 100 y 1,43% de 7.000.
5. Conectar la wallet Emisora y depositar, por ejemplo, 0,1 AVAX de prueba como alquiler simulado.
6. Volver a Inversor. Mostrar el ingreso reclamable y ejecutar Reclamar ingresos.
7. Transferir 10 participaciones a una tercera wallet. Abrir ambas direcciones en el explorador.
8. Cerrar con la restriccion: es participacion economica demo, no titulo legal del inmueble. La siguiente fase incorpora la estructura juridica.

## Evidencia para entregar

- URL del repositorio.
- Direccion del contrato en Fuji.
- URL de contrato verificado.
- Hash de una compra.
- Hash de un deposito de ingreso.
- Hash de una reclamacion o transferencia.
- Captura o enlace de la interfaz mostrando el flujo.

No presentes una direccion sin verificar ni afirmes que el token por si solo transmite propiedad inmobiliaria legal.
