import { Router } from 'express';
import { 
  getMyNotifications, 
  readNotification, 
  readAllNotifications 
} from '../controllers/notification.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateUser()); 

router.get('/', getMyNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);

export default router;