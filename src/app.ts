import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { issueRouter } from "./modules/issues/issue.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Express Server is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
// app.use("/api/users");

// Global Error Handling Middleware (it should stay at the bottom of the middleware stack)
app.use(globalErrorHandler);
export default app;
