insert into profiles (user_id, display_name, username, city, bio, avatar_hue, size_top, size_bottom, size_shoes, seeded)
values
  ('community-lina', 'Lina Farid', 'lina', 'Cairo', 'Capsule dresser. Strong blacks, one loud piece.', '12 28% 42%', 'S', 'S', '37', true),
  ('community-nour', 'Nour Hassan', 'nour', 'Alexandria', 'Linen, salt air, and a coat that outlives trends.', '210 18% 32%', 'M', 'M', '39', true),
  ('community-maya', 'Maya Adel', 'maya', 'Giza', 'Tailoring by day. Silk after six.', '24 22% 28%', 'M', '27', '38', true),
  ('community-yasmine', 'Yasmine Kamel', 'yasmine', 'Maadi', 'If it is not ivory, navy, or terracotta, I walk away.', '18 24% 36%', 'S', 'S', '36', true)
on conflict (user_id) do nothing;

insert into items (user_id, title, description, image_url, category, color, color_hex, brand, season, size, is_public)
select * from (values
  ('community-lina', 'Terra Cotta Midi', 'Square neck linen, the dress that does weddings and weekdays.', '/closet/dress-terracotta.jpg', 'dress', 'terracotta', '#C45C3A', 'Casa Linen', 'summer', 'S', true),
  ('community-lina', 'Sand Linen Trousers', 'Wide leg, deep pleat, cool in July.', '/closet/trousers-beige.jpg', 'bottom', 'beige', '#C4A574', 'Kojak Studio', 'summer', 'S', true),
  ('community-lina', 'Tan Tote', 'Everyday leather that takes a beating.', '/closet/tote-tan.jpg', 'bag', 'tan', '#A67C54', 'Cairo Last', 'all', '', true),
  ('community-nour', 'Marinière Tee', 'Breton stripe, boat neck, salt in the seams.', '/closet/tee-stripe.jpg', 'top', 'navy', '#2C3A4E', 'Atelier Nil', 'summer', 'M', true),
  ('community-nour', 'Camel Coat', 'The coat that ends the conversation.', '/closet/coat-camel.jpg', 'outerwear', 'camel', '#C49A62', 'Winter Arc', 'winter', 'M', true),
  ('community-nour', 'Ankle Boot', 'Black leather, low heel, walks everywhere.', '/closet/boots-black.jpg', 'shoes', 'black', '#1A1614', 'Cairo Last', 'all', '39', true),
  ('community-maya', 'Noir Crepe Skirt', 'Midi pencil. Meetings, then dinner.', '/closet/skirt-black.jpg', 'bottom', 'black', '#1A1614', 'Maison Heliopolis', 'all', 'M', true),
  ('community-maya', 'Silk Scarf', 'Printed silk, tied on a bag or a throat.', '/closet/scarf-silk.jpg', 'accessory', 'terracotta', '#8C4038', 'Atelier Nil', 'all', '', true),
  ('community-maya', 'Black Blazer', 'Peak lapel, sharp shoulder.', '/closet/blazer-black.jpg', 'outerwear', 'black', '#1A1614', 'Tailor Row', 'all', 'M', true),
  ('community-yasmine', 'Ivory Silk Blouse', 'The blouse you already own. Photograph it once.', '/closet/blouse-white.jpg', 'top', 'ivory', '#F4EFE6', 'Maison Heliopolis', 'all', 'S', true),
  ('community-yasmine', 'Black Slip Dress', 'Bias silk. One piece, whole evening.', '/closet/dress-slip.jpg', 'dress', 'black', '#1A1614', 'Casa Linen', 'all', 'S', true),
  ('community-yasmine', 'Court Sneaker', 'White leather, quiet on purpose.', '/closet/sneakers-white.jpg', 'shoes', 'white', '#F7F4EE', 'Cairo Last', 'all', '36', true)
) as v(user_id, title, description, image_url, category, color, color_hex, brand, season, size, is_public)
where not exists (
  select 1 from items i where i.user_id = v.user_id and i.title = v.title
);

insert into shop_products (title, brand, category, color, color_hex, size_range, price_egp, image_url, shop_name, description)
select * from (values
  ('Burgundy Blazer', 'Maison Heliopolis', 'outerwear', 'burgundy', '#5C242A', 'XS–L', 3100, '/shop/blazer-burgundy.jpg', 'Downtown Cairo', 'The missing structure over a silk blouse and black trousers.'),
  ('Ivory Wide Trouser', 'Atelier Nil', 'bottom', 'ivory', '#F4EFE6', 'XS–XL', 1750, '/shop/trousers-white.jpg', 'Zamalek', 'Cuts through a dark closet. Pairs with the black turtleneck.'),
  ('Olive Utility Jacket', 'Field Notes', 'outerwear', 'olive', '#5A6648', 'S–L', 2750, '/shop/jacket-olive.jpg', 'New Cairo', 'Weekend layer when the camel coat is too much.'),
  ('Leather Loafer', 'Cairo Last', 'shoes', 'brown', '#5C3A24', '36–41', 2200, '/shop/loafers-brown.jpg', 'Downtown Cairo', 'The shoe your looks are missing.'),
  ('Cream Trench', 'Rain Line', 'outerwear', 'cream', '#E8DCC8', 'XS–L', 3900, '/shop/trench-cream.jpg', 'Alexandria', 'Shoulder and belt. Spring in one garment.'),
  ('Navy Knit Dress', 'Casa Linen', 'dress', 'navy', '#243048', 'XS–L', 2600, '/shop/dress-navy.jpg', 'Maadi', 'Column knit. Travel, desk, dinner.'),
  ('Sand Linen Trousers', 'Kojak Studio', 'bottom', 'beige', '#C4A574', 'S–L', 1890, '/closet/trousers-beige.jpg', 'Heliopolis', 'The beige you do not already own.'),
  ('Terra Cotta Midi', 'Casa Linen', 'dress', 'terracotta', '#C45C3A', 'XS–M', 2400, '/closet/dress-terracotta.jpg', 'Zamalek', 'Color when the closet has gone monochrome.')
) as v(title, brand, category, color, color_hex, size_range, price_egp, image_url, shop_name, description)
where not exists (
  select 1 from shop_products s where s.title = v.title and s.brand = v.brand
);
