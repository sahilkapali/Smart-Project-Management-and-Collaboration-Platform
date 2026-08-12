import { Router } from 'express';

import {
  createRepository,
  getRepositories,
  getProjectRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository
} from '../controllers/repository.controller';

import {
  authenticateUser
} from '../middleware/auth.middleware';

import {
  checkProjectMembership,
  checkProjectManagementAccess
} from '../middleware/role.middleware';

const router = Router();


// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

router.get(
  '/',
  authenticateUser(),
  getRepositories
);


// =====================================================
// GET REPOSITORIES OF A PROJECT
// =====================================================

router.get(
  '/project/:projectId',
  authenticateUser(),
  checkProjectMembership,
  getProjectRepositories
);


// =====================================================
// CREATE REPOSITORY
// =====================================================

router.post(
  '/',
  authenticateUser(),
  checkProjectManagementAccess,
  createRepository
);


// =====================================================
// GET ONE REPOSITORY
// =====================================================

router.get(
  '/:id',
  authenticateUser(),
  getRepositoryById
);


// =====================================================
// UPDATE REPOSITORY
// =====================================================

router.patch(
  '/:id',
  authenticateUser(),
  updateRepository
);


// =====================================================
// DELETE REPOSITORY
// =====================================================

router.delete(
  '/:id',
  authenticateUser(),
  deleteRepository
);


export default router;