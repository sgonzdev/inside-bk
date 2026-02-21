import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { createRoomSchema, sendMessageSchema, roomParamsSchema } from './chat.validation';
import * as controller from './chat.controller';

const router = Router();

router.use(authenticate);
router.post('/rooms', validate(createRoomSchema), controller.createRoom);
router.get('/rooms', controller.getRooms);
router.get('/rooms/:roomId/messages', validate(roomParamsSchema, 'params'), controller.getMessages);
router.post('/rooms/:roomId/messages', validate(roomParamsSchema, 'params'), validate(sendMessageSchema), controller.sendMessage);

export default router;
