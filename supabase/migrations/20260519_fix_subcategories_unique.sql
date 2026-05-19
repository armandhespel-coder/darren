-- Contrainte unique sur (name, category_name) au lieu de name seul
-- Permet d'avoir le même nom dans deux catégories différentes

ALTER TABLE site_subcategories DROP CONSTRAINT IF EXISTS site_tags_name_key;
ALTER TABLE site_subcategories DROP CONSTRAINT IF EXISTS site_subcategories_name_key;

ALTER TABLE site_subcategories
  ADD CONSTRAINT site_subcategories_name_category_unique UNIQUE (name, category_name);
