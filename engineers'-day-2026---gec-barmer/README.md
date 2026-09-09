# Engineers' Day 2026 - Government Engineering College, Barmer

Official web application for **Engineers' Day 2026** at **Government Engineering College, Barmer** (GEC Barmer, Rajasthan). Rebuilt with React, Vite, and Tailwind CSS in a professional light/white theme.

---

## 4 Official Activity Tracks
1. **Conclave** – Technical & Visionary National Symposium
2. **Plantation** – Green Campus Eco-Restoration Drive (250+ native saplings)
3. **Project Show** – Innovation Expo showcasing working prototypes and software
4. **Blood Donation** – Humanitarian Blood Donation Camp in association with District Red Cross

*Note: All prior old activities have been completely removed.*

---

## Key Features
- **Official Branding**: Government Engineering College, Barmer branding and responsive vector college emblem.
- **Theme**: Clean white, light gray, and light blue professional academic palette with high-contrast navy typography.
- **Student Registration Form**: Includes Full Name, Email ID (Enrollment Number removed), Mobile Number, Branch, Semester, Gender, Interested Activity (the 4 tracks only), and suggestions.
- **Instant Digital Pass**: Confirmation receipt modal with printable pass and unique registration ID.
- **Schedule**: Timed program synchronized exclusively across the 4 activity tracks.
- **Faculty Coordinators & Contact**: Official administration and activity leads with direct contact details.
- **Fully Responsive**: Optimized for smartphones, tablets, laptops, and wide screens.

---

## Local Development & Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## Project Structure

```
src/
├── components/
│   ├── TopBar.tsx           # Official Government announcements & quick links
│   ├── Navbar.tsx           # Navigation bar with GEC Barmer logo & register CTA
│   ├── Hero.tsx             # Hero section with countdown timer & institution branding
│   ├── EventInfo.tsx        # Tribute to Sir M. Visvesvaraya & 4 tracks overview
│   ├── Activities.tsx       # 4 Activity track cards with guidelines modal
│   ├── Schedule.tsx         # Event timeline for the 4 tracks
│   ├── RegistrationForm.tsx # Validated form with Email ID & Instant pass
│   ├── Coordinators.tsx     # Faculty leaders and campus contact info
│   ├── Footer.tsx           # Official footer (no FAQ)
│   ├── CollegeLogo.tsx      # Vector college crest component
│   └── ZipExportModal.tsx   # Project ZIP export & download modal
├── data/
│   └── eventData.ts         # Structured data for tracks, schedule, coordinators
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application orchestrator
├── main.tsx                 # React entry point
└── index.css                # Tailwind CSS styling
```

---

## Supabase Database Integration

The application supports real-time student registration syncing directly into a **Supabase PostgreSQL** cloud database.

### 1. SQL Schema (Run in Supabase SQL Editor)

```sql
-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester TEXT NOT NULL,
  gender TEXT NOT NULL,
  interested_activity TEXT NOT NULL,
  message TEXT,
  photo TEXT,
  registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if already created
DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow public read" ON public.registrations;

-- 4. Policy: Allow students to register
CREATE POLICY "Allow public insert" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- 5. Policy: Allow reading registrations
CREATE POLICY "Allow public read" 
ON public.registrations 
FOR SELECT 
USING (true);

-- 6. Create Public Storage Bucket 'registration-photos' for Student Photos (Max 1MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'registration-photos',
  'registration-photos',
  true,
  1048576, -- 1MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 7. Storage Policies for Photo Upload & View
DROP POLICY IF EXISTS "Allow public photo upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo read" ON storage.objects;

CREATE POLICY "Allow public photo upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'registration-photos');

CREATE POLICY "Allow public photo read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'registration-photos');
```

### 2. Environment Variables (.env)

Add the following to your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## License & Attribution
© 2026 Government Engineering College, Barmer. All Rights Reserved.
Commemorating the legacy of Bharat Ratna Sir M. Visvesvaraya.
