<div align="center">

# ✈️ Sistema de Registro de Vuelos

### Gestión de movimientos, arribos y partidas con autenticación y panel operativo

[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![CI](https://img.shields.io/github/actions/workflow/status/Rolando-Du/psa-vuelos-sistema/ci.yml?branch=master&style=for-the-badge&label=CI)](https://github.com/Rolando-Du/psa-vuelos-sistema/actions)

</div>

---

## Descripción

Aplicación full stack para el **registro, consulta y administración de movimientos de vuelos**.

El sistema cuenta con autenticación, rutas protegidas, carga y edición de movimientos, planilla histórica, búsquedas específicas y un dashboard con indicadores de actividad.

---

## Funcionalidades

- Inicio de sesión y registro de usuarios.
- Autenticación JWT.
- Rutas protegidas.
- Registro de movimientos de vuelos.
- Consulta completa de registros.
- Obtención por ID.
- Edición y eliminación.
- Búsqueda por DNI.
- Búsqueda por matrícula.
- Búsqueda por nombre de oficial.
- Gestión de estados.
- Dashboard con total de movimientos.
- Conteo de arribos y partidas.
- Planilla de registros desplegable.
- Exportación y herramientas documentales disponibles mediante dependencias del proyecto.
- Interfaz responsive.
- CI con GitHub Actions.

---

## Stack

### Frontend

```text
React 19
Vite 7
Tailwind CSS
React Router
Axios
Lucide React
SweetAlert2
ESLint
```

### Backend

```text
Node.js
Express 5
MongoDB
Mongoose
JWT
bcryptjs
CORS
dotenv
```

### Documentos y exportación

```text
ExcelJS
XLSX
FileSaver
jsPDF
jsPDF AutoTable
```

---

## Arquitectura

```text
Usuario
  ↓
React + Router
  ↓
Auth Context / Hooks / Components
  ↓
API REST
  ↓
Express
  ↓
Controllers / Models
  ↓
MongoDB
```

---

## Estructura

```text
psa-vuelos-sistema/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── models/
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── package-lock.json
├── SECURITY.md
└── README.md
```

---

## Instalación

```bash
git clone https://github.com/Rolando-Du/psa-vuelos-sistema.git
cd psa-vuelos-sistema
```

### Backend

```bash
cd backend
npm ci
```

Crear un archivo `.env` con la configuración local de MongoDB y JWT. No versionar este archivo.

Ejecutar:

```bash
npm run dev
```

### Frontend

En otra terminal:

```bash
cd frontend
npm ci
npm run dev
```

---

## Rutas de autenticación

```text
POST /api/auth/login
POST /api/auth/register
```

El frontend utiliza contexto de autenticación y `ProtectedRoute` para restringir el dashboard.

---

## API de vuelos

```text
GET    /api/flights
POST   /api/flights
GET    /api/flights/:id
PUT    /api/flights/:id
DELETE /api/flights/:id

GET /api/flights/search/dni/:dni
GET /api/flights/search/matricula/:matricula
GET /api/flights/search/oficial/:nombre
```

---

## Dashboard

El dashboard muestra indicadores derivados de los registros activos:

```text
Total de movimientos
Arribos
Partidas
```

Los registros con estado `ANULADO` no se contabilizan como movimientos activos.

---

## Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

---

## CI

GitHub Actions valida automáticamente cada push y pull request a `master`:

```text
Frontend → npm ci + lint + build
Backend  → npm ci
```

El workflow evita integrar cambios del frontend que no pasen las validaciones básicas de calidad y compilación.

---

## Seguridad

- No versionar `.env`.
- Mantener la conexión a MongoDB y los secretos JWT fuera del repositorio.
- No utilizar información real de personas o vuelos en ejemplos públicos.
- Revisar rutas protegidas y permisos antes de desplegar.
- Mantener dependencias actualizadas.

La política completa está disponible en **[SECURITY.md](./SECURITY.md)**.

---

## Estado

```text
✓ autenticación
✓ rutas protegidas
✓ dashboard
✓ registro de vuelos
✓ historial
✓ arribos y partidas
✓ búsquedas específicas
✓ edición
✓ eliminación
✓ frontend responsive
✓ API REST
✓ MongoDB
✓ CI
```

---

## Autor

Desarrollado por **Rolando Duarte**.

[![GitHub](https://img.shields.io/badge/GitHub-Rolando--Du-181717?style=for-the-badge&logo=github)](https://github.com/Rolando-Du)
