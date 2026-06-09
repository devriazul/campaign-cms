import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/forms/[id] - Fetch a single form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        ...form,
        fields: JSON.parse(form.fields),
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, titleAlign, fields, pixelId, showBanner, bannerText, bannerLink, bannerImage } = body;

    const existingForm = await prisma.form.findUnique({
      where: { id },
    });

    if (!existingForm) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingForm.title,
        description: description !== undefined ? description : existingForm.description,
        titleAlign: titleAlign !== undefined ? titleAlign : existingForm.titleAlign,
        pixelId: pixelId !== undefined ? pixelId : existingForm.pixelId,
        fields: fields !== undefined ? JSON.stringify(fields) : existingForm.fields,
        showBanner: showBanner !== undefined ? showBanner : existingForm.showBanner,
        bannerText: bannerText !== undefined ? bannerText : existingForm.bannerText,
        bannerLink: bannerLink !== undefined ? bannerLink : existingForm.bannerLink,
        bannerImage: bannerImage !== undefined ? bannerImage : existingForm.bannerImage,
      },
    });

    return NextResponse.json({
      success: true,
      form: {
        ...updatedForm,
        fields: JSON.parse(updatedForm.fields),
      },
    });
  } catch (error: any) {
    console.error("Failed to update form:", error);
    return NextResponse.json(
      { success: false, error: `Failed to update form: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Form deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete form" },
      { status: 500 }
    );
  }
}
