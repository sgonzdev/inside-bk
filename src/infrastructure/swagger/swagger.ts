import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const router = Router();

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'InsideOut Expressions API',
    version: '1.0.0',
    description: 'API de apoyo psicológico para estudiantes universitarios.',
  },
  servers: [{ url: '/api/v1', description: 'v1 (current)' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
        },
      },
      Program: {
        type: 'string',
        enum: [
          'ENGINEERING', 'MEDICINE', 'LAW', 'PSYCHOLOGY', 'BUSINESS',
          'ARTS', 'SCIENCES', 'EDUCATION', 'ARCHITECTURE', 'COMMUNICATIONS',
        ],
      },
      Role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL'] },

      // Auth
      RegisterBody: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'consentGiven'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          consentGiven: { type: 'boolean', enum: [true] },
          program: { $ref: '#/components/schemas/Program' },
          birthDate: { type: 'string', format: 'date', example: '2000-05-20' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },

      // User
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          program: { $ref: '#/components/schemas/Program' },
          birthDate: { type: 'string', format: 'date-time', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateProfileBody: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          program: { $ref: '#/components/schemas/Program' },
          birthDate: { type: 'string', format: 'date', example: '2000-05-20' },
        },
      },

      // Diary
      DiaryEntry: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          mood: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateDiaryBody: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          mood: { type: 'string' },
        },
      },
      UpdateDiaryBody: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          mood: { type: 'string' },
        },
      },

      // Emotions
      Emotion: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          color: { type: 'string', nullable: true },
          children: { type: 'array', items: { $ref: '#/components/schemas/Emotion' } },
        },
      },
      LogEmotionBody: {
        type: 'object',
        required: ['emotionId'],
        properties: {
          emotionId: { type: 'string', format: 'uuid' },
          intensity: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
          note: { type: 'string' },
        },
      },
      EmotionLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          intensity: { type: 'integer' },
          note: { type: 'string', nullable: true },
          aiFeedback: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          emotion: { $ref: '#/components/schemas/Emotion' },
        },
      },
      EmotionStat: {
        type: 'object',
        properties: {
          emotionId: { type: 'string', format: 'uuid' },
          emotionName: { type: 'string' },
          count: { type: 'integer' },
        },
      },

      // Chat
      ChatRoom: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          sender: { $ref: '#/components/schemas/User' },
        },
      },

      // Notifications
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          message: { type: 'string' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Preferences
      UserPreferences: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['ES', 'EN'] },
          theme: { type: 'string', enum: ['LIGHT', 'DARK', 'SYSTEM'] },
          notificationsEnabled: { type: 'boolean' },
        },
      },
      UpdatePreferencesBody: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['ES', 'EN'] },
          theme: { type: 'string', enum: ['LIGHT', 'DARK', 'SYSTEM'] },
          notificationsEnabled: { type: 'boolean' },
        },
      },

      // Enums
      EnumsResponse: {
        type: 'object',
        properties: {
          programs: { type: 'array', items: { type: 'string' } },
          roles: { type: 'array', items: { type: 'string' } },
          languages: { type: 'array', items: { type: 'string' } },
          themes: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },

  paths: {
    // ── Health ──────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { '200': { description: 'Server is up' } },
      },
    },

    // ── Auth ─────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } },
        },
        responses: {
          '201': { description: 'Usuario creado', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/AuthTokens' } } } } } },
          '400': { description: 'Validación fallida' },
          '409': { description: 'Email ya registrado' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: {
          '200': { description: 'Login exitoso', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/AuthTokens' } } } } } },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Token renovado' },
          '401': { description: 'Refresh token inválido o expirado' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Sesión cerrada' },
          '401': { description: 'No autenticado' },
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Obtener perfil propio',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil del usuario', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'No autenticado' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Actualizar perfil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileBody' } } },
        },
        responses: {
          '200': { description: 'Perfil actualizado' },
          '400': { description: 'Validación fallida' },
          '401': { description: 'No autenticado' },
        },
      },
    },

    // ── Diary ─────────────────────────────────────────────────
    '/diary': {
      get: {
        tags: ['Diary'],
        summary: 'Listar entradas del diario',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de entradas' }, '401': { description: 'No autenticado' } },
      },
      post: {
        tags: ['Diary'],
        summary: 'Crear entrada de diario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDiaryBody' } } },
        },
        responses: { '201': { description: 'Entrada creada' }, '400': { description: 'Validación fallida' } },
      },
    },
    '/diary/{id}': {
      get: {
        tags: ['Diary'],
        summary: 'Obtener entrada por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Entrada encontrada' }, '404': { description: 'No encontrada' } },
      },
      patch: {
        tags: ['Diary'],
        summary: 'Actualizar entrada',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDiaryBody' } } },
        },
        responses: { '200': { description: 'Actualizada' }, '404': { description: 'No encontrada' } },
      },
      delete: {
        tags: ['Diary'],
        summary: 'Eliminar entrada',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Eliminada' }, '404': { description: 'No encontrada' } },
      },
    },

    // ── Emotions ──────────────────────────────────────────────
    '/emotions/wheel': {
      get: {
        tags: ['Emotions'],
        summary: 'Rueda de emociones (público)',
        responses: { '200': { description: 'Árbol de emociones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Emotion' } } } } } },
      },
    },
    '/emotions/log': {
      post: {
        tags: ['Emotions'],
        summary: 'Registrar emoción',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LogEmotionBody' } } },
        },
        responses: { '201': { description: 'Log creado con feedback de IA', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/EmotionLog' } } } } } }, '404': { description: 'Emoción no encontrada' } },
      },
    },
    '/emotions/history': {
      get: {
        tags: ['Emotions'],
        summary: 'Historial de emociones del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de logs' } },
      },
    },
    '/emotions/stats': {
      get: {
        tags: ['Emotions'],
        summary: 'Estadísticas de emociones (solo PROFESSIONAL)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'program', in: 'query', schema: { $ref: '#/components/schemas/Program' }, description: 'Filtrar por programa' },
          { name: 'ageMin', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Edad mínima' },
          { name: 'ageMax', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Edad máxima' },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Desde fecha (YYYY-MM-DD)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Hasta fecha (YYYY-MM-DD)' },
        ],
        responses: {
          '200': { description: 'Conteo por emoción', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/EmotionStat' } } } } } } },
          '401': { description: 'No autenticado' },
          '403': { description: 'Solo accesible por PROFESSIONAL' },
        },
      },
    },

    // ── Chat ──────────────────────────────────────────────────
    '/chat/rooms': {
      post: {
        tags: ['Chat'],
        summary: 'Crear sala de chat',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, participantIds: { type: 'array', items: { type: 'string', format: 'uuid' } } } } } },
        },
        responses: { '201': { description: 'Sala creada' } },
      },
      get: {
        tags: ['Chat'],
        summary: 'Listar salas del usuario',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de salas' } },
      },
    },
    '/chat/rooms/{roomId}/messages': {
      get: {
        tags: ['Chat'],
        summary: 'Obtener mensajes de una sala',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roomId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Lista de mensajes' } },
      },
      post: {
        tags: ['Chat'],
        summary: 'Enviar mensaje',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roomId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } } },
        },
        responses: { '201': { description: 'Mensaje enviado' } },
      },
    },

    // ── Notifications ─────────────────────────────────────────
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Listar notificaciones del usuario',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de notificaciones' } },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Marcar todas como leídas',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Todas marcadas como leídas' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Marcar notificación como leída',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Notificación marcada' }, '404': { description: 'No encontrada' } },
      },
    },

    // ── Enums ──────────────────────────────────────────────────
    '/enums': {
      get: {
        tags: ['Enums'],
        summary: 'Obtener valores de enums (programas, roles, idiomas, temas)',
        responses: {
          '200': {
            description: 'Valores de enums',
            content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/EnumsResponse' } } } } },
          },
        },
      },
    },

    // ── Preferences ────────────────────────────────────────────
    '/preferences': {
      get: {
        tags: ['Preferences'],
        summary: 'Obtener preferencias del usuario',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Preferencias del usuario',
            content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/UserPreferences' } } } } },
          },
          '401': { description: 'No autenticado' },
        },
      },
      patch: {
        tags: ['Preferences'],
        summary: 'Actualizar preferencias',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePreferencesBody' } } },
        },
        responses: {
          '200': { description: 'Preferencias actualizadas', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/UserPreferences' } } } } } },
          '400': { description: 'Validación fallida' },
          '401': { description: 'No autenticado' },
        },
      },
    },

    // ── Upload ─────────────────────────────────────────────────
    '/upload/avatar': {
      post: {
        tags: ['Upload'],
        summary: 'Subir o reemplazar avatar',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: {
                  avatar: { type: 'string', format: 'binary', description: 'Imagen (jpeg, png, webp, gif). Máx 5 MB' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Avatar actualizado', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } } },
          '400': { description: 'Archivo no enviado o tipo inválido' },
          '401': { description: 'No autenticado' },
        },
      },
      delete: {
        tags: ['Upload'],
        summary: 'Eliminar avatar',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Avatar eliminado', content: { 'application/json': { schema: { properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'No autenticado' },
        },
      },
    },
  },
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(spec, { explorer: false }));

export default router;
