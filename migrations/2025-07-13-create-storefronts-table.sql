-- Create storefronts table
CREATE TABLE storefronts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    logo_url TEXT,
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all storefronts
CREATE POLICY "Allow authenticated users to read storefronts" ON storefronts
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert storefronts
CREATE POLICY "Allow authenticated users to insert storefronts" ON storefronts
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update storefronts
CREATE POLICY "Allow authenticated users to update storefronts" ON storefronts
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete storefronts
CREATE POLICY "Allow authenticated users to delete storefronts" ON storefronts
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storefronts_updated_at BEFORE UPDATE ON storefronts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create storage bucket for storefront logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('storefrontlogos', 'storefrontlogos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for storefront logos
CREATE POLICY "Allow authenticated users to upload storefront logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'storefrontlogos' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public to view storefront logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'storefrontlogos');

CREATE POLICY "Allow authenticated users to update storefront logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'storefrontlogos' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to delete storefront logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'storefrontlogos' AND 
        auth.role() = 'authenticated'
    );
