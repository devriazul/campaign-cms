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
      
      <main className="min-h-screen bg-gradient-to-tr from-slate-50 via-sky-50/50 to-indigo-50/50 text-slate-800 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Subtle background light leaks */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-400/15 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/15 blur-[135px] pointer-events-none animate-pulse duration-[10000ms]"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-400/5 blur-[150px] pointer-events-none"></div>
        
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/60 relative z-10 transition-all duration-300">
          <PublicFormRenderer 
            formId={form.id} 
            title={form.title} 
            description={form.description || ""} 
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
