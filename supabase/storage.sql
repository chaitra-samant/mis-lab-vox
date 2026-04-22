-- ============================================================
-- CCIS — AuraBank | Storage Setup
-- ============================================================
-- Run this in Supabase SQL Editor to enable file attachments
-- ============================================================

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vox-attachments', 'vox-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access (for viewing attachments)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vox-attachments' );

-- 3. Allow authenticated users to upload (for submitting complaints)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vox-attachments' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to delete their own uploads (optional, for cleanup)
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vox-attachments'
  AND (auth.uid() = owner)
);
