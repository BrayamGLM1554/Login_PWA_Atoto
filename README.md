# Auth API PWA - Municipio

API RESTful con control de roles y areas. Node.js + Express + MongoDB.

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

## Configuración de imágenes (Cloudinary - Gratis)

1. Crear cuenta en https://cloudinary.com (plan gratuito: 25GB)
2. Copiar Cloud Name, API Key y API Secret al `.env`

## Variables de entorno (.env)

```
MONGO_URI=mongodb+srv://admin:BrayamLM155478@cluster0.9wqzbjl.mongodb.net/authDBPWA?appName=Cluster0
JWT_SECRET=cambia_esto_en_produccion_con_algo_muy_largo
PORT=3000
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Crear admin inicial

```bash
node src/seed.js
```
Esto crea: `admin@municipio.gob.mx` / `Admin123!`

## Iniciar servidor

```bash
npm run dev     # desarrollo
npm start       # producción
```

---

## Endpoints

### 🔐 Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/perfil` | Perfil del usuario | Sí |

#### POST /auth/login
```json
// Request
{ "email": "jefe@municipio.gob.mx", "password": "Contraseña123" }

// Response
{
  "token": "eyJhbGci...",
  "perfil": {
    "id": "...",
    "nombre": "Juan",
    "apellidos": "Perez",
    "nombreCompleto": "Juan Perez",
    "email": "jefe@municipio.gob.mx",
    "rol": "JEFE_AREA",
    "puesto": "Jefe de Area",
    "areasPermitidas": ["area-obras", "area-limpia"],
    "avatar": "https://res.cloudinary.com/...",
    "activo": true,
    "ultimoLogin": "2025-01-10T08:00:00Z",
    "loginActual": "2025-01-15T09:30:00Z"
  }
}
```

---

### 👑 Administración (solo ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/users` | Listar todos los usuarios |
| POST | `/admin/users` | Crear usuario |
| GET | `/admin/users/:id` | Ver usuario |
| PATCH | `/admin/users/:id/areas` | Actualizar areas |
| PATCH | `/admin/users/:id/toggle` | Activar/desactivar |
| POST | `/admin/users/:id/avatar` | Subir foto de perfil |

#### POST /admin/users
```json
{
  "nombre": "María",
  "apellidos": "García López",
  "email": "maria@municipio.gob.mx",
  "password": "Segura123!",
  "puesto": "Jefe de Área",
  "areasPermitidas": ["area-obras", "area-agua"]
}
```

El **rol** se asigna automáticamente según el puesto:
- `Jefe de Área` / `Director` / `Coordinador` → `JEFE_AREA`
- `Empleado` / `Operativo` → `EMPLEADO`  
- `Asistente` → `ASISTENTE`

#### PATCH /admin/users/:id/areas
```json
{ "areasPermitidas": ["area-obras", "area-agua", "area-limpia"] }
```

#### POST /admin/users/:id/avatar
Enviar como `multipart/form-data` con campo `avatar` (JPG, PNG, WebP, max 5MB).

---

### 📋 Registros

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/registros` | Listar registros | Filtrado por areas |
| POST | `/registros` | Crear registro | Requiere area permitida |
| GET | `/registros/:id` | Ver registro | Si tiene acceso al area |

#### POST /registros
```json
{
  "areaId": "area-obras",
  "data": {
    "tipo": "inspeccion",
    "descripcion": "Revisión de baches en Av. Principal",
    "ubicacion": "Calle 5 #123"
  }
}
```

#### GET /registros (con filtros)
```
GET /registros?page=1&limit=20&areaId=area-obras
```

---

## 🔑 Roles y permisos

| Acción | ADMIN | JEFE_AREA | EMPLEADO | ASISTENTE |
|--------|-------|-----------|----------|-----------|
| Crear usuarios | ✅ | ❌ | ❌ | ❌ |
| Asignar areas | ✅ | ❌ | ❌ | ❌ |
| Ver todos los registros | ✅ | ❌ | ❌ | ❌ |
| Ver registros de sus areas | ✅ | ✅ | ✅ | ✅ |
| Crear registros en sus areas | ✅ | ✅ | ✅ | ✅ |

## 🕐 Token JWT
- Vigencia: **6 días (Lunes a Sábado)**
- Si expira en domingo, se ajusta al sábado anterior
- Incluye: `uid`, `rol`, `areas`

## 📦 Stack
- **Runtime**: Node.js + Express
- **BD**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcrypt
- **Imágenes**: Cloudinary (gratis 25GB)
- **Validación**: express-validator
