import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  eventType: string;
  email: string;
  author?: string;
  title?: string;
  submissionId?: string;
  categories?: string;
  publicationUrl?: string;
  reviewerComments?: string;
  editorRemarks?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(value = ""): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function metadataTable(payload: EmailPayload, status: string): string {
  const rows: Array<[string, string]> = [
    ["Title", escapeHtml(payload.title ?? "")],
    ["Archive ID", escapeHtml(payload.submissionId ?? "")],
    ["Author", escapeHtml(payload.author ?? "")],
    ["Categories", escapeHtml(payload.categories ?? "")],
    ["Status", escapeHtml(status)],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="border:1px solid #e5e7eb;padding:10px 14px;background:#f8fafc;font-weight:600;color:#374151;width:140px;vertical-align:top;">${label}</td>
          <td style="border:1px solid #e5e7eb;padding:10px 14px;color:#111827;vertical-align:top;">${value}</td>
        </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      ${rowsHtml}
    </table>`;
}

function buildLayout(title: string, content: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 36px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                IndieResearch Archive
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.3px;">
                Open Access Research Publishing Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:24px 36px;">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;font-weight:600;">IndieResearch Archive</p>
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Licensed under CC BY 4.0 &mdash; Open Access</p>
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                Editorial Office:
                <a href="mailto:support@indieresearcharchive.org" style="color:#3b82f6;text-decoration:none;">support@indieresearcharchive.org</a>
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;">
                Website:
                <a href="https://indieresearcharchive.org" style="color:#3b82f6;text-decoration:none;">https://indieresearcharchive.org</a>
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">&copy; ${year} IndieResearch Archive. All Rights Reserved.</p>
            </td>
          </tr>

        </table>
        <!-- /Wrapper -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function infoBox(text: string, accentColor = "#1e40af", bgColor = "#eff6ff"): string {
  return `
    <div style="background-color:${bgColor};border-left:4px solid ${accentColor};border-radius:0 6px 6px 0;padding:16px 20px;margin:16px 0;font-size:14px;color:#1e293b;line-height:1.7;white-space:pre-wrap;">
      ${escapeHtml(text)}
    </div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />`;
}

function sectionHeading(text: string): string {
  return `<h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#374151;">${escapeHtml(text)}</h3>`;
}

function greeting(author?: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear ${escapeHtml(author ?? "Author")},</p>`;
}

function bodyParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">${text}</p>`;
}

function signature(): string {
  return `
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Regards,<br />
      <strong style="color:#374151;">The IndieResearch Archive Editorial Team</strong>
    </p>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function createSubmissionReceivedTemplate(payload: EmailPayload): EmailTemplate {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">Submission Successfully Received</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("Thank you for submitting your manuscript to <strong>IndieResearch Archive (IRA)</strong>. Your submission has been successfully received and entered into our editorial workflow.")}
    ${bodyParagraph("You will receive email notifications at each stage of the review process.")}
    ${divider()}
    ${sectionHeading("Submission Details")}
    ${metadataTable(payload, "Awaiting Editorial Review")}
    ${divider()}
    ${sectionHeading("Editorial Workflow")}
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:2;">
      <li>Editorial Screening</li>
      <li>Technical Verification</li>
      <li>Peer Review</li>
      <li>Editorial Decision</li>
      <li>Publication</li>
    </ol>
    ${bodyParagraph("If you have any questions, please contact the Editorial Office at <a href='mailto:support@indieresearcharchive.org' style='color:#3b82f6;'>support@indieresearcharchive.org</a>.")}
    ${signature()}`;

  return {
    subject: `Submission Received \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Submission Received", content),
  };
}

function createUnderReviewTemplate(payload: EmailPayload): EmailTemplate {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">Manuscript Under Editorial Review</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("We are pleased to inform you that your manuscript has successfully passed the initial editorial screening and has now entered the formal peer-review process.")}
    ${divider()}
    ${sectionHeading("Manuscript Details")}
    ${metadataTable(payload, "Under Editorial Review")}
    ${divider()}
    ${sectionHeading("What Happens Next")}
    ${bodyParagraph("Our editorial team is evaluating your manuscript for scholarly quality, originality, relevance, and technical correctness. This process typically takes several weeks depending on reviewer availability.")}
    ${bodyParagraph("You will be notified by email once a decision has been reached. Thank you for your patience and for choosing IndieResearch Archive.")}
    ${signature()}`;

  return {
    subject: `Under Review \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Under Editorial Review", content),
  };
}

function createRevisionRequestedTemplate(payload: EmailPayload): EmailTemplate {
  const comments =
    payload.reviewerComments?.trim() ||
    "Reviewer comments will be communicated by the editorial office. Please check your account or contact the editorial team.";

  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">Revision Requested</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("Following a thorough editorial and peer-review evaluation, the editorial board has determined that revisions are required before a final publication decision can be made.")}
    ${divider()}
    ${sectionHeading("Manuscript Details")}
    ${metadataTable(payload, "Revision Required")}
    ${divider()}
    ${sectionHeading("Reviewer Comments")}
    ${infoBox(comments, "#1e40af", "#eff6ff")}
    ${bodyParagraph("Please address all reviewer comments carefully and submit a revised version of your manuscript through the submission platform.")}
    ${bodyParagraph("<strong>Note:</strong> Failure to submit revisions within the requested timeframe may result in withdrawal of the submission from the review process.")}
    ${signature()}`;

  return {
    subject: `Revision Required \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Revision Required", content),
  };
}

function createAcceptedTemplate(payload: EmailPayload): EmailTemplate {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#15803d;">Congratulations &mdash; Manuscript Accepted for Publication</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("We are delighted to inform you that your manuscript has successfully completed the editorial evaluation process and has been <strong>accepted for publication</strong> in IndieResearch Archive.")}
    ${divider()}
    ${sectionHeading("Manuscript Details")}
    ${metadataTable(payload, "Accepted for Publication")}
    ${divider()}
    ${sectionHeading("Publication Workflow")}
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#374151;line-height:2;">
      <li>Final Manuscript Processing</li>
      <li>Metadata Indexing &amp; DOI Assignment</li>
      <li>Open Access Publication</li>
    </ol>
    ${bodyParagraph("You will receive a separate notification once your manuscript is live on the platform. Thank you for contributing to open-access research and for choosing IndieResearch Archive.")}
    ${signature()}`;

  return {
    subject: `Accepted for Publication \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Manuscript Accepted", content),
  };
}

function createRejectedTemplate(payload: EmailPayload): EmailTemplate {
  const remarks =
    payload.editorRemarks?.trim() ||
    "No additional editorial remarks were provided for this decision.";

  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#b91c1c;">Editorial Decision</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("Thank you for submitting your manuscript to IndieResearch Archive. We appreciate the time and effort you have invested in your research.")}
    ${bodyParagraph("After careful consideration by our editorial board, we regret to inform you that your manuscript has not been accepted for publication in its current form.")}
    ${divider()}
    ${sectionHeading("Manuscript Details")}
    ${metadataTable(payload, "Not Accepted")}
    ${divider()}
    ${sectionHeading("Editorial Remarks")}
    ${infoBox(remarks, "#dc2626", "#fef2f2")}
    ${bodyParagraph("We encourage you to consider the editorial feedback and explore opportunities for future submissions to IndieResearch Archive. We wish you success with your research.")}
    ${signature()}`;

  return {
    subject: `Editorial Decision \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Editorial Decision", content),
  };
}

function createPublishedTemplate(payload: EmailPayload): EmailTemplate {
  const year = new Date().getFullYear();
  const publicationUrl = payload.publicationUrl ?? "";
  const citationBlock =
    `${escapeHtml(payload.author ?? "Author")} (${year}). ` +
    `${escapeHtml(payload.title ?? "")}. ` +
    `IndieResearch Archive. Archive ID: ${escapeHtml(payload.submissionId ?? "")}`;

  const publicationRow = publicationUrl
    ? `<a href="${escapeHtml(publicationUrl)}" style="color:#3b82f6;text-decoration:none;word-break:break-all;">${escapeHtml(publicationUrl)}</a>`
    : `<span style="color:#94a3b8;">Not yet available</span>`;

  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#1d4ed8;">Your Research Is Now Published</h2>
    ${greeting(payload.author)}
    ${bodyParagraph("Congratulations! Your manuscript has been successfully published on <strong>IndieResearch Archive</strong> and is now openly accessible to the global academic community.")}
    ${divider()}
    ${sectionHeading("Publication Details")}
    ${metadataTable(payload, "Published")}
    ${divider()}
    ${sectionHeading("Publication URL")}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px 14px;font-size:14px;">
          ${publicationRow}
        </td>
      </tr>
    </table>
    ${sectionHeading("Suggested Citation")}
    <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
      ${citationBlock}
    </div>
    ${bodyParagraph("Thank you for publishing your research with IndieResearch Archive and for your contribution to open-access scholarship.")}
    ${signature()}`;

  return {
    subject: `Published \u2013 ${payload.title ?? "Your Manuscript"}`,
    html: buildLayout("Paper Published", content),
  };
}

// ---------------------------------------------------------------------------
// Template dispatcher
// ---------------------------------------------------------------------------

function createEmailTemplate(payload: EmailPayload): EmailTemplate | null {
  switch (payload.eventType) {
    case "submission_received":
      return createSubmissionReceivedTemplate(payload);
    case "under_review":
      return createUnderReviewTemplate(payload);
    case "revision_requested":
      return createRevisionRequestedTemplate(payload);
    case "accepted":
      return createAcceptedTemplate(payload);
    case "rejected":
      return createRejectedTemplate(payload);
    case "published":
      return createPublishedTemplate(payload);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function log(level: "INFO" | "WARN" | "ERROR", message: string, data?: unknown): void {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...(data !== undefined ? { data } : {}),
  };
  if (level === "ERROR") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!RESEND_API_KEY) {
      log("ERROR", "RESEND_API_KEY environment variable is not configured");
      return jsonResponse({ success: false, error: "Email service is not configured" }, 500);
    }

    let payload: EmailPayload;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
    }

    if (!payload.email || typeof payload.email !== "string") {
      return jsonResponse({ success: false, error: "Recipient email address is required" }, 400);
    }

    if (!payload.eventType || typeof payload.eventType !== "string") {
      return jsonResponse({ success: false, error: "Event type is required" }, 400);
    }

    const template = createEmailTemplate(payload);
    if (!template) {
      return jsonResponse(
        { success: false, error: `Unsupported event type: ${payload.eventType}` },
        400
      );
    }

    log("INFO", "Sending email", { eventType: payload.eventType, to: payload.email });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IndieResearch Archive <onboarding@resend.dev>",
        to: [payload.email],
        subject: template.subject,
        html: template.html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      log("ERROR", "Resend API returned an error", { status: resendResponse.status, resendData });
      return jsonResponse({ success: false, error: resendData }, resendResponse.status);
    }

    log("INFO", "Email sent successfully", { id: resendData?.id, to: payload.email });

    return jsonResponse({ success: true, message: "Email sent successfully", data: resendData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    log("ERROR", "Unhandled exception in email function", { error: message });
    return jsonResponse({ success: false, error: message }, 500);
  }
});