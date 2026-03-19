const Report = require("../models/Report");
const Job = require("../models/Job");

exports.submitReport = async (req, res) => {
  try {

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Invalid submission" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your assigned job" });
    }

    if (job.reportStatus === "SUBMITTED") {
      return res.status(400).json({ message: "Report already submitted" });
    }

    // Get form data
    let formData = req.body;

    // Process uploaded images
    const photos = req.files.map((file, index) => ({
      filename: file.filename,
      path: file.path,
      type: req.body.photoType ? req.body.photoType[index] : null,
      description: req.body.photoDescription ? req.body.photoDescription[index] : null
    }));

    // Attach photos
    formData.photos = photos;

    const report = await Report.create({
      jobId,
      formData
    });

    // Update job status (FIXED)
    await Job.findByIdAndUpdate(jobId, {
      reportStatus: "SUBMITTED",
      siteVisitStatus: "VISITED"
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// exports.getSubmittedReports = async (req, res) => {

//   const reports = await Report.find({ adminStatus: "PENDING" })
//     .populate({
//       path: "jobId",
//       populate: {
//         path: "assignedTo",
//         select: "name"
//       }
//     })
//     .sort({ createdAt: -1 });

//   res.json({ reports });
// };
exports.getSubmittedReports = async (req, res) => {
  try {

    const { status, city, engineerId } = req.query; 
    let filter = {};

    // Filter by status only
    if (status && status !== "ALL") {
      filter.adminStatus = status.toUpperCase();
    }

    const reports = await Report.find(filter)
      .populate({
        path: "jobId",
        populate: {
          path: "assignedTo",
          select: "name location"
        }
      })
      .sort({ createdAt: -1 });

    // Apply city & engineer filter safely
    const filteredReports = reports.filter(report => {

      const engineer = report.jobId?.assignedTo;
      if (!engineer) return false;

      // Only filter city if NOT ALL
      if (city && city !== "ALL") {
        if (engineer.location !== city) return false;
      }

      // Only filter engineer if NOT ALL
      if (engineerId && engineerId !== "ALL") {
        if (engineer._id.toString() !== engineerId) return false;
      }

      return true;
    });

    res.json({ reports: filteredReports });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.adminAction = async (req, res) => {

  const { status } = req.body;
  const reportId = req.params.id;

  if (!["APPROVED", "REJECTED"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

  const report = await Report.findById(reportId);

  if (!report)
      return res.status(404).json({ message: "Report not found" });

  report.adminStatus = status;
  report.reviewedBy = req.user.id;

  await report.save();

  res.json({ message: `Report ${status} successfully` });
};

const mongoose = require("mongoose");

exports.getSingleReport = async (req, res) => {

  const reportId = req.params.id;
  console.log(reportId)
  // 🔴 Prevent crash if id is null or invalid
  if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ message: "Invalid report ID" });
  }

  const report = await Report.findById(reportId)
      .populate("jobId");

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json({ report });
};
exports.getReportByJobId = async (req, res) => {
  try {

    const { jobId } = req.params;
    console.log("HIT JOB ROUTE",req.params.jobId)

    const report = await Report.findOne({ jobId });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ report });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getApprovedReportsForSuperAdmin = async (req, res) => {
  try {

    const { status, city, adminId } = req.query;
    // console.log("Query:", req.query);

    // STEP 1 — Build base query
    let query = {};

    if (status && status !== "ALL") {
      query.adminStatus = status;
    } else {
      query.adminStatus = { $in: ["PENDING", "APPROVED", "REJECTED"] };
    }
    // STEP 2 — Fetch reports
    let reports = await Report.find(query)
      .populate({
        path: "jobId",
        populate: {
          path: "assignedTo",
          select: "name location"
        }
      })
      .populate("reviewedBy", "name location")
      .sort({ createdAt: -1 });

    // STEP 3 — Apply city & admin filters
    reports = reports.filter(report => {

      const admin = report.reviewedBy;
      if (!admin) return false;

      // CITY FILTER
      if (city && city !== "ALL") {
        if (
          admin.location?.toLowerCase() !== city.toLowerCase()
        ) return false;
      }

      // ADMIN FILTER
      if (adminId && adminId !== "ALL") {
        if (admin._id.toString() !== adminId)
          return false;
      }

      return true;
    });

    res.json({ reports });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};