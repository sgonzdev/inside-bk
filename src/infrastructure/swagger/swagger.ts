import swaggerUi from "swagger-ui-express";
import { Router } from "express";

const router = Router();

const spec = {
  openapi: "3.0.3",
  info: {
    title: "InsideOut Expressions API",
    version: "1.0.0",
    description: "API de apoyo psicológico para estudiantes universitarios.",
  },
  servers: [{ url: "/api/v1", description: "v1 (current)" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
        },
      },
      Program: {
        type: "string",
        enum: [
          "SOFTWARE_ENGINEERING",
          "ENVIRONMENTAL_ENGINEERING",
          "OCCUPATIONAL_HEALTH_ADMIN",
          "FOOD_ENGINEERING",
          "ELECTRICAL_ENGINEERING",
          "DIGITAL_BUSINESS_ADMIN",
        ],
      },
      Role: { type: "string", enum: ["STUDENT", "PROFESSIONAL"] },

      // Auth
      RegisterBody: {
        type: "object",
        required: [
          "email",
          "password",
          "firstName",
          "lastName",
          "program",
          "birthDate",
          "idDocument",
        ],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          firstName: { type: "string" },
          lastName: { type: "string" },
          role: { $ref: "#/components/schemas/Role" },
          sex: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
          phone: { type: "string", example: "3001234567" },
          idDocument: { type: "string", example: "1234567890" },
          language: { type: "string", enum: ["ES", "EN"], default: "ES" },
          program: { $ref: "#/components/schemas/Program" },
          birthDate: { type: "string", format: "date", example: "2000-05-20" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },

      // User
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          role: { $ref: "#/components/schemas/Role" },
          program: { $ref: "#/components/schemas/Program" },
          birthDate: { type: "string", format: "date-time", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UpdateProfileBody: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          program: { $ref: "#/components/schemas/Program" },
          birthDate: { type: "string", format: "date", example: "2000-05-20" },
        },
      },

      // Diary
      DiaryEntry: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          content: { type: "string" },
          mood: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateDiaryBody: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          mood: { type: "string" },
        },
      },
      UpdateDiaryBody: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          mood: { type: "string" },
        },
      },

      // Emotions
      Emotion: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: {
            type: "string",
            enum: [
              "HAPPY",
              "SATISFIED",
              "SAD",
              "DEPRESSED",
              "ANGRY",
              "ANXIOUS",
              "CONFUSED",
            ],
          },
          color: { type: "string", nullable: true },
        },
      },
      LogEmotionBody: {
        type: "object",
        required: ["emotionId"],
        properties: {
          emotionId: { type: "string", format: "uuid" },
        },
      },
      EmotionLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          aiFeedback: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          emotion: { $ref: "#/components/schemas/Emotion" },
        },
      },
      EmotionStat: {
        type: "object",
        properties: {
          emotionId: { type: "string", format: "uuid" },
          emotionName: { type: "string" },
          count: { type: "integer" },
        },
      },

      // Chat
      ChatRoom: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          sender: { $ref: "#/components/schemas/User" },
        },
      },

      // Notifications
      Notification: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          message: { type: "string" },
          read: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // Preferences
      UserPreferences: {
        type: "object",
        properties: {
          language: { type: "string", enum: ["ES", "EN"] },
          theme: { type: "string", enum: ["LIGHT", "DARK", "SYSTEM"] },
          notificationsEnabled: { type: "boolean" },
        },
      },
      UpdatePreferencesBody: {
        type: "object",
        properties: {
          language: { type: "string", enum: ["ES", "EN"] },
          theme: { type: "string", enum: ["LIGHT", "DARK", "SYSTEM"] },
          notificationsEnabled: { type: "boolean" },
        },
      },

      // Consent
      SignConsentBody: {
        type: "object",
        required: ["signature"],
        properties: {
          signature: {
            type: "string",
            pattern: "^data:image/(png|jpeg|webp);base64,",
            description: "Firma en formato data URI base64 (máx 500 KB)",
            example: "data:image/png;base64,iVBORw0KGgo...",
          },
          guardianName: {
            type: "string",
            minLength: 1,
            description:
              "Nombre completo del acudiente. Obligatorio si el usuario tiene menos de 18 años según su birthDate registrado.",
          },
          guardianPhone: {
            type: "string",
            minLength: 7,
            description:
              "Teléfono del acudiente. Obligatorio si el usuario tiene menos de 18 años según su birthDate registrado.",
          },
        },
      },
      ConsentRecord: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          storageKey: { type: "string", example: "consents/uuid.pdf" },
          signedAt: { type: "string", format: "date-time" },
          ip: { type: "string", example: "192.168.1.1" },
          guardianName: { type: "string", nullable: true },
          guardianPhone: { type: "string", nullable: true },
          url: {
            type: "string",
            description:
              "URL prefirmada temporal para descargar el PDF (expira en 1 hora)",
          },
        },
      },
      ConsentRecordWithUser: {
        allOf: [
          { $ref: "#/components/schemas/ConsentRecord" },
          {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                  idDocument: { type: "string", nullable: true },
                },
              },
            },
          },
        ],
      },

      // Media
      MediaItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          storageKey: { type: "string" },
          mimeType: { type: "string", example: "image/png" },
          size: { type: "integer", example: 204800 },
          url: { type: "string", description: "URL prefirmada (expira en 1h)" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ReadReceipt: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
          readAt: { type: "string", format: "date-time" },
        },
      },

      // Pagination
      PaginatedMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 100 },
          totalPages: { type: "integer", example: 5 },
        },
      },

      // Enums
      EnumsResponse: {
        type: "object",
        properties: {
          programs: {
            type: "array",
            items: { $ref: "#/components/schemas/Program" },
          },
        },
      },
    },
  },

  paths: {
    // ── Health ──────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { "200": { description: "Server is up" } },
      },
    },

    // ── Auth ─────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        description:
          "Solo se permiten correos @fet.edu.co. Se envía un correo de verificación al registrarse. El token expira en 24h.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Registro exitoso — se envió correo de verificación",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      properties: {
                        code: {
                          type: "string",
                          example: "AUTH_REGISTER_SUCCESS",
                        },
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validación fallida o dominio no permitido (AUTH_INVALID_DOMAIN)",
          },
          "409": {
            description: "Email ya registrado y verificado (AUTH_EMAIL_EXISTS)",
          },
        },
      },
    },
    "/auth/verify-email": {
      get: {
        tags: ["Auth"],
        summary: "Verificar correo electrónico",
        description:
          "Confirma la cuenta usando el token enviado al correo. El token expira en 24 horas. Retorna accessToken y refreshToken para iniciar sesión automáticamente.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Token de verificación recibido por correo",
          },
        ],
        responses: {
          "200": {
            description: "Correo verificado — sesión iniciada automáticamente",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                    code: { type: "string", example: "AUTH_EMAIL_VERIFIED" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            email: { type: "string", format: "email" },
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            program: { $ref: "#/components/schemas/Program" },
                            birthDate: {
                              type: "string",
                              format: "date-time",
                              nullable: true,
                            },
                            idDocument: { type: "string", nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Token inválido o expirado (AUTH_VERIFICATION_TOKEN_INVALID)",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login exitoso",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/AuthTokens" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Credenciales inválidas (AUTH_INVALID_CREDENTIALS)",
          },
          "403": {
            description: "Correo no verificado (AUTH_EMAIL_NOT_VERIFIED)",
          },
          "423": {
            description:
              "Cuenta bloqueada por demasiados intentos fallidos (AUTH_ACCOUNT_LOCKED)",
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Token renovado" },
          "401": { description: "Refresh token inválido o expirado" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesión",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Sesión cerrada" },
          "401": { description: "No autenticado" },
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────
    "/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Obtener perfil propio",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil del usuario",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Actualizar perfil",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileBody" },
            },
          },
        },
        responses: {
          "200": { description: "Perfil actualizado" },
          "400": { description: "Validación fallida" },
          "401": { description: "No autenticado" },
        },
      },
    },

    // ── Diary ─────────────────────────────────────────────────
    "/diary/all": {
      get: {
        tags: ["Diary"],
        summary: "Listar entradas de todos los usuarios (solo PROFESSIONAL)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Buscar por título o correo del autor",
          },
        ],
        responses: {
          "200": {
            description: "Lista paginada de entradas con datos del usuario",
          },
          "403": { description: "Solo accesible por PROFESSIONAL" },
        },
      },
    },
    "/diary": {
      get: {
        tags: ["Diary"],
        summary: "Listar mis entradas del diario",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Buscar por título",
          },
        ],
        responses: {
          "200": { description: "Lista paginada de entradas" },
          "401": { description: "No autenticado" },
        },
      },
      post: {
        tags: ["Diary"],
        summary: "Crear entrada de diario",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDiaryBody" },
            },
          },
        },
        responses: {
          "201": { description: "Entrada creada" },
          "400": { description: "Validación fallida" },
        },
      },
    },
    "/diary/{id}": {
      get: {
        tags: ["Diary"],
        summary: "Obtener entrada por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Entrada encontrada" },
          "404": { description: "No encontrada" },
        },
      },
      patch: {
        tags: ["Diary"],
        summary: "Actualizar entrada",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateDiaryBody" },
            },
          },
        },
        responses: {
          "200": { description: "Actualizada" },
          "404": { description: "No encontrada" },
        },
      },
      delete: {
        tags: ["Diary"],
        summary: "Eliminar entrada",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Eliminada" },
          "404": { description: "No encontrada" },
        },
      },
    },

    // ── Diary Media ───────────────────────────────────────────
    "/diary/{id}/media": {
      post: {
        tags: ["Diary"],
        summary: "Subir imagen o video a una entrada",
        description:
          "Adjunta un archivo a una entrada del diario. Soporta imágenes (máx 10 MB) y videos (máx 100 MB).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description:
                      "Imagen (jpeg/png/webp/gif, máx 10 MB) o video (mp4/webm/mov, máx 100 MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Media subida",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/MediaItem" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Sin archivo, tipo inválido o tamaño excedido",
          },
          "404": { description: "Entrada no encontrada" },
        },
      },
    },
    "/diary/{id}/media/{mediaId}": {
      delete: {
        tags: ["Diary"],
        summary: "Eliminar archivo adjunto de una entrada",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "mediaId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": { description: "Archivo eliminado de MinIO y DB" },
          "404": { description: "Media no encontrada" },
        },
      },
    },

    // ── Emotions ──────────────────────────────────────────────
    "/emotions/wheel": {
      get: {
        tags: ["Emotions"],
        summary: "Rueda de emociones (público)",
        responses: {
          "200": {
            description: "Árbol de emociones",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Emotion" },
                },
              },
            },
          },
        },
      },
    },
    "/emotions/log": {
      post: {
        tags: ["Emotions"],
        summary: "Registrar emoción",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogEmotionBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Log creado con feedback de IA",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/EmotionLog" },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Cooldown activo (EMOTION_COOLDOWN) o límite diario alcanzado (EMOTION_DAILY_LIMIT)",
          },
          "404": { description: "Emoción no encontrada (EMOTION_NOT_FOUND)" },
          "429": {
            description: "Rate limit excedido (máx. 10 registros/hora)",
          },
        },
      },
    },
    "/emotions/prediction": {
      get: {
        tags: ["Emotions"],
        summary: "Predicción emocional del día (solo STUDENT)",
        description:
          "Genera una predicción emocional basada en los últimos registros de emociones y entradas de diario. Se genera una vez por día calendario y se reutiliza hasta la medianoche.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Predicción del día",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        prediction: {
                          type: "string",
                          example: "Hoy podrías sentirte un poco ansioso...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
          "403": { description: "Solo accesible por STUDENT" },
        },
      },
    },
    "/emotions/history": {
      get: {
        tags: ["Emotions"],
        summary: "Historial de emociones del usuario autenticado",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: { "200": { description: "Lista paginada de logs" } },
      },
    },
    "/emotions/stats": {
      get: {
        tags: ["Emotions"],
        summary: "Estadísticas de emociones (solo PROFESSIONAL)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "program",
            in: "query",
            schema: { $ref: "#/components/schemas/Program" },
            description: "Filtrar por programa",
          },
          {
            name: "ageMin",
            in: "query",
            schema: { type: "integer", minimum: 0 },
            description: "Edad mínima",
          },
          {
            name: "ageMax",
            in: "query",
            schema: { type: "integer", minimum: 0 },
            description: "Edad máxima",
          },
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Desde fecha (YYYY-MM-DD)",
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Hasta fecha (YYYY-MM-DD)",
          },
        ],
        responses: {
          "200": {
            description: "Conteo por emoción",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/EmotionStat" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
          "403": { description: "Solo accesible por PROFESSIONAL" },
        },
      },
    },

    // ── Chat ──────────────────────────────────────────────────
    "/chat/rooms": {
      post: {
        tags: ["Chat"],
        summary: "Crear sala de chat (solo PROFESSIONAL)",
        description:
          "Solo los profesionales pueden crear salas. Los `participantIds` deben ser IDs de usuarios con rol STUDENT. El profesional queda incluido automáticamente.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["participantIds"],
                properties: {
                  name: {
                    type: "string",
                    description: "Nombre opcional de la sala (para grupos)",
                  },
                  participantIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    description: "IDs de estudiantes a incluir",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Sala creada" },
          "400": {
            description:
              "Algún participantId no es STUDENT (CHAT_PARTICIPANTS_MUST_BE_STUDENTS)",
          },
          "403": { description: "Solo accesible por PROFESSIONAL" },
        },
      },
      get: {
        tags: ["Chat"],
        summary: "Listar salas del usuario",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Buscar por nombre de sala",
          },
        ],
        responses: { "200": { description: "Lista paginada de salas" } },
      },
    },
    "/chat/rooms/{roomId}/participants": {
      post: {
        tags: ["Chat"],
        summary: "Añadir participante a sala (solo PROFESSIONAL)",
        description:
          "El profesional puede añadir estudiantes a una sala existente en la que ya participa.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: {
                    type: "string",
                    format: "uuid",
                    description: "ID del estudiante a añadir",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Participante añadido" },
          "400": {
            description:
              "El usuario no es STUDENT (CHAT_PARTICIPANTS_MUST_BE_STUDENTS)",
          },
          "403": {
            description: "Solo PROFESSIONAL que ya es participante de la sala",
          },
          "404": { description: "Sala o usuario no encontrado" },
          "409": {
            description:
              "El usuario ya es participante (CHAT_ALREADY_PARTICIPANT)",
          },
        },
      },
    },

    "/chat/rooms/{roomId}/messages": {
      get: {
        tags: ["Chat"],
        summary: "Obtener mensajes de una sala",
        description:
          "Retorna los últimos 50 mensajes. Cada mensaje incluye `media[]` y `receipts[]` (quién lo leyó).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Lista de mensajes con media y receipts" },
        },
      },
      post: {
        tags: ["Chat"],
        summary: "Enviar mensaje de texto",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: { content: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Mensaje enviado. Se emite `chat:message` por WebSocket a los participantes.",
          },
        },
      },
    },
    "/chat/rooms/{roomId}/messages/voice": {
      post: {
        tags: ["Chat"],
        summary: "Enviar nota de voz",
        description:
          "Sube un archivo de audio grabado (webm/ogg/mp4/mpeg/wav, máx 10 MB) como mensaje. Se emite `chat:message` por WebSocket con la URL prefirmada.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["audio"],
                properties: {
                  audio: {
                    type: "string",
                    format: "binary",
                    description:
                      "Archivo de audio (webm, ogg, mp4, mpeg, wav — máx 10 MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Nota de voz enviada" },
          "400": {
            description: "Sin archivo, tipo inválido o tamaño excedido",
          },
          "403": { description: "No es participante de la sala" },
        },
      },
    },
    "/chat/rooms/{roomId}/messages/media": {
      post: {
        tags: ["Chat"],
        summary: "Enviar imagen o video",
        description:
          "Sube un archivo a MinIO y crea un mensaje con media adjunta. Se emite `chat:message` por WebSocket con la URL prefirmada.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description:
                      "Imagen (jpeg/png/webp/gif, máx 10 MB) o video (mp4/webm/mov, máx 100 MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Mensaje con media creado",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: {
                      properties: {
                        media: {
                          type: "array",
                          items: { $ref: "#/components/schemas/MediaItem" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Sin archivo, tipo inválido o tamaño excedido",
          },
          "403": { description: "No es participante de la sala" },
        },
      },
    },
    "/chat/rooms/{roomId}/read": {
      post: {
        tags: ["Chat"],
        summary: "Marcar mensajes como leídos",
        description:
          "Marca como leídos todos los mensajes de la sala que no fueron enviados por el usuario autenticado. Emite `chat:read` por WebSocket a los participantes con `{ roomId, userId, readAt }`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Mensajes marcados",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: {
                      properties: { read: { type: "integer", example: 5 } },
                    },
                  },
                },
              },
            },
          },
          "403": { description: "No es participante de la sala" },
        },
      },
    },

    // ── Notifications ─────────────────────────────────────────
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Listar notificaciones del usuario",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            description: "Buscar por título o contenido",
            schema: { type: "string" },
          },
          {
            name: "read",
            in: "query",
            description: "Filtrar por estado de lectura: true = leídas, false = no leídas",
            schema: { type: "boolean" },
          },
        ],
        responses: {
          "200": { description: "Lista paginada de notificaciones" },
        },
      },
      delete: {
        tags: ["Notifications"],
        summary: "Eliminar todas las notificaciones (soft delete)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Todas eliminadas" } },
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Marcar todas como leídas",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Todas marcadas como leídas" } },
      },
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Marcar notificación como leída",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Notificación marcada" },
          "404": { description: "No encontrada" },
        },
      },
    },
    "/notifications/{id}": {
      delete: {
        tags: ["Notifications"],
        summary: "Eliminar una notificación (soft delete)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Notificación eliminada" },
        },
      },
    },

    // ── Consent ───────────────────────────────────────────────
    "/consent": {
      post: {
        tags: ["Consent"],
        summary: "Firmar consentimiento informado",
        description:
          "El estudiante firma el consentimiento informado. " +
          "El backend detecta automáticamente si el usuario es menor de 18 años consultando su `birthDate` registrado. " +
          "Si es menor, `guardianName` y `guardianPhone` son obligatorios; si no, se ignoran aunque se envíen. " +
          "Se genera un PDF sellado con la firma, fecha, IP y datos del acudiente (si aplica) y se almacena en MinIO.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignConsentBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Consentimiento firmado — PDF generado y almacenado",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Error de validación",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "error" },
                    code: {
                      type: "string",
                      enum: [
                        "CONSENT_GUARDIAN_INCOMPLETE",
                        "CONSENT_INVALID_SIGNATURE",
                        "CONSENT_SIGNATURE_TOO_LARGE",
                      ],
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado (AUTH_INVALID_TOKEN)" },
          "403": { description: "Solo accesible por STUDENT" },
          "409": {
            description: "El usuario ya firmó el consentimiento",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "error" },
                    code: { type: "string", example: "CONSENT_ALREADY_SIGNED" },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Consent"],
        summary: "Listar todos los consentimientos (solo PROFESSIONAL)",
        description:
          "Retorna una lista paginada de todos los consentimientos firmados. Cada registro incluye una URL prefirmada temporal para descargar el PDF.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Buscar por correo o número de documento del usuario",
          },
        ],
        responses: {
          "200": {
            description: "Lista paginada de consentimientos",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/ConsentRecordWithUser",
                      },
                    },
                    meta: { $ref: "#/components/schemas/PaginatedMeta" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
          "403": { description: "Solo accesible por PROFESSIONAL" },
        },
      },
    },
    "/consent/me": {
      get: {
        tags: ["Consent"],
        summary: "Obtener mi consentimiento firmado",
        description:
          "Retorna el consentimiento del usuario autenticado junto con una URL prefirmada para descargar el PDF.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Consentimiento encontrado",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/ConsentRecord" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
          "403": { description: "Solo accesible por STUDENT" },
          "404": {
            description: "El usuario aún no ha firmado el consentimiento",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string", example: "error" },
                    code: { type: "string", example: "CONSENT_NOT_FOUND" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Enums ──────────────────────────────────────────────────
    "/enums": {
      get: {
        tags: ["Enums"],
        summary: "Obtener programas académicos disponibles",
        responses: {
          "200": {
            description: "Valores de enums",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/EnumsResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Preferences ────────────────────────────────────────────
    "/preferences": {
      get: {
        tags: ["Preferences"],
        summary: "Obtener preferencias del usuario",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Preferencias del usuario",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/UserPreferences" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
        },
      },
      patch: {
        tags: ["Preferences"],
        summary: "Actualizar preferencias",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePreferencesBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Preferencias actualizadas",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/UserPreferences" },
                  },
                },
              },
            },
          },
          "400": { description: "Validación fallida" },
          "401": { description: "No autenticado" },
        },
      },
    },

    // ── Upload ─────────────────────────────────────────────────
    "/upload/avatar": {
      post: {
        tags: ["Upload"],
        summary: "Subir o reemplazar avatar",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: {
                  avatar: {
                    type: "string",
                    format: "binary",
                    description: "Imagen (jpeg, png, webp, gif). Máx 5 MB",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Avatar actualizado",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { description: "Archivo no enviado o tipo inválido" },
          "401": { description: "No autenticado" },
        },
      },
      delete: {
        tags: ["Upload"],
        summary: "Eliminar avatar",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Avatar eliminado",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    status: { type: "string" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado" },
        },
      },
    },
  },
};

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(spec, { explorer: false }));

export default router;
