"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

import { FormField } from "@/components/admin/types";
import SidebarElements from "@/components/admin/create/SidebarElements";
import FormCanvas from "@/components/admin/create/FormCanvas";
import FieldCustomizer from "@/components/admin/create/FieldCustomizer";
import PageSetup from "@/components/admin/create/PageSetup";

function FormBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const [title, setTitle] = useState("My New Campaign Form");
  const [description, setDescription] = useState("Please fill out this form to apply.");
  const [titleAlign, setTitleAlign] = useState("left");
  const [pixelId, setPixelId] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    {
      id: "step-contact",
      type: "step",
      label: "Step 1 — Contact Information",
      required: false
    },
    {
      id: "field-fullname",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name...",
      required: true
    },
    {
      id: "field-email",
      type: "text",
      label: "Email Address",
      placeholder: "name@example.com",
      required: true
    },
    {
      id: "field-phone",
      type: "text",
      label: "Phone Number",
      placeholder: "e.g. +1 (555) 000-0000",
      required: true
    }
  ]);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();
      if (data.success) {
        setTitle(data.form.title);
        setDescription(data.form.description || "");
        setTitleAlign(data.form.titleAlign || "left");
        setPixelId(data.form.pixelId || "");
        setShowBanner(data.form.showBanner || false);
        setBannerText(data.form.bannerText || "");
        setBannerLink(data.form.bannerLink || "");
        setBannerImage(data.form.bannerImage || "");
        setFields(data.form.fields);
        if (data.form.fields.length > 0) {
          setSelectedFieldId(data.form.fields[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading form:", err);
    } finally {
      setLoading(false);
    }
  };

  const addField = useCallback((type: FormField["type"]) => {
    const newId = `field_${Date.now()}`;
    const newField: FormField = {
      id: newId,
      type,
      label: type === "step" ? "Step Title & Header" : `New ${type.toUpperCase()} Field`,
      placeholder: type === "step" ? "" : "Enter placeholder text...",
      required: type !== "step",
      options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1", "Option 2"] : undefined,
      helpText: ""
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      setSelectedFieldId((currentSelected) => {
        if (currentSelected === id) {
          return filtered[0]?.id || null;
        }
        return currentSelected;
      });
      return filtered;
    });
  }, []);

  const updateFieldProperty = useCallback((id: string, property: keyof FormField, value: any) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [property]: value } : f))
    );
  }, []);

  const moveField = useCallback((index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    setFields((prev) => {
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[nextIndex];
      updated[nextIndex] = temp;
      return updated;
    });
  }, []);

  const reorderFields = useCallback((updatedFields: FormField[]) => {
    setFields(updatedFields);
  }, []);

  const saveForm = useCallback(async () => {
    setSaving(true);
    try {
      const method = formId ? "PUT" : "POST";
      const url = formId ? `/api/forms/${formId}` : "/api/forms";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          titleAlign,
          pixelId,
          fields,
          showBanner,
          bannerText,
          bannerLink,
          bannerImage
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(formId ? "Form updated successfully!" : "Form created successfully!");
        router.push("/admin");
      } else {
        alert("Error saving form: " + data.error);
      }
    } catch (err) {
      console.error("Error saving form:", err);
      alert("An error occurred while saving the form.");
    } finally {
      setSaving(false);
    }
  }, [formId, title, description, titleAlign, pixelId, fields, showBanner, bannerText, bannerLink, bannerImage, router]);

  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId);
  }, [fields, selectedFieldId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top action bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" /> Form Builder
            </h1>
            <p className="text-xs text-slate-550 truncate max-w-[200px] md:max-w-xs">
              {formId ? `Editing: ${title}` : "Creating new custom landing form"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={saveForm}
            disabled={saving}
            className="hs-button-primary text-xs font-bold py-2.5 px-4.5"
          >
            <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </header>

      {/* Editor Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Components Library */}
        <SidebarElements 
          onAddField={addField} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Center Panel: Interactive Form Preview & Canvas */}
        <FormCanvas 
          title={title}
          description={description}
          titleAlign={titleAlign}
          fields={fields}
          selectedFieldId={selectedFieldId}
          showBanner={showBanner}
          bannerText={bannerText}
          bannerImage={bannerImage}
          bannerLink={bannerLink}
          onSelectField={setSelectedFieldId}
          onDeleteField={deleteField}
          onMoveField={moveField}
          onReorderFields={reorderFields}
        />

        {/* Right Sidebar: Settings Panel */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-5 overflow-y-auto flex-shrink-0">
          {activeTab === "fields" ? (
            <FieldCustomizer 
              selectedField={selectedField}
              onUpdateProperty={updateFieldProperty}
              onDeleteField={deleteField}
            />
          ) : (
            <PageSetup 
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              titleAlign={titleAlign}
              setTitleAlign={setTitleAlign}
              pixelId={pixelId}
              setPixelId={setPixelId}
              showBanner={showBanner}
              setShowBanner={setShowBanner}
              bannerText={bannerText}
              setBannerText={setBannerText}
              bannerLink={bannerLink}
              setBannerLink={setBannerLink}
              bannerImage={bannerImage}
              setBannerImage={setBannerImage}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default function FormBuilder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    }>
      <FormBuilderContent />
    </Suspense>
  );
}
