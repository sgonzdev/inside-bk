import { Router } from 'express';

import authRoutes from '../../modules/auth/auth.routes';
import usersRoutes from '../../modules/users/users.routes';
import diaryRoutes from '../../modules/diary/diary.routes';
import emotionsRoutes from '../../modules/emotions/emotions.routes';
import chatRoutes from '../../modules/chat/chat.routes';
import notificationsRoutes from '../../modules/notifications/notifications.routes';
import enumsRoutes from '../../modules/enums/enums.routes';
import preferencesRoutes from '../../modules/preferences/preferences.routes';
import uploadRoutes from '../../modules/upload/upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/diary', diaryRoutes);
router.use('/emotions', emotionsRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/enums', enumsRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/upload', uploadRoutes);

export default router;
