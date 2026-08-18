# Contribuir

## Flujo

1. Crear una rama desde `master`.
2. Mantener los cambios pequeños y enfocados.
3. Ejecutar validaciones locales.
4. Crear commits descriptivos.
5. Abrir un pull request explicando objetivo y pruebas.

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
```

## Backend

```bash
cd backend
npm ci
```

## Reglas

- No publicar datos personales o registros reales de vuelos.
- Mantener secretos JWT y conexión a MongoDB fuera del repositorio.
- Preservar rutas protegidas y autenticación.
- Documentar cambios en endpoints o modelos.
- Evitar dependencias innecesarias.

## Pull requests

Indicá alcance, pruebas realizadas y cualquier impacto en datos, autenticación, API o interfaz.
