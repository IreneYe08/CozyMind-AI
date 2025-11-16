# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stability AI API Key (for AI image generation)
STABILITY_API_KEY=your_stability_api_key
```

## How to Get These Values

### Supabase Configuration

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stability AI API Key

1. Go to [platform.stability.ai](https://platform.stability.ai) and sign in
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy the key → `STABILITY_API_KEY`
   - ⚠️ **Important**: Save this key immediately, you won't be able to see it again!

# RapidAPI Key (for Amazon Product Search)

1. Go to [rapidapi.com](https://rapidapi.com) and sign in
2. Navigate to **My Apps** → **Default Application**
3. Copy your **X-RapidAPI-Key** → `RAPIDAPI_KEY`
4. Subscribe to "Amazon24" API: https://rapidapi.com/logicbuilder/api/amazon24
   - ⚠️ **Note**: Free tier may have rate limits

## Example

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example

# Stability AI API Key
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# RapidAPI Key (for Amazon Product Search)
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Important Notes

- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the browser
- Restart your development server after changing environment variables
