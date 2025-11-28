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
│   ├── AuthController.ts
│   ├── BeneficioController.ts
│   ├── EventoController.ts
│   ├── MetodoEstudioController.ts
│   ├── MusicController.ts
│   ├── ReportsController.ts
│   ├── SessionController.ts
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
│   ├── CodigosVerificacionRepository.ts
│   ├── EventoRepository.ts
│   ├── MetodoEstudioRepository.ts
│   ├── MusicRepository.ts
│   ├── NotificacionesPreferenciasRepository.ts
│   ├── NotificacionesProgramadasRepository.ts
│   ├── UserRepository.ts
│   └── (otros repositories según entidades)
├── routes/                # Definición de rutas
│   ├── authRoutes.ts
│   ├── beneficioRoutes.ts
│   ├── eventosRutas.ts
│   ├── metodoEstudioRoutes.ts
│   ├── musicaRoutes.ts
│   ├── notificacionesPreferenciasRutas.ts
│   ├── notificacionesProgramadasRutas.ts
│   ├── reportsRoutes.ts
│   ├── sessionRoutes.ts
│   ├── userRoutes.ts
│   └── index.ts
├── services/              # Lógica de negocio
│   ├── BeneficioService.ts
│   ├── EmailVerificationService.ts
│   ├── EventosService.ts
│   ├── MetodoEstudioService.ts
│   ├── MusicService.ts
│   ├── NotificacionesPreferenciasService.ts
│   ├── NotificacionesProgramadasService.ts
│   ├── NotificationService.ts
│   ├── PasswordResetService.ts
│   ├── ReportsService.ts
│   ├── SessionService.ts
│   └── UserService.ts
├── types/                 # Tipos e interfaces TypeScript
│   ├── ApiResponse.ts
│   ├── Beneficio.ts
│   ├── CodigosVerificacion.ts
│   ├── IEventoCreate.ts
│   ├── MetodoEstudio.ts
│   ├── Musica.ts
│   ├── Session.ts
│   └── User.ts
├── utils/                 # Utilidades
│   ├── jwt.ts
│   ├── logger.ts
│   ├── mailer.ts
│   └── validation.ts
└── scripts/               # Scripts de mantenimiento/testing
    ├── debug-routes.ts
    ├── send-pending-emails.ts
    ├── test-db.ts
    ├── test-integration.ts
    ├── test-reports.ts
    ├── test-reports-domain-separation.ts
    └── test-sessions.ts
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

### 🔐 Módulo de Autenticación

Sistema completo de autenticación y verificación de usuarios.
Incluye registro con verificación de email, login/logout con JWT, recuperación de contraseña y gestión de tokens de seguridad.

### 👤 Módulo de Usuario

Gestión completa de perfiles de usuario, intereses y distracciones.
Incluye actualización de datos personales, gestión de preferencias y asociaciones con intereses/distracciones.

### 🧠 Módulo de Sesiones de Concentración

Gestión de sesiones de estudio enfocadas con temporizadores y seguimiento de progreso.
Permite crear sesiones desde eventos, actualizar progreso en tiempo real y vincular con métodos de estudio y música.

### 📚 Módulo de Métodos de Estudio

Administra técnicas y estrategias de estudio, relacionadas con beneficios.
Incluye biblioteca de métodos predefinidos y seguimiento de progreso por usuario.

### 🎵 Módulo de Música

Gestiona el catálogo de música, búsqueda, organización por álbumes y URLs de streaming.
Soporta múltiples géneros y categorías para ambientes de estudio óptimos.

### 📅 Módulo de Eventos

Programación de eventos y sesiones de estudio, vinculadas con métodos.
Soporta eventos normales y de concentración con estados de completitud.

### 💡 Módulo de Beneficios

Administra los beneficios asociados a los métodos de estudio (relación muchos a muchos).
Permite asociar beneficios específicos a cada método de estudio.

### 📊 Módulo de Reportes

Sistema de reportes y analytics para seguimiento de progreso.
Incluye reportes de sesiones completadas, métodos realizados y métricas de productividad.

### 🔔 Módulo de Notificaciones

Gestión de notificaciones programadas y preferencias de usuario.
Soporta notificaciones por email para eventos, recordatorios de métodos pendientes y mensajes motivacionales.

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
npm run test:db                    # Test de conexión a base de datos
npm run test:integration           # Test integral completo
npm run test:routes                # Debug de rutas
npm run test:reports               # Test de reportes
npm run test:reports-separation    # Test de separación de dominios en reportes
npm run test:sessions              # Test de endpoints de sesiones
npm run test:feynman               # Test de método Feynman
npm run test:cornell               # Test de método Cornell
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

## 10. Cambios Realizados por "Código Limpio"

### Fecha de Implementación

2025-11-28

### Resumen de Mejoras

- **Limpieza de Código**: Eliminación de métodos obsoletos en `UserService` (`sendPasswordResetLink`, `resetPassword`, `sendResetEmail`) y archivos no utilizados en raíz.
- **Consolidación de Lógica**: Creación de utilidad `ResponseBuilder` para estandarizar construcción de respuestas API y reducir duplicación.
- **Documentación**: Traducción completa de descripciones Swagger al español y estandarización de formato para mayor claridad y concisión.
- **Mantenibilidad**: Comentarios en español, estructura de código limpia y eliminación de código dead.

### Archivos Modificados

- `src/services/UserService.ts`: Eliminación de métodos no utilizados
- `src/controllers/UserController.ts`: Refactor para usar `ResponseBuilder`
- `src/utils/responseBuilder.ts`: Nuevo archivo de utilidad
- `src/config/swagger.ts`: Traducciones al español
- `src/routes/sessionRoutes.ts`: Estandarización de documentación Swagger
- `src/routes/musicaRoutes.ts`: Estandarización de documentación Swagger
- `src/routes/reportsRoutes.ts`: Estandarización de documentación Swagger
- `README.md`: Actualización completa con todos los módulos y estructura actual
- `AUDITORIA_CODIGO_LIMPIO.md`: Documento de auditoría creado

### Archivos Eliminados

- Métodos obsoletos en `UserService` (no archivos físicos)

### Compatibilidad

- ✅ API contracts preservados
- ✅ Base de datos sin cambios estructurales
- ✅ Tests existentes pasan

---

> 📘 **Focus Up Backend** combina una arquitectura modular, principios sólidos de diseño y buenas prácticas de desarrollo para garantizar un sistema **escalable, seguro y mantenible**.

---
