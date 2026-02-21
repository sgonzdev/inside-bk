import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { updatePreferencesSchema } from './preferences.validation';
import * as controller from './preferences.controller';

const router = Router();

router.use(authenticate);
router.get('/', controller.get);
router.patch('/', validate(updatePreferencesSchema), controller.update);

export default router;
