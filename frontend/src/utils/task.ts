import type { TaskUser, TaskCommentUser } from "../types/task.types";

export const getTaskUserName = (
  user?: string | TaskUser | TaskCommentUser | null,
): string => {
  if (!user) {
    return "Unassigned";
  }

  if (typeof user === "string") {
    return user;
  }

  if (user.name) {
    return user.name;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.email || "Unknown User";
};
