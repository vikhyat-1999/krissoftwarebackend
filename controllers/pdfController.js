const PDFDocument = require("pdfkit");
const Report = require("../models/Report");
const path = require("path");
const fs = require("fs");

exports.downloadReportPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${report._id}.pdf`
    );

    doc.pipe(res);

    // ---------- Helper: Format label ----------
    const formatLabel = (key) => {
      return key
        .replace(/_/g, " ")
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // ---------- Helper: Recursive print ----------
    const printObject = (obj, indent = 0) => {
      Object.keys(obj || {}).forEach((key) => {
        if (key === "photos") return;

        let value = obj[key];

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          doc.moveDown(0.3);
          doc.fontSize(11).text(`${" ".repeat(indent)}${formatLabel(key)}:`);
          printObject(value, indent + 4);
        } else if (Array.isArray(value)) {
          doc
            .fontSize(11)
            .text(
              `${" ".repeat(indent)}${formatLabel(key)}: ${
                value.length ? value.join(", ") : "N/A"
              }`
            );
        } else {
          doc
            .fontSize(11)
            .text(
              `${" ".repeat(indent)}${formatLabel(key)}: ${
                value || "N/A"
              }`
            );
        }
      });
    };

    // ---------- Title ----------
    doc
      .fontSize(18)
      .text("Report Details", { align: "center", underline: true });

    doc.moveDown();

    // ---------- Summary ----------
    const applicant = report.formData?.applicantDetails || {};

    doc.fontSize(12).text(`Applicant Name: ${applicant.applicantName || "N/A"}`);
    doc.text(`Engineer: ${applicant.site_engineer_name || "N/A"}`);
    doc.text(`Bank: ${applicant.bankName || "N/A"}`);
    doc.text(`Branch: ${applicant.branchName || "N/A"}`);
    doc.text(`Location: ${applicant.siteLocation || "N/A"}`);
    doc.text(`Date: ${new Date(report.createdAt).toDateString()}`);

    doc.moveDown();

    // ---------- All Sections ----------
    const formData = report.formData || {};

    Object.keys(formData).forEach((section) => {
      if (section === "photos") return;

      doc.moveDown();

      doc
        .fontSize(14)
        .text(formatLabel(section), { underline: true });

      doc.moveDown(0.5);

      printObject(formData[section]);
    });

    // ---------- PHOTOS ----------
    const photos = report.formData?.photos || [];

    if (photos.length > 0) {
      doc.addPage();
      doc.fontSize(16).text("Photos", { underline: true });

      photos.forEach((photo, index) => {
        try {
          // 🔥 Fix Windows → Linux path issue
          const fixedPath = photo.path.replace(/\\/g, "/");
          const imagePath = path.resolve(fixedPath);

          console.log("Trying image:", imagePath);

          if (!fs.existsSync(imagePath)) {
            console.log("❌ File not found:", imagePath);
            return;
          }

          doc.moveDown();

          doc.fontSize(12).text(`Photo ${index + 1}`);
          doc.text(`Type: ${photo.type || "N/A"}`);
          doc.text(`Description: ${photo.description || "N/A"}`);

          doc.moveDown(0.5);

          doc.image(imagePath, {
            fit: [300, 300],
            align: "center",
          });

          doc.moveDown();

        } catch (err) {
          console.log("Image error:", err.message);
        }
      });
    }

    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
