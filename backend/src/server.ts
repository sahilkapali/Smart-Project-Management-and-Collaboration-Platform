import express,{Request,Response,NextFunction} from "express";
import "dotenv/config"
import { connectDatabase } from "./config/db";

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI ?? "";

const app = express();
connectDatabase(DB_URI);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "server is running",
  });
});

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});