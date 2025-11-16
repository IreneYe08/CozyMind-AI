# CozyMind-AI Folder Structure

```
CozyMind-AI/
│
├── app/                                    # Next.js App Router
│   ├── api/                                # API Routes
│   │   ├── generateInitialAfter/
│   │   │   └── route.ts                    # Generate initial "after" image
│   │   ├── generateAfterProductList/
│   │   │   └── route.ts                    # Generate final image + products
│   │   ├── getResult/
│   │   │   └── route.ts                    # Get single result by ID
│   │   ├── getResults/
│   │   │   └── route.ts                    # Get all results for user
│   │   ├── saveResult/
│   │   │   └── route.ts                    # Save result to database
│   │   └── upload/
│   │       └── route.ts                    # Upload image to Supabase
│   │
│   ├── customize/
│   │   └── page.tsx                        # Customize design page
│   ├── final/
│   │   └── [id]/
│   │       └── page.tsx                    # Final result page (dynamic)
│   ├── gallery/
│   │   └── page.tsx                        # User gallery page
│   ├── login/
│   │   └── page.tsx                        # Login/signup page
│   ├── preview/
│   │   └── page.tsx                        # Aha moment preview
│   ├── save/
│   │   └── page.tsx                        # Save confirmation page
│   ├── upload/
│   │   └── page.tsx                        # Upload page
│   │
│   ├── globals.css                         # Global Tailwind styles
│   ├── layout.tsx                          # Root layout component
│   └── page.tsx                            # Home page (redirects to /upload)
│
├── components/                             # React Components
│   ├── ImageCard.tsx                       # Image display component
│   ├── InputSection.tsx                    # Form section wrapper
│   ├── LoadingSpinner.tsx                  # Loading indicator
│   ├── ProductCard.tsx                     # Amazon product card
│   ├── SectionTitle.tsx                    # Section heading component
│   ├── StyleTagSelector.tsx                # Style tag picker chips
│   └── UploadBox.tsx                       # Drag-and-drop upload zone
│
├── lib/                                    # Utility Libraries
│   └── supabaseClient.ts                   # Supabase client configuration
│
├── supabase/                               # Database Schema
│   └── schema.sql                          # SQL schema for results table & buckets
│
├── types/                                  # TypeScript Type Definitions
│   └── database.ts                         # Database types (ResultRecord, AmazonItem, etc.)
│
├── .env.example                            # Environment variables template
├── .eslintrc.json                          # ESLint configuration
├── .gitignore                              # Git ignore rules
├── LICENSE                                  # License file
├── README.md                                # Project documentation
├── next.config.js                          # Next.js configuration
├── package.json                             # Dependencies & scripts
├── postcss.config.js                       # PostCSS configuration
├── tailwind.config.ts                      # Tailwind CSS configuration
└── tsconfig.json                           # TypeScript configuration
```

## Key Files

### Pages (App Router)
- `/upload` - Initial photo upload
- `/preview` - Aha moment preview (before/after)
- `/customize` - Customize with prompt, style, budget, size
- `/final/[id]` - Final result with product list
- `/save` - Save confirmation
- `/login` - Authentication
- `/gallery` - User's saved designs

### API Routes
- `/api/upload` - Image upload to Supabase storage
- `/api/generateInitialAfter` - Generate initial AI image (placeholder)
- `/api/generateAfterProductList` - Generate final image + products (placeholder)
- `/api/saveResult` - Save to database
- `/api/getResults` - Get all user results
- `/api/getResult` - Get single result

### Components
All components are responsive and mobile-first:
- `UploadBox` - Drag-and-drop image upload
- `ImageCard` - Before/after image display
- `ProductCard` - Amazon product display
- `StyleTagSelector` - Style tag selection chips
- `LoadingSpinner` - Loading states
- `SectionTitle` - Page section headings
- `InputSection` - Form wrapper

