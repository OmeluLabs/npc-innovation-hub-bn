import express from 'express';
import { protectRoute, restrictTo } from '../../middlewares/auth.middleware';
import { updateMemberAlumniStatus, updateMemberLeadership } from '../../controllers/admin/member.controller';
import { validateAlumniStatusUpdate, validateLeadershipUpdate } from '../../validations/member.validation';

const router = express.Router();

// Protect all admin routes with authentication and Admin role restriction
router.use(protectRoute, restrictTo('Admin'));

router.patch('/:id/alumni-status', validateAlumniStatusUpdate, updateMemberAlumniStatus);

router.patch('/:id/leadership', validateLeadershipUpdate, updateMemberLeadership);

export default router;
