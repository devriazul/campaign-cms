import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Retrieve global settings
export async function GET() {
  try {
    const webhookSetting = await prisma.setting.findUnique({
      where: { key: "webhook_url" },
    });

    const leadLibSetting = await prisma.setting.findUnique({
      where: { key: "lead_library_url" },
    });

    return NextResponse.json({
      success: true,
      webhookUrl: webhookSetting ? webhookSetting.value : "",
      leadLibraryUrl: (leadLibSetting && leadLibSetting.value.trim() !== "") 
        ? leadLibSetting.value 
        : (process.env.LEAD_LIBRARY_BACKEND_URL || "http://127.0.0.1:8000"),
    });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update global settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, leadLibraryUrl } = body;

    const updatedWebhook = await prisma.setting.upsert({
      where: { key: "webhook_url" },
      update: { value: webhookUrl || "" },
      create: { key: "webhook_url", value: webhookUrl || "" },
    });

    let updatedLeadLibVal = "";
    if (leadLibraryUrl !== undefined) {
      const updatedLeadLib = await prisma.setting.upsert({
        where: { key: "lead_library_url" },
        update: { value: leadLibraryUrl || "" },
        create: { key: "lead_library_url", value: leadLibraryUrl || "" },
      });
      updatedLeadLibVal = updatedLeadLib.value;
    } else {
      const existing = await prisma.setting.findUnique({ where: { key: "lead_library_url" } });
      updatedLeadLibVal = existing ? existing.value : "";
    }

    return NextResponse.json({
      success: true,
      webhookUrl: updatedWebhook.value,
      leadLibraryUrl: updatedLeadLibVal,
      message: "Settings saved successfully",
    });
  } catch (error: any) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
