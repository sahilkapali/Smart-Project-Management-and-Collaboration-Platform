import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateUser());

router.post('/', meetingController.createMeeting);
router.get('/project/:projectId', meetingController.getProjectMeetings);
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

export default router;