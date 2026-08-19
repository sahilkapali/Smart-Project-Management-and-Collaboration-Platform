import dotenv from "dotenv";
import { prioritizeProjectTasks } from "./services/gemini.service";

dotenv.config();

const test = async () => {
  const tasksContext = `
TASK 1

Task ID:
111111111111111111111111

Title:
Fix critical authentication bug

Description:
Users are currently unable to log in. This is blocking access to the entire application.

Status:
In Progress

Current Priority:
Medium

Due Date:
2026-08-19T00:00:00.000Z

Days Until Due:
1

Overdue:
NO

Assigned:
YES

------------------------------

TASK 2

Task ID:
222222222222222222222222

Title:
Update dashboard colors

Description:
Improve the visual appearance of the dashboard.

Status:
Todo

Current Priority:
Medium

Due Date:
2026-08-30T00:00:00.000Z

Days Until Due:
12

Overdue:
NO

Assigned:
YES

------------------------------

TASK 3

Task ID:
333333333333333333333333

Title:
Prepare project documentation

Description:
Write general documentation for the project.

Status:
Todo

Current Priority:
Low

Due Date:
No due date

Days Until Due:
No due date

Overdue:
NO

Assigned:
NO
`;

  try {
    console.log("======================================");
    console.log("TESTING AI TASK PRIORITIZATION");
    console.log("======================================");

    const results = await prioritizeProjectTasks(tasksContext);

    console.log("\nGemini prioritization result:\n");

    console.log(JSON.stringify(results, null, 2));

    console.log("\n======================================");
    console.log("TEST PASSED");
    console.log("======================================");
  } catch (error) {
    console.error("\n======================================");
    console.error("TEST FAILED");
    console.error("======================================");

    console.error(error);
  }
};

test();