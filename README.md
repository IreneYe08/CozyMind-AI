# CozyMind-AI

AI-powered room design assistance - MVP
Demo: https://drive.google.com/file/d/1G1Pu2tLAqefuAeCiwQ34zT8PBcBkpZEg/view

## 🚀 Features

- Upload room photos and generate AI-powered "after" designs
- Customize designs with prompts, style tags, budget, and size preferences
- Get Amazon product recommendations for your design
- Save designs to your personal gallery
- Responsive mobile-first UI

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (for authentication and storage)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Go to Storage and create two public buckets:
   - `before` (for before images)
   - `after` (for after images)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
CozyMind-AI/
├── app/
│   ├── api/
│   │   ├── generateInitialAfter/    # Generate initial "after" image
│   │   ├── generateAfterProductList/ # Generate final image + products
│   │   ├── getResult/                # Get single result by ID
│   │   ├── getResults/               # Get all results for user
│   │   ├── saveResult/               # Save result to database
│   │   └── upload/                   # Upload image to Supabase
│   ├── customize/                    # Customize design page
│   ├── final/[id]/                   # Final result page
│   ├── gallery/                      # User gallery page
│   ├── login/                        # Login/signup page
│   ├── preview/                      # Aha moment preview
│   ├── save/                         # Save confirmation page
│   ├── upload/                       # Upload page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home (redirects to /upload)
├── components/
│   ├── ImageCard.tsx                 # Image display component
│   ├── InputSection.tsx              # Form section wrapper
│   ├── LoadingSpinner.tsx            # Loading indicator
│   ├── ProductCard.tsx               # Amazon product card
│   ├── SectionTitle.tsx              # Section heading
│   ├── StyleTagSelector.tsx          # Style tag picker
│   └── UploadBox.tsx                 # Drag-and-drop upload
├── lib/
│   └── supabaseClient.ts             # Supabase client setup
├── supabase/
│   └── schema.sql                    # Database schema
├── types/
│   └── database.ts                   # TypeScript types
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js configuration
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

## 🔄 User Flow

1. **Upload** (`/upload`)` - User uploads a "before" photo
2. **Preview** (`/preview`) - Shows initial AI-generated "after" image
3. **Customize** (`/customize`) - User adds prompt, style tags, budget, size
4. **Final** (`/final/[id]`) - Shows final design + Amazon product list
5. **Save** (`/save`) - Confirmation page after saving
6. **Login** (`/login`) - Authentication (required for gallery)
7. **Gallery** (`/gallery`) - View all saved designs

## 🔌 API Routes

### POST `/api/upload`
Uploads an image to Supabase storage.

**Request:** FormData with `file` field  
**Response:** `{ url: string }`

### POST `/api/generateInitialAfter`
Generates initial "after" image (placeholder - replace with real AI API).

**Request:** `{ before_image_url: string }`  
**Response:** `{ after_image_url: string }`

### POST `/api/generateAfterProductList`
Generates final "after" image + Amazon product list (placeholder - replace with real APIs).

**Request:** `{ before_image_url, prompt, style, budget?, size? }`  
**Response:** `{ final_after_image_url: string, amazon_items: AmazonItem[] }`

### POST `/api/saveResult`
Saves a result to the database.

**Request:** `{ before_image, after_image, prompt, style, budget?, size?, items? }`  
**Response:** `{ id: string }`

### GET `/api/getResults?user_id=xxx`
Gets all results for a user.

**Response:** `ResultRecord[]`

### GET `/api/getResult?id=xxx`
Gets a single result by ID.

**Response:** `ResultRecord`

## 🎨 Responsive Design

All pages are built with mobile-first responsive design:
- **Mobile:** Vertical stacking, full-width components
- **Tablet (md):** 2-column layouts where appropriate
- **Desktop (lg):** Side-by-side layouts, multi-column grids

## 🔐 Authentication

Uses Supabase Auth with email/password. Users must be logged in to:
- Save results
- View gallery

## 📝 TODO

- [ ] Replace placeholder AI image generation with real API
- [ ] Integrate Amazon Product Advertising API
- [ ] Add image optimization
- [ ] Add error boundaries
- [ ] Add loading states for better UX
- [ ] Add image editing capabilities

## 📄 License

See LICENSE file for details.
