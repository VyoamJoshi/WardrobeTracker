-- Seed Data for Personal Wardrobe Tracker
-- Creates demo user (email: demo@wardrobe.me / password: demo1234) and initial wardrobe items

-- Sample Demo User (password: 'demo1234')
INSERT INTO users (name, email, password_hash, created_at)
VALUES (
    'Alex Morgan',
    'demo@wardrobe.me',
    '$2a$10$uY9uaS3z/D7UMrOwoyUZwuwKOdSNaJWdYUCGwivc9mAnmQoWFRU7u',
    NOW() - INTERVAL '30 days'
);

-- Clothing Items for Alex Morgan (user_id = 1)
INSERT INTO clothing (
    user_id, name, category, color, style, material, image_url,
    wash_threshold, current_wear_count, lifetime_wear_count, last_worn, last_washed, created_at
) VALUES
(
    1, 'Black Oversized T-Shirt', 'T-Shirts', 'Black', 'Oversized', '100% Heavy Cotton',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    2, 2, 17, NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days', NOW() - INTERVAL '30 days'
),
(
    1, 'White Oxford Cotton Shirt', 'Shirts', 'White', 'Classic Slim', 'Oxford Cotton',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    2, 0, 12, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '28 days'
),
(
    1, 'Classic Blue Straight Jeans', 'Jeans', 'Blue', 'Straight Fit', 'Raw Denim',
    'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
    4, 3, 24, NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '25 days'
),
(
    1, 'Beige Relaxed Cargo Pants', 'Cargos', 'Beige', 'Relaxed Cargo', 'Cotton Twill',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    4, 1, 8, NOW() - INTERVAL '6 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '20 days'
),
(
    1, 'Heather Grey Heavyweight Hoodie', 'Hoodies', 'Grey', 'Drop Shoulder', 'French Terry',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    4, 3, 19, NOW() - INTERVAL '1 day', NOW() - INTERVAL '14 days', NOW() - INTERVAL '22 days'
),
(
    1, 'Minimalist Black Bomber Jacket', 'Jackets', 'Black', 'Bomber', 'Nylon & Poly',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    7, 4, 15, NOW() - INTERVAL '3 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '18 days'
),
(
    1, 'White Leather Minimal Sneakers', 'Shoes', 'White', 'Low Top', 'Full Grain Leather',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    15, 6, 32, NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 days', NOW() - INTERVAL '30 days'
),
(
    1, 'Olive Slim Chinos', 'Chinos', 'Olive', 'Slim Tapered', 'Stretch Cotton',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
    3, 0, 9, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '15 days'
),
(
    1, 'Navy Crewneck Sweatshirt', 'Sweatshirts', 'Navy', 'Regular Fit', 'Brushed Cotton',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    4, 4, 14, NOW() - INTERVAL '2 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'
);

-- Wear History Entries
INSERT INTO wear_history (clothing_id, worn_date) VALUES
(1, NOW() - INTERVAL '1 day'),
(1, NOW() - INTERVAL '3 days'),
(1, NOW() - INTERVAL '8 days'),
(2, NOW() - INTERVAL '4 days'),
(2, NOW() - INTERVAL '9 days'),
(3, NOW() - INTERVAL '2 days'),
(3, NOW() - INTERVAL '5 days'),
(3, NOW() - INTERVAL '7 days'),
(4, NOW() - INTERVAL '6 days'),
(5, NOW() - INTERVAL '1 day'),
(5, NOW() - INTERVAL '4 days'),
(5, NOW() - INTERVAL '10 days'),
(6, NOW() - INTERVAL '3 days'),
(6, NOW() - INTERVAL '6 days'),
(7, NOW() - INTERVAL '1 day'),
(7, NOW() - INTERVAL '2 days'),
(8, NOW() - INTERVAL '7 days'),
(9, NOW() - INTERVAL '2 days'),
(9, NOW() - INTERVAL '5 days'),
(9, NOW() - INTERVAL '9 days'),
(9, NOW() - INTERVAL '12 days');

-- Wash History Entries
INSERT INTO wash_history (clothing_id, wash_date) VALUES
(1, NOW() - INTERVAL '5 days'),
(1, NOW() - INTERVAL '15 days'),
(2, NOW() - INTERVAL '2 days'),
(2, NOW() - INTERVAL '14 days'),
(3, NOW() - INTERVAL '12 days'),
(4, NOW() - INTERVAL '8 days'),
(5, NOW() - INTERVAL '14 days'),
(6, NOW() - INTERVAL '21 days'),
(7, NOW() - INTERVAL '20 days'),
(8, NOW() - INTERVAL '3 days'),
(9, NOW() - INTERVAL '16 days');
