import { Router } from 'express';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { logEmotionSchema, statsQuerySchema } from './emotions.validation';
import * as controller from './emotions.controller';

const router = Router();

router.get('/wheel', controller.getWheel);
router.use(authenticate);
router.post('/log', validate(logEmotionSchema), controller.logEmotion);
router.get('/history', controller.getHistory);
router.get('/stats', authorize('PROFESSIONAL'), validate(statsQuerySchema, 'query'), controller.getStats);

export default router;
