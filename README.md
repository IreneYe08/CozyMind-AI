# 🏡 CozyMind-AI

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Replicate AI](https://img.shields.io/badge/Replicate%20AI-Realistic%20Vision%20v5-orange?style=flat-square&logo=replicate)](https://replicate.com/)

An AI-powered, mobile-first room design companion that transforms messy, empty, or outdated spaces into beautifully curated, shoppable designs in seconds.

**🎥 View Live Demo:** [CozyMind-AI Demo Video](https://drive.google.com/file/d/1G1Pu2tLAqefuAeCiwQ34zT8PBcBkpZEg/view)

---

## 🎯 Product Vision & JTBD

### The Problem
Traditional interior design is a high-friction, high-cost experience. Homeowners and renters face significant barriers:
- **High Designer Fees:** Hiring an interior designer often costs between $100 to $500 per hour.
- **Steep Learning Curve:** Professional 3D rendering software (like SketchUp or AutoCAD) is too complex for casual users.
- **The "Inspiration-to-Acquisition" Gap:** Seeing a beautiful mood board is inspiring, but finding and purchasing the actual furniture shown is tedious and time-consuming.

### Jobs-to-be-Done (JTBD)
> **When I am** redecorating or moving into a new room,  
> **I want to** instantly visualize professional design styles applied to my physical space and find shoppable matching products,  
> **So that I can** confidently make purchase decisions and bring my dream room to life within my budget.

---

## 🚀 Key Features

*   **⚡ Aha-Moment Initial Preview:** Upload a "before" photo and instantly see a high-fidelity redesigned version in less than 15 seconds.
*   **🎨 Granular Style Customization:** Tailor the AI model using customized prompts, layout style tags (e.g., *Japandi, Mid-Century Modern, Industrial, Minimalist*), budget tiers, and room size parameters.
*   **🛒 E-Commerce Integration (Shoppable AI):** Generates structural designs alongside curated Amazon product recommendations, closing the loop from inspiration to immediate purchase.
*   **📁 Personal Gallery & Authentication:** A secure Supabase Auth and Database layer allows users to persist their design records, catalog item details, and revisit their historical layout galleries.
*   **📱 Flawless Responsive UI:** Built with a mobile-first philosophy, adapting smoothly from narrow handheld screens to high-definition desktop views.

---

## 🗺️ Product Architecture & Data Flow

CozyMind-AI integrates Supabase, Replicate AI, and Next.js App Router API endpoints to deliver a fast, stateful user experience.

```
+------------------+         Upload Photo         +--------------------------+
|                  | ---------------------------> |   Supabase Buckets       |
|   User Client    |                              |   (before / after S3)    |
|   (Next.js Web)  | <--------------------------- +--------------------------+
|                  |        Image CDN URLs
+------------------+
   |          ^
   | POST     | Response: Final Image URL + Amazon Items
   v          |
+----------------------------------------------------------------------------+
|                       Next.js App Router (Backend APIs)                     |
|                                                                            |
|   +--------------------+       Generate Image       +------------------+   |
|   | /generateInitial   | -------------------------> |   Replicate AI   |   |
|   |                    | <------------------------- |   (Realistic     |   |
|   +--------------------+     Output Design Image    |    Vision v5)    |   |
|                                                     +------------------+   |
|   +--------------------+       Match Products                              |   |
|   | /generateAfterPro- | -------------------------> [ Future: Amazon ]     |   |
|   |  ductList          |                            [ Product API   ]     |   |
|   +--------------------+                                                   |   |
+----------------------------------------------------------------------------+
```

### User Flow
1.  **Upload (`/upload`):** User takes/uploads a "before" photo (stored securely in Supabase `before` bucket).
2.  **Preview (`/preview`):** Instant triggers `/api/generateInitialAfter` to showcase the immediate AI transformation.
3.  **Customize (`/customize`):** Users fine-tune the parameters (style tag, prompt, budget tier, and size).
4.  **Final (`/final/[id]`):** Calls `/api/generateAfterProductList` to generate the personalized design along with a curated Amazon Product List.
5.  **Save (`/save`):** Persists the complete result package into the Supabase database.
6.  **Login (`/login`):** Streamlined user authentication.
7.  **Gallery (`/gallery`):** Fetches historical designs specific to the authenticated `user_id`.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, TypeScript
- **Backend / BaaS:** Supabase (Auth, S3-compatible Storage, PostgreSQL Database)
- **AI Inference:** Replicate API running `lucataco/realistic-vision-v5` for spatial-preserving Image-to-Image generation
- **E-Commerce Simulation:** Mocked Amazon Product Advertising API matching generated furniture tags to real product entries

---

## ⚙️ Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/IreneYe08/CozyMind-AI.git
cd CozyMind-AI
npm install
```

### 2. Configure Supabase Backend
1. Create a free project at [Supabase](https://supabase.com).
2. Execute the schema script located in `supabase/schema.sql` inside the Supabase SQL Editor.
3. Create two public Storage buckets:
   - `before` (For raw upload photos)
   - `after` (For AI-generated design results)

### 3. Environment Variables
Create a `.env.local` file in your root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_TOKEN=your_replicate_api_token
```

### 4. Run Locally
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧠 PM Perspective: Core Product Decisions & Tradeoffs

During development, several engineering-to-product trade-offs were made to guarantee an optimal user experience:

*   **Spatial Consistency vs. Creativity (The 0.35 Strength Sweet Spot):**  
    Using AI to redesign rooms often leads to "hallucinated" layouts (e.g., doors disappearing, windows moving). By utilizing Replicate's Image-to-Image pipeline and setting the `strength` to exactly `0.35` and `guidance_scale` to `3`, we ensure the core room geometry (walls, window placements, doors) remains structurally unchanged, while replacing only the aesthetic elements (furniture, paint, decoration).
*   **Aha-Moment Retention Strategy:**  
    Rather than forcing users to fill out complex forms upfront, we adopted an "upload-first, configure-later" model. The user uploads a photo and is immediately met with a gorgeous AI-redesign "Aha-moment" within seconds, drastically increasing signup and customization conversion rates.

---

## 🔮 Future Product Roadmap

- [ ] **Live AI Inpainting:** Allow users to brush over specific furniture items (e.g., "just replace the sofa") instead of redesigning the whole room.
- [ ] **Amazon Product Advertising API Integration:** Connect mock items with live, region-specific Amazon products with real-time pricing and stock data.
- [ ] **HD Upscaling:** Integrate GFPGAN / RealESRGAN pipelines via Replicate to generate photo-realistic 4K design outputs.
- [ ] **Interactive Budget Allocator:** A slider letting users dynamically adjust furniture pricing tiers and instantly recalculate the total cost of the room.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
