const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Report = require("../models/Report");

function getChromePath() {
  const base = path.join(process.cwd(), ".local-chromium", "chrome");

  if (!fs.existsSync(base)) {
    return null;
  }

  const folder = fs.readdirSync(base).find(f => f.startsWith("linux-"));
  if (!folder) return null;

  return path.join(base, folder, "chrome-linux64", "chrome");
}

exports.downloadReportPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const d = report.formData || {};
    const baseURL = "https://krissoftwarebackend.onrender.com";

    const floorKeys = Object.keys(d.Unitdetails || {}).filter(key =>
      key.toLowerCase().includes("floor") &&
      !key.toLowerCase().includes("approved") &&
      !key.toLowerCase().includes("proposed") &&
      !key.toLowerCase().includes("at_site")
    );

    const html = `
    <html>
    <head>
      <style>
      body {
  font-family: Arial, sans-serif;
  font-size: 12px; /* 🔥 smaller = professional */
  margin: 15px;
}

h2 {
  text-align: center;
  font-size: 14px;
  margin-bottom: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  table-layout: fixed; /* 🔥 VERY IMPORTANT */
}

td, th {
  border: 1px solid #000;
  padding: 4px;
  vertical-align: top;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
  td {
  line-height: 1.2;
  }

th {
  font-size: 12px;
  background: #f2f2f2;
}

.section {
  background: #d9d9d9;
  font-weight: bold;
  text-align: center;
}

/* 🔥 FIX LABEL WIDTH */

/* 🔥 prevent ugly wrapping */
.nowrap {
  white-space: nowrap;
}

/* 🔥 allow long text but controlled */
.wrap {
  word-break: break-word;
}

/* 🔥 address full width */
.full-width {
  word-break: break-word;
}

/* 🔥 photos */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.photo-grid img {
  width: 140px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #000;
}
  .report-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
}

.report-table td {
  border: 1px solid #000;
  padding: 5px;
  vertical-align: middle;
  word-wrap: break-word;
}

.section-title {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  padding: 6px;
}

.label {
  font-weight: bold;
  width: 20%;
}

.value {
  width: 30%;
}
.tall-row td {
  padding: 12px 6px;
  line-height: 1.4;
}
  .report-table + .report-table {
  margin-top: -1px;
}
  .remarks-cell {
  line-height: 1.4;
  padding: 8px 6px;
  vertical-align: top;
}
  .final-section .label {
  width: 25%;
}

.final-section .value {
  width: 75%;
}
      </style>
    </head>

    <body>

    <h2>PROPERTY VALUATION REPORT</h2>

    <!-- ================= BASIC DETAILS ================= -->

    <table>
      <tr>
        <td class="label">Branch</td>
        <td class="value">${d?.applicantDetails?.branchName || ""}</td>
        <td class="label">Report Date</td>
        <td class="value">${report?.createdAt || ""}</td>
      </tr>

      <tr>
        <td class="label">Application Number</td>
        <td class="value">${d?.applicantDetails?.leadId || ""}</td>
        <td class="label">Date of Visit</td>
        <td class="value">${report?.createdAt || ""}</td>
      </tr>

      <tr>
        <td class="label">Applicant Name</td>
        <td class="value">${d?.applicantDetails?.applicantName || ""}</td>
        <td class="label">Visited by</td>
        <td class="value">${d?.applicantDetails?.site_engineer_name || ""}</td>
      </tr>

      <tr>
        <td class="label">Product Type</td>
        <td class="value">${d?.applicantDetails.casetype || ""}</td>
        <td class="label">Property Type</td>
        <td class="value">${d?.applicantDetails.propertyType || ""}</td>
      </tr>

      <tr>
        <td class="label">Bank</td>
        <td class="value">${d?.applicantDetails?.bankName || ""}</td>
        <td class="label">Vendor Name</td>
        <td colspan="3">Krishna Group of Architect</td>
        
      </tr>

      <tr>
        <td colspan="2" class="label">Property address as per site</td>
        <td colspan="2" class="label">Property address as per document</td>
      </tr>

      <tr>
        <td colspan="2" class="full-width value">
          ${d?.applicantDetails.site_address_as_per_site || ""}
        </td>
        <td colspan="2" class="full-width value">
          ${d?.applicantDetails.site_address_as_per_document || ""}
        </td>
      </tr>

    </table>

    <!-- ================= PROPERTY DETAILS ================= -->
    <table class="report-table">
  <tr>
    <td colspan="6" class="section-title">Property & Surrounding details</td>
  </tr>

  <!-- Row 1 -->
  <tr>
    <td class="label">House/Flat/Premises No.</td>
    <td class="value"></td>
    <td class="label">Floor No.</td>
    <td class="value"></td>
    <td class="label">Wing Name/No.</td>
    <td class="value"></td>
  </tr>

  <!-- Row 2 -->
  <tr class="tall-row">
    <td class="label">Colony/Project Name</td>
    <td class="value"></td>
    <td class="label">Plot/Property/DAG No.</td>
    <td class="value"></td>
    <td class="label">Khasra/Survey No.</td>
    <td class="value"></td>
  </tr>

  <!-- Row 3 -->
  <tr>
    <td class="label">Gali No./Road Name</td>
    <td class="value"></td>
    <td class="label">Sector/Phase/Ward</td>
    <td class="value"></td>
    <td class="label">Landmark</td>
    <td class="value"></td>
  </tr>

  <!-- Row 4 -->
  <tr>
    <td class="label">Village/Location</td>
    <td class="value"></td>
    <td class="label">Mauza/Police Station</td>
    <td class="value"></td>
    <td class="label">City/Tehsil/Taluka/Town</td>
    <td class="value"&nbsp></td>
  </tr>

  <!-- Row 5 -->
  <tr>
    <td class="label">District</td>
    <td class="value"></td>
    <td class="label">State</td>
    <td class="value"></td>
  </tr>

  <!-- Row 6 -->
  <tr>
    <td class="label">Street Name & No</td>
    <td class="value" colspan="3"></td>
    <td class="label">Pincode</td>
    <td class="value"></td>
  </tr>

  <!-- Row 7 -->
  <tr>
    <td class="label" colspan="2">Distance from Nearest DMI branch (Km)</td>
    <td class="value"></td>
    <td class="label" colspan="2">Distance from Nearest city centre (Km)</td>
    <td class="value"></td>
  </tr>
</table>
<table class="report-table">

  <!-- SECTION TITLE -->
  <tr>
    <td colspan="6" class="section-title">
      List of Documents and person details met at site
    </td>
  </tr>

  <!-- ROW 1 -->
  <tr>
    <td class="label" colspan="2">List of Documents submitted</td>
    <td class="value" colspan="4"></td>
  </tr>

  <!-- ROW 2 -->
  <tr>
    <td class="label" colspan="2">Property owner as per documents</td>
    <td class="value" colspan="1"></td>

    <td class="label" colspan="2">Is it self occupied property by Applicant</td>
    <td class="value"></td>
  </tr>

  <!-- ROW 3 -->
  <tr>
    <td class="label" colspan="2">Name of person met</td>
    <td class="value"></td>

    <td class="label" colspan="2">If No, who owns the property</td>
    <td class="value"></td>
  </tr>

  <!-- ROW 4 -->
  <tr>
    <td class="label" colspan="2">Contact no. of person met</td>
    <td class="value"></td>

    <td class="label" colspan="2">Relation with applicant</td>
    <td class="value"></td>
  </tr>

  <!-- ROW 5 -->
  <tr>
    <td class="label" colspan="2">Contact no. of Applicant</td>
    <td class="value" colspan="4"></td>
  </tr>

</table>


<!-- DOCUMENT TABLE (separate but visually continuous) -->

<table class="report-table" style="margin-top: -8px;">

  <!-- HEADER -->
  <tr>
    <td class="label">Document Name</td>
    <td class="label">Received Type</td>
    <td class="label">Received Status</td>
    <td class="label">Document Ref Number</td>
    <td class="label">Document Date</td>
  </tr>

  <!-- DATA ROW -->
  <tr class="tall-row">
    <td class="value" &nbsp></td>
    <td class="value" &nbsp></td>
    <td class="value" &nbsp></td>
    <td class="value" &nbsp></td>
    <td class="value" &nbsp></td>
  </tr>

</table>

    <!-- ================= PHYSICAL ================= -->
    <table>
      <tr><td colspan="2" class="section">PHYSICAL DETAILS</td></tr>
      <tr><td class="label">Meter Installed</td><td>${d?.Physicaldetails?.meter_installed || ""}</td></tr>
      <tr><td class="label">Meter No</td><td>${d?.Physicaldetails?.["meter_sr_no."] || ""}</td></tr>
      <tr><td class="label">Bill Date</td><td>${d?.Physicaldetails?.billDate || ""}</td></tr>
      <tr><td class="label">Land Area (Site)</td><td>${d?.Physicaldetails?.land_area_as_per_site || ""}</td></tr>
    </table>

    <!-- ================= FLOOR DETAILS ================= -->
    <table>
      <tr><td colspan="6" class="section">FLOOR DETAILS</td></tr>

      <tr>
        <th>Floor</th>
        <th>Roof</th>
        <th>Rooms</th>
        <th>Kitchen</th>
        <th>Toilet</th>
        <th>Area</th>
      </tr>

      ${
        floorKeys.map(key => {
          const f = d.Unitdetails[key] || {};
          return `
            <tr>
              <td>${key.replace(/_/g, " ")}</td>
              <td>${f.type_of_roof || ""}</td>
              <td>${Array.isArray(f.rooms) ? f.rooms.join(", ") : f.rooms || ""}</td>
              <td>${Array.isArray(f.kitchen) ? f.kitchen.join(", ") : f.kitchen || ""}</td>
              <td>${Array.isArray(f.toilet) ? f.toilet.join(", ") : f.toilet || ""}</td>
              <td>${Array.isArray(f.Area_sqft) ? f.Area_sqft.join(", ") : f.Area_sqft || ""}</td>
            </tr>
          `;
        }).join("")
      }
    </table>

    <!-- ================= BOUNDARIES ================= -->
    <table>
      <tr><td colspan="5" class="section">BOUNDARIES</td></tr>

      <tr>
        <th></th>
        <th>East</th>
        <th>West</th>
        <th>North</th>
        <th>South</th>
      </tr>

      <tr>
        <td><b>As per Document</b></td>
        <td>${d?.Boundaries?.As_per_doc?.East || ""}</td>
        <td>${d?.Boundaries?.As_per_doc?.West || ""}</td>
        <td>${d?.Boundaries?.As_per_doc?.North || ""}</td>
        <td>${d?.Boundaries?.As_per_doc?.South || ""}</td>
      </tr>

      <tr>
        <td><b>As per Plan</b></td>
        <td>${d?.Boundaries?.As_per_plan?.East || ""}</td>
        <td>${d?.Boundaries?.As_per_plan?.West || ""}</td>
        <td>${d?.Boundaries?.As_per_plan?.North || ""}</td>
        <td>${d?.Boundaries?.As_per_plan?.South || ""}</td>
      </tr>

      <tr>
        <td><b>As per Site</b></td>
        <td>${d?.Boundaries?.As_per_site?.East || ""}</td>
        <td>${d?.Boundaries?.As_per_site?.West || ""}</td>
        <td>${d?.Boundaries?.As_per_site?.North || ""}</td>
        <td>${d?.Boundaries?.As_per_site?.South || ""}</td>
      </tr>
    </table>

    <!-- ================= PHOTOS ================= -->
    <table>
      <tr><td class="section">PHOTOS</td></tr>
      <tr>
        <td>
          <div class="photo-grid">
            ${(d?.photos || []).map(p => {
              const path = (p.path || "").replace(/\\\\/g, "/");
              return `<img src="${baseURL}/${path}" />`;
            }).join("")}
          </div>
        </td>
      </tr>
    </table>
    <!-- ================= FINAL DECLARATION ================= -->
    <table class="report-table final-section">

  <!-- SPECIAL REMARKS -->
  <tr>
    <td class="label">Special Remarks</td>
    <td class="value remarks-cell">
      Remark:-<br>
      1. The Subject property is a vacant plot.( Area Undefined. )<br>
      2. The actual BUA is Undefined Sq.Ft.<br>
      3. The valuation has taken as per FSI area.<br>
      4. The subject property was in vacant plot at the time of site visit.<br>
      5. Subject Property under MC Limit.<br>
      6. The population density in the locality is approx. 20-25%.<br>
      7. The subject property is not easily identifiable, the same can be identified with the help of contact person/applicant.<br>
      8. The approach of the property is through Undefined Feet Wide Road.<br>
      9. Latitude and longitude- Undefined, Undefined.<br>
      10. A copy of the construction estimate has been provided to us for Rs. 11,70,000.00/- for proposed structure ground floor storied having area 900.00 sq. feet and the same has been restricted (FSI Area) to Rs. 8,74,800.00/- (Rs. 1200.00 per sq. feet) which has been considered for the valuation.<br>
      Provided Document<br>
      1. A Soft copy of Undefined, Date- Undefined has been provided.
    </td>
  </tr>

  <!-- REPORT STATUS -->
  <tr>
    <td class="label">Report status</td>
    <td class="value">Undefined</td>
  </tr>

  <!-- DECLARATION -->
  <tr>
    <td class="label">I hereby declare that:-</td>
    <td class="value remarks-cell">
      (1) I have personally visited the property.<br>
      (2) I have no direct or indirect interest in the property valued.<br>
      (3) The information furnished in the report is true and correct to the best of my knowledge and belief.<br>
      (4) In our view the work being done for construction/extension/improvement in the dwelling unit does not endanger the residents.<br>
      (5) Google map copy attached here with.
    </td>
  </tr>

</table>
    </body>
    </html>
    `;

    // 🔥 IMPORTANT PART (browser launch)
    const browser = await puppeteer.launch({
      executablePath: getChromePath() || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load" // 🔥 FIXED (was networkidle0)
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=report-${report._id}.pdf`
    });

    res.send(pdf);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
