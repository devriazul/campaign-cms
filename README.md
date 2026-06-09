# Form Builder CMS (Campaign CMS)

A modern, high-performance Content Management System (CMS) designed for building dynamic forms, generating standalone landing pages, and capturing leads with real-time conversion tracking. Built using Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma, and SQLite.

---

## 🚀 Features

### 🛠️ Interactive Form Builder
* **Dynamic Fields:** Support for text inputs, textareas, dropdown selects, radio buttons, checkboxes, and multi-step pagination (`step` fields).
* **Rich Customization:** Configure field labels, placeholders, helper descriptions, validation rules (required/optional), layout alignments, and options.
* **Canvas Preview:** An interactive canvas that renders fields in real-time as you build.

### 📢 Banner CTA Customization
* **Promotional Banner:** Opt-in banner overlays on dynamic form pages.
* **Custom Assets:** Set customizable banner copy, call-to-action redirection links, and branding banner image URLs.

### 📊 Admin Dashboard & Insights
* **Metrics Snapshot:** Instant counters for total forms generated, leads collected, and average completion/progress rate.
* **Performance Charts:** Visual timeline charts displaying lead capture trends over time.
* **Lead Database:** Search, filter, and inspect collected submissions. Tracks multi-step progress rate (partial vs. complete submissions).
* **Forms Registry:** Easy management tool to edit, copy public URLs, view submissions per form, or delete forms.
* **Global Portal Settings:** Edit portal branding, default SEO headers, and integrations.

### 🌐 Dynamic Landing Pages & Pixel Tracking
* **Automatic Routing:** Standalone, responsive landing pages under `/form/[id]`.
* **Pixel & Script Injection:** Built-in tracking parameter field to inject Facebook Pixels, Google Analytics, or custom tracking scripts per form.

---

## 🛠️ Tech Stack

* **Frontend:** [React 19](https://react.dev/), [Next.js 16 (App Router)](https://nextjs.org/), [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & ORM:** [SQLite](https://sqlite.org/), [Prisma Client v6](https://www.prisma.io/)
* **Icons & UI Extras:** [Lucide React](https://lucide.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Directory Structure

```text
├── prisma/
│   ├── dev.db            # Local SQLite database file
│   └── schema.prisma     # Prisma database schema definition
├── src/
│   ├── app/
│   │   ├── admin/        # Admin portal routes (login, create page, dashboard)
│   │   ├── api/          # REST API endpoints (forms, submissions, settings)
│   │   ├── form/         # Dynamic public-facing landing page route (/form/[id])
│   │   ├── globals.css   # Main Tailwind CSS configurations
│   │   ├── layout.tsx    # App root layout
│   │   └── page.tsx      # Main application entry/redirect
│   ├── components/
│   │   ├── admin/        # Admin components (dashboard, canvas, sidebar, customizer)
│   │   └── public-form/  # Components for rendering the public-facing form
│   └── lib/              # Shared helper modules (Prisma client)
```

---

## ⚙️ Database Schema

The SQLite schema consists of three main models:

```prisma
model Form {
  id          String       @id @default(uuid())
  title       String
  description String?
  titleAlign  String?      @default("left")
  pixelId     String?      // Custom tracking tags (Facebook Pixel / Google Analytics)
  fields      String       // JSON-serialized string of form elements/fields config
  showBanner  Boolean      @default(false)
  bannerText  String?
  bannerLink  String?
  bannerImage String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  submissions Submission[]
}

model Submission {
  id        String   @id @default(uuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  data      String   // JSON-serialized string of field values
  progress  Float    @default(100.0) // Completion progress (0-100) for multi-step tracking
  createdAt DateTime @default(now())
}

model Setting {
  key   String @id
  value String
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or later recommended).

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization
Ensure database migrations are run and client is generated:
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 5. Production Build
```bash
npm run build
npm run start
```
