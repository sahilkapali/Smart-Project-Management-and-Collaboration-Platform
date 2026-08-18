import { Request, Response, NextFunction } from "express";

import * as meetingService from "../services/meeting.service";
import * as aiService from "../services/gemini.service";

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id: unknown): id is string => {
  if (typeof id !== "string") {
    return false;
  }

  return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidUrl = (urlString: unknown): boolean => {
  if (typeof urlString !== "string") {
    return false;
  }

  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get authenticated user ID.
 */
const getAuthenticatedUserId = (req: Request): string | null => {
  const userId = req.user?.id;

  if (!userId) {
    return null;
  }

  return String(userId);
};

/**
 * Get route parameter safely as a string.
 */
const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

// =====================================================
// CREATE MEETING
// POST /api/meetings
// =====================================================

export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      title,
      description,
      meetingLink,
      projectId,
      participants,
      startTime,
      endTime,
      notes,
    } = req.body;

    const errors: string[] = [];

    // =================================================
    // TITLE
    // =================================================

    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100
    ) {
      errors.push(
        "Meeting title must be a string between 3 and 100 characters.",
      );
    }

    // =================================================
    // PROJECT ID
    // =================================================

    if (!projectId || !isValidObjectId(projectId)) {
      errors.push("Invalid or missing projectId.");
    }

    // =================================================
    // MEETING LINK
    // =================================================

    if (
      meetingLink !== undefined &&
      meetingLink !== null &&
      meetingLink !== ""
    ) {
      if (typeof meetingLink !== "string" || !isValidUrl(meetingLink)) {
        errors.push("Invalid meeting link URL.");
      }
    }

    // =================================================
    // PARTICIPANTS
    // =================================================

    const parsedParticipants = participants || [];

    if (!Array.isArray(parsedParticipants)) {
      errors.push("Participants must be an array.");
    } else {
      const invalidParticipant = parsedParticipants.some(
        (participantId: unknown) => !isValidObjectId(participantId),
      );

      if (invalidParticipant) {
        errors.push("One or more participant IDs are invalid MongoDB IDs.");
      }
    }

    // =================================================
    // START TIME
    // =================================================

    let start: Date | undefined;

    if (!startTime) {
      errors.push("Start time is required.");
    } else {
      const parsedStart = new Date(startTime);

      if (isNaN(parsedStart.getTime())) {
        errors.push("Start time must be a valid date.");
      } else {
        start = parsedStart;
      }
    }

    // =================================================
    // END TIME
    // =================================================

    let end: Date | undefined;

    if (!endTime) {
      errors.push("End time is required.");
    } else {
      const parsedEnd = new Date(endTime);

      if (isNaN(parsedEnd.getTime())) {
        errors.push("End time must be a valid date.");
      } else {
        end = parsedEnd;
      }
    }

    // =================================================
    // DATE COMPARISON
    // =================================================

    if (start && end && start >= end) {
      errors.push("Meeting end time must be later than the start time.");
    }

    // =================================================
    // NOTES
    // =================================================

    if (notes !== undefined) {
      if (!Array.isArray(notes)) {
        errors.push("Notes must be an array.");
      } else {
        const invalidNotes = notes.some(
          (note: any) =>
            !note ||
            typeof note.content !== "string" ||
            note.content.trim().length === 0,
        );

        if (invalidNotes) {
          errors.push("Each note must contain a non-empty content field.");
        }
      }
    }

    // =================================================
    // VALIDATION RESPONSE
    // =================================================

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // =================================================
    // MEETING DATA
    // =================================================

    const meetingData = {
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : description,
      meetingLink:
        typeof meetingLink === "string" ? meetingLink.trim() : meetingLink,
      projectId,
      participants: parsedParticipants,
      startTime: start,
      endTime: end,
      notes,
      createdBy: userId,
    };

    // =================================================
    // CREATE
    // =================================================

    const meeting = await meetingService.createMeeting(meetingData, userId);

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully.",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE MEETING
// PUT /api/meetings/:id
// =====================================================

