<div align="center">

📌 Descripción

SkyLog Manager es una aplicación web full stack orientada al registro, consulta y administración de movimientos de vuelos.

Permite gestionar arribos y partidas, manifiestos de pasajeros y tripulantes, oficiales intervinientes, equipaje, búsquedas históricas y exportaciones documentales.

Los registros históricos no se eliminan físicamente.
Cuando un movimiento deja de ser válido, se marca como ANULADO, preservando la trazabilidad del sistema.

✨ Funcionalidades

Módulo

Funcionalidad

🔐 Autenticación

Login, registro de usuarios, JWT y rutas protegidas

✈️ Vuelos

Alta, consulta, edición y anulación de movimientos

🔢 SMA

Numeración automática de registros

👥 Manifiestos

Gestión de pasajeros y tripulantes

🧳 Equipaje

Equipaje de mano y equipaje de bodega

👮 Oficiales

Catálogo y autocompletado por nombre, grado y L.U.P.

🔎 Búsquedas

DNI, matrícula y nombre de oficial

📊 Dashboard

Indicadores de vuelos, pasajeros y tripulantes

📄 PDF

Reporte general y PDF individual por vuelo

📗 Excel

Exportación de registros y manifiestos

📱 UI

Interfaz responsive

⚙️ CI

Validaciones automáticas con GitHub Actions

🧱 Stack tecnológico

🎨 Frontend

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
</p>

React 19
Vite 7
Tailwind CSS
React Router
Axios
Lucide React
SweetAlert2

⚙️ Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

Node.js
Express 5
Prisma 7
Prisma PostgreSQL Adapter
JWT
bcryptjs
CORS
dotenv

🗄️ Base de datos

<p>
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Neon-Cloud_DB-00E599?style=flat-square&logo=postgresql&logoColor=000000" alt="Neon" />
</p>

PostgreSQL 17
Prisma ORM
Neon PostgreSQL

📄 Documentos y exportación

<p>
  <img src="https://img.shields.io/badge/PDF-jsPDF-red?style=flat-square&logo=adobe-acrobat-reader&logoColor=white" alt="jsPDF" />
  <img src="https://img.shields.io/badge/Excel-XLSX-217346?style=flat-square&logo=microsoft-excel&logoColor=white" alt="XLSX" />
</p>

ExcelJS
XLSX
FileSaver
jsPDF
jsPDF AutoTable

☁️ Infraestructura

<p>
  <img src="https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render&logoColor=000000" alt="Render" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=000000" alt="Neon" />
</p>

🏗️ Arquitectura

┌─────────────────────┐
│       Usuario       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   React + Vite      │
│      Vercel         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       Axios         │
│      API REST       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Node.js + Express   │
│       Render        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Prisma ORM      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PostgreSQL 17       │
│       Neon          │
└─────────────────────┘

📁 Estructura

skylog-manager/
├── .github/
│   └── workflows/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── package.json
├── SECURITY.md
└── README.md

🚀 Instalación

1. Clonar el repositorio

git clone https://github.com/Rolando-Du/psa-vuelos-sistema.git
cd psa-vuelos-sistema

2. Instalar dependencias

pnpm install

🔐 Variables de entorno

Crear:

backend/.env

Ejemplo:

PORT=5000
DATABASE_URL=postgresql://usuario:password@localhost:5432/skylog
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

⚠️ No versionar el archivo .env.

🗄️ PostgreSQL + Prisma

pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate status
pnpm --filter backend exec prisma migrate deploy

▶️ Ejecución local

Proyecto completo

pnpm dev

Backend

pnpm --filter backend dev

http://localhost:5000

Frontend

pnpm --filter frontend dev

http://localhost:5173

🔑 Autenticación

POST /api/auth/login
POST /api/auth/register

Las rutas privadas requieren autenticación mediante JWT.

Las contraseñas se almacenan mediante hashes generados con bcryptjs.

✈️ API de vuelos

Operaciones

GET  /api/flights
POST /api/flights
GET  /api/flights/:id
PUT  /api/flights/:id

Búsquedas

GET /api/flights/search/dni/:dni
GET /api/flights/search/matricula/:matricula
GET /api/flights/search/oficial/:nombre

Anulación

Los vuelos no se eliminan físicamente.

{
  "estado": "ANULADO"
}

El registro permanece disponible en el historial para conservar la trazabilidad.

🔢 Numeración SMA

SMA-0001/2026
SMA-0002/2026
SMA-0003/2026

La numeración se conserva incluso cuando un registro es anulado.

👥 Manifiestos

T → Tripulante
P → Pasajero

Datos registrados:

Apellido y nombre
Tipo de documento
Número de documento
Nacionalidad
Tipo de persona
Equipaje de mano
Equipaje de bodega

👮 Oficiales

El sistema mantiene un catálogo de oficiales con:

Grado
Nombre
L.U.P.

El L.U.P. funciona como identificador único.

📊 Dashboard

Indicadores principales:

Vuelos
Pasajeros
Tripulantes

Los registros ANULADO permanecen visibles, diferenciados visualmente y sin acciones operativas.

