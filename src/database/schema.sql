-- ১. পার্টনার টেবিল (কাস্টমার এবং সাপ্লায়ার উভয়ের জন্য)
CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT,
  partner_type TEXT CHECK(partner_type IN ('Customer', 'Supplier', 'Both')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ২. প্রোডাক্ট টেবিল
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT, -- যেমন: Pcs, Kg, Box
  sale_price REAL DEFAULT 0,
  purchase_price REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ৩. সেল অর্ডার টেবিল (মেইন অর্ডার বা হেডার)
CREATE TABLE IF NOT EXISTS sales_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft', -- Draft, Confirmed, Paid
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- ৪. পার্চেস অর্ডার টেবিল (মেইন অর্ডার বা হেডার)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- ৫. আইটেমস টেবিল (সেল এবং পার্চেস উভয় লাইনের জন্য)
-- এখানে order_type দিয়ে আমরা আলাদা করব এটা সেলের আইটেম নাকি পার্চেসের
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_type TEXT CHECK(order_type IN ('Sale', 'Purchase')), 
  order_id INTEGER NOT NULL, -- এটি sales_orders অথবা purchase_orders এর ID
  product_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);