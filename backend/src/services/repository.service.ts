import Repository from '../models/repository.models';
import Project from '../models/project.models';
import User from '../models/user.models';

import { ROLE } from '../types/user.types';

import * as activityService
  from './activity.service';

import {
  ActivityAction,
  ActivityEntityType
} from '../types/activity.types';


// =====================================================
// CHECK PROJECT ACCESS
// =====================================================

const checkProjectAccess = async (
  projectId: string,
  userId: string,
  action: 'VIEW' | 'MANAGE'
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  const user = await User.findById(userId)
    .select('role');

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const isAdmin =
    user.role === ROLE.ADMIN;

  const isOwner =
    project.owner.toString() === userId;

  const isMember =
    project.members.some(
      (member) => member.toString() === userId
    );

  // ================================================
  // VIEW ACCESS
  // ================================================

  if (action === 'VIEW') {
    if (
      isAdmin ||
      isOwner ||
      isMember
    ) {
      return project;
    }

    throw new Error('PROJECT_ACCESS_DENIED');
  }

  // ================================================
  // MANAGEMENT ACCESS
  // ================================================

  if (action === 'MANAGE') {
    if (isAdmin) {
      return project;
    }

    if (
      user.role === ROLE.PROJECT_MANAGER &&
      (isOwner || isMember)
    ) {
      return project;
    }

    throw new Error('PROJECT_MANAGE_DENIED');
  }

  throw new Error('PROJECT_ACCESS_DENIED');
};


// =====================================================
// CREATE REPOSITORY
// =====================================================

export const createRepositoryService = async (
  data: {
    project: string;
    name: string;
    description?: string;
    githubUrl?: string;
  },
  userId: string
) => {

  // Verify project + membership + role
  const project = await checkProjectAccess(
    data.project,
    userId,
    'MANAGE'
  );

  const repository =
    await Repository.create({
      project: project._id,
      name: data.name,
      description: data.description,
      githubUrl: data.githubUrl,

      // Never trust createdBy from frontend
      createdBy: userId
    });

  // ================================================
  // AUTOMATIC ACTIVITY
  // ================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action:
      ActivityAction.REPOSITORY_CREATED,

    description:
      `Repository "${repository.name}" was created.`,

    entityType:
      ActivityEntityType.REPOSITORY,

    entityId:
      repository._id.toString()
  });

  return repository;
};


// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

export const getRepositoriesService = async (
  userId: string
) => {

  const user = await User.findById(userId)
    .select('role');

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  /*
   * ADMIN can see everything.
   */
  if (user.role === ROLE.ADMIN) {
    return await Repository.find()
      .populate(
        'createdBy',
        'name email avatar'
      )
      .populate(
        'project',
        'name description'
      )
      .sort({
        createdAt: -1
      });
  }

  /*
   * Find projects where the user is:
   *
   * 1. owner
   * 2. member
   */
  const projects = await Project.find({
    $or: [
      {
        owner: userId
      },
      {
        members: userId
      }
    ]
  }).select('_id');

  const projectIds =
    projects.map(
      (project) => project._id
    );

  return await Repository.find({
    project: {
      $in: projectIds
    }
  })
    .populate(
      'createdBy',
      'name email avatar'
    )
    .populate(
      'project',
      'name description'
    )
    .sort({
      createdAt: -1
    });
};


// =====================================================
// GET PROJECT REPOSITORIES
// =====================================================

export const getProjectRepositoriesService = async (
  projectId: string,
  userId: string
) => {

  /*
   * VIEW permission:
   *
   * ADMIN
   * OWNER
   * PROJECT MEMBER
   */
  await checkProjectAccess(
    projectId,
    userId,
    'VIEW'
  );

  return await Repository.find({
    project: projectId
  })
    .populate(
      'createdBy',
      'name email avatar'
    )
    .populate(
      'project',
      'name description'
    )
    .sort({
      createdAt: -1
    });
};


// =====================================================
// GET REPOSITORY BY ID
// =====================================================

export const getRepositoryByIdService = async (
  repositoryId: string,
  userId: string
) => {

  const repository =
    await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error('REPOSITORY_NOT_FOUND');
  }

  /*
   * Get repository's project.
   */
  await checkProjectAccess(
    repository.project.toString(),
    userId,
    'VIEW'
  );

  return await Repository.findById(repositoryId)
    .populate(
      'createdBy',
      'name email avatar'
    )
    .populate(
      'project',
      'name description owner members'
    );
};


// =====================================================
// UPDATE REPOSITORY
// =====================================================

export const updateRepositoryService = async (
  repositoryId: string,
  data: {
    name?: string;
    description?: string;
    githubUrl?: string;
  },
  userId: string
) => {

  const repository =
    await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error('REPOSITORY_NOT_FOUND');
  }

  /*
   * Repository → Project
   *
   * Then check:
   * ADMIN
   * PROJECT_MANAGER + project member
   */
  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    'MANAGE'
  );

  /*
   * Do NOT allow project to be changed here.
   */
  const updatedRepository =
    await Repository.findByIdAndUpdate(
      repositoryId,
      {
        ...(data.name !== undefined && {
          name: data.name
        }),

        ...(data.description !== undefined && {
          description: data.description
        }),

        ...(data.githubUrl !== undefined && {
          githubUrl: data.githubUrl
        })
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate(
        'createdBy',
        'name email avatar'
      )
      .populate(
        'project',
        'name description'
      );

  if (!updatedRepository) {
    throw new Error('REPOSITORY_NOT_FOUND');
  }

  // ================================================
  // AUTOMATIC ACTIVITY
  // ================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action:
      ActivityAction.REPOSITORY_UPDATED,

    description:
      `Repository "${updatedRepository.name}" was updated.`,

    entityType:
      ActivityEntityType.REPOSITORY,

    entityId:
      updatedRepository._id.toString()
  });

  return updatedRepository;
};


// =====================================================
// DELETE REPOSITORY
// =====================================================

export const deleteRepositoryService = async (
  repositoryId: string,
  userId: string
) => {

  const repository =
    await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error('REPOSITORY_NOT_FOUND');
  }

  /*
   * Check project management access
   * before deleting.
   */
  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    'MANAGE'
  );

  const repositoryName =
    repository.name;

  await Repository.findByIdAndDelete(
    repositoryId
  );

  // ================================================
  // AUTOMATIC ACTIVITY
  // ================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action:
      ActivityAction.REPOSITORY_DELETED,

    description:
      `Repository "${repositoryName}" was deleted.`,

    entityType:
      ActivityEntityType.REPOSITORY,

    entityId:
      repositoryId
  });

  return true;
};