-- Allow full access to categories for everyone (public)
DROP POLICY IF EXISTS "Categories manageable by authenticated" ON categories;
CREATE POLICY "Categories manageable by everyone" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- Ensure Read is also fully open (already exists but ensuring consistency)
DROP POLICY IF EXISTS "Categories viewable by everyone" ON categories;
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
