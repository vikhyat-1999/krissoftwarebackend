const Job = require("../models/Job");
const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notfication");
exports.createJob = async (req, res) => {

try {

const { leadId, applicantName, assignedTo } = req.body;

if (!leadId || !applicantName || !assignedTo) {
return res.status(400).json({ message: "All fields are required" });
}

const engineer = await User.findById(assignedTo);

if (!engineer || engineer.role !== "ENGINEER") {
return res.status(400).json({ message: "Invalid engineer selected" });
}

const existingJob = await Job.findOne({ leadId });

if (existingJob) {
return res.status(400).json({ message: "Lead ID already exists" });
}

const job = await Job.create({

leadId,
applicantName,
assignedTo,
createdBy: req.user.id,
assignedDate: new Date(),
siteVisitStatus: "PENDING",
reportStatus: "NOT_SUBMITTED"

});

await Notification.create({

user: assignedTo,
title: "New Job Assigned",
message: `You have been assigned new job ${leadId}`,
type: "JOB_ASSIGNED"

});

res.status(201).json({
message: "Job assigned successfully",
job
});

}
catch (error) {

console.error(error);

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
