# 🎯 Focus Up Backend API

Una API RESTful robusta y escalable para la aplicación **Focus Up**, diseñada para ayudar a usuarios a mejorar su concentración y productividad mediante sesiones de estudio gestionadas, control de distracciones y seguimiento de métricas.

## 🚀 Características

- **Framework**: Express.js con TypeScript
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT con refresh tokens
- **Seguridad**: Bcrypt hashing, sanitización de inputs, protección contra SQL injection
- **Validación**: Schemas robustos con validación personalizada
- **Documentación**: Swagger/OpenAPI integrado
- **Arquitectura**: Pattern Repository + Services + Controllers

## 📦 Estructura del Proyecto

```
src/
├── config/                 # Configuración de la aplicación
│   ├── env.ts             # Variables de entorno
│   ├── ormconfig.ts       # Configuración TypeORM
│   └── swagger.ts         # Configuración Swagger
├── controllers/           # Controladores HTTP
│   └── UserController.ts  # Controlador de usuarios
├── models/               # Entidades de base de datos
│   └── User.entity.ts    # Entidad Usuario
├── repositories/         # Capa de acceso a datos
│   └── UserRepository.ts # Repositorio de usuarios
├── services/             # Lógica de negocio
│   └── UserService.ts    # Servicio de usuarios
├── types/               # Interfaces TypeScript
│   └── User.ts          # Tipos de usuario
├── utils/               # Utilidades
│   ├── validation.ts    # Funciones de validación
│   └── jwt.ts          # Utilidades JWT
├── routes/              # Rutas de la API
│   ├── index.ts        # Rutas principales
│   └── userRoutes.ts   # Rutas de usuarios
└── scripts/            # Scripts de utilidad
    └── test-integration.ts # Tests de integración
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### 1. Clonar e instalar dependencias
```bash
git clone <repository-url>
cd focus-up-backend
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la raíz:
```env
# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1

# Database Configuration (Neon.tech PostgreSQL)
PGHOST=ep-dawn-brook-adh1dsia-pooler.c-2.us-east-1.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=tu_password_aqui
PGSSLMODE=require
PGPORT=5432

# JWT Configuration
JWT_SECRET=tu-super-secreto-jwt-muy-largo-y-complejo-aqui-256-bits
JWT_REFRESH_SECRET=tu-super-secreto-refresh-muy-largo-y-diferente-aqui
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12
```

### 3. Configurar base de datos
Asegúrate de que PostgreSQL esté corriendo y que la base de datos exista.

### 4. Ejecutar la aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/v1/users` - Crear nuevo usuario
- `POST /api/v1/users/login` - Iniciar sesión
- `GET /api/v1/users/profile` - Obtener perfil (requiere auth)

### Usuarios
- `GET /api/v1/users` - Obtener todos los usuarios (admin)
- `GET /api/v1/users/:id` - Obtener usuario por ID
- `GET /api/v1/users/email/:email` - Obtener usuario por email
- `PUT /api/v1/users/:id` - Actualizar usuario

### Sistema
- `GET /api/v1/health` - Health check del servidor

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Incluye tu token en los headers:

```http
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo de login:
```bash
curl -X POST http://localhost:3001/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "SecurePassword123"
  }'
```

## 🧪 Testing

### Ejecutar tests de integración
```bash
npm run test:integration
```

### Probar endpoints manualmente
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Crear usuario
curl -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_usuario": "testuser",
    "correo": "test@example.com",
    "contrasena": "SecurePassword123",
    "fecha_nacimiento": "1990-01-01"
  }'
```

## 📚 Documentación API

La documentación interactiva está disponible en:
```
http://localhost:3001/api-docs
```

Incluye:
- Descripción de todos los endpoints
- Esquemas de request/response
- Ejemplos de uso
- Try-it-out functionality

## 🛡️ Seguridad

### Implementado:
- ✅ Hashing de contraseñas con bcrypt (12 salt rounds)
- ✅ Tokens JWT con expiración configurable
- ✅ Sanitización de inputs contra XSS
- ✅ Validación de datos de entrada
- ✅ Prevención de SQL injection con TypeORM
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado

### Prácticas recomendadas:
- Usar HTTPS en producción
- Rotar secrets JWT regularmente
- Implementar rate limiting
- Logging y monitoring de seguridad

## 🚀 Despliegue

### Variables de entorno para producción:
```env
NODE_ENV=production
PGSSLMODE=require
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Build para producción:
```bash
npm run build
npm start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la documentación en `/api-docs`
2. Verifica las variables de entorno
3. Revisa los logs del servidor
4. Abre un issue en el repositorio

---

**¿Problemas?** Asegúrate de que:
- PostgreSQL esté corriendo
- Las variables de entorno estén configuradas correctamente
- El puerto 3001 esté disponible
- Las dependencias estén instaladas (`npm install`)
