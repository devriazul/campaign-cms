"use client";

import React, { useState, useCallback, useMemo } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Check
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
  titleAlign?: string;
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
  titleAlign = "left",
  fields,
  showBanner = false,
  bannerText = "",
  bannerLink = "",
  bannerImage = ""
}: PublicFormRendererProps) {
  // Parse fields into dynamic steps
  const steps = useMemo(() => {
    const stepGroups: StepGroup[] = [];
    let currentStepFields: FormField[] = [];
    let currentStepTitle = "Fill Out The Form";

    fields.forEach((field) => {
      if (field.type === "step") {
        if (currentStepFields.length > 0 || stepGroups.length > 0) {
          stepGroups.push({ title: currentStepTitle, fields: currentStepFields });
        }
        currentStepTitle = field.label;
        currentStepFields = [];
      } else {
        currentStepFields.push(field);
      }
    });

    if (currentStepFields.length > 0 || stepGroups.length === 0) {
      stepGroups.push({ title: currentStepTitle, fields: currentStepFields });
    }
    return stepGroups;
  }, [fields]);

  // State Management
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = steps[currentStepIdx];
  const totalSteps = steps.length;

  // Calculate progress based on actual input fields filled
  const inputFields = useMemo(() => fields.filter(f => f.type !== "step"), [fields]);
  const filledFieldsCount = useMemo(() => {
    return inputFields.filter(f => {
      const val = formData[f.id];
      return val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0);
    }).length;
  }, [inputFields, formData]);

  const progressPercentage = useMemo(() => {
    return inputFields.length > 0 ? Math.round((filledFieldsCount / inputFields.length) * 100) : 100;
  }, [inputFields, filledFieldsCount]);

  // Inline Validation
  const validateField = useCallback((field: FormField, value: string | string[]): string => {
    if (field.required) {
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        return `${field.label} is required`;
      }
    }
    return "";
  }, []);

  const handleInputChange = useCallback((field: FormField, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field.id]: value }));
    
    // Validate instantly if touched
    if (touched[field.id]) {
      const errMsg = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (errMsg) {
          next[field.id] = errMsg;
        } else {
          delete next[field.id];
        }
        return next;
      });
    }
  }, [touched, validateField]);

  const handleInputBlur = useCallback((field: FormField) => {
    setTouched((prev) => ({ ...prev, [field.id]: true }));
    const val = formData[field.id] || "";
    const errMsg = validateField(field, val);
    setErrors((prev) => {
      const next = { ...prev };
      if (errMsg) {
        next[field.id] = errMsg;
      } else {
        delete next[field.id];
      }
      return next;
    });
  }, [formData, validateField]);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    currentStep.fields.forEach((field) => {
      newTouched[field.id] = true;
      const val = formData[field.id] || "";
      const errMsg = validateField(field, val);
      if (errMsg) {
        newErrors[field.id] = errMsg;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, validateField]);

  // Track progress partially on step transition
  const trackProgress = async (nextStepIndex: number) => {
    try {
      const completedFields = steps
        .slice(0, nextStepIndex)
        .flatMap((s) => s.fields.map((f) => f.id));

      const progressData: Record<string, any> = {};
      completedFields.forEach((fid) => {
        if (formData[fid] !== undefined) {
          progressData[fid] = formData[fid];
        }
      });

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
      const submissionPayload: Record<string, string | string[]> = {};
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
      <div className="w-full relative overflow-hidden flex items-center justify-center bg-slate-50 h-40 sm:h-48 md:h-56 shadow-inner transition-opacity hover:opacity-95 duration-200">
        {bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={bannerImage} 
            alt="Campaign Banner" 
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#2d3e50] via-[#33475b] to-[#ff7a59] flex items-center justify-center px-4 text-center">
            <p className="text-white text-xs sm:text-sm md:text-base font-bold tracking-tight drop-shadow-md flex items-center justify-center gap-1.5 animate-pulse">
              {bannerText || "Exclusive Campaign Banner"}
              {bannerLink && <ExternalLink className="w-3.5 h-3.5 opacity-80" />}
            </p>
          </div>
        )}
      </div>
    );

    if (bannerLink) {
      return (
        <a 
          href={bannerLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full border-b border-[#cbd6e2] overflow-hidden cursor-pointer"
        >
          {bannerContent}
        </a>
      );
    }

    return <div className="w-full border-b border-[#cbd6e2] overflow-hidden">{bannerContent}</div>;
  };

  const getFieldStatus = (field: FormField) => {
    const isTouched = touched[field.id];
    const val = formData[field.id];
    const isFilled = val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0);
    const hasErr = !!errors[field.id];

    if (!isTouched) return "idle";
    if (hasErr) return "error";
    if (isFilled) return "valid";
    return "idle";
  };

  // World-class Confetti Particles generator
  const confettiParticles = useMemo(() => {
    const colors = ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-pink-400", "bg-purple-400", "bg-orange-400"];
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 60;
      const r = 180 + Math.random() * 360;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.2;
      
      return (
        <div
          key={i}
          className={`absolute w-2 h-3.5 rounded-sm animate-confetti ${color}`}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            "--x": `${x}px`,
            "--y": `${y}px`,
            "--r": `${r}deg`,
            animationDelay: `${delay}s`
          } as React.CSSProperties}
        />
      );
    });
  }, []);

  if (submitted) {
    return (
      <div className="text-center py-20 px-6 space-y-6 animate-scale-in relative overflow-hidden bg-white rounded-lg border-t-4 border-[#ff7a59] border-x border-b border-[#cbd6e2] shadow-lg max-w-xl mx-auto">
        {/* Confetti Explosion Trigger */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {confettiParticles}
        </div>

        <div className="w-16 h-16 bg-[#ff7a59]/10 border border-[#ff7a59]/25 rounded-full flex items-center justify-center mx-auto text-[#ff7a59] shadow-inner animate-checkmark relative z-15">
          <Check className="w-8 h-8 stroke-[3.5]" />
        </div>
        <div className="space-y-2.5 relative z-15">
          <h2 className="text-2xl font-bold text-[#2d3e50] tracking-tight">Thank you!</h2>
          <p className="text-[#516f90] text-sm max-w-sm mx-auto leading-relaxed">
            Your submission has been received. We will process your information and get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border-t-4 border-[#ff7a59] border-x border-b border-[#cbd6e2] shadow-lg overflow-hidden transition-all duration-300">
      {/* Top Banner (If Configured) */}
      {renderBanner()}

      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
        {/* Title & Description Banner */}
        {currentStepIdx === 0 && (
          <div className={`pb-6 border-b border-[#f5f8fa] space-y-2 animate-slide-up ${
            titleAlign === "center" ? "text-center" : titleAlign === "right" ? "text-right" : "text-left"
          }`}>
            <h1 className="text-2xl font-bold text-[#2d3e50] tracking-tight leading-snug">
              {title}
            </h1>
            <p className="text-[#516f90] text-[14px] leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Step Title Indicator (No progress bar / dots) */}
        {totalSteps > 1 && (
          <div className="pb-4 border-b border-[#cbd6e2]/60 animate-slide-up flex justify-between items-center">
            <h2 className="text-xs font-bold text-[#ff7a59] uppercase tracking-wider">
              {currentStep.title}
            </h2>
            <span className="text-[11px] text-[#516f90] font-bold">
              Step {currentStepIdx + 1} of {totalSteps}
            </span>
          </div>
        )}

        {/* Form Fields Canvas with Slide-Up Transition */}
        <div key={currentStepIdx} className="space-y-5 animate-slide-up">
          {currentStep.fields.map((field) => {
            const status = getFieldStatus(field);

            return (
              <div key={field.id} className="space-y-1 relative group">
                <label className="hs-label flex items-center justify-between">
                  <span>
                    {field.label} {field.required && <span className="text-[#ff7a59] font-bold">*</span>}
                  </span>
                </label>

                <div className="relative flex items-center w-full">
                  {field.type === "text" && (
                    <input 
                      type="text"
                      value={(formData[field.id] as string) || ""}
                      placeholder={field.placeholder || ""}
                      onBlur={() => handleInputBlur(field)}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={`hs-input rounded-[3px] py-3 text-sm transition-all duration-150 ${
                        status === "error" ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "focus:border-[#ff7a59]"
                      }`}
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea 
                      value={(formData[field.id] as string) || ""}
                      placeholder={field.placeholder || ""}
                      onBlur={() => handleInputBlur(field)}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      rows={3}
                      className={`hs-input rounded-[3px] py-3 text-sm resize-none transition-all duration-150 ${
                        status === "error" ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "focus:border-[#ff7a59]"
                      }`}
                    />
                  )}

                  {field.type === "select" && (
                    <div className="relative w-full">
                      <select 
                        value={(formData[field.id] as string) || ""}
                        onBlur={() => handleInputBlur(field)}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className={`hs-input rounded-[3px] py-3 text-sm pr-10 appearance-none cursor-pointer transition-all duration-150 ${
                          status === "error" ? "border-red-500 focus:border-red-500" : "focus:border-[#ff7a59]"
                        }`}
                      >
                        <option value="" className="text-slate-400">{field.placeholder || "Select option..."}</option>
                        {field.options?.map((opt, idx) => (
                          <option key={idx} value={opt} className="text-[#33475b]">{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#516f90]">
                        <svg className="fill-current h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  )}

                  {/* Icon Feedback over inputs */}
                  {field.type !== "radio" && field.type !== "checkbox" && (
                    <div className="absolute right-3.5 pointer-events-none z-10">
                      {status === "error" && <AlertCircle className="w-4 h-4 text-red-500 animate-scale-in" />}
                      {status === "valid" && <CheckCircle2 className="w-4 h-4 text-[#ff7a59] animate-scale-in" />}
                    </div>
                  )}
                </div>

                {field.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    {field.options?.map((opt, idx) => {
                      const isChecked = formData[field.id] === opt;
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-center gap-3 px-4 py-3 border transition-all duration-150 cursor-pointer rounded-[3px] select-none hover:shadow-sm ${
                            isChecked 
                              ? "bg-[#ff7a59]/5 border-[#ff7a59] ring-1 ring-[#ff7a59]/25 text-[#ff7a59]" 
                              : "bg-white border-[#cbd6e2] hover:bg-[#f5f8fa] text-[#33475b]"
                          }`}
                        >
                          <input 
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={isChecked}
                            onBlur={() => handleInputBlur(field)}
                            onChange={() => handleInputChange(field, opt)}
                            className="w-4 h-4 text-[#ff7a59] focus:ring-0 accent-[#ff7a59] border-[#cbd6e2] bg-white cursor-pointer"
                          />
                          <span className="text-xs font-bold leading-none">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    {field.options?.map((opt, idx) => {
                      const rawValues = formData[field.id];
                      const currentValues = Array.isArray(rawValues) ? rawValues : [];
                      const isChecked = currentValues.includes(opt);
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-center gap-3 px-4 py-3 border transition-all duration-150 cursor-pointer rounded-[3px] select-none hover:shadow-sm ${
                            isChecked 
                              ? "bg-[#ff7a59]/5 border-[#ff7a59] ring-1 ring-[#ff7a59]/25 text-[#ff7a59]" 
                              : "bg-white border-[#cbd6e2] hover:bg-[#f5f8fa] text-[#33475b]"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            name={field.id}
                            value={opt}
                            checked={isChecked}
                            onBlur={() => handleInputBlur(field)}
                            onChange={() => {
                              let newVals;
                              if (isChecked) {
                                newVals = currentValues.filter((v: string) => v !== opt);
                              } else {
                                newVals = [...currentValues, opt];
                              }
                              handleInputChange(field, newVals);
                            }}
                            className="w-4 h-4 text-[#ff7a59] focus:ring-0 accent-[#ff7a59] rounded-[2px] border-[#cbd6e2] bg-white cursor-pointer"
                          />
                          <span className="text-xs font-bold leading-none">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {field.helpText && (
                  <p className="text-[11px] text-[#516f90] mt-1 flex items-center gap-1.5 pl-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#cbd6e2]" /> {field.helpText}
                  </p>
                )}

                {status === "error" && errors[field.id] && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1.5 pl-0.5 animate-scale-in">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {errors[field.id]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Wizard Action Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-[#cbd6e2]/60">
          <div>
            {currentStepIdx > 0 && (
              <button 
                type="button"
                onClick={handleBack}
                className="hs-button-secondary text-xs font-bold py-2.5 px-4.5"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
            )}
          </div>

          <div>
            {currentStepIdx < totalSteps - 1 ? (
              <button 
                type="button"
                onClick={handleNext}
                className="hs-button-primary text-xs font-bold py-2.5 px-5 shadow-sm shadow-[#ff7a59]/10"
              >
                Next <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={submitting}
                className="hs-button-primary text-xs font-bold py-2.5 px-6 disabled:opacity-50 shadow-sm shadow-[#ff7a59]/10"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

