import express,{Request,Response,NextFunction} from "express";
import "dotenv/config"
import { connectDatabase } from "./config/db";
import meetingRouter from './routes/meeting.routes';
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI ?? "";

const app = express();
connectDatabase(DB_URI);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "server is running",
  });
});


app.use('/api/meetings', meetingRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboards', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});


