# Security Policy

## Reportar una vulnerabilidad

No publiques credenciales, tokens, información personal ni detalles explotables en issues públicos.

Para reportar un problema de seguridad, utilizá el correo de contacto disponible en el perfil de GitHub del autor. Incluí descripción, pasos de reproducción, impacto estimado y versión o commit afectado.

## Reglas del proyecto

- Mantener secretos JWT y conexión a MongoDB fuera del repositorio.
- No versionar archivos `.env`.
- No incluir datos reales de personas o vuelos en ejemplos públicos.
- Revisar permisos y rutas protegidas antes de desplegar.
- Mantener dependencias actualizadas.
- Ejecutar CI antes de integrar cambios.

## Datos sensibles

Los registros de usuarios, documentos, identificadores y movimientos deben tratarse como datos sensibles cuando provengan de entornos reales.
