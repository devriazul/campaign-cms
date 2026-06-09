import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicFormRenderer from "@/components/public-form/PublicFormRenderer";

interface FormPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FormPageProps) {
  const { id } = await params;
  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) return {};

  return {
    title: `${form.title} | Application Form`,
    description: form.description || "Fill out the form below.",
  };
}

export default async function PublicFormPage({ params }: FormPageProps) {
  const { id } = await params;
  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  const fields = JSON.parse(form.fields);

  return (
    <>
      {/* Inject Custom Analytics Pixels / Scripts in head */}
      {form.pixelId && (
        <head dangerouslySetInnerHTML={{ __html: form.pixelId }} />
      )}
      
      <main className="min-h-screen bg-[#f5f8fa] text-[#33475b] flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
        {/* Subtle professional background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#2d3e50]/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#ff7a59]/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#2d3e50]/5 blur-[140px] pointer-events-none"></div>
        
        <div className="w-full max-w-2xl relative z-10 transition-all duration-300">
          <PublicFormRenderer 
            formId={form.id} 
            title={form.title} 
            description={form.description || ""} 
            titleAlign={form.titleAlign || "left"}
            fields={fields}
            showBanner={form.showBanner}
            bannerText={form.bannerText || ""}
            bannerLink={form.bannerLink || ""}
            bannerImage={form.bannerImage || ""}
          />
        </div>
      </main>
    </>
  );
}
