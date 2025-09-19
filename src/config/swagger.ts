import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env";

// Opciones de configuración para swagger-jsdoc
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Focus Up API",
      version: "1.0.0",
      description:
        "API RESTful para la aplicación Focus Up - Sistema de gestión de enfoque y productividad",
      contact: {
        name: "Equipo de Desarrollo",
        email: "support@focusup.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.focusup.com/api/v1",
        description: "Servidor de producción",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT en el formato: Bearer <token>",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id_usuario: {
              type: "integer",
              description: "ID único del usuario",
            },
            nombre_usuario: {
              type: "string",
              description: "Nombre de usuario",
            },
            correo: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            pais: {
              type: "string",
              nullable: true,
              description: "País del usuario",
            },
            genero: {
              type: "string",
              enum: ["Masculino", "Femenino", "Otro", "Prefiero no decir"],
              description: "Género del usuario",
            },
            fecha_nacimiento: {
              type: "string",
              format: "date",
              description: "Fecha de nacimiento del usuario",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            error: {
              type: "string",
              example: "Error details",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Endpoints de autenticación",
      },
      {
        name: "Users",
        description: "Endpoints de gestión de usuarios",
      },
      {
        name: "Health",
        description: "Endpoints de verificación del sistema",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // archivos donde buscará la documentación
};

// Generar especificación Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Configurar UI de Swagger
const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Focus Up API Documentation",
  customfavIcon: "/assets/favicon.ico",
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