📤 Exportaciones

📄 PDF general

Reporte completo de movimientos y manifiestos.

📄 PDF individual

Reporte específico de un vuelo.

📗 Excel

Exportación de registros en formato .xlsx.

🛠️ Scripts

Proyecto

pnpm dev

Backend

pnpm --filter backend dev
pnpm --filter backend start

Frontend

pnpm --filter frontend dev
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter frontend preview

☁️ Producción

Servicio

Plataforma

Estado

🎨 Frontend

Vercel

✅ Online

⚙️ Backend

Render

✅ Online

🗄️ PostgreSQL

Neon

✅ Online

Frontend

https://psa-vuelos-sistema.vercel.app

Backend

https://skylog-api.onrender.com

🔄 CI/CD

<p>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Git-Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Git" />
  <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
</p>

El proyecto utiliza GitHub Actions para validar cambios mediante instalación de dependencias, lint y build.

🛡️ Seguridad

No versionar .env.

No almacenar credenciales dentro del código.

Mantener DATABASE_URL y JWT_SECRET como variables de entorno.

Contraseñas almacenadas mediante hash.

Rutas privadas protegidas mediante JWT.

Registros históricos sin eliminación física.

Mantener dependencias actualizadas.

Rotar cualquier credencial expuesta.

La política completa está disponible en SECURITY.md.

✅ Estado

✓ autenticación
✓ rutas protegidas
✓ PostgreSQL 17
✓ Prisma ORM
✓ Neon
✓ dashboard
✓ registro de vuelos
✓ historial
✓ arribos y partidas
✓ manifiestos
✓ pasajeros y tripulantes
✓ equipaje
✓ búsquedas
✓ catálogo de oficiales
✓ autocompletado
✓ edición
✓ anulación
✓ exportación PDF
✓ exportación Excel
✓ frontend responsive
✓ API REST
✓ Vercel
✓ Render
✓ GitHub Actions

<div align="center">


<div align="center">

Descripción

SkyLog Manager es una aplicación full stack para el registro, consulta y administración de movimientos de vuelos.

El sistema cuenta con autenticación, rutas protegidas, carga y edición de movimientos, planilla histórica, búsquedas específicas, gestión de manifiestos y herramientas de exportación.

Los registros históricos no se eliminan físicamente. Cuando un movimiento deja de ser válido, se marca con estado ANULADO, preservando su trazabilidad dentro del sistema.

Funcionalidades

Inicio de sesión y registro de usuarios.

Autenticación mediante JWT.

Rutas protegidas.

Registro de movimientos de vuelos.

Numeración automática de registros SMA.

Registro de arribos y partidas.

Gestión de tripulantes y pasajeros.

Registro de equipaje de mano y bodega.

Consulta completa del historial.

Obtención de vuelos por ID.

Edición de movimientos.

Anulación de registros sin eliminación física.

Búsqueda por DNI.

Búsqueda por matrícula.

Búsqueda por nombre de oficial.

Autocompletado de oficiales.

Gestión de estados de vuelos.

Dashboard con indicadores de actividad.

Conteo de pasajeros y tripulantes.

Exportación de registros a PDF.

Exportación de registros a Excel.

Generación de PDF individual por vuelo.

Interfaz responsive.

CI con GitHub Actions.

Stack

Frontend

React 19
Vite 7
Tailwind CSS
React Router
Axios
Lucide React
SweetAlert2

Backend

Node.js
Express 5
PostgreSQL 17
Prisma 7
Prisma PostgreSQL Adapter
JWT
bcryptjs
CORS
dotenv

Base de datos

PostgreSQL
Prisma ORM
Neon PostgreSQL

Documentos y exportación

ExcelJS
XLSX
FileSaver
jsPDF
jsPDF AutoTable

Infraestructura

Frontend → Vercel
Backend  → Render
Database → Neon PostgreSQL

Arquitectura

Usuario
  ↓
React + Vite
  ↓
Auth Context / Components
  ↓
Axios
  ↓
API REST
  ↓
Node.js + Express
  ↓
Controllers
  ↓
Prisma ORM
  ↓
PostgreSQL
  ↓
Neon

Producción

Vercel
  ↓
skylog-api / Render
  ↓
Prisma
  ↓
Neon PostgreSQL

Estructura

skylog-manager/
├── .github/
│   └── workflows/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   │
│   └── package.json
│
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── package.json
├── SECURITY.md
└── README.md

Instalación

El proyecto utiliza pnpm como gestor de paquetes.

Clonar el repositorio

git clone https://github.com/Rolando-Du/psa-vuelos-sistema.git
cd psa-vuelos-sistema

Instalar dependencias

Desde la raíz:

pnpm install

Variables de entorno

Crear:

backend/.env

Ejemplo:

PORT=5000
DATABASE_URL=postgresql://usuario:password@localhost:5432/skylog
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

El archivo .env no debe versionarse.

Base de datos

El proyecto utiliza PostgreSQL 17 administrado mediante Prisma.

Validar el esquema

pnpm --filter backend exec prisma validate

Generar Prisma Client

