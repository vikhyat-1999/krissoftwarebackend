const Job = require("../models/Job");
const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notfication");
exports.createJob = async (req, res) => {
  try {

    const {
      leadId,
      applicantName,
      mobile,
      siteAddressTechnical,
      siteAddressDocument,
      siteAddressSite,
      bankName,
      initiatedByBank
    } = req.body;

    const job = await Job.create({
      leadId,
      applicantName,
      mobile,
      siteAddressTechnical,
      siteAddressDocument,
      siteAddressSite,
      bankName,
      initiatedByBank,

      createdBy: req.user.id,

      // 👇 DO NOT assign here
      assignedTo: null,
      assignedDate: null
    });

    res.json(job);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdminJobs = async (req, res) => {
  try {

    const jobs = await Job.find({
      createdBy: req.user.id
    }).populate("assignedTo", "name");

    const jobIds = jobs.map(job => job._id);

    const reports = await Report.find({
      jobId: { $in: jobIds }
    });

    const jobsWithReports = jobs.map(job => {
      const report = reports.find(
        r => r.jobId.toString() === job._id.toString()
      );

      return {
        ...job.toObject(),
        reportId: report ? report._id : null
      };
    });

    res.json({ jobs: jobsWithReports });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      assignedTo: req.user.id
    })
    .populate("assignedTo", "name")
    .lean(); // 👈 IMPORTANT (so we can modify objects)

    // 👉 Step 1: collect job IDs
    const jobIds = jobs.map(job => job._id);

    // 👉 Step 2: fetch reports for these jobs
    const reports = await Report.find({
      jobId: { $in: jobIds }
    }).select("_id jobId").lean();

    // 👉 Step 3: create map
    const reportMap = {};
    reports.forEach(report => {
      reportMap[report.jobId.toString()] = report._id.toString();
    });

    // 👉 Step 4: attach reportId to each job
    const finalJobs = jobs.map(job => ({
      ...job,
      reportId: reportMap[job._id.toString()] || null
    }));

    res.json(finalJobs);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getJobById = async (req, res) => {

  try {

    const job = await Job.findById(req.params.id)
      .populate("assignedTo", "name");

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    res.json({ job });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};
exports.assignJobToEngineer = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { engineerId } = req.body;

    if (!engineerId) {
      return res.status(400).json({ message: "Engineer ID is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found" });
    }

    if (engineer.role !== "ENGINEER") {
      return res.status(400).json({
        message: "Selected user is not an engineer"
      });
    }

    // 🔥 Detect reassignment
    const isReassignment =
      job.assignedTo && job.assignedTo.toString() !== engineerId;

    // ---------- Assign ----------
    job.assignedTo = engineerId;
    job.assignedDate = new Date();

    await job.save();

    // 🔥 IMPORTANT: Don't re-query (this was causing crash)
    job.assignedTo = {
      _id: engineer._id,
      name: engineer.name
    };

    return res.status(200).json({
      message: isReassignment
        ? "Engineer reassigned successfully"
        : "Engineer assigned successfully",
      job
    });

  } catch (error) {
    console.error("❌ Assign/Reassign error:", error);

    return res.status(500).json({
      message: "Assignment failed internally"
    });
  }
};
exports.getAllJobsForSuperAdmin = async (req, res) => {
  try {
    // 🔥 NO FILTER → fetch all jobs
    const jobs = await Job.find()
      .populate("assignedTo", "name");

    const jobIds = jobs.map(job => job._id);

    const reports = await Report.find({
      jobId: { $in: jobIds }
    });

    const jobsWithReports = jobs.map(job => {
      const report = reports.find(
        r => r.jobId.toString() === job._id.toString()
      );

      return {
        ...job.toObject(),
        reportId: report ? report._id : null
      };
    });

    res.json({ jobs: jobsWithReports });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
