"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  HelpCircle,
  Eye, 
  Save,
  CheckCircle,
  FileText,
  MousePointer,
  Sparkles
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "step";
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
}

function FormBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const [title, setTitle] = useState("My New Campaign Form");
  const [description, setDescription] = useState("Please fill out this form to apply.");
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

  // Drag and Drop States
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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

  const addField = (type: FormField["type"]) => {
    const newId = `field_${Date.now()}`;
    const newField: FormField = {
      id: newId,
      type,
      label: type === "step" ? "Step Title & Header" : `New ${type.toUpperCase()} Field`,
      placeholder: type === "step" ? "" : "Enter placeholder text...",
      required: type !== "step",
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2"] : undefined,
      helpText: ""
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newId);
  };

  const deleteField = (id: string) => {
    const filtered = fields.filter((f) => f.id !== id);
    setFields(filtered);
    if (selectedFieldId === id) {
      setSelectedFieldId(filtered[0]?.id || null);
    }
  };

  const updateFieldProperty = (id: string, property: keyof FormField, value: any) => {
    setFields(
      fields.map((f) => (f.id === id ? { ...f, [property]: value } : f))
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setFields(updated);
  };

  const saveForm = async () => {
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
  };

  // HTML5 Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const updated = [...fields];
    const draggedItem = updated[draggedIdx];
    updated.splice(draggedIdx, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setFields(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

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
              <Sparkles className="w-5 h-5 text-sky-655" /> Form Builder
            </h1>
            <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-xs">
              {formId ? `Editing: ${title}` : "Creating new custom landing form"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={saveForm}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-sky-500/10 border border-sky-450/20"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </header>

      {/* Editor Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Components Library */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-5 space-y-6 flex-shrink-0">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-sky-500" /> Add Form Elements
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              <button 
                onClick={() => addField("step")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-650 flex items-center justify-center font-bold text-[10px]">STEP</span>
                Step Separator
              </button>
              <button 
                onClick={() => addField("text")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">TXT</span>
                Short Text
              </button>
              <button 
                onClick={() => addField("textarea")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-[10px]">AREA</span>
                Long Textarea
              </button>
              <button 
                onClick={() => addField("select")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[10px]">SEL</span>
                Dropdown Select
              </button>
              <button 
                onClick={() => addField("radio")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-[10px]">RAD</span>
                Radio Button List
              </button>
              <button 
                onClick={() => addField("checkbox")}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-sky-500/50 rounded-xl text-left text-xs font-bold text-slate-700 transition shadow-sm"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-650 flex items-center justify-center font-bold text-[10px]">CHK</span>
                Checklist Field
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex border border-slate-200 bg-white p-1 rounded-xl text-xs shadow-sm">
              <button 
                onClick={() => setActiveTab("fields")}
                className={`flex-1 py-1.5 text-center font-bold rounded-lg transition ${
                  activeTab === "fields" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Field Edit
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-1.5 text-center font-bold rounded-lg transition ${
                  activeTab === "settings" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Page Setup
              </button>
            </div>
          </div>
        </aside>

        {/* Center Panel: Interactive Form Preview & Canvas */}
        <main className="flex-1 bg-slate-100 p-6 md:p-8 overflow-y-auto flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            
            {/* Header Preview card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              {showBanner && (
                <div className="relative w-full h-24 flex items-center justify-center bg-slate-100 group border-b border-slate-100">
                  {bannerImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerImage} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600"></div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/20"></div>
                  <div className="relative z-10 text-center px-4">
                    <p className="text-white text-xs font-black tracking-tight drop-shadow-md">
                      {bannerText || "Exclusive Campaign Banner"}
                    </p>
                    {bannerLink && (
                      <span className="text-[9px] text-sky-200 font-medium opacity-90 block mt-0.5 max-w-[220px] truncate underline">
                        {bannerLink}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-6">
                <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider px-2 py-0.5 bg-sky-50 border border-sky-100 rounded-md">
                  Form Header Banner
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-3">{title || "Form Title"}</h2>
                <p className="text-slate-500 text-sm mt-1">{description || "No description specified."}</p>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-white/60">
                  <MousePointer className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-sm">Your Form Canvas is Empty</p>
                  <p className="text-xs text-slate-500 mt-1">Click form components on the left sidebar to add fields.</p>
                </div>
              ) : (
                fields.map((field, idx) => {
                  const isSelected = field.id === selectedFieldId;
                  const isStep = field.type === "step";

                  return (
                    <div 
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setActiveTab("fields");
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing relative group ${
                        isStep 
                          ? "bg-sky-50/45 border-dashed border-sky-200 hover:border-sky-400" 
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      } ${isSelected ? "ring-2 ring-sky-500 border-transparent bg-white shadow-md" : ""}`}
                    >
                      {/* Control buttons overlay on hover */}
                      <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1 bg-white p-1 border border-slate-200 shadow-sm rounded-lg">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(idx, "up");
                          }}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(idx, "down");
                          }}
                          disabled={idx === fields.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                          title="Remove field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display Label */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase ${
                          isStep ? "bg-sky-50 text-sky-600 border border-sky-100" : "bg-slate-100 text-slate-600"
                        }`}>
                          {field.type}
                        </span>
                        <span className={`font-bold text-sm ${isStep ? "text-sky-700 text-base" : "text-slate-800"}`}>
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </span>
                      </div>

                      {/* Preview Inputs */}
                      {!isStep && (
                        <div className="mt-2 pointer-events-none">
                          {field.type === "text" && (
                            <input 
                              type="text" 
                              placeholder={field.placeholder || "Enter answer..."}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-500"
                            />
                          )}
                          {field.type === "textarea" && (
                            <textarea 
                              placeholder={field.placeholder || "Enter long answer..."}
                              rows={2}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-500 resize-none"
                            />
                          )}
                          {field.type === "select" && (
                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-500">
                              <option>{field.placeholder || "Choose option..."}</option>
                              {field.options?.map((opt, i) => (
                                <option key={i}>{opt}</option>
                              ))}
                            </select>
                          )}
                          {field.type === "radio" && (
                            <div className="space-y-1 mt-1">
                              {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type="radio" checked={false} readOnly className="accent-sky-500 border-slate-300" />
                                  <span className="text-slate-600 text-xs font-medium">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {field.type === "checkbox" && (
                            <div className="space-y-1 mt-1">
                              {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type="checkbox" checked={false} readOnly className="accent-sky-500 border-slate-300 rounded" />
                                  <span className="text-slate-600 text-xs font-medium">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {field.helpText && (
                            <p className="text-[10px] text-slate-500 mt-1 italic flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-slate-400" /> {field.helpText}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Settings Panel */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-5 overflow-y-auto flex-shrink-0">
          
          {/* Tab 1: Selected Field Properties */}
          {activeTab === "fields" && (
            <div className="space-y-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-sky-500" /> Field Customization
              </h2>

              {!selectedField ? (
                <p className="text-slate-400 text-xs italic">
                  Select a field in the canvas to customize its settings.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Field Label</label>
                    <input 
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateFieldProperty(selectedField.id, "label", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-sm text-slate-800 outline-none shadow-sm"
                    />
                  </div>

                  {selectedField.type !== "step" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Placeholder</label>
                        <input 
                          type="text"
                          value={selectedField.placeholder || ""}
                          onChange={(e) => updateFieldProperty(selectedField.id, "placeholder", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-sm text-slate-800 outline-none shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Help / Example Text</label>
                        <input 
                          type="text"
                          value={selectedField.helpText || ""}
                          onChange={(e) => updateFieldProperty(selectedField.id, "helpText", e.target.value)}
                          placeholder="e.g. GPA 4.50 / A+ / CGPA 3.20"
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-sm text-slate-800 outline-none shadow-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-700">Required Field</span>
                        <input 
                          type="checkbox"
                          checked={selectedField.required}
                          onChange={(e) => updateFieldProperty(selectedField.id, "required", e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-0 accent-sky-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Options editor for Select / Radio */}
                  {(selectedField.type === "select" || selectedField.type === "radio" || selectedField.type === "checkbox") && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 block">Configure Options</label>
                      <div className="space-y-2">
                        {selectedField.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2">
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(selectedField.options || [])];
                                newOpts[oIdx] = e.target.value;
                                updateFieldProperty(selectedField.id, "options", newOpts);
                              }}
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                            />
                            <button 
                              onClick={() => {
                                const newOpts = (selectedField.options || []).filter((_, i) => i !== oIdx);
                                updateFieldProperty(selectedField.id, "options", newOpts);
                              }}
                              disabled={(selectedField.options || []).length <= 1}
                              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          const newOpts = [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`];
                          updateFieldProperty(selectedField.id, "options", newOpts);
                        }}
                        className="w-full mt-2 py-1.5 bg-white border border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 text-sky-600 text-xs font-bold rounded-lg transition"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200">
                    <button 
                      onClick={() => deleteField(selectedField.id)}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-lg border border-red-200 flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Form/Page Metadata Setup */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" /> Page Configuration
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655">Campaign Form Title</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-sm text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655">Campaign Subtitle / description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-sm text-slate-800 outline-none resize-none shadow-sm"
                  />
                </div>

                {/* Banner Configuration */}
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-700">Enable Top Banner</span>
                    <input 
                      type="checkbox"
                      checked={showBanner}
                      onChange={(e) => setShowBanner(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-0 accent-sky-500"
                    />
                  </div>

                  {showBanner && (
                    <div className="space-y-3 pl-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Banner Text</label>
                        <input 
                          type="text"
                          value={bannerText}
                          onChange={(e) => setBannerText(e.target.value)}
                          placeholder="e.g. Special Offer: 20% Off!"
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Banner Image Upload</label>
                        {bannerImage && (
                          <div className="relative w-full h-16 rounded-lg overflow-hidden border border-slate-200 mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setBannerImage("")}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const img = new Image();
                                img.src = reader.result as string;
                                img.onload = () => {
                                  const canvas = document.createElement("canvas");
                                  const MAX_WIDTH = 1200;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > MAX_WIDTH) {
                                    height = Math.round((height * MAX_WIDTH) / width);
                                    width = MAX_WIDTH;
                                  }

                                  canvas.width = width;
                                  canvas.height = height;

                                  const ctx = canvas.getContext("2d");
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, width, height);
                                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                    setBannerImage(compressedBase64);
                                  } else {
                                    setBannerImage(reader.result as string);
                                  }
                                };
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Banner Link (Optional)</label>
                        <input 
                          type="text"
                          value={bannerLink}
                          onChange={(e) => setBannerLink(e.target.value)}
                          placeholder="e.g. https://your-site.com/offer"
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-655 flex items-center gap-1">
                      Tracking Pixel Script
                    </label>
                    <span className="text-[9px] text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded font-bold uppercase">Pixel</span>
                  </div>
                  <textarea 
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    placeholder="Paste your Facebook Pixel code, Google Analytics ID, custom script, or HTML tracking scripts here..."
                    rows={6}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-700 font-mono outline-none shadow-sm"
                  />
                  <p className="text-[10px] text-slate-450 mt-1 leading-normal">
                    This script tag will be loaded into the dynamic page header of your public landing page form. Perfect for lead conversion tracking.
                  </p>
                </div>
              </div>
            </div>
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
