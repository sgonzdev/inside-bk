import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { updateProfileSchema } from './users.validation';
import * as controller from './users.controller';

const router = Router();

router.use(authenticate);
router.get('/profile', controller.getProfile);
router.patch('/profile', validate(updateProfileSchema), controller.updateProfile);

export default router;
