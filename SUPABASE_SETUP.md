# Supabase Setup Instructions

## What's New
This update adds profile management features:
1. **Completed Orders Tab** - Completed orders now move from the Orders tab to the Completed tab
2. **Profile Editing** - Users can update their name and upload a profile photo
3. **Profile Photos** - Profile photos are stored in Supabase Storage with a public URL

## Required Setup Steps

### 1. Create Storage Bucket for Profile Photos

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `profiles`
3. Set Access Level: **Public**
4. Enable the bucket

### 2. Deploy Database Migration

Run the following SQL in Supabase SQL Editor:

```sql
-- Add photo_url column to profiles table for profile pictures
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
```

### 3. Verify RLS Policies (profiles table)

The profiles table should already have RLS enabled from Supabase default setup. Verify these policies exist:
- Users can read their own profile
- Users can update their own profile

### 4. Configure Storage RLS (profiles bucket)

In Supabase Dashboard → Storage → Policies for 'profiles' bucket, add:

**SELECT Policy:**
```sql
-- Anyone can view profile photos (public)
true
```

**INSERT Policy:**
```sql
-- Only authenticated users can upload
auth.role() = 'authenticated'
```

**UPDATE Policy:**
```sql
-- Users can update their own files
auth.uid() = owner_id
```

**DELETE Policy:**
```sql
-- Users can delete their own files
auth.uid() = owner_id
```

## Features Implemented

### Profile Page Updates

#### 1. Orders Tab (Tab 1)
- **Before**: Shows all orders including completed ones
- **After**: Shows only active orders (status ≠ 'completed')
- **Button**: "View Details" to expand and see items

#### 2. Completed Tab (Tab 2)
- **Before**: Shows completed orders with review functionality
- **After**: Unchanged (still shows completed orders with View Details)

#### 3. Edit Profile (New)
- Click "Edit Profile" button next to user name in header
- **Name**: Update user's display name
- **Photo**: 
  - Upload a new profile photo (max 5MB)
  - See preview before saving
  - Remove existing photo
- **Avatar**: Profile photo displays in header (or default icon)

#### 4. Profile Features
- Profile name and email displayed in header
- Edit button always visible
- Profile photo cached and persists across sessions
- Supports JPG, PNG image formats

## Code Changes

### New Files Created
- `src/services/profiles.ts` - Profile service with photo upload/delete
- `src/components/profile/EditProfileModal.tsx` - Profile editing modal
- `SQL_MIGRATIONS/007_add_profile_photo.sql` - Migration for photo_url column

### Modified Files
- `src/pages/Profile.tsx` - Added profile editing integration, filtered Orders tab
- `src/components/profile/` - New directory for profile components

## Testing Checklist

- [ ] Completed orders appear only in Completed tab
- [ ] Active orders appear only in Orders tab
- [ ] View Details works in both tabs
- [ ] Can edit profile name
- [ ] Can upload profile photo
- [ ] Profile photo displays in header
- [ ] Can remove profile photo
- [ ] Photo persists after page reload
- [ ] File size validation works
- [ ] File type validation works

## Deployment Steps

1. Deploy migration 007 to Supabase (copy SQL from file)
2. Create 'profiles' storage bucket with public access
3. Configure storage RLS policies as above
4. Build and deploy the frontend
5. Test all features in production
