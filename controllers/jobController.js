const Job = require("../models/Job");
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
    })
    .populate("assignedTo", "name");

    res.json({
      jobs
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
exports.getMyJobs = async (req, res) => {
  try {

    const jobs = await Job.find({
    assignedTo: req.user.id
    }).populate("assignedTo", "name");

    res.json(jobs);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