export const updateMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    const {
      title,
      description,
      meetingLink,
      projectId,
      participants,
      startTime,
      endTime,
      notes,
    } = req.body;

    const errors: string[] = [];

    // =================================================
    // TITLE
    // =================================================

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 100
      ) {
        errors.push(
          "Meeting title must be a string between 3 and 100 characters.",
        );
      }
    }

    // =================================================
    // PROJECT
    // =================================================

    if (projectId !== undefined && !isValidObjectId(projectId)) {
      errors.push("Invalid projectId.");
    }

    // =================================================
    // MEETING LINK
    // =================================================

    if (
      meetingLink !== undefined &&
      meetingLink !== null &&
      meetingLink !== ""
    ) {
      if (typeof meetingLink !== "string" || !isValidUrl(meetingLink)) {
        errors.push("Invalid meeting link URL.");
      }
    }

    // =================================================
    // PARTICIPANTS
    // =================================================

    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
        errors.push("Participants must be an array.");
      } else {
        const invalidParticipant = participants.some(
          (participantId: unknown) => !isValidObjectId(participantId),
        );

        if (invalidParticipant) {
          errors.push("One or more participant IDs are invalid MongoDB IDs.");
        }
      }
    }

    // =================================================
    // DATES
    // =================================================

    let start: Date | undefined;
    let end: Date | undefined;

    if (startTime !== undefined) {
      const parsedStart = new Date(startTime);

      if (isNaN(parsedStart.getTime())) {
        errors.push("Start time must be a valid date.");
      } else {
        start = parsedStart;
      }
    }

    if (endTime !== undefined) {
      const parsedEnd = new Date(endTime);

      if (isNaN(parsedEnd.getTime())) {
        errors.push("End time must be a valid date.");
      } else {
        end = parsedEnd;
      }
    }

    if (start && end && start >= end) {
      errors.push("Meeting end time must be later than the start time.");
    }

    // =================================================
    // NOTES
    // =================================================

    if (notes !== undefined) {
      if (!Array.isArray(notes)) {
        errors.push("Notes must be an array.");
      } else {
        const invalidNotes = notes.some(
          (note: any) =>
            !note ||
            typeof note.content !== "string" ||
            note.content.trim().length === 0,
        );

        if (invalidNotes) {
          errors.push("Each note must contain a non-empty content field.");
        }
      }
    }

    // =================================================
    // VALIDATION RESPONSE
    // =================================================

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // =================================================
    // PREPARE UPDATE DATA
    // =================================================

    const updateData: Record<string, any> = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description === "string" ? description.trim() : description;
    }

    if (meetingLink !== undefined) {
      updateData.meetingLink =
        typeof meetingLink === "string" ? meetingLink.trim() : meetingLink;
    }

    if (projectId !== undefined) {
      updateData.projectId = projectId;
    }

    if (participants !== undefined) {
      updateData.participants = participants;
    }

    if (start !== undefined) {
      updateData.startTime = start;
    }

    if (end !== undefined) {
      updateData.endTime = end;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // =================================================
    // UPDATE
    // =================================================

    const updatedMeeting = await meetingService.updateMeeting(
      id,
      updateData,
      userId,
    );

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET PROJECT MEETINGS
// GET /api/meetings/project/:projectId
// =====================================================

export const getProjectMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const projectId = getParam(req.params.projectId);

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid projectId.",
      });
    }

    const meetings = await meetingService.getMeetingsByProject(
      projectId,
      userId,
    );

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET MEETING BY ID
// GET /api/meetings/:id
// =====================================================

