"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
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

interface PublicFormRendererProps {
  formId: string;
  title: string;
  description: string;
  fields: FormField[];
  showBanner?: boolean;
  bannerText?: string;
  bannerLink?: string;
  bannerImage?: string;
}

interface StepGroup {
  title: string;
  fields: FormField[];
}

export default function PublicFormRenderer({
  formId,
  title,
  description,
  fields,
  showBanner = false,
  bannerText = "",
  bannerLink = "",
  bannerImage = ""
}: PublicFormRendererProps) {
  // Parse fields into dynamic steps
  const steps: StepGroup[] = [];
  let currentStepFields: FormField[] = [];
  let currentStepTitle = "Fill Out The Form";

  fields.forEach((field) => {
    if (field.type === "step") {
      if (currentStepFields.length > 0 || steps.length > 0) {
        steps.push({ title: currentStepTitle, fields: currentStepFields });
      }
      currentStepTitle = field.label;
      currentStepFields = [];
    } else {
      currentStepFields.push(field);
    }
  });

  if (currentStepFields.length > 0 || steps.length === 0) {
    steps.push({ title: currentStepTitle, fields: currentStepFields });
  }

  // State Management
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = steps[currentStepIdx];
  const totalSteps = steps.length;

  // Calculate progress based on actual input fields filled
  const inputFields = fields.filter(f => f.type !== "step");
  const filledFieldsCount = inputFields.filter(f => {
    const val = formData[f.id];
    return val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0);
  }).length;
  const progressPercentage = inputFields.length > 0 ? Math.round((filledFieldsCount / inputFields.length) * 100) : 100;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    currentStep.fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track progress partially on step transition
  const trackProgress = async (nextStepIndex: number) => {
    try {
      // Filter out data from subsequent steps to only log current progress
      const completedFields = steps
        .slice(0, nextStepIndex)
        .flatMap((s) => s.fields.map((f) => f.id));

      const progressData: Record<string, any> = {};
      completedFields.forEach((fid) => {
        if (formData[fid] !== undefined) {
          progressData[fid] = formData[fid];
        }
      });

      // Send background progress tracking event
      await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: progressData,
          progress: progressPercentage
        })
      });
    } catch (err) {
      console.warn("Background progress tracking failed:", err);
    }
  };

  const handleNext = async () => {
    if (validateStep()) {
      const nextIdx = currentStepIdx + 1;
      if (nextIdx < totalSteps) {
        setCurrentStepIdx(nextIdx);
        await trackProgress(nextIdx);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      // Map form ID keys to full label names for readable database results
      const submissionPayload: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.type !== "step" && formData[field.id] !== undefined) {
          submissionPayload[field.label] = formData[field.id];
        }
      });

      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: submissionPayload,
          progress: 100.0
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert("Failed to submit form: " + data.error);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred during submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBanner = () => {
    if (!showBanner) return null;

    const bannerContent = (
      <div className="relative w-full h-32 md:h-40 overflow-hidden flex items-center justify-center group">
        {bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={bannerImage} 
            alt="Campaign Banner" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 animate-gradient-xy"></div>
        )}
        {/* Visual Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] transition-all duration-300 group-hover:bg-slate-900/5"></div>
        
        <div className="relative z-10 text-center px-4 max-w-lg">
          <p className="text-white text-base md:text-lg font-black tracking-tight drop-shadow-md flex items-center justify-center gap-1.5">
            {bannerText || "Exclusive Campaign Banner"}
            {bannerLink && <ExternalLink className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />}
          </p>
        </div>
      </div>
    );

    if (bannerLink) {
      return (
        <a 
          href={bannerLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full border-b border-slate-200/80 overflow-hidden cursor-pointer"
        >
          {bannerContent}
        </a>
      );
    }

    return <div className="w-full border-b border-slate-200/80 overflow-hidden">{bannerContent}</div>;
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 space-y-6">
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Thank you for completing the form. Your response has been securely and successfully recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Top Banner (If Configured) */}
      {renderBanner()}

      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
        {/* Title & Description Banner */}
        {currentStepIdx === 0 && (
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-slate-550 text-sm leading-relaxed">
              {description}
            </p>
            <p className="text-[11px] text-slate-400">
              Required fields are marked with <span className="text-red-500 font-bold">*</span>
            </p>
          </div>
        )}

        {/* Steps Progress Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-sky-600 font-extrabold tracking-wider uppercase">
              {totalSteps > 1 ? `Step ${currentStepIdx + 1} of ${totalSteps}` : "Form Progress"}
            </span>
            <span className="text-slate-600 font-bold">{progressPercentage}% filled</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {totalSteps > 1 && (
            <h2 className="text-md sm:text-lg font-bold text-slate-700 mt-2">
              {currentStep.title}
            </h2>
          )}
        </div>

        {/* Form Fields Canvas */}
        <div className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-750 block">
                {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
              </label>

              {field.type === "text" && (
                <input 
                  type="text"
                  value={formData[field.id] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-450 outline-none transition duration-200 shadow-sm"
                />
              )}

              {field.type === "textarea" && (
                <textarea 
                  value={formData[field.id] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-450 outline-none resize-none transition duration-200 shadow-sm"
                />
              )}

              {field.type === "select" && (
                <div className="relative">
                  <select 
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 rounded-xl text-sm text-slate-800 outline-none transition duration-200 shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="text-slate-400">{field.placeholder || "Select option..."}</option>
                    {field.options?.map((opt, idx) => (
                      <option key={idx} value={opt} className="text-slate-800">{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              )}

              {field.type === "radio" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {field.options?.map((opt, idx) => {
                    const isChecked = formData[field.id] === opt;
                    return (
                      <label 
                        key={idx} 
                        className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                          isChecked 
                            ? "bg-sky-50 border-sky-400 ring-1 ring-sky-300" 
                            : "bg-white border-slate-200 hover:bg-slate-50/70 hover:border-slate-300"
                        }`}
                      >
                        <input 
                          type="radio"
                          name={field.id}
                          value={opt}
                          checked={isChecked}
                          onChange={() => handleInputChange(field.id, opt)}
                          className="w-4.5 h-4.5 text-sky-605 focus:ring-0 accent-sky-500 border-slate-300 bg-white"
                        />
                        <span className={`text-sm font-semibold transition-colors ${isChecked ? "text-sky-700" : "text-slate-700"}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === "checkbox" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {field.options?.map((opt, idx) => {
                    const currentValues = formData[field.id] || [];
                    const isChecked = currentValues.includes(opt);
                    return (
                      <label 
                        key={idx} 
                        className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                          isChecked 
                            ? "bg-sky-50 border-sky-400 ring-1 ring-sky-300" 
                            : "bg-white border-slate-200 hover:bg-slate-50/70 hover:border-slate-300"
                        }`}
                      >
                        <input 
                          type="checkbox"
                          name={field.id}
                          value={opt}
                          checked={isChecked}
                          onChange={() => {
                            let newVals;
                            if (isChecked) {
                              newVals = currentValues.filter((v: string) => v !== opt);
                            } else {
                              newVals = [...currentValues, opt];
                            }
                            handleInputChange(field.id, newVals);
                          }}
                          className="w-4.5 h-4.5 text-sky-605 focus:ring-0 accent-sky-500 rounded border-slate-300 bg-white"
                        />
                        <span className={`text-sm font-semibold transition-colors ${isChecked ? "text-sky-700" : "text-slate-700"}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.helpText && (
                <p className="text-xs text-slate-450 mt-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-450" /> {field.helpText}
                </p>
              )}

              {errors[field.id] && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {errors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Wizard Action Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <div>
            {currentStepIdx > 0 && (
              <button 
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div>
            {currentStepIdx < totalSteps - 1 ? (
              <button 
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-705 text-white rounded-xl transition text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/10 border border-sky-400/20 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/15 border border-emerald-400/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
