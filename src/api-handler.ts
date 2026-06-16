import { fromNodeMiddleware } from "h3";
import app from "../server/src/app.js";

export default fromNodeMiddleware(app);