export const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    const meeting = await meetingService.getMeetingById(id, userId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE MEETING
// DELETE /api/meetings/:id
// =====================================================

export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    const deleted = await meetingService.deleteMeeting(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ADD MEETING NOTES
// POST /api/meetings/:id/notes
// =====================================================

export const addMeetingNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    const { content } = req.body;

    // =================================================
    // MEETING ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    // =================================================
    // CONTENT
    // =================================================

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    // =================================================
    // ADD NOTE
    // =================================================

    const meeting = await meetingService.addMeetingNotes(
      id,
      content.trim(),
      userId,
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Meeting note added successfully.",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE MEETING NOTES
// PUT /api/meetings/:id/notes
// =====================================================

export const updateMeetingNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    const { noteId, content } = req.body;

    // =================================================
    // MEETING ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    // =================================================
    // NOTE ID
    // =================================================

    if (!noteId || !isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    // =================================================
    // CONTENT
    // =================================================

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    // =================================================
    // UPDATE NOTE
    // =================================================

    const meeting = await meetingService.updateMeetingNotes(
      id,
      noteId,
      content.trim(),
      userId,
    );

    if (meeting === null) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    if (meeting === undefined) {
      return res.status(404).json({
        success: false,
        message: "Meeting note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting note updated successfully.",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// PATCH MEETING NOTES
// PATCH /api/meetings/:id/notes
// =====================================================

export const patchMeetingNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    const { noteId, content } = req.body;

    // =================================================
    // MEETING ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    // =================================================
    // NOTE ID
    // =================================================

    if (!noteId || !isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    // =================================================
    // CONTENT
    // =================================================

    if (
      content !== undefined &&
      (typeof content !== "string" || content.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Note content must be a non-empty string.",
      });
    }

    // =================================================
    // PATCH NOTE
    // =================================================

    const meeting = await meetingService.patchMeetingNotes(
      id,
      noteId,
      content !== undefined ? content.trim() : undefined,
      userId,
    );

    if (meeting === null) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    if (meeting === undefined) {
      return res.status(404).json({
        success: false,
        message: "Meeting note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting note updated successfully.",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// AI SUMMARY
// PATCH /api/meetings/:id/ai-summary
// =====================================================

export const autoSummarizeMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    const { noteId } = req.body;

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    // =================================================
    // GET MEETING
    // =================================================

    const meeting = await meetingService.getMeetingById(id, userId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const meetingData = meeting as any;

    // =================================================
    // CHECK NOTES
    // =================================================

    if (!meetingData.notes || meetingData.notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No meeting notes available to summarize.",
      });
    }

    // =================================================
    // FIND TARGET NOTE
    // =================================================

    let targetNoteIndex = -1;

    if (noteId) {
      if (!isValidObjectId(noteId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID.",
        });
      }

      targetNoteIndex = meetingData.notes.findIndex(
        (note: any) => note._id?.toString() === noteId,
      );
    } else {
      targetNoteIndex = meetingData.notes.length - 1;
    }

    // =================================================
    // VALIDATE TARGET NOTE
    // =================================================

    if (
      targetNoteIndex === -1 ||
      !meetingData.notes[targetNoteIndex]?.content
    ) {
      return res.status(400).json({
        success: false,
        message: "Could not find valid note content to summarize.",
      });
    }

    const rawContent = meetingData.notes[targetNoteIndex].content;

    // =================================================
    // GEMINI SUMMARY
    // =================================================

    const aiSummary = await aiService.generateMeetingSummary(rawContent);

    meetingData.notes[targetNoteIndex].aiGeneratedSummary = aiSummary;

    // =================================================
    // SAVE
    // =================================================

    const updatedMeeting = await meetingService.updateMeeting(
      id,
      {
        notes: meetingData.notes,
      },
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Meeting note summarized successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXTRACT ACTION ITEMS
// PATCH /api/meetings/:id/action-items
// =====================================================

export const extractMeetingActionItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = getParam(req.params.id);

    // =================================================
    // VALIDATE ID
    // =================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    // =================================================
    // GET MEETING
    // =================================================

    const meeting = await meetingService.getMeetingById(id, userId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const meetingData = meeting as any;

    // =================================================
    // CHECK NOTES
    // =================================================

    if (!meetingData.notes || meetingData.notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No meeting notes available to analyze.",
      });
    }

    // =================================================
    // COMBINE NOTES
    // =================================================

    const combinedNotes = meetingData.notes
      .map((note: any) => note.content)
      .filter((content: string) => Boolean(content && content.trim()))
      .join("\n\n---\n\n");

    if (!combinedNotes) {
      return res.status(400).json({
        success: false,
        message: "No valid meeting note content available.",
      });
    }

    // =================================================
    // GEMINI ACTION ITEMS
    // =================================================

    const actionItems = await aiService.generateActionItems(combinedNotes);

    // =================================================
    // SAVE ACTION ITEMS
    // =================================================

    const updatedMeeting = await meetingService.updateMeeting(
      id,
      {
        actionItems,
      },
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Action items extracted successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};
