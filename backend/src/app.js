import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger";
import "dotenv/config";
import routes from "./api/routes";
import responseHandler from "./utils/response.handler";
import { connect } from "./utils/database.connection";

const app = express();
const PORT = process.env.PORT || "8090";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Register Middleware Chain
app.use(limiter);
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Content Security Policy (CSP) misconfiguration by defining strict rules
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],              // Allow resources only from the same origin
      scriptSrc: ["'self'"],               // Restrict scripts to local server only
      styleSrc: ["'self'"],                // Restrict stylesheets to local server only
      imgSrc: ["'self'", "data:"],         // Allow images from local server and inline data URIs
      fontSrc: ["'self'"],                 // Restrict fonts to local server only
      connectSrc: ["'self'", "http://localhost:5000"], // Allow API requests to backend
      frameAncestors: ["'none'"],          // Prevent clickjacking by blocking framing
      objectSrc: ["'none'"],               // Disallow plugins/objects like Flash or Java
    }
  })
);

// Inject Response Handler
app.use((req, res, next) => {
  req.handleResponse = responseHandler;
  next();
});

//Handle Root API Call
app.get("/", (req, res, next) => {
  res.send(
    "<title>Password strength and Breach Analysis System</title><h1>Welcome to Password strength and Breach Analysis System</h1>"
  );
  next();
});

//Start the Server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  connect();
  routes(app);
});
