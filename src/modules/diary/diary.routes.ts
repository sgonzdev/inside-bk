import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { createDiarySchema, updateDiarySchema, diaryParamsSchema } from './diary.validation';
import * as controller from './diary.controller';

const router = Router();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/:id', validate(diaryParamsSchema, 'params'), controller.getById);
router.post('/', validate(createDiarySchema), controller.create);
router.patch('/:id', validate(diaryParamsSchema, 'params'), validate(updateDiarySchema), controller.update);
router.delete('/:id', validate(diaryParamsSchema, 'params'), controller.remove);

export default router;
