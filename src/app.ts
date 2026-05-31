import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Express Server is running!");
});

export default app;
