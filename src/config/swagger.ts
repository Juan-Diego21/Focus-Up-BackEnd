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
      version: "1.0.2",
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
       CreateSessionDto: {
         type: "object",
         required: ["type"],
         properties: {
           title: {
             type: "string",
             description: "Título opcional para la sesión",
             example: "Sesión de estudio matutina",
           },
           description: {
             type: "string",
             description: "Descripción opcional de la sesión",
             example: "Enfocándose en el capítulo 5 de matemáticas",
           },
           type: {
             type: "string",
             enum: ["rapid", "scheduled"],
             description: "Tipo de sesión de concentración",
             example: "rapid",
           },
           event_id: {
             type: "integer",
             description: "ID de evento asociado opcional (enviar en snake_case)",
             example: 123,
           },
           id_metodo: {
             type: "integer",
             description: "ID de método de estudio asociado opcional (enviar en snake_case)",
             example: 456,
           },
           id_album: {
             type: "integer",
             description: "ID de álbum de música asociado opcional (enviar en snake_case)",
             example: 789,
           },
         },
         description: "DTO para crear una nueva sesión de concentración. IMPORTANTE: El cuerpo de la solicitud DEBE usar nombres de campos en snake_case (ej. 'event_id', 'id_metodo', 'id_album') ya que se convierten automáticamente a camelCase internamente.",
       },
       UpdateSessionDto: {
         type: "object",
         properties: {
           title: {
             type: "string",
             description: "Título actualizado para la sesión",
             example: "Sesión de estudio actualizada",
           },
           description: {
             type: "string",
             description: "Descripción actualizada de la sesión",
             example: "Enfoque revisado en matemáticas",
           },
           id_metodo: {
             type: "integer",
             description: "ID de método de estudio asociado actualizado (enviar en snake_case)",
             example: 457,
           },
           id_album: {
             type: "integer",
             description: "ID de álbum de música asociado actualizado (enviar en snake_case)",
             example: 790,
           },
         },
         description: "DTO para actualizar metadatos de sesión. Solo se pueden actualizar título, descripción, id_metodo e id_album. IMPORTANTE: El cuerpo de la solicitud DEBE usar nombres de campos en snake_case.",
       },
       SessionResponseDto: {
         type: "object",
         properties: {
           sessionId: {
             type: "integer",
             description: "Identificador único de la sesión",
             example: 1,
           },
           userId: {
             type: "integer",
             description: "ID del usuario propietario de la sesión",
             example: 123,
           },
           title: {
             type: "string",
             nullable: true,
             description: "Título de la sesión",
             example: "Sesión de estudio matutina",
           },
           description: {
             type: "string",
             nullable: true,
             description: "Descripción de la sesión",
             example: "Enfocándose en el capítulo 5 de matemáticas",
           },
           type: {
             type: "string",
             enum: ["rapid", "scheduled"],
             description: "Tipo de sesión de concentración",
             example: "rapid",
           },
           status: {
             type: "string",
             enum: ["pending", "completed"],
             description: "Estado actual de la sesión",
             example: "pending",
           },
           eventId: {
             type: "integer",
             nullable: true,
             description: "ID de evento asociado",
             example: 123,
           },
           methodId: {
             type: "integer",
             nullable: true,
             description: "ID de método de estudio asociado",
             example: 456,
           },
           albumId: {
             type: "integer",
             nullable: true,
             description: "ID de álbum de música asociado",
             example: 789,
           },
           elapsedInterval: {
             type: "string",
             description: "Tiempo transcurrido en formato HH:MM:SS",
             example: "01:30:45",
           },
           elapsedMs: {
             type: "integer",
             description: "Tiempo transcurrido en milisegundos",
             example: 5445000,
           },
           createdAt: {
             type: "string",
             format: "date-time",
             description: "Timestamp de creación de la sesión (sin conversión de zona horaria)",
             example: "2024-01-15T08:30:00.000Z",
           },
           updatedAt: {
             type: "string",
             format: "date-time",
             description: "Timestamp de última actualización (sin conversión de zona horaria)",
             example: "2024-01-15T09:15:30.000Z",
           },
           lastInteractionAt: {
             type: "string",
             format: "date-time",
             description: "Timestamp de última interacción (sin conversión de zona horaria)",
             example: "2024-01-15T09:15:30.000Z",
           },
         },
         description: "Respuesta completa de sesión con todos los datos de sesión e información de seguimiento de tiempo.",
       },
       SessionListResponse: {
         type: "object",
         properties: {
           sessions: {
             type: "array",
             items: {
               $ref: "#/components/schemas/SessionResponseDto",
             },
             description: "Arreglo de objetos de sesión",
           },
           total: {
             type: "integer",
             description: "Número total de sesiones que coinciden con los criterios",
             example: 25,
           },
           page: {
             type: "integer",
             description: "Número de página actual",
             example: 1,
           },
           perPage: {
             type: "integer",
             description: "Número de sesiones por página",
             example: 10,
           },
           totalPages: {
             type: "integer",
             description: "Número total de páginas",
             example: 3,
           },
         },
         description: "Respuesta paginada para listado de sesiones con metadatos.",
       },
       PendingSessionsResponse: {
         type: "array",
         items: {
           type: "object",
           properties: {
             idSesion: {
               type: "integer",
               description: "ID de la sesión",
               example: 1,
             },
             idUsuario: {
               type: "integer",
               description: "ID del usuario",
               example: 123,
             },
             titulo: {
               type: "string",
               nullable: true,
               description: "Título de la sesión",
               example: "Sesión de estudio matutina",
             },
             fechaCreacion: {
               type: "string",
               format: "date-time",
               description: "Fecha de creación",
               example: "2024-01-08T08:30:00.000Z",
             },
           },
         },
         description: "Arreglo de sesiones pendientes más antiguas que los días especificados, utilizado por trabajos cron.",
       },
       ApiResponse: {
         type: "object",
         required: ["success", "message", "timestamp"],
         properties: {
           success: {
             type: "boolean",
             description: "Indicates if the operation was successful",
             example: true,
           },
           message: {
             type: "string",
             description: "Response message",
             example: "Operation completed successfully",
           },
           data: {
             description: "Response data (varies by endpoint)",
           },
           timestamp: {
             type: "string",
             format: "date-time",
             description: "Response timestamp",
             example: "2024-01-15T09:15:30.000Z",
           },
         },
         description: "Standard API response wrapper for all endpoints.",
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
        name: "Sessions",
        description: "Endpoints de gestión de sesiones de concentración",
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
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
