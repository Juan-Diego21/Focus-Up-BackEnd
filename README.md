---
# 🎯 Focus Up Backend API - Manual Técnico de Arquitectura

Un manual técnico completo para la aplicación **Focus Up Backend**, que detalla la arquitectura de software, patrones de diseño, buenas prácticas y estándares de desarrollo utilizados en esta aplicación **Node.js / Express / TypeScript**.
---

## 📋 Tabla de Contenido

- [1. Descripción General de la Arquitectura](#1-descripción-general-de-la-arquitectura)
- [2. Componentes Principales](#2-componentes-principales)
- [3. Manual de Buenas Prácticas](#3-manual-de-buenas-prácticas)
- [4. Principios de Diseño](#4-principios-de-diseño)
- [5. Patrones Usados o Recomendados](#5-patrones-usados-o-recomendados)
- [6. Configuración de Desarrollo](#6-configuración-de-desarrollo)
- [7. Documentación de la API](#7-documentación-de-la-api)

---

## 1. Descripción General de la Arquitectura

### Tipo de Arquitectura: **Layered Architecture (Arquitectura por Capas)**

Esta aplicación backend implementa una **Layered Architecture** (también conocida como arquitectura en N capas), la cual promueve la **separación de responsabilidades** al organizar el código en capas con funciones específicas. Esta arquitectura ofrece:

- **Mantenibilidad:** Los cambios en una capa no afectan las demás.
- **Testabilidad:** Cada capa puede probarse de forma independiente.
- **Escalabilidad:** Las capas pueden escalarse de manera individual.
- **Reusabilidad:** La lógica de negocio puede reutilizarse en diferentes interfaces.

### Capas Principales

```
┌─────────────────┐
│   Controllers   │ ← Manejo de solicitudes/respuestas HTTP
├─────────────────┤
│    Services     │ ← Lógica de negocio y validaciones
├─────────────────┤
│  Repositories   │ ← Abstracción de persistencia de datos
├─────────────────┤
│    Entities     │ ← Definición del esquema de base de datos
└─────────────────┘
```

**Flujo de Datos:**

1. **Request** → El Controller recibe la solicitud HTTP
2. **Validation** → El Middleware valida los datos de entrada
3. **Delegation** → El Controller delega la operación al Service
4. **Business Logic** → El Service ejecuta las reglas de negocio
5. **Data Access** → El Service llama los métodos del Repository
6. **Persistence** → El Repository interactúa con las Entities de TypeORM
7. **Database** → TypeORM gestiona las operaciones con PostgreSQL
8. **Response** → Los datos regresan a través de las capas hacia el Controller
9. **Response** → El Controller devuelve la respuesta HTTP

### Integración Tecnológica

- **Express.js:** Proporciona el framework web y el enrutamiento.
- **TypeScript:** Añade tipado estático y mejor soporte en IDE.
- **TypeORM:** ORM (Object-Relational Mapping) para operaciones con base de datos.
- **PostgreSQL:** Base de datos relacional usada para la persistencia de datos.

---

## 2. Componentes Principales

### Controllers

Los Controllers manejan las solicitudes y respuestas HTTP, actuando como punto de entrada a los endpoints de la API. Están diseñados para ser **delgados** y centrarse en:

- Manejo de request/response
- Códigos de estado HTTP
- Delegación de validaciones básicas
- Llamado a métodos del Service correspondiente

**Características Clave:**

- Sin lógica de negocio
- Formato consistente de errores
- Anotaciones de documentación Swagger
- Inyección de dependencias de servicios

---

### Services

Los Services contienen la lógica de negocio central y orquestan las operaciones entre los Repositories. Se encargan de:

- Reglas de negocio y validaciones
- Manejo de transacciones
- Transformación de datos
- Operaciones de seguridad (hashing de contraseñas, etc.)
- Comunicación con servicios externos

**Características Clave:**

- Sin preocupaciones HTTP
- Manejo completo de errores
- Sanitización de datos
- Implementación segura de procesos de autenticación

---

### Repositories (TypeORM)

Los Repositories abstraen la lógica de persistencia, proporcionando una interfaz limpia para las operaciones de base de datos bajo el **Repository Pattern**.

- Encapsulan la lógica de acceso a datos
- Proveen operaciones CRUD
- Manejan consultas complejas
- Administran relaciones entre Entities

---

### Entities

Las Entities definen el esquema de la base de datos y las relaciones usando decoradores de TypeORM. Representan:

- Tablas y columnas de la base de datos
- Relaciones entre entidades
- Índices y restricciones
- Validaciones a nivel de esquema

---

### Middlewares

Manejan preocupaciones transversales aplicadas a las solicitudes:

- **Authentication:** Verificación de tokens JWT
- **Validation:** Validación de datos de entrada
- **Security:** CORS, Helmet headers
- **Logging:** Registro de solicitudes con Morgan
- **Error Handling:** Manejo centralizado de errores

---

### Capa de Configuración

Administra la configuración de la aplicación a través de:

- **Environment Variables**
- **TypeORM Config**
- **Swagger Config**

---

## 3. Manual de Buenas Prácticas

### a. Organización del Código

#### Estructura de Carpetas

```
src/
├── controllers/     # Manejadores HTTP
├── services/        # Lógica de negocio
├── repositories/    # Capa de acceso a datos
├── models/          # Entities de TypeORM
├── middleware/      # Middlewares de Express
├── routes/          # Definiciones de rutas
├── types/           # Interfaces TypeScript
├── utils/           # Funciones utilitarias
├── config/          # Archivos de configuración
└── scripts/         # Scripts de mantenimiento
```

- **Un módulo por dominio:** agrupa controllers, services y repositories relacionados.
- **Dependency Injection:** usa inyección por constructor para facilitar testing.
- **Separación de responsabilidades:** evita lógica de negocio en los controllers.

---

### b. Manejo de Errores

Uso de un **Error Handler centralizado**, **Custom Error Classes**, y formato de error uniforme.

Cada error sigue el formato:

```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": "Descripción detallada",
  "timestamp": "ISO date"
}
```

---

### c. Validaciones

Validación en **múltiples niveles:**

1. Middleware (entrada de datos)
2. Service (reglas de negocio)
3. Database (restricciones de esquema)

Usando librerías y DTOs para sanitizar la entrada y prevenir ataques (XSS, SQL Injection).

---

### d. Seguridad

- **Autenticación y Autorización:** basada en **JWT** (stateless).
- **Seguridad de contraseñas:** **bcrypt** con 12 salt rounds.
- **Protección de datos:** nunca exponer contraseñas o tokens.
- **Headers de seguridad:** uso de **Helmet** con políticas CSP.

---

### e. Manejo de Entorno

Archivo `.env` con variables de entorno para:

- Configuración del servidor
- Conexión a la base de datos
- Claves de seguridad (JWT, bcrypt, etc.)

Con validación de variables requeridas en el startup de la aplicación.

---

### f. Logging y Monitoreo

Uso de **Winston** para registro estructurado de eventos:

- Inicio y cierre del servidor
- Conexión a la base de datos
- Fallos de autenticación
- Errores de API
- Métricas de rendimiento

---

### g. Capa de Base de Datos

Implementación del **Repository Pattern**, manejo de **migraciones**, y gestión de **relaciones entre entidades** con TypeORM.

---

### h. Documentación

Integración de **Swagger/OpenAPI** para documentación interactiva:

- Documentar todos los endpoints
- Incluir esquemas de request/response
- Proveer ejemplos actualizados

---

## 4. Principios de Diseño

### Principios SOLID

- **SRP (Single Responsibility):** cada clase tiene una sola responsabilidad.
- **OCP (Open/Closed):** abiertas para extensión, cerradas para modificación.
- **LSP (Liskov):** las implementaciones pueden sustituirse sin alterar el comportamiento.
- **ISP (Interface Segregation):** las interfaces deben ser específicas y no forzar dependencias innecesarias.
- **DIP (Dependency Inversion):** depender de abstracciones, no de implementaciones concretas.

Otros principios:

- **DRY (Don’t Repeat Yourself)**
- **KISS (Keep It Simple, Stupid)**
- **YAGNI (You Aren’t Gonna Need It)**
- **Separación de responsabilidades**

---

## 5. Patrones Usados o Recomendados

- **Repository Pattern**
- **Dependency Injection Pattern**
- **DTO Pattern (Data Transfer Object)**
- **Factory Pattern**
- **Middleware Pattern**

---

## 6. Configuración de Desarrollo

### Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

```bash
git clone <repository-url>
cd focus-up-backend
npm install
```

### Configuración del Entorno

Crear archivo `.env` con las variables requeridas.

### Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### Pruebas

```bash
npm run test:integration
npm run test:db
```

---

## 7. Documentación de la API

Documentación interactiva disponible en:

```
http://localhost:3001/api-docs
```

**Autenticación:** incluir el token JWT en el header `Authorization`.

Formato de respuesta estándar:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {},
  "timestamp": "ISO date string"
}
```

---

Este manual técnico sirve como guía definitiva para mantener, escalar y mejorar la aplicación **Focus Up Backend**. Seguir estos patrones arquitectónicos y buenas prácticas garantiza un desarrollo **consistente, profesional y mantenible**.

---
