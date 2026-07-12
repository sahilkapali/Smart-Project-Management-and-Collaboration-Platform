import { Router } from 'express';
import {
    createMeeting,
    getProjectMeetings,
    getMeetingById,
    updateMeeting, 
    deleteMeeting
} from '../controllers/meeting.controller';


const router = Router();

//1. Project scoped endpoints 
router.get('/priject/:projectId', getProjectMeetings);

//2. General meeting CRUD endpoints
router.get('/', createMeeting);


router.route('/:id')
    .get(getMeetingById)
    .patch(updateMeeting)
    .delete(deleteMeeting);

export default router;
