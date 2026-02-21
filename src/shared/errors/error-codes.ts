// ── Auth ─────────────────────────────────────────────
export const AUTH_EMAIL_EXISTS        = 'AUTH_EMAIL_EXISTS';        // El email ya está registrado
export const AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS'; // Credenciales inválidas (email o contraseña incorrectos)
export const AUTH_INVALID_TOKEN       = 'AUTH_INVALID_TOKEN';       // Token ausente, inválido o expirado
export const AUTH_TOKEN_REUSE         = 'AUTH_TOKEN_REUSE';         // Reuso de refresh token detectado — sesiones revocadas

// ── Validation: password ─────────────────────────────
export const PASS_MIN_LENGTH = 'PASS_MIN_LENGTH'; // La contraseña debe tener al menos 8 caracteres
export const PASS_UPPERCASE  = 'PASS_UPPERCASE';  // Debe contener al menos una letra mayúscula
export const PASS_LOWERCASE  = 'PASS_LOWERCASE';  // Debe contener al menos una letra minúscula
export const PASS_NUMBER     = 'PASS_NUMBER';      // Debe contener al menos un número
export const PASS_SPECIAL    = 'PASS_SPECIAL';     // Debe contener al menos un carácter especial

// ── Validation: general ──────────────────────────────
export const FIELD_REQUIRED   = 'FIELD_REQUIRED';   // Campo obligatorio vacío
export const EMAIL_INVALID    = 'EMAIL_INVALID';    // Formato de email inválido
export const CONSENT_REQUIRED = 'CONSENT_REQUIRED'; // Se requiere aceptar el consentimiento
export const AGE_MIN_16       = 'AGE_MIN_16';       // Debe ser mayor de 16 años

// ── Generic ──────────────────────────────────────────
export const FORBIDDEN        = 'FORBIDDEN';        // Sin permisos suficientes para esta acción
export const NOT_FOUND        = 'NOT_FOUND';        // Recurso no encontrado
export const INTERNAL_ERROR   = 'INTERNAL_ERROR';   // Error interno del servidor
export const VALIDATION_ERROR = 'VALIDATION_ERROR'; // Error de validación en los datos enviados
export const RATE_LIMITED     = 'RATE_LIMITED';      // Demasiadas solicitudes, intenta más tarde

// ── AI ───────────────────────────────────────────────
export const AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR'; // Error al comunicarse con el proveedor de IA
export const AI_CONFIG_ERROR   = 'AI_CONFIG_ERROR';   // Configuración de IA inválida (API key faltante o proveedor desconocido)

// ── Emotions ─────────────────────────────────────────
export const EMOTION_NOT_FOUND = 'EMOTION_NOT_FOUND'; // La emoción especificada no existe

// ── Diary ────────────────────────────────────────────
export const DIARY_NOT_FOUND = 'DIARY_NOT_FOUND'; // La entrada de diario no existe

// ── Chat ─────────────────────────────────────────────
export const CHAT_NOT_PARTICIPANT = 'CHAT_NOT_PARTICIPANT'; // No es participante de esta sala de chat

// ── Notifications ────────────────────────────────────
export const NOTIFICATIONS_DISABLED = 'NOTIFICATIONS_DISABLED'; // El usuario tiene las notificaciones desactivadas

// ── Users ────────────────────────────────────────────
export const USER_NOT_FOUND = 'USER_NOT_FOUND';

// ── Upload ───────────────────────────────────────────
export const UPLOAD_NO_FILE       = 'UPLOAD_NO_FILE';        // No se envió ningún archivo
export const UPLOAD_INVALID_TYPE  = 'UPLOAD_INVALID_TYPE';   // Tipo de archivo no permitido
export const UPLOAD_TOO_LARGE     = 'UPLOAD_TOO_LARGE';      // Archivo excede el tamaño máximo
export const UPLOAD_FAILED        = 'UPLOAD_FAILED';         // Error al subir el archivo // El usuario no existe
