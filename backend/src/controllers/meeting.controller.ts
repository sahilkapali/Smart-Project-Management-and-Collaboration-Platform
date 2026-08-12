import { Request, Response, NextFunction } from "express";
import * as meetingService from "../services/meeting.service";
import * as aiService from "../services/gemini.service";

// --------------------------------------------------
// Helper: Validate MongoDB ObjectId
// --------------------------------------------------
const isValidObjectId = (id: any): boolean => {
  if (typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// --------------------------------------------------
// Helper: Validate URL
// --------------------------------------------------
const isValidUrl = (urlString: any): boolean => {
  if (typeof urlString !== "string") return false;

  try {
    return Boolean(new URL(urlString));
  } catch {
    return false;
  }
};

// ==================================================
// CREATE MEETING
// POST /api/meetings
// ==================================================
export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    // ------------------------------------------------
    // Validate title
    // ------------------------------------------------
    if (
      !title ||
      typeof title !== "string" ||
      title.length < 3 ||
      title.length > 100
    ) {
      errors.push(
        "Meeting title must be a string between 3 and 100 characters"
      );
    }

    // ------------------------------------------------
    // Validate project ID
    // ------------------------------------------------
    if (!projectId || !isValidObjectId(projectId)) {
      errors.push("Invalid or missing projectId");
    }

    // ------------------------------------------------
    // Validate meeting link
    // ------------------------------------------------
    if (
      meetingLink &&
      typeof meetingLink === "string" &&
      meetingLink.trim() !== ""
    ) {
      if (!isValidUrl(meetingLink)) {
        errors.push("Invalid meeting link URL");
      }
    }

    // ------------------------------------------------
    // Validate participants
    // ------------------------------------------------
    const parsedParticipants = participants || [];

    if (!Array.isArray(parsedParticipants)) {
      errors.push("Participants must be an array");
    } else {
      const allValid = parsedParticipants.every(
        (id: string) => isValidObjectId(id)
      );

      if (!allValid) {
        errors.push(
          "One or more participant IDs are invalid MongoDB IDs"
        );
      }
    }

    // ------------------------------------------------
    // Validate start and end time
    // ------------------------------------------------
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!startTime || isNaN(start.getTime())) {
      errors.push("Start time must be a valid date");
    }

    if (!endTime || isNaN(end.getTime())) {
      errors.push("End time must be a valid date");
    }

    if (
      !isNaN(start.getTime()) &&
      !isNaN(end.getTime()) &&
      start >= end
    ) {
      errors.push(
        "Meeting end time must be later than the start time"
      );
    }

    // ------------------------------------------------
    // Validate notes
    // ------------------------------------------------
    if (notes !== undefined) {
      if (!Array.isArray(notes)) {
        errors.push("Notes must be an array");
      } else {
        const invalidNotes = notes.some(
          (note: any) =>
            !note ||
            typeof note.content !== "string" ||
            note.content.trim().length === 0
        );

        if (invalidNotes) {
          errors.push(
            "Each note must contain a non-empty content field"
          );
        }
      }
    }

    // ------------------------------------------------
    // Return validation errors
    // ------------------------------------------------
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // ------------------------------------------------
    // Get authenticated user
    // ------------------------------------------------
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ------------------------------------------------
    // Prepare meeting data
    // ------------------------------------------------
    const meetingData = {
      title,
      description,
      meetingLink,
      projectId,
      participants: parsedParticipants,
      startTime: start,
      endTime: end,
      notes,
      createdBy: userId,
    };

    // ------------------------------------------------
    // Create meeting
    // ------------------------------------------------
    const meeting = await meetingService.createMeeting(
      meetingData
    );

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// UPDATE MEETING
// PUT /api/meetings/:id
// ==================================================
export const updateMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

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

    // ------------------------------------------------
    // Validate title
    // ------------------------------------------------
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.length < 3 ||
        title.length > 100
      ) {
        errors.push(
          "Meeting title must be a string between 3 and 100 characters"
        );
      }
    }

    // ------------------------------------------------
    // Validate project ID
    // ------------------------------------------------
    if (
      projectId !== undefined &&
      !isValidObjectId(projectId)
    ) {
      errors.push("Invalid projectId");
    }

    // ------------------------------------------------
    // Validate meeting link
    // ------------------------------------------------
    if (
      meetingLink !== undefined &&
      typeof meetingLink === "string" &&
      meetingLink.trim() !== ""
    ) {
      if (!isValidUrl(meetingLink)) {
        errors.push("Invalid meeting link URL");
      }
    }

    // ------------------------------------------------
    // Validate participants
    // ------------------------------------------------
    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
        errors.push("Participants must be an array");
      } else {
        const allValid = participants.every(
          (pid: string) => isValidObjectId(pid)
        );

        if (!allValid) {
          errors.push(
            "One or more participant IDs are invalid MongoDB IDs"
          );
        }
      }
    }

    // ------------------------------------------------
    // Validate dates
    // ------------------------------------------------
    let start: Date | undefined;
    let end: Date | undefined;

    if (startTime !== undefined) {
      start = new Date(startTime);

      if (isNaN(start.getTime())) {
        errors.push("Start time must be a valid date");
      }
    }

    if (endTime !== undefined) {
      end = new Date(endTime);

      if (isNaN(end.getTime())) {
        errors.push("End time must be a valid date");
      }
    }

    if (start && end && start >= end) {
      errors.push(
        "Meeting end time must be later than the start time"
      );
    }

    // ------------------------------------------------
    // Validate notes
    // ------------------------------------------------
    if (notes !== undefined) {
      if (!Array.isArray(notes)) {
        errors.push("Notes must be an array");
      } else {
        const invalidNotes = notes.some(
          (note: any) =>
            !note ||
            typeof note.content !== "string" ||
            note.content.trim().length === 0
        );

        if (invalidNotes) {
          errors.push(
            "Each note must contain a non-empty content field"
          );
        }
      }
    }

    // ------------------------------------------------
    // Return validation errors
    // ------------------------------------------------
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // ------------------------------------------------
    // Update meeting
    // ------------------------------------------------
    const updatedMeeting =
      await meetingService.updateMeeting(
        id as string,
        req.body
      );

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// GET PROJECT MEETINGS
// GET /api/meetings/project/:projectId
// ==================================================
export const getProjectMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid projectId",
      });
    }

    const meetings =
      await meetingService.getMeetingsByProject(
        projectId as string
      );

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// GET MEETING BY ID
// GET /api/meetings/:id
// ==================================================
export const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const meeting =
      await meetingService.getMeetingById(id as string);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
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

