import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { avatarUpload } from './upload.validation';
import { uploadAvatar, removeAvatar } from './upload.controller';

const router = Router();

// POST /upload/avatar  – Subir o reemplazar el avatar del usuario autenticado
router.post('/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatar);

// DELETE /upload/avatar – Eliminar el avatar del usuario autenticado
router.delete('/avatar', authenticate, removeAvatar);

export default router;
