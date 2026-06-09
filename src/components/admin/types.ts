export interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "step";
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
}

export interface FormSummary {
  id: string;
  title: string;
  description: string;
  pixelId: string;
  fields: FormField[];
  showBanner: boolean;
  bannerText?: string;
  bannerLink?: string;
  bannerImage?: string;
  createdAt: string;
  submissionCount: number;
}

export interface Submission {
  id: string;
  formId: string;
  formTitle?: string;
  data: Record<string, string | string[]>;
  progress: number;
  createdAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}
