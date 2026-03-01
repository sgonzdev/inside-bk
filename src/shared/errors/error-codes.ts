// ── Auth ─────────────────────────────────────────────
export const AUTH_EMAIL_EXISTS = "AUTH_EMAIL_EXISTS"; // El email ya está registrado
export const AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"; // Credenciales inválidas (email o contraseña incorrectos)
export const AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN"; // Token ausente, inválido o expirado
export const AUTH_TOKEN_REUSE = "AUTH_TOKEN_REUSE"; // Reuso de refresh token detectado — sesiones revocadas
export const AUTH_EMAIL_NOT_VERIFIED = "AUTH_EMAIL_NOT_VERIFIED";
export const AUTH_ACCOUNT_LOCKED = "AUTH_ACCOUNT_LOCKED"; // Cuenta bloqueada por demasiados intentos fallidos       // El email aún no ha sido verificado
export const AUTH_INVALID_DOMAIN = "AUTH_INVALID_DOMAIN"; // Solo se permiten correos @fet.edu.co
export const AUTH_VERIFICATION_TOKEN_INVALID =
  "AUTH_VERIFICATION_TOKEN_INVALID"; // Token de verificación inválido o expirado
export const AUTH_EMAIL_VERIFIED = "AUTH_EMAIL_VERIFIED"; // Correo verificado correctamente
export const AUTH_REGISTER_SUCCESS = "AUTH_REGISTER_SUCCESS"; // Registro exitoso, correo de verificación enviado
export const AUTH_RESET_TOKEN_INVALID = "AUTH_RESET_TOKEN_INVALID"; // Token de recuperación inválido o expirado
export const AUTH_PASSWORD_RESET_SUCCESS = "AUTH_PASSWORD_RESET_SUCCESS"; // Contraseña restablecida correctamente
export const AUTH_PASSWORD_SAME_AS_CURRENT = "AUTH_PASSWORD_SAME_AS_CURRENT"; // La nueva contraseña no puede ser igual a la anterior

// ── Validation: password ─────────────────────────────
export const PASS_MIN_LENGTH = "PASS_MIN_LENGTH"; // La contraseña debe tener al menos 8 caracteres
export const PASS_UPPERCASE = "PASS_UPPERCASE"; // Debe contener al menos una letra mayúscula
export const PASS_LOWERCASE = "PASS_LOWERCASE"; // Debe contener al menos una letra minúscula
export const PASS_NUMBER = "PASS_NUMBER"; // Debe contener al menos un número
export const PASS_SPECIAL = "PASS_SPECIAL"; // Debe contener al menos un carácter especial

// ── Validation: general ──────────────────────────────
export const FIELD_REQUIRED = "FIELD_REQUIRED"; // Campo obligatorio vacío
export const EMAIL_INVALID = "EMAIL_INVALID"; // Formato de email inválido
export const CONSENT_REQUIRED = "CONSENT_REQUIRED"; // Se requiere aceptar el consentimiento
export const AGE_MIN_16 = "AGE_MIN_16"; // Debe ser mayor de 16 años
export const AGE_MAX = "AGE_MAX"; // La fecha de nacimiento no es válida (año muy antiguo)
export const PHONE_INVALID = "PHONE_INVALID"; // El teléfono debe tener exactamente 10 dígitos
export const ID_DOCUMENT_INVALID = "ID_DOCUMENT_INVALID"; // El documento debe tener entre 5 y 10 dígitos
export const NAME_INVALID = "NAME_INVALID"; // El nombre solo puede contener letras y espacios

// ── Generic ──────────────────────────────────────────
export const FORBIDDEN = "FORBIDDEN"; // Sin permisos suficientes para esta acción
export const NOT_FOUND = "NOT_FOUND"; // Recurso no encontrado
export const INTERNAL_ERROR = "INTERNAL_ERROR"; // Error interno del servidor
export const VALIDATION_ERROR = "VALIDATION_ERROR"; // Error de validación en los datos enviados
export const RATE_LIMITED = "RATE_LIMITED"; // Demasiadas solicitudes, intenta más tarde

// ── AI ───────────────────────────────────────────────
export const AI_PROVIDER_ERROR = "AI_PROVIDER_ERROR"; // Error al comunicarse con el proveedor de IA
export const AI_CONFIG_ERROR = "AI_CONFIG_ERROR"; // Configuración de IA inválida (API key faltante o proveedor desconocido)

// ── Emotions ─────────────────────────────────────────
export const EMOTION_NOT_FOUND = "EMOTION_NOT_FOUND"; // La emoción especificada no existe
export const EMOTION_COOLDOWN = "EMOTION_COOLDOWN"; // Debes esperar antes de registrar otra emoción
export const EMOTION_DAILY_LIMIT = "EMOTION_DAILY_LIMIT"; // Límite diario de registros de emoción alcanzado
export const STATS_AGE_RANGE_INVALID = "STATS_AGE_RANGE_INVALID"; // ageMin no puede ser mayor que ageMax
export const STATS_DATE_RANGE_INVALID = "STATS_DATE_RANGE_INVALID"; // from no puede ser posterior a to

// ── Diary ────────────────────────────────────────────
export const DIARY_NOT_FOUND = "DIARY_NOT_FOUND"; // La entrada de diario no existe

// ── Chat ─────────────────────────────────────────────
export const CHAT_NOT_PARTICIPANT = "CHAT_NOT_PARTICIPANT"; // No es participante de esta sala de chat
export const CHAT_PARTICIPANTS_MUST_BE_STUDENTS =
  "CHAT_PARTICIPANTS_MUST_BE_STUDENTS"; // Solo se pueden añadir estudiantes a una sala
export const CHAT_ALREADY_PARTICIPANT = "CHAT_ALREADY_PARTICIPANT"; // El usuario ya es participante de esta sala
export const CHAT_NAME_TOO_LONG = "CHAT_NAME_TOO_LONG"; // El nombre de la sala no puede superar 100 caracteres
export const CHAT_TOO_MANY_PARTICIPANTS = "CHAT_TOO_MANY_PARTICIPANTS"; // No se pueden añadir más de 50 participantes
export const CHAT_MESSAGE_TOO_LONG = "CHAT_MESSAGE_TOO_LONG"; // El mensaje no puede superar 2000 caracteres

// ── Notifications ────────────────────────────────────
export const NOTIFICATIONS_DISABLED = "NOTIFICATIONS_DISABLED"; // El usuario tiene las notificaciones desactivadas
export const NOTIF_CHAT_NEW_MESSAGE = "CHAT_NEW_MESSAGE"; // Nuevo mensaje de chat no leído
export const NOTIF_DIARY_RISK_ALERT = "DIARY_RISK_ALERT"; // Alerta de riesgo detectada en entrada de diario

// ── Users ────────────────────────────────────────────
export const USER_NOT_FOUND = "USER_NOT_FOUND";

// ── Consent ───────────────────────────────────────────
export const CONSENT_GUARDIAN_INCOMPLETE = "CONSENT_GUARDIAN_INCOMPLETE"; // Se requiere nombre y telefono del acudiente
export const CONSENT_ALREADY_SIGNED = "CONSENT_ALREADY_SIGNED"; // El usuario ya firmó el consentimiento
export const CONSENT_NOT_FOUND = "CONSENT_NOT_FOUND"; // El consentimiento no existe
export const CONSENT_INVALID_SIGNATURE = "CONSENT_INVALID_SIGNATURE"; // Formato de firma inválido
export const CONSENT_SIGNATURE_TOO_LARGE = "CONSENT_SIGNATURE_TOO_LARGE"; // La firma supera el tamaño máximo (500KB)

// ── Upload ───────────────────────────────────────────
export const UPLOAD_NO_FILE = "UPLOAD_NO_FILE"; // No se envió ningún archivo
export const UPLOAD_INVALID_TYPE = "UPLOAD_INVALID_TYPE"; // Tipo de archivo no permitido
export const UPLOAD_TOO_LARGE = "UPLOAD_TOO_LARGE"; // Archivo excede el tamaño máximo
export const UPLOAD_FAILED = "UPLOAD_FAILED"; // Error al subir el archivo
export const UPLOAD_TOO_MANY_FILES = "UPLOAD_TOO_MANY_FILES"; // Se superó el límite de archivos permitidos
