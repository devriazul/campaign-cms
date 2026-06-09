import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/forms/[id]/submissions - Retrieve submissions for a specific form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissions = await prisma.submission.findMany({
      where: { formId: id },
      orderBy: { createdAt: "desc" },
    });

    const formattedSubmissions = submissions.map((sub: any) => ({
      id: sub.id,
      formId: sub.formId,
      data: JSON.parse(sub.data),
      progress: sub.progress,
      createdAt: sub.createdAt,
    }));

    return NextResponse.json({ success: true, submissions: formattedSubmissions });
  } catch (error: any) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[id]/submissions - Create/Record a new submission or progress step
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, progress } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Data is required" },
        { status: 400 }
      );
    }

    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        formId: id,
        data: JSON.stringify(data),
        progress: progress !== undefined ? parseFloat(progress) : 100.0,
      },
    });

    // Forward to External Webhook if configured and lead is complete
    const isCompleted = progress === undefined || parseFloat(progress) >= 100.0;
    if (isCompleted) {
      // 1. Forward to Lead Library Backend
      try {
        let name = "";
        let email = "";
        let phone = "";
        const questions: Record<string, any> = {};

        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
        if (parsedData && typeof parsedData === "object") {
          for (const [key, val] of Object.entries(parsedData)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes("name")) {
              name = String(val);
            } else if (lowerKey.includes("email")) {
              email = String(val);
            } else if (lowerKey.includes("phone") || lowerKey.includes("mobile") || lowerKey.includes("contact")) {
              phone = String(val);
            } else {
              // Store any extra/custom fields as questions
              questions[key] = val;
            }
          }
        }

        let backendUrl = process.env.LEAD_LIBRARY_BACKEND_URL || "http://127.0.0.1:8000";
        try {
          const leadLibSetting = await prisma.setting.findUnique({
            where: { key: "lead_library_url" },
          });
          if (leadLibSetting && leadLibSetting.value.trim() !== "") {
            backendUrl = leadLibSetting.value.trim();
          }
        } catch (dbErr) {
          console.error("Failed to read lead_library_url from db settings:", dbErr);
        }

        if (email || phone) {
          fetch(`${backendUrl.replace(/\/$/, "")}/api/capture-lead`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              phone,
              questions,
              source: `Form CMS: ${form.title || "Form"}`
            })
          })
          .then(res => res.json())
          .then(resData => console.log("Lead successfully captured in Lead Library Backend:", resData))
          .catch(err => console.error("Failed to capture lead in Lead Library Backend:", err));
        }
      } catch (leadCaptureErr) {
        console.error("Error preparing lead for capture:", leadCaptureErr);
      }

      // 2. Forward to general webhook if configured
      try {
        const webhookSetting = await prisma.setting.findUnique({
          where: { key: "webhook_url" },
        });
        if (webhookSetting && webhookSetting.value.trim() !== "") {
          // Fire-and-forget POST in background
          fetch(webhookSetting.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leadId: submission.id,
              campaignId: id,
              campaignTitle: form.title,
              data,
              createdAt: submission.createdAt
            })
          }).catch(err => console.error("Webhook forwarding failed:", err));
        }
      } catch (webhookErr) {
        console.error("Failed to retrieve webhook settings:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        data: JSON.parse(submission.data),
      },
    });
  } catch (error: any) {
    console.error("Failed to create submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
