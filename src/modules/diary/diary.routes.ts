import { Router } from 'express';
import { authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { createDiarySchema, updateDiarySchema, diaryParamsSchema } from './diary.validation';
import * as controller from './diary.controller';

const router = Router();

router.get('/all', authorize('PROFESSIONAL'), controller.getAllForProfessional);
router.get('/', authorize('STUDENT'), controller.getAll);
router.get('/:id', authorize('STUDENT'), validate(diaryParamsSchema, 'params'), controller.getById);
router.post('/', authorize('STUDENT'), validate(createDiarySchema), controller.create);
router.patch('/:id', authorize('STUDENT'), validate(diaryParamsSchema, 'params'), validate(updateDiarySchema), controller.update);
router.delete('/:id', authorize('STUDENT'), validate(diaryParamsSchema, 'params'), controller.remove);

export default router;
