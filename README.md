---
# 🎯 Focus Up Backend API — Documentación y Manual Técnico

Documentación completa y unificada del **Backend de Focus Up**, una aplicación construida en **Node.js / Express / TypeScript** para la gestión del enfoque y la productividad personal.
Incluye detalles de **arquitectura, estructura de carpetas, módulos funcionales, principios de diseño, patrones, buenas prácticas** y **configuración de desarrollo**.
---

## 📘 Tabla de Contenido

1. [Arquitectura General](#1-arquitectura-general)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Módulos Funcionales](#3-módulos-funcionales)
4. [Flujo de Datos](#4-flujo-de-datos)
5. [Manual de Buenas Prácticas](#5-manual-de-buenas-prácticas)
6. [Principios de Diseño](#6-principios-de-diseño)
7. [Patrones Usados o Recomendados](#7-patrones-usados-o-recomendados)
8. [Configuración y Desarrollo](#8-configuración-y-desarrollo)
9. [Documentación de la API](#9-documentación-de-la-api)

---

## 1. Arquitectura General

### Tipo de Arquitectura: **Layered Architecture (Arquitectura por Capas)**

La aplicación está diseñada bajo una **arquitectura por capas**, que separa responsabilidades y mejora la mantenibilidad, testabilidad y escalabilidad del sistema.

```
Cliente HTTP
    ↓
Middleware (Auth, Validation)
    ↓
Controllers (HTTP Request/Response)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Entities (Database Schema)
    ↓
PostgreSQL Database
```

### Tecnologías Principales

- **Node.js / Express** — Framework web y enrutamiento
- **TypeScript** — Tipado estático y desarrollo robusto
- **TypeORM** — ORM para operaciones de base de datos
- **PostgreSQL** — Base de datos relacional
- **JWT** — Autenticación sin estado
- **Swagger** — Documentación interactiva de API
- **Winston** — Logging estructurado
- **Helmet / Morgan** — Seguridad y registro de solicitudes

---

## 2. Estructura de Carpetas

```
src/
├── app.ts                 # Punto de entrada principal
├── config/                # Configuración general
│   ├── env.ts             # Variables de entorno
│   ├── ormconfig.ts       # Conexión TypeORM/PostgreSQL
│   └── swagger.ts         # Configuración Swagger
├── controllers/           # Controladores HTTP
│   ├── BeneficioController.ts
│   ├── EventoController.ts
│   ├── MetodoEstudioController.ts
│   ├── MusicController.ts
│   └── UserController.ts
├── middleware/            # Middlewares transversales
│   ├── auth.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── models/                # Entities (TypeORM)
│   ├── *.entity.ts
│   └── User.ts
├── repositories/          # Repositories (acceso a datos)
│   ├── BeneficioRepository.ts
│   ├── EventoRepository.ts
│   ├── MetodoEstudioRepository.ts
│   ├── MusicRepository.ts
│   └── UserRepository.ts
├── routes/                # Definición de rutas
│   ├── beneficioRoutes.ts
│   ├── eventosRutas.ts
│   ├── metodoEstudioRoutes.ts
│   ├── musicaRoutes.ts
│   ├── userRoutes.ts
│   └── index.ts
├── services/              # Lógica de negocio
│   ├── BeneficioService.ts
│   ├── EventosService.ts
│   ├── MetodoEstudioService.ts
│   ├── MusicService.ts
│   ├── PasswordResetService.ts
│   └── UserService.ts
├── types/                 # Tipos e interfaces TypeScript
│   ├── ApiResponse.ts
│   ├── Beneficio.ts
│   ├── IEventoCreate.ts
│   ├── MetodoEstudio.ts
│   ├── Musica.ts
│   └── User.ts
├── utils/                 # Utilidades
│   ├── jwt.ts
│   ├── logger.ts
│   ├── mailer.ts
│   └── validation.ts
└── scripts/               # Scripts de mantenimiento/testing
    ├── debug-routes.ts
    ├── test-db.ts
    └── test-integration.ts
```

### Interconexión

- `app.ts` → importa configuraciones y rutas
- **Controllers** → llaman **Services**
- **Services** → usan **Repositories**
- **Repositories** → operan sobre **Entities**
- **Routes** → definen endpoints y aplican **Middleware**
- **Utils** → soporte común (JWT, mailer, logger)

---

## 3. Módulos Funcionales

### 🔐 Módulo de Usuario

Gestión de autenticación, registro y perfiles.
Incluye autenticación JWT, hashing de contraseñas y recuperación de cuenta.

### 📚 Módulo de Métodos de Estudio

Administra técnicas y estrategias de estudio, relacionadas con beneficios.

### 🎵 Módulo de Música

Gestiona el catálogo de música, búsqueda, organización por álbumes y URLs de streaming.

### 📅 Módulo de Eventos

Programación de eventos y sesiones de estudio, vinculadas con métodos.

### 💡 Módulo de Beneficios

Administra los beneficios asociados a los métodos de estudio (relación muchos a muchos).

---

## 4. Flujo de Datos

```
Cliente HTTP Request
       ↓
   Middleware (auth, validation)
       ↓
   Routes
       ↓
   Controller
       ↓
   Service
       ↓
   Repository
       ↓
   Entity
       ↓
   PostgreSQL Database
```

**Ejemplo:**
Creación de usuario → Route → Controller → Service → Repository → Entity → Base de Datos → Respuesta.

---

## 5. Manual de Buenas Prácticas

### ✅ Organización del Código

- Un módulo por dominio.
- Controllers delgados (sin lógica de negocio).
- Services robustos y reutilizables.
- Uso de **Dependency Injection** cuando sea posible.

### ⚠️ Manejo de Errores

Error handler centralizado con formato uniforme:

```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Detalle del error",
  "timestamp": "ISO date"
}
```

### 🧩 Validaciones

Múltiples niveles: middleware → service → base de datos.
Sanitización de entradas contra XSS e inyección SQL.

### 🔒 Seguridad

- Autenticación y autorización por **JWT**
- Hashing con **bcrypt (12 salt rounds)**
- Seguridad HTTP con **Helmet**
- No exponer tokens ni contraseñas

### 🧾 Logging

Uso de **Winston** y **Morgan** para registro estructurado.
Seguimiento de errores, autenticaciones y rendimiento.

---

## 6. Principios de Diseño

### Principios **SOLID**

- SRP — Responsabilidad única
- OCP — Abierto para extensión
- LSP — Sustitución de Liskov
- ISP — Interfaces específicas
- DIP — Inversión de dependencias

Otros:
**DRY**, **KISS**, **YAGNI**, **Separation of Concerns**

---

## 7. Patrones Usados o Recomendados

- **Repository Pattern**
- **DTO Pattern**
- **Dependency Injection Pattern**
- **Factory Pattern**
- **Middleware Pattern**

---

## 8. Configuración y Desarrollo

### Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

```bash
git clone <repository-url>
cd focus-up-backend
npm install
```

### Variables de Entorno (.env)

```env
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1
PGHOST=localhost
PGPORT=5432
PGDATABASE=focusup_db
PGUSER=focusup_user
PGPASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
BCRYPT_SALT_ROUNDS=12
```

### Ejecución

```bash
npm run dev        # Desarrollo
npm run build      # Compilación
npm start          # Producción
```

### Testing

```bash
npm run test:db
npm run test:integration
npm run test:routes
```

---

## 9. Documentación de la API

Accede a Swagger UI en:
👉 `http://localhost:3001/api-docs`

**Autenticación:** incluir el header
`Authorization: Bearer <token>`

**Formato de respuesta:**

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {},
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

> 📘 **Focus Up Backend** combina una arquitectura modular, principios sólidos de diseño y buenas prácticas de desarrollo para garantizar un sistema **escalable, seguro y mantenible**.

---
