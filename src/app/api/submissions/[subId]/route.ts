import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/submissions/[subId] - Remove a lead submission
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const { subId } = await params;
    await prisma.submission.delete({
      where: { id: subId },
    });

    return NextResponse.json({ success: true, message: "Submission deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
