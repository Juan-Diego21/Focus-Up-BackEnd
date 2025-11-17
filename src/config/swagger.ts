import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env";

/**
 * Configuración de Swagger/OpenAPI para documentación de la API
 * Define esquemas, endpoints y opciones de UI para la documentación interactiva
 */

/**
 * Opciones de configuración para swagger-jsdoc
 */
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
    security: [
      {
        BearerAuth: [],
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
               nullable: true,
               description: "Género del usuario",
             },
             fecha_nacimiento: {
               type: "string",
               format: "date",
               nullable: true,
               description: "Fecha de nacimiento del usuario",
             },
             horario_fav: {
               type: "string",
               format: "time",
               nullable: true,
               description: "Horario favorito del usuario",
             },
             fecha_creacion: {
               type: "string",
               format: "date-time",
               description: "Fecha de creación del usuario",
             },
             fecha_actualizacion: {
               type: "string",
               format: "date-time",
               description: "Fecha de actualización del usuario",
             },
             intereses: {
               type: "array",
               items: {
                 type: "integer",
               },
               nullable: true,
               description: "IDs de intereses del usuario",
             },
             distracciones: {
               type: "array",
               items: {
                 type: "integer",
               },
               nullable: true,
               description: "IDs de distracciones del usuario",
             },
           },
         },
       Beneficio: {
         type: "object",
         properties: {
           id_beneficio: {
             type: "integer",
             description: "ID único del beneficio",
           },
           descripcion_beneficio: {
             type: "string",
             description: "Descripción del beneficio",
           },
           fecha_creacion: {
             type: "string",
             format: "date-time",
             description: "Fecha de creación del beneficio",
           },
           fecha_actualizacion: {
             type: "string",
             format: "date-time",
             description: "Fecha de actualización del beneficio",
           },
         },
       },
       MetodoEstudio: {
         type: "object",
         properties: {
           id_metodo: {
             type: "integer",
             description: "ID único del método de estudio",
           },
           nombre_metodo: {
             type: "string",
             description: "Nombre del método de estudio",
           },
           descripcion: {
             type: "string",
             nullable: true,
             description: "Descripción del método de estudio",
           },
           fecha_creacion: {
             type: "string",
             format: "date-time",
             description: "Fecha de creación del método de estudio",
           },
           fecha_actualizacion: {
             type: "string",
             format: "date-time",
             description: "Fecha de actualización del método de estudio",
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
        name: "Beneficios",
        description: "Endpoints de gestión de beneficios",
      },
      {
        name: "MetodosEstudio",
        description: "Endpoints de gestión de métodos de estudio",
      },
      {
        name: "Reports",
        description: "Endpoints de gestión de reportes de métodos y sesiones",
      },
      {
        name: "Health",
        description: "Endpoints de verificación del sistema",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // archivos donde buscará la documentación
};

/**
 * Generar especificación Swagger a partir de las opciones configuradas
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Configurar opciones de UI de Swagger para personalización de la documentación
 */
const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Focus Up API Documentation",
  customfavIcon: "/assets/favicon.ico",
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
