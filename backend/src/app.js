import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import logger from "./utils/logger";
import "dotenv/config";
import routes from "./api/routes";
import responseHandler from "./utils/response.handler";
import { connect } from "./utils/database.connection";
import mongoSanitize from "express-mongo-sanitize";  
import xssClean from "xss-clean";
import passport from "./configs/passport.js";  

const app = express();
const PORT = process.env.PORT || "8090";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Disable 'X-Powered-By: Express' header
app.disable("x-powered-by");

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
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Sanitize incoming data to prevent NoSQL Injection
app.use(mongoSanitize());

// Sanitize input to prevent XSS
app.use(xssClean());

app.use(express.json({limit : "500kb"})); // limit JSON body to 500KB to prevent DoS
app.use(express.urlencoded({ extended: true,limit : "500kb" })); // limit URL-encoded body to 500KB to prevent DoS

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

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
