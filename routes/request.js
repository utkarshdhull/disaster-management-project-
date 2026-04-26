const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const nodemailer = require("nodemailer");

// 📧 Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 📧 Send email notification
const sendEmailNotification = async (requestData) => {
  const severityLabel = {
    1: "🟢 Low",
    2: "🟡 Moderate",
    3: "🟠 High",
    4: "🔴 Critical",
    5: "🔴 Extreme",
  };

  const mailOptions = {
    from: `"🚨 Disaster Alert System" <${process.env.GMAIL_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🆘 New Help Request — ${requestData.name} (Severity: ${requestData.severity}/5)`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 24px 32px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🚨 Emergency Help Request</h1>
          <p style="color: #c7d2fe; margin: 4px 0 0; font-size: 14px;">Smart Disaster Response System</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; width: 120px;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 15px; font-weight: 600;">${requestData.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px;">Need</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 15px;">${requestData.need}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px;">Severity</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 15px;">
                ${severityLabel[requestData.severity] || requestData.severity} (${requestData.severity}/5)
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px;">Priority</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #60a5fa; font-size: 15px; font-weight: 600;">${requestData.priority}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px;">Location</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 15px;">
                📍 ${requestData.location?.lat}, ${requestData.location?.lng}
                ${requestData.location?.accuracy ? `<br><span style="color: #94a3b8; font-size: 12px;">Accuracy: ±${Math.round(requestData.location.accuracy)}m</span>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #94a3b8; font-size: 13px;">Status</td>
              <td style="padding: 12px 0; color: #fbbf24; font-size: 15px; font-weight: 600;">⏳ Pending</td>
            </tr>
          </table>

          <!-- Map Link -->
          <div style="margin-top: 20px;">
            <a href="https://www.google.com/maps?q=${requestData.location?.lat},${requestData.location?.lng}" 
               style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600;">
              🗺️ View on Google Maps
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 32px; background: #020617; border-top: 1px solid #1e293b;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated alert from the Smart Disaster Response Coordination System.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email notification sent to:", process.env.NOTIFICATION_EMAIL);
  } catch (err) {
    console.error("📧 Email sending failed:", err.message);
    // Don't throw — email failure should not block the request
  }
};

// ✅ POST: Create request
router.post("/request-help", async (req, res) => {
  console.log("📥 REQUEST RECEIVED:", req.body);
  try {
    const { name, need, severity, location, urgency } = req.body;

    const finalUrgency = urgency || 1;
    const priority = severity * finalUrgency;

    const newRequest = new Request({
      name,
      need,
      severity,
      location,
      urgency: finalUrgency,
      priority
    });

    await newRequest.save();

    // 🔥 VERY IMPORTANT (MUST BE INSIDE ROUTE)
    const io = req.app.get("io");
    io.emit("newRequest", newRequest);

    console.log("🔥 Emitted newRequest:", newRequest);

    // 📧 Send email notification (non-blocking)
    sendEmailNotification(newRequest);

    res.status(201).json(newRequest);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/resolve/:id", async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ GET: Fetch all requests
router.get("/all-requests", async (req, res) => {
  try {
    const data = await Request.find().sort({ priority: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
