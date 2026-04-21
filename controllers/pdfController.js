const PDFDocument = require("pdfkit");
const Report = require("../models/Report");
const path = require("path");
const fs = require("fs");

const puppeteer = require("puppeteer-core");
exports.downloadReportPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const d = report.formData || {};
    const baseURL = "https://krissoftwarebackend.onrender.com"; // change in production

    // ---------- FILTER ONLY REAL FLOORS ----------
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
  font-size: 5px; /* 🔥 smaller = professional */
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
  font-size: 14px;
  background: #f2f2f2;
}

.section {
  background: #d9d9d9;
  font-weight: bold;
  text-align: center;
}

/* 🔥 FIX LABEL WIDTH */
.label {
  font-weight: bold;
  width: 20%;
  font-size:12px; 
}

/* 🔥 VALUE CELLS */
.value {
  width: 30%;
  font-size:12px;
}

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
    <table>
      <tr><td colspan="2" class="section">PROPERTY DETAILS</td></tr>
      <tr><td class="label">Person Met</td><td>${d?.Propertydetails?.person_met_at_site || ""}</td></tr>
      <tr><td class="label">Contact Number</td><td>${d?.Propertydetails?.Contactnumber || ""}</td></tr>
      <tr><td class="label">Site Address</td><td>${d?.Propertydetails?.siteaddress || ""}</td></tr>
      <tr><td class="label">Address as per Doc</td><td>${d?.Propertydetails?.address_as_per_doc || ""}</td></tr>
      <tr><td class="label">Address as per Site</td><td>${d?.Propertydetails?.address_as_per_site || ""}</td></tr>
      <tr><td class="label">Nearby Landmark</td><td>${d?.Propertydetails?.Nearby_landmark || ""}</td></tr>
      <tr><td class="label">Coordinates</td><td>${d?.Propertydetails?.Cooridinates || ""}</td></tr>
      <tr><td class="label">Visit Date</td><td>${d?.Propertydetails?.site_visit_date || ""}</td></tr>
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

    </body>
    </html>
    `;

const browser = await puppeteer.launch({
  executablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true
});
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=report-${report._id}.pdf`
    });

    res.send(pdf);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};