// ==================================================
// DELETE MEETING
// DELETE /api/meetings/:id
// ==================================================
export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const deleted =
      await meetingService.deleteMeeting(id as string);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// AI SUMMARY
// PATCH /api/meetings/:id/ai-summary
// ==================================================
export const autoSummarizeMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { noteId } = req.body;

    const meeting =
      await meetingService.getMeetingById(id as string);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const meetingData = meeting as any;

    if (
      !meetingData.notes ||
      meetingData.notes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No meeting notes available to summarize.",
      });
    }

    let targetNoteIndex = -1;

    if (noteId) {
      targetNoteIndex = meetingData.notes.findIndex(
        (note: any) =>
          note._id.toString() === noteId
      );
    } else {
      targetNoteIndex =
        meetingData.notes.length - 1;
    }

    if (
      targetNoteIndex === -1 ||
      !meetingData.notes[targetNoteIndex].content
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Could not find valid note content to summarize.",
      });
    }

    const rawContent =
      meetingData.notes[targetNoteIndex].content;

    const aiSummary =
      await aiService.generateMeetingSummary(
        rawContent
      );

    meetingData.notes[
      targetNoteIndex
    ].aiGeneratedSummary = aiSummary;

    const updatedMeeting =
      await meetingService.updateMeeting(
        id as string,
        {
          notes: meetingData.notes,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Meeting note summarized successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// EXTRACT ACTION ITEMS
// PATCH /api/meetings/:id/action-items
// ==================================================
export const extractMeetingActionItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meeting =
      await meetingService.getMeetingById(id as string);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const meetingData = meeting as any;

    if (
      !meetingData.notes ||
      meetingData.notes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No meeting notes available to analyze.",
      });
    }

    const combinedNotes = meetingData.notes
      .map((note: any) => note.content)
      .filter(
        (content: string) => content
      )
      .join("\n\n---\n\n");

    const actionItems =
      await aiService.extractActionItems(
        combinedNotes
      );

    const updatedMeeting =
      await meetingService.updateMeeting(
        id as string,
        {
          actionItems,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Action items extracted successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};