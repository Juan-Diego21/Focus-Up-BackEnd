# Focus-Up Backend

Backend API de Focus-Up construido con Node.js, Express, TypeScript, TypeORM y PostgreSQL.

Este README esta pensado como guia tecnica de estudio para desarrolladores (incluyendo aprendices). La idea es que entiendas no solo que hace el proyecto, sino tambien por que esta organizado asi y como se conecta cada pieza.

## Tabla de contenido

1. [Que es este backend](#que-es-este-backend)
2. [Arquitectura en una vista rapida](#arquitectura-en-una-vista-rapida)
3. [Como viaja una peticion dentro del sistema](#como-viaja-una-peticion-dentro-del-sistema)
4. [Estructura de carpetas (explicada)](#estructura-de-carpetas-explicada)
5. [Modulos funcionales y como interactuan](#modulos-funcionales-y-como-interactuan)
6. [Modelo de datos (entidades principales)](#modelo-de-datos-entidades-principales)
7. [Automatizacion de correos y tareas programadas](#automatizacion-de-correos-y-tareas-programadas)
8. [Seguridad y buenas practicas implementadas](#seguridad-y-buenas-practicas-implementadas)
9. [Configuracion de entorno](#configuracion-de-entorno)
10. [Ejecucion local y comandos utiles](#ejecucion-local-y-comandos-utiles)
11. [Como agregar una nueva funcionalidad](#como-agregar-una-nueva-funcionalidad)
12. [Glosario tecnico simple](#glosario-tecnico-simple)

## Que es este backend

Este backend expone una API REST para la aplicacion Focus-Up. Sus responsabilidades principales son:

- Autenticacion y gestion de usuarios.
- Gestion de eventos de estudio y sesiones de concentracion.
- Gestion de metodos de estudio, beneficios y musica.
- Reportes de progreso (metodos y sesiones).
- Programacion y envio de notificaciones por correo.

Se puede ver como un monolito modular: un solo servicio, pero con modulos separados por dominio.

## Arquitectura en una vista rapida

Patron principal: arquitectura por capas.

```text
Cliente (web/mobile)
  -> Routes (define endpoints)
  -> Middleware (seguridad, auth, validacion)
  -> Controllers (HTTP: req/res)
  -> Services (reglas de negocio)
  -> Repositories (acceso a datos)
  -> Entities TypeORM (mapeo tabla <-> objeto)
  -> PostgreSQL
```

Capas transversales que apoyan todo:

- `config/`: entorno, ORM, Swagger, configuraciones de metodos y mensajes.
- `utils/`: JWT, logger, validaciones, cache, manejo de errores.
- `jobs/` y `scripts/`: automatizaciones y ejecucion operativa.

## Como viaja una peticion dentro del sistema

Ejemplo mental para `PATCH /api/v1/reports/sessions/:id/progress`:

1. Entra por `routes/reportsRoutes.ts`.
2. Pasa por `authenticateToken` para validar JWT y poblar `req.user`.
3. Llega a `ReportsController.updateSessionProgress` para validaciones HTTP.
4. El controller llama `ReportsService.updateSessionProgress`.
5. El servicio ejecuta reglas de negocio y transaccion en BD (actualiza sesion y, si aplica, evento asociado).
6. TypeORM persiste cambios usando las entidades.
7. El controller responde en formato estandar `{ success, message, data, timestamp }`.

Si ocurre un error no controlado, lo captura el middleware global de errores en `app.ts`.

## Estructura de carpetas (explicada)

### Raiz del proyecto

- `package.json`: dependencias y scripts de ejecucion.
- `.env.example`: plantilla de variables de entorno.
- `.github/workflows/email-automation.yml`: ejecucion automatica cada 5 minutos del ciclo de correos.
- `dist/`: salida compilada de TypeScript.
- `logs/`: logs de Winston (`combined.log`, `error.log`).
- `src/`: codigo fuente principal.

### `src/`

- `app.ts`
Archivo de arranque de Express. Configura seguridad (`helmet`, `cors`, `rate limits`), parseo, rutas, Swagger en desarrollo y shutdown elegante.

- `config/`
Configuracion centralizada.
  - `env.ts`: valida variables de entorno con Zod (falla rapido si falta algo critico).
  - `ormconfig.ts`: instancia `AppDataSource` (TypeORM + PostgreSQL + entidades).
  - `swagger.ts`: OpenAPI/Swagger.
  - `methods.config.ts`: reglas de progreso por metodo de estudio.
  - `motivationalMessages.ts`: mensajes motivacionales semanales.

- `routes/`
Define endpoints y los conecta con middlewares/controladores.

- `middleware/`
Piezas reutilizables en el pipeline HTTP:
  - `auth.ts`: JWT, blacklist y control de version de token.
  - `validation.ts`: validacion de payloads (Zod).
  - `rateLimit.ts`: proteccion anti abuso.
  - `session.ts`: utilidades para sesiones (snake_case -> camelCase, ownership, concurrencia optimista).

- `controllers/`
Capa HTTP. Lee `req`, llama servicios y arma respuestas.
No deberia contener logica de negocio compleja.

- `services/`
Reglas de negocio del dominio. Aqui viven decisiones como:
  - validaciones funcionales,
  - reglas de progreso,
  - transacciones,
  - programacion de recordatorios.

- `repositories/`
Acceso a datos. Encapsula consultas TypeORM/QueryBuilder.

- `models/`
Entidades TypeORM (tabla y relaciones).

- `jobs/`
Flujos operativos no HTTP. Ejemplo: ciclo de automatizacion de correos y procesador de pendientes.

- `scripts/`
Entrypoints de ejecucion manual para pruebas, debugging y automatizacion.

- `tests/`
Pruebas de integracion (incluye pruebas de sesiones y separacion de dominios de reportes).

- `database/`
SQL y migraciones TypeORM del proyecto.

- `interfaces/` y `types/`
Tipos e interfaces para contratos internos y DTOs.

- `utils/`
Helpers compartidos: logger, JWT, mailer, cache, validaciones, builder de respuestas, `HttpError`.

## Modulos funcionales y como interactuan

### 1) Autenticacion y usuarios

Rutas base:

- `/auth`: solicitud/verificacion de codigo, registro, login, logout.
- `/users`: perfil, cambio de password, reset de password, eliminar cuenta.

Flujo clave:

- Registro usa `EmailVerificationService`.
- Login usa `UserService.verifyCredentials` + incremento de `tokenVersion`.
- Middleware `authenticateToken` valida firma JWT, blacklist y `tokenVersion` en BD.

### 2) Sesiones de concentracion

Rutas base:

- `/sessions`: crear, consultar por id, actualizar metadata, listar pendientes antiguas, crear desde evento.
- `/users/:userId/sessions`: listado paginado para el usuario autenticado.

Detalles utiles:

- La API de sesiones acepta snake_case y camelCase (middleware de conversion).
- El tiempo se maneja como `interval` en BD y se expone tambien en milisegundos.

### 3) Reportes

Rutas base:

- `/reports/active-methods`
- `/reports/methods/:id/progress`
- `/reports/sessions/:id/progress`
- `/reports/sessions`
- `/reports/methods`
- `/reports/:id` (eliminar reporte)

Regla importante:

- `ReportsService` usa `config/methods.config.ts` para validar transiciones de progreso segun tipo de metodo.

### 4) Eventos

Rutas base:

- `/eventos`: listar, crear, actualizar, eliminar, cambiar estado.

Integracion con notificaciones:

- Al crear/actualizar eventos, el servicio evalua y agenda recordatorios de correo segun fecha, hora y preferencias de usuario.

### 5) Notificaciones

Rutas base:

- `/notificaciones/preferencias/:idUsuario`: leer/actualizar preferencias.
- `/notificaciones/programadas`: crear/listar.
- `/notificaciones/programadas/:id/enviada`: marcar como enviada.

Servicios relacionados:

- `NotificacionesProgramadasService`: logica general de programacion.
- `NotificationService`: reglas especificas para sesiones pendientes.
- `MethodReminderService`: agenda recordatorios de metodos incompletos.

### 6) Catalogos (musica, metodos, beneficios)

Rutas base:

- `/musica`
- `/metodos-estudio`
- `/beneficios`

Estos modulos son la base de datos de apoyo para sesiones/eventos/reportes.

## Modelo de datos (entidades principales)

Tablas/entidades mas relevantes:

- `usuario`: cuenta principal del usuario.
- `eventos`: agenda de estudio por usuario.
- `sesiones_concentracion`: ejecuciones de enfoque.
- `metodos_realizados`: progreso de metodos.
- `bibliotecametodosestudio`: catalogo de metodos.
- `beneficios` y `metodobeneficios`: catalogo y relacion de beneficios.
- `musica` y `albummusica`: catalogo musical.
- `notificaciones_usuario`: preferencias por tipo de notificacion.
- `notificaciones_programadas`: cola de envios pendientes/enviados.
- `password_resets` y `codigos_verificacion`: recuperacion y verificacion por codigo.

Relaciones clave:

- Un `usuario` tiene muchos `eventos`.
- Una `sesion_concentracion` pertenece a un `usuario` y opcionalmente a `evento/metodo/album`.
- `metodos_realizados` conecta usuario con un metodo y su progreso.
- `notificaciones_programadas` y `notificaciones_usuario` se relacionan con usuario.

## Automatizacion de correos y tareas programadas

Arquitectura operativa:

- Un workflow de GitHub Actions (`email-automation.yml`) corre cada 5 minutos.
- Ese workflow ejecuta `npm run email:automation`.
- El script dispara `runEmailAutomationCycle()`.

El ciclo decide que ejecutar segun ventana horaria y variables de entorno:

- Procesar notificaciones pendientes para envio inmediato.
- Programar recordatorios de sesiones pendientes.
- Programar motivacion semanal.

Detalles tecnicos importantes:

- El envio usa `nodemailer`.
- Se usa advisory lock en PostgreSQL para evitar ejecuciones duplicadas simultaneas.
- El procesamiento respeta preferencias del usuario y evita duplicados semanales.

## Seguridad y buenas practicas implementadas

- Validacion estricta de variables de entorno con Zod al arrancar.
- JWT con versionado de token por usuario (`tokenVersion`) y blacklist en memoria.
- `helmet` con CSP y HSTS en produccion.
- CORS estricto segun entorno (`development` vs `production`).
- Rate limiting para login y API publica.
- Validacion de payloads con Zod en endpoints criticos.
- Logger estructurado (Winston) a archivo y consola en desarrollo.
- Middleware global de errores para respuestas consistentes.

## Configuracion de entorno

Variables principales (ver `.env.example`):

- Servidor: `PORT`, `NODE_ENV`, `API_PREFIX`, `FRONTEND_URL`.
- Base de datos: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE`.
- JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET`, expiraciones.
- Seguridad: `BCRYPT_SALT_ROUNDS`.
- Correo: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, `EMAIL_PASS`.
- Automatizacion: `CRON_TIMEZONE`, `EMAIL_AUTOMATION_*`, `SESSION_REMINDER_*`, `WEEKLY_MOTIVATION_*`.

## Ejecucion local y comandos utiles

Prerequisitos recomendados:

- Node.js 20.x
- PostgreSQL disponible y accesible

Instalacion:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Produccion local:

```bash
npm start
```

Swagger (solo en development):

- `http://localhost:<PORT>/api-docs`
- `http://localhost:<PORT>/api-docs.json`

Scripts operativos/utiles definidos en `package.json`:

- `npm run email:automation`
- `npm run send-emails`
- `npm run test:integration`
- `npm run test:routes`
- `npm run test:reports`
- `npm run test:reports-separation`
- `npm run test:sessions`
- `npm run test:motivational-email`

Nota tecnica:

- El script `test:db` actualmente apunta a `src/scripts/test-connection.ts`, archivo que no existe en el estado actual del repositorio.

## Como agregar una nueva funcionalidad

Secuencia sugerida (para mantener consistencia):

1. Define o ajusta tipos/interfaces en `types/` o `interfaces/`.
2. Crea/ajusta entidad en `models/` si hay cambios de datos.
3. Implementa acceso a datos en `repositories/`.
4. Implementa reglas de negocio en `services/`.
5. Expone el caso de uso en `controllers/`.
6. Registra endpoint en `routes/` y middlewares necesarios.
7. Documenta endpoint con bloque Swagger.
8. Agrega pruebas o script de verificacion.

Regla practica:

- Si una logica puede reutilizarse en varios endpoints, debe vivir en `services/`, no en `controllers`.

## Glosario tecnico simple

- API REST: forma estandar de exponer funcionalidades por HTTP.
- Endpoint: URL especifica de la API (ejemplo: `/api/v1/users`).
- Middleware: funcion que se ejecuta antes del controlador (auth, validacion, etc.).
- Controller: capa que recibe request y responde HTTP.
- Service: capa con reglas de negocio.
- Repository: capa que consulta/actualiza la base de datos.
- ORM: herramienta que mapea tablas a objetos (aqui TypeORM).
- Entity: clase que representa una tabla de base de datos.
- DTO: objeto para transportar datos entre capas.
- JWT: token firmado para autenticar usuarios.
- Token blacklist: lista de tokens invalidados antes de expirar.
- Token versioning: tecnica para invalidar sesiones antiguas cambiando una version en BD.
- CORS: politica que define que frontends pueden consumir la API.
- Rate limit: limite de peticiones por tiempo para evitar abuso.
- Zod: libreria de validacion de datos.
- Hashing: conversion irreversible de contrasenas para almacenarlas de forma segura.
- Bcrypt: algoritmo de hashing para contrasenas.
- Swagger/OpenAPI: documentacion interactiva de endpoints.
- Cron: ejecucion programada por tiempo.
- Advisory lock: bloqueo en BD para evitar procesos duplicados concurrentes.
- Transaccion: bloque atomico de operaciones de BD (todo o nada).
- Concurrencia optimista: control para evitar pisar cambios de otro proceso.
- Interval (PostgreSQL): tipo de dato para duraciones de tiempo.
- Monolito modular: una sola app con modulos internos bien separados.

---

Si vas a iniciar en este proyecto, empieza por este orden:

1. `src/app.ts`
2. `src/routes/index.ts`
3. Un modulo completo (por ejemplo `reports` o `sessions`) desde route -> controller -> service -> repository -> entity.
4. `src/jobs/emailAutomationJob.ts` y `src/jobs/pendingEmailScheduler.ts` para entender la parte operativa.

Con ese recorrido vas a entender rapido como pensar y extender el backend sin romper su arquitectura.
