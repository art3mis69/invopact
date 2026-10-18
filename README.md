<div align="center">

# ⚡ InvoPact

### *The Frictionless Invoice & Contract Studio for Freelancers, Agencies & Creators*

[![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_%26_Offline-success?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Zero Database](https://img.shields.io/badge/Database-Zero_%2F_100%25_Private-emerald?logo=lock&logoColor=white)](#-zero-database-privacy-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

<p align="center">
  <b>Generate client-ready invoices and legally sound Statements of Work in under 60 seconds.</b><br/>
  No accounts. No subscriptions. No tracking. Runs 100% in your browser.
</p>

---

</div>

## 🌟 Why InvoPact?

Traditional invoicing and contract software is bloated with mandatory sign-ups, expensive monthly tiers, and invasive tracking. **InvoPact** reclaims simplicity:

- **Zero-Friction**: Open the app and start typing immediately.
- **Dual-Engine Studio**: Toggle seamlessly between itemized **Invoices** and legal **Agreements / SOWs**.
- **Instant 2-Way Conversion**: Convert an agreement into an itemized bill (or vice versa) in one click.
- **100% Privacy & Zero-DB**: No remote database or third-party servers. Your client names, rates, and financials never leave your machine.
- **Installable Desktop/Mobile PWA**: Runs fully offline as a standalone native-feeling application.

---

## ✨ Feature Highlights

### 🧾 1. Professional Billing & Invoices
* **Live Calculation**: Auto-computes subtotals, single or dual tax brackets (GST, VAT, CGST/SGST), custom discount rates, and shipping fees.
* **Multi-Currency Support**: Instant switching across `$ USD`, `€ EUR`, `£ GBP`, `₹ INR`, `CA$ CAD`, `A$ AUD`, `¥ JPY`, and `S$ SGD`.
* **Dynamic Payment QR Codes**: Scan-to-pay via Indian UPI, PayPal links, or custom Stripe/payment gateway URLs.
* **Rubber Stamp Toggle**: Interactive vintage `PAID` rubber stamp that can be stamped onto completed invoices.

### 📜 2. Legal Contracts & Statements of Work (SOW)
* **Plain-Language Legal Structure**: Project scope overview, itemized milestone deliverables, payment terms, and customizable clauses (IP transfer, confidentiality, termination, liability).
* **Clause Management**: Reorder, add, or customize contract legal clauses on the fly.
* **Interactive e-Signatures**: Draw signatures with a stylus/mouse or type stylized signatures. Signatures are embedded directly into the document.

### 🔄 3. Two-Way Document Conversion
* **Agreement ➔ Invoice**: Ports client details, deliverables, and total contract fees into line items ready for billing.
* **Invoice ➔ Agreement**: Transforms an itemized quotation or invoice into a formal services contract.

### 📊 4. Financial Metrics Dashboard & Library
* **Live Financial Pipeline**: The built-in Library calculates:
  * **Total Billed**: Gross volume across all documents.
  * **Collected / Signed**: Realized revenue from paid invoices and signed agreements.
  * **Pending / Due**: Outstanding invoices with an **Overdue** count badge.
* **Document Manager**: Filter by type, search across client names or document numbers, duplicate, and delete documents with immediate feedback.

### 📇 5. Client Directory & One-Click Auto-Fill
* Save frequent clients to your local directory.
* Auto-populate client details in new invoices or contracts with a single selection.
* Save your default business identity and company logo once to auto-apply across all documents.

### 🔒 6. Zero-Database & Privacy Architecture
* **100% Client-Side**: All documents, profiles, and directories are stored in the browser's `localStorage`.
* **Complete Offline Functionality**: Service Worker caching allows InvoPact to launch and work with zero internet connection.
* **Encrypted URL Sharing**: Share documents directly via compressed, tamper-proof LZ-string URL hashes—no backend server needed.
* **JSON Backup & Restore**: One-click full database export and import to backup your workspace across machines.

### 🖨️ 7. Pixel-Perfect A4 Print & PDF Export
* **Guaranteed Single-Page Fit**: Carefully calibrated layout with visual page-boundary indicator.
* **Vector Print**: Uses `@media print` styling for razor-sharp typography.
* **Direct PDF Download**: Client-side PDF generation powered by `jsPDF` and `html2canvas`.
* **PNG Image Export**: High-resolution image capture for quick messaging attachments.
* **Watermarks**: Selectable watermark overlays (`DRAFT`, `CONFIDENTIAL`, `PAID`, `VOID`, `ORIGINAL`).

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or later)
* `npm`, `pnpm`, or `yarn`

### Installation

```bash
# 1. Clone your repository
git clone <your-git-repo-url>
cd invopact

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173/`** to start creating documents.

---

## 🛠️ Build & Deployment

### Production Build
```bash
npm run build
```
This generates a static, high-performance production bundle in the `dist/` directory.

### Deploy in Seconds
Because InvoPact requires **no database or server-side runtime**, it can be hosted for free on:
* **GitHub Pages**
* **Vercel** (`vercel --prod`)
* **Netlify**
* **Cloudflare Pages**

---

## 📁 Project Architecture

```text
invopact/
├── public/
│   ├── favicon.svg          # Modern SVG favicon
│   ├── icon-192.png         # PWA Android/Desktop raster icon
│   ├── icon-512.png         # High-res PWA splash & taskbar icon
│   ├── apple-touch-icon.png # iOS home screen icon
│   ├── manifest.json        # PWA Web App Manifest
│   └── sw.js                # Offline Service Worker cache
├── src/
│   ├── components/
│   │   ├── BusinessProfileModal.tsx # Business identity & defaults
│   │   ├── ColorPicker.tsx          # Accent color palette selector
│   │   ├── ContractForm.tsx         # Agreement & SOW editor
│   │   ├── ContractPreview.tsx      # A4 live agreement sheet
│   │   ├── Header.tsx               # Primary toolbar & navigation
│   │   ├── InvoiceForm.tsx          # Invoice editor & line items
│   │   ├── InvoicePreview.tsx       # A4 live invoice sheet
│   │   ├── LogoUploader.tsx         # Image & logo compressor
│   │   ├── SavedDocsModal.tsx       # Library & Financial Dashboard
│   │   └── SignatureModal.tsx       # Canvas drawing & typed signature
│   ├── types/
│   │   └── index.ts                 # Full TypeScript interfaces
│   ├── utils/
│   │   ├── formatters.ts            # Currency, numbers & date helpers
│   │   ├── pdfGenerator.ts          # jsPDF / html2canvas export
│   │   ├── storage.ts               # LocalStorage & JSON backup engine
│   │   └── urlSharing.ts            # LZ-string compression engine
│   ├── App.tsx                      # Root state & layout coordinator
│   ├── main.tsx                     # React 19 entry point
│   └── index.css                    # Tailwind CSS v4 styling
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI framework with React Portals & fast rendering |
| **TypeScript** | Strict compile-time safety and self-documenting types |
| **Tailwind CSS v4** | Lightweight modern utility styling & dark mode support |
| **Vite 8** | Ultra-fast lightning HMR and optimized production bundling |
| **Lucide React** | Clean, consistent icons |
| **jsPDF & html2canvas** | Client-side vector PDF document rendering |
| **lz-string** | High-density URL state compression for serverless sharing |
| **qrcode.react** | Dynamic vector QR code generation for payments |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
