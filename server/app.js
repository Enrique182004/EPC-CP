const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctors");
const profile = require("./routes/profile");
const documentRoutes = require("./routes/documents");
const workflowRoutes = require("./routes/workflow");
const alertRoutes = require("./routes/alerts");
const calendarRoutes = require("./routes/calendar");
const tdiRoutes = require("./routes/tdi");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (protected in real app, served directly here for simplicity)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/doctors", doctorRoutes);

// Doctor profile sub-resources
app.use("/api/doctors/:id/professional-ids", profile.professionalIds);
app.use("/api/doctors/:id/education", profile.education);
app.use("/api/doctors/:id/specialties", profile.specialties);
app.use("/api/doctors/:id/practice-locations", profile.practiceLocations);
app.use("/api/doctors/:id/hospital-affiliations", profile.hospitalAffiliations);
app.use(
  "/api/doctors/:id/credentialing-contacts",
  profile.credentialingContacts,
);
app.use("/api/doctors/:id/liability-insurance", profile.liabilityInsurance);
app.use("/api/doctors/:id/employment-history", profile.employmentHistory);
app.use(
  "/api/doctors/:id/professional-references",
  profile.professionalReferences,
);
app.use("/api/doctors/:id/disclosures", profile.disclosures);
app.use("/api/doctors/:id/documents", documentRoutes);
app.use("/api/doctors/:id/workflow", workflowRoutes);
app.use("/api/doctors/:id/tdi", tdiRoutes);

app.use("/api/alerts", alertRoutes);
app.use("/api/calendar", calendarRoutes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuild));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