pnpm --filter backend exec prisma generate

Aplicar migraciones

pnpm --filter backend exec prisma migrate deploy

Estado de las migraciones

pnpm --filter backend exec prisma migrate status

Ejecución local

Proyecto completo

Desde la raíz:

pnpm dev

Esto inicia frontend y backend en paralelo.

Backend

pnpm --filter backend dev

Backend:

http://localhost:5000

Frontend

pnpm --filter frontend dev

Frontend:

http://localhost:5173

Rutas de autenticación

POST /api/auth/login
POST /api/auth/register

El frontend utiliza contexto de autenticación y rutas protegidas para restringir el acceso al sistema.

Las contraseñas se almacenan utilizando hashes generados con bcryptjs.

API de vuelos

Operaciones principales

GET  /api/flights
POST /api/flights
GET  /api/flights/:id
PUT  /api/flights/:id

Los vuelos no poseen una operación de eliminación física.

Para invalidar un registro se actualiza:

{
  "estado": "ANULADO"
}

De esta forma se mantiene el historial completo del sistema.

Búsquedas

GET /api/flights/search/dni/:dni
GET /api/flights/search/matricula/:matricula
GET /api/flights/search/oficial/:nombre

Numeración SMA

Cada movimiento recibe automáticamente un número de registro con el formato:

SMA-0001/2026
SMA-0002/2026
SMA-0003/2026

La numeración se administra mediante PostgreSQL y se conserva incluso cuando un registro es anulado.

Manifiesto

Cada vuelo puede contener múltiples personas clasificadas como:

T → Tripulante
P → Pasajero

Por persona se registran datos como:

Apellido y nombre
Tipo de documento
Número de documento
Nacionalidad
Tipo de persona
Equipaje de mano
Equipaje de bodega

Oficiales

El sistema mantiene un catálogo de oficiales utilizado para autocompletar:

Grado
Nombre
L.U.P.

El L.U.P. funciona como identificador único dentro del catálogo.

Al registrar nuevos movimientos, el sistema puede incorporar o actualizar automáticamente la información del oficial correspondiente.

Dashboard

El dashboard muestra información derivada de los registros disponibles:

Vuelos
Pasajeros
Tripulantes

Los registros con estado:

ANULADO

se mantienen visibles para preservar el historial, pero se presentan diferenciados visualmente y quedan inactivos para determinadas operaciones.

Exportaciones

SkyLog permite generar documentación desde la planilla histórica.

PDF general

Incluye todos los movimientos filtrados y sus manifiestos.

PDF individual

Permite descargar la información correspondiente a un único vuelo.

Excel

Permite exportar los registros y manifiestos en formato .xlsx.

Entre los datos exportados se incluyen:

Nº de registro
Estado
Fecha
Hora
Matrícula
Movimiento
Origen / Destino
Tripulante / Pasajero
Apellido y nombre
Nacionalidad
Documento
Equipaje de mano
Equipaje de bodega
Observaciones
Oficial

Scripts

Raíz

pnpm dev

Backend

pnpm --filter backend dev
pnpm --filter backend start

Frontend

pnpm --filter frontend dev
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter frontend preview

Prisma

pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate status
pnpm --filter backend exec prisma migrate deploy

Despliegue

Frontend

El frontend se encuentra desplegado en Vercel.

https://psa-vuelos-sistema.vercel.app

Backend

La API se encuentra desplegada en Render.

https://skylog-api.onrender.com

Base de datos

La base PostgreSQL de producción se encuentra alojada en Neon.

PostgreSQL 17
Prisma ORM
Neon PostgreSQL

CI

El proyecto utiliza GitHub Actions para validar cambios antes de integrarlos.

Las validaciones pueden incluir:

Instalación de dependencias
Lint del frontend
Build del frontend
Validación del backend

El proyecto utiliza pnpm-lock.yaml para garantizar instalaciones reproducibles.

Seguridad

No versionar archivos .env.

No almacenar credenciales dentro del código fuente.

Mantener DATABASE_URL y JWT_SECRET como variables de entorno.

Las contraseñas de usuarios se almacenan mediante hash.

Las rutas privadas requieren autenticación JWT.

Los registros de vuelos no se eliminan físicamente.

No utilizar información real de personas o vuelos en ejemplos públicos.

Mantener las dependencias actualizadas.

Rotar inmediatamente cualquier credencial que haya sido expuesta.

La política completa está disponible en SECURITY.md.

Estado

✓ autenticación
✓ rutas protegidas
✓ PostgreSQL
✓ Prisma ORM
✓ Neon
✓ dashboard
✓ registro de vuelos
✓ historial
✓ arribos y partidas
✓ manifiestos
✓ pasajeros y tripulantes
✓ equipaje de mano y bodega
✓ búsquedas específicas
✓ catálogo de oficiales
✓ autocompletado de oficiales
✓ edición
✓ anulación de registros
✓ exportación PDF
✓ exportación Excel
✓ frontend responsive
✓ API REST
✓ Vercel
✓ Render
✓ CI

Autor

Desarrollado por Rolando Duarte.
