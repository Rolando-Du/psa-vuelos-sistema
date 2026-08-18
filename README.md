<div align="center">

# ✈️ Sistema de Registro de Vuelos

### Gestión de movimientos, arribos y partidas con autenticación y panel operativo

![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## 📌 Descripción

Aplicación full stack para el **registro, consulta y administración de movimientos de vuelos**. El sistema cuenta con autenticación de usuarios, rutas protegidas, carga de movimientos, planilla histórica y un dashboard con indicadores de actividad.

La interfaz fue desarrollada con React, Vite y Tailwind CSS, mientras que el backend utiliza Node.js, Express y MongoDB mediante Mongoose.

---

## 🚀 Funcionalidades principales

- Inicio de sesión y registro de usuarios.
- Autenticación mediante JWT.
- Rutas protegidas en el frontend.
- Registro de movimientos de vuelos.
- Consulta completa de registros.
- Edición y eliminación de movimientos.
- Obtención de un vuelo por ID.
- Búsqueda por DNI.
- Búsqueda por matrícula.
- Búsqueda por nombre de oficial.
- Gestión de estados de los vuelos.
- Panel con estadísticas de movimientos.
- Conteo de arribos y partidas.
- Planilla de registros desplegable.
- Interfaz responsive con diseño oscuro.

---

## 🧩 Arquitectura

```text
psa-vuelos-sistema/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🛠️ Stack tecnológico

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- SweetAlert2
- date-fns / Moment

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### Exportación y documentos

El proyecto incluye dependencias preparadas para trabajar con archivos y reportes:

- ExcelJS
- XLSX
- FileSaver
- jsPDF
- jsPDF AutoTable

---

## 🔐 Autenticación

El backend expone las siguientes rutas principales:

```text
POST /api/auth/login
POST /api/auth/register
```

El frontend utiliza contexto de autenticación y un componente `ProtectedRoute` para restringir el acceso al dashboard.

---

## ✈️ API de vuelos

Las rutas disponibles incluyen:

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

## 📊 Dashboard

El dashboard calcula indicadores en tiempo real a partir de los registros activos:

```text
Total de movimientos
Arribos
Partidas
```

Los vuelos con estado `ANULADO` no se incluyen dentro de las estadísticas activas.

---

## 💻 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Rolando-Du/psa-vuelos-sistema.git
cd psa-vuelos-sistema
```

### 2. Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` con las variables necesarias para la conexión a MongoDB y autenticación.

Ejecutar en desarrollo:

```bash
npm run dev
```

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite iniciará el frontend en el puerto configurado para desarrollo.

---

## 📜 Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

---

## 🔒 Seguridad

El proyecto utiliza:

- Hash de contraseñas con bcryptjs.
- Tokens JWT.
- Rutas protegidas en frontend.
- Variables de entorno para configuración sensible.
- CORS en el backend.

Los archivos `.env` no deben subirse al repositorio.

---

## 🎯 Estado del proyecto

El sistema cuenta actualmente con:

```text
✓ autenticación
✓ dashboard
✓ registro de vuelos
✓ historial de movimientos
✓ arribos y partidas
✓ búsquedas específicas
✓ actualización de registros
✓ eliminación de registros
✓ frontend responsive
✓ backend REST
✓ persistencia MongoDB
```

---

## 👨‍💻 Autor

Desarrollado por **Rolando Duarte**.

[![GitHub](https://img.shields.io/badge/GitHub-Rolando--Du-181717?style=for-the-badge&logo=github)](https://github.com/Rolando-Du)
