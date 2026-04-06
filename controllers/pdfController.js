const PDFDocument = require("pdfkit");
const Report = require("../models/Report");

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

    // ---------- Helper: Format labels ----------
    const formatLabel = (key) => {
      return key
        .replace(/_/g, " ")
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // ---------- Helper: Recursive printer ----------
    const printObject = (obj, indent = 0) => {
      Object.keys(obj || {}).forEach((key) => {
        let value = obj[key];

        // Handle nested object
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          doc.moveDown(0.3);
          doc
            .fontSize(11)
            .text(`${" ".repeat(indent)}${formatLabel(key)}:`, {
              continued: false,
            });

          printObject(value, indent + 4);
        }
        // Handle array
        else if (Array.isArray(value)) {
          doc
            .fontSize(11)
            .text(
              `${" ".repeat(indent)}${formatLabel(key)}: ${
                value.length ? value.join(", ") : "N/A"
              }`
            );
        }
        // Handle normal values
        else {
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

    // ---------- Top Summary (important fields) ----------
    const applicant = report.formData?.applicantDetails || {};

    doc.fontSize(12).text(`Applicant Name: ${applicant.applicantName || "N/A"}`);
    doc.text(`Engineer: ${applicant.site_engineer_name || "N/A"}`);
    doc.text(`Bank: ${applicant.bankName || "N/A"}`);
    doc.text(`Branch: ${applicant.branchName || "N/A"}`);
    doc.text(`Location: ${applicant.siteLocation || "N/A"}`);
    doc.text(`Date: ${new Date(report.createdAt).toDateString()}`);

    doc.moveDown();

    // ---------- Loop through all sections ----------
    const formData = report.formData || {};

    Object.keys(formData).forEach((section) => {
      doc.moveDown();

      // Section Title
      doc
        .fontSize(14)
        .text(formatLabel(section), { underline: true });

      doc.moveDown(0.5);

      printObject(formData[section]);
    });

    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
