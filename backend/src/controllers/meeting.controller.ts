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
  if (typeof urlString !== "string" || !urlString.trim()) {
    return false;
  }

  try {
    const url = new URL(urlString);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getAuthenticatedUserId = (req: Request): string | null => {
  const userId = req.user?.id;

  if (!userId) {
    return null;
  }

  return String(userId);
};

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
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100
    ) {
      errors.push("Meeting title must be between 3 and 100 characters.");
    }

    // =================================================
    // PROJECT
    // =================================================

    if (!projectId || !isValidObjectId(projectId)) {
      errors.push("Invalid or missing projectId.");
    }

    // =================================================
    // DESCRIPTION
    // =================================================

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      errors.push("Description must be a string.");
    }

    // =================================================
    // MEETING LINK
    // =================================================

    if (
      meetingLink !== undefined &&
      meetingLink !== null &&
      meetingLink !== ""
    ) {
      if (!isValidUrl(meetingLink)) {
        errors.push("Invalid meeting link URL.");
      }
    }

    // =================================================
    // PARTICIPANTS
    // =================================================

    const parsedParticipants = participants ?? [];

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

      if (Number.isNaN(parsedStart.getTime())) {
        errors.push("Start time must be a valid date.");
      } else {
        start = parsedStart;
      }
    }

    // =================================================
    // END TIME
    // =================================================

    let end: Date | undefined;

    if (endTime) {
      const parsedEnd = new Date(endTime);

      if (Number.isNaN(parsedEnd.getTime())) {
        errors.push("End time must be a valid date.");
      } else {
        end = parsedEnd;
      }
    }

    // =================================================
    // DATE VALIDATION
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
            !note || typeof note.content !== "string" || !note.content.trim(),
        );

        if (invalidNotes) {
          errors.push("Each note must contain non-empty content.");
        }
      }
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // =================================================
    // CREATE DATA
    // =================================================

    const meetingData = {
      title: title.trim(),

      description:
        typeof description === "string" ? description.trim() : undefined,

      meetingLink:
        typeof meetingLink === "string" ? meetingLink.trim() : undefined,

      projectId,

      participants: parsedParticipants,

      startTime: start,

      endTime: end,

      notes: Array.isArray(notes)
        ? notes.map((note: any) => ({
            content: note.content.trim(),
          }))
        : [],
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

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 100)
    ) {
      errors.push("Meeting title must be between 3 and 100 characters.");
    }

    // =================================================
    // PROJECT
    // =================================================

    if (projectId !== undefined && !isValidObjectId(projectId)) {
      errors.push("Invalid projectId.");
    }

    // =================================================
    // LINK
    // =================================================

    if (
      meetingLink !== undefined &&
      meetingLink !== null &&
      meetingLink !== ""
    ) {
      if (!isValidUrl(meetingLink)) {
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

      if (Number.isNaN(parsedStart.getTime())) {
        errors.push("Start time must be a valid date.");
      } else {
        start = parsedStart;
      }
    }

    if (endTime !== undefined) {
      const parsedEnd = new Date(endTime);

      if (Number.isNaN(parsedEnd.getTime())) {
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
            !note || typeof note.content !== "string" || !note.content.trim(),
        );

        if (invalidNotes) {
          errors.push("Each note must contain non-empty content.");
        }
      }
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // =================================================
    // UPDATE DATA
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
      updateData.participants = [...new Set(participants.map(String))];
    }

    if (start !== undefined) {
      updateData.startTime = start;
    }

    if (end !== undefined) {
      updateData.endTime = end;
    }

    if (notes !== undefined) {
      updateData.notes = notes.map((note: any) => ({
        _id: note._id,
        content: note.content.trim(),
        aiGeneratedSummary: note.aiGeneratedSummary || "",
      }));
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
// ADD MEETING NOTE
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

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
// UPDATE MEETING NOTE
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

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
// PATCH MEETING NOTE
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID.",
      });
    }

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    if (
      content !== undefined &&
      (typeof content !== "string" || !content.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Note content must be a non-empty string.",
      });
    }

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

    const notes = meeting.notes || [];

    if (notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No meeting notes available to summarize.",
      });
    }

    let targetIndex = notes.length - 1;

    if (noteId) {
      if (!isValidObjectId(noteId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID.",
        });
      }

      targetIndex = notes.findIndex(
        (note: any) => note._id?.toString() === noteId,
      );
    }

    if (targetIndex === -1 || !notes[targetIndex]?.content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not find valid note content to summarize.",
      });
    }

    const rawContent = notes[targetIndex].content;

    const aiSummary = await aiService.generateMeetingSummary(rawContent);

    notes[targetIndex].aiGeneratedSummary = aiSummary;

    const updatedMeeting = await meetingService.updateMeeting(
      id,
      {
        notes,
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

    // =================================================
    // CHECK NOTES
    // =================================================

    const notes = Array.isArray(meeting.notes) ? meeting.notes : [];

    if (notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No meeting notes available to analyze.",
      });
    }

    // =================================================
    // COMBINE NOTES
    // =================================================

    const combinedNotes = notes
      .map((note: any) => {
        if (note && typeof note.content === "string") {
          return note.content.trim();
        }

        return "";
      })
      .filter((content: string) => Boolean(content))
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

    const actionItemsText = await aiService.generateActionItems(combinedNotes);

    // Split the text block into an array, trim, and remove empty lines
    const actionItemsArray = actionItemsText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // =================================================
    // SAVE ACTION ITEMS
    // =================================================

    const updatedMeeting = await meetingService.updateMeeting(
      id,
      {
        actionItems: actionItemsArray,
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
