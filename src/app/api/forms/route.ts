import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/forms - List all forms with submission count
export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    const formattedForms = forms.map((f: any) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      pixelId: f.pixelId,
      fields: JSON.parse(f.fields),
      showBanner: f.showBanner,
      bannerText: f.bannerText,
      bannerLink: f.bannerLink,
      bannerImage: f.bannerImage,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      submissionCount: f._count.submissions,
    }));

    return NextResponse.json({ success: true, forms: formattedForms });
  } catch (error: any) {
    console.error("Failed to fetch forms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

// POST /api/forms - Create a new form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, fields, pixelId, showBanner, bannerText, bannerLink, bannerImage } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const newForm = await prisma.form.create({
      data: {
        title,
        description: description || "",
        pixelId: pixelId || "",
        fields: JSON.stringify(fields || []),
        showBanner: showBanner ?? false,
        bannerText: bannerText || "",
        bannerLink: bannerLink || "",
        bannerImage: bannerImage || "",
      },
    });

    return NextResponse.json({
      success: true,
      form: {
        ...newForm,
        fields: JSON.parse(newForm.fields),
      },
    });
  } catch (error: any) {
    console.error("Failed to create form:", error);
    return NextResponse.json(
      { success: false, error: `Failed to create form: ${error.message || error}` },
      { status: 500 }
    );
  }
}
