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
       CreateSessionDto: {
         type: "object",
         required: ["type"],
         properties: {
           title: {
             type: "string",
             description: "Optional title for the session",
             example: "Morning Study Session",
           },
           description: {
             type: "string",
             description: "Optional description of the session",
             example: "Focusing on mathematics chapter 5",
           },
           type: {
             type: "string",
             enum: ["rapid", "scheduled"],
             description: "Type of concentration session",
             example: "rapid",
           },
           event_id: {
             type: "integer",
             description: "Optional associated event ID (send as snake_case)",
             example: 123,
           },
           id_metodo: {
             type: "integer",
             description: "Optional associated study method ID (send as snake_case)",
             example: 456,
           },
           id_album: {
             type: "integer",
             description: "Optional associated music album ID (send as snake_case)",
             example: 789,
           },
         },
         description: "DTO for creating a new concentration session. IMPORTANT: Request body MUST use snake_case field names (e.g., 'event_id', 'id_metodo', 'id_album') as they are automatically converted to camelCase internally.",
       },
       UpdateSessionDto: {
         type: "object",
         properties: {
           title: {
             type: "string",
             description: "Updated title for the session",
             example: "Updated Study Session",
           },
           description: {
             type: "string",
             description: "Updated description of the session",
             example: "Revised focus on mathematics",
           },
           id_metodo: {
             type: "integer",
             description: "Updated associated study method ID (send as snake_case)",
             example: 457,
           },
           id_album: {
             type: "integer",
             description: "Updated associated music album ID (send as snake_case)",
             example: 790,
           },
         },
         description: "DTO for updating session metadata. Only title, description, id_metodo, and id_album can be updated. IMPORTANT: Request body MUST use snake_case field names.",
       },
       SessionResponseDto: {
         type: "object",
         properties: {
           sessionId: {
             type: "integer",
             description: "Unique session identifier",
             example: 1,
           },
           userId: {
             type: "integer",
             description: "ID of the user who owns the session",
             example: 123,
           },
           title: {
             type: "string",
             nullable: true,
             description: "Session title",
             example: "Morning Study Session",
           },
           description: {
             type: "string",
             nullable: true,
             description: "Session description",
             example: "Focusing on mathematics chapter 5",
           },
           type: {
             type: "string",
             enum: ["rapid", "scheduled"],
             description: "Type of concentration session",
             example: "rapid",
           },
           status: {
             type: "string",
             enum: ["pending", "completed"],
             description: "Current status of the session",
             example: "pending",
           },
           eventId: {
             type: "integer",
             nullable: true,
             description: "Associated event ID",
             example: 123,
           },
           methodId: {
             type: "integer",
             nullable: true,
             description: "Associated study method ID",
             example: 456,
           },
           albumId: {
             type: "integer",
             nullable: true,
             description: "Associated music album ID",
             example: 789,
           },
           elapsedInterval: {
             type: "string",
             description: "Elapsed time in HH:MM:SS format",
             example: "01:30:45",
           },
           elapsedMs: {
             type: "integer",
             description: "Elapsed time in milliseconds",
             example: 5445000,
           },
           createdAt: {
             type: "string",
             format: "date-time",
             description: "Session creation timestamp (without timezone conversion)",
             example: "2024-01-15T08:30:00.000Z",
           },
           updatedAt: {
             type: "string",
             format: "date-time",
             description: "Last update timestamp (without timezone conversion)",
             example: "2024-01-15T09:15:30.000Z",
           },
           lastInteractionAt: {
             type: "string",
             format: "date-time",
             description: "Last interaction timestamp (without timezone conversion)",
             example: "2024-01-15T09:15:30.000Z",
           },
         },
         description: "Complete session response with all session data and time tracking information.",
       },
       SessionListResponse: {
         type: "object",
         properties: {
           sessions: {
             type: "array",
             items: {
               $ref: "#/components/schemas/SessionResponseDto",
             },
             description: "Array of session objects",
           },
           total: {
             type: "integer",
             description: "Total number of sessions matching the criteria",
             example: 25,
           },
           page: {
             type: "integer",
             description: "Current page number",
             example: 1,
           },
           perPage: {
             type: "integer",
             description: "Number of sessions per page",
             example: 10,
           },
           totalPages: {
             type: "integer",
             description: "Total number of pages",
             example: 3,
           },
         },
         description: "Paginated response for session listing with metadata.",
       },
       PendingSessionsResponse: {
         type: "array",
         items: {
           type: "object",
           properties: {
             idSesion: {
               type: "integer",
               description: "Session ID",
               example: 1,
             },
             idUsuario: {
               type: "integer",
               description: "User ID",
               example: 123,
             },
             titulo: {
               type: "string",
               nullable: true,
               description: "Session title",
               example: "Morning Study Session",
             },
             fechaCreacion: {
               type: "string",
               format: "date-time",
               description: "Creation date",
               example: "2024-01-08T08:30:00.000Z",
             },
           },
         },
         description: "Array of pending sessions older than specified days, used by cron jobs.",
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
  customfavIcon: "/assets/favicon.ico",
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
