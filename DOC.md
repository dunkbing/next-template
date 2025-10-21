# 📚 POS System Documentation

**Version:** 1.0.0  
**Last Updated:** October 21, 2025  
**Target Audience:** Testers, Business Analysts, Product Owners, Non-Technical Users

---

## 📖 Table of Contents

1. [System Overview](#system-overview)
2. [How to Access the System](#how-to-access-the-system)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Feature Status](#feature-status)
5. [Module Guide](#module-guide)
6. [Test Data](#test-data)
7. [Known Limitations](#known-limitations)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## 🎯 System Overview

This is a **Point of Sale (POS) System** designed for retail businesses. It helps manage:
- Product inventory across multiple stores
- Customer information and loyalty programs
- Sales transactions at checkout
- Stock levels and purchasing
- Business reports and analytics

**Key Capabilities:**
- ✅ Multi-store support (manage multiple locations)
- ✅ Multi-language support (English & Vietnamese)
- ✅ Multi-tenant architecture (each company has separate data)
- ✅ Role-based access control (different permissions for different users)

---

## 🔐 How to Access the System

### Registration (First Time)

1. Go to `/register` (e.g., `http://localhost:3000/en/register`)
2. Fill in the registration form:
   - **Your Name**: Your full name
   - **Email**: Your work email
   - **Password**: Choose a secure password
   - **Company Name**: Your business/company name
3. Click **"Create Account"**
4. You will be automatically logged in as the company owner

**What happens on registration:**
- A new company account is created
- You become the Owner with full permissions
- An "Admin" role is created with all permissions
- You can now add products, stores, and team members

### Login (Returning Users)

1. Go to `/login` (e.g., `http://localhost:3000/en/login`)
2. Enter your **Email** and **Password**
3. Click **"Sign In"**
4. You'll be redirected to the Dashboard

### Switching Languages

- Click the **Globe icon** (🌐) in the top-right corner
- Select **English** or **Tiếng Việt** (Vietnamese)
- The entire interface will switch to your selected language

---

## 👥 User Roles & Permissions

The system has 4 default roles with different permission levels:

### 1. **Owner** (Full Access)
- All permissions across the entire system
- Can manage users, roles, and company settings
- Can access all stores and features

### 2. **Admin**
- Nearly all permissions
- Can manage products, inventory, customers
- Can view all reports
- Cannot modify company-wide settings

### 3. **Manager**
- Store-level management
- Can manage products and inventory
- Can view store-specific reports
- Can manage store staff
- Cannot delete critical data

### 4. **Cashier**
- Limited to POS operations
- Can process sales
- Can search products and customers
- Cannot access reports or settings
- Cannot modify inventory

**Note:** You can customize these roles or create new ones from the Users page.

---

## ✅ Feature Status

### 🟢 Fully Implemented Features

#### **1. User Management**
- ✅ User registration with company setup
- ✅ User login/logout
- ✅ Invite new users to your company
- ✅ Assign roles to users
- ✅ Custom permissions per user
- ✅ View list of all users in your company

**How to test:**
1. Go to **Dashboard → Users**
2. Click **"Create User"**
3. Fill in email, name, select a role
4. User receives invitation

#### **2. Product Catalog**
- ✅ Create products with multiple variants
- ✅ Product categories
- ✅ SKU and barcode for each variant
- ✅ Price and cost tracking
- ✅ Product list with search
- ✅ View product details
- ✅ Product status (Active/Inactive)

**How to test:**
1. Go to **Dashboard → Products**
2. Click **"Create Product"**
3. Fill in product details
4. Add variants (e.g., different sizes, colors)
5. Each variant gets its own SKU and barcode
6. View the product in the list

**Example:**
```
Product: T-Shirt
├── Variant 1: White - Small (SKU: TSHIRT-WHT-S, Price: 150,000₫)
├── Variant 2: White - Medium (SKU: TSHIRT-WHT-M, Price: 150,000₫)
└── Variant 3: Black - Large (SKU: TSHIRT-BLK-L, Price: 150,000₫)
```

#### **3. Customer Management**
- ✅ Create customer profiles
- ✅ Store customer contact information
- ✅ Loyalty points system
- ✅ Customer list with search
- ✅ View customer details

**How to test:**
1. Go to **Dashboard → Customers**
2. Click **"Create Customer"**
3. Fill in name, email, phone, address
4. Set initial loyalty points (optional)
5. View customer in the list

#### **4. Store Management**
- ✅ Create multiple store locations
- ✅ Store code, address, phone
- ✅ Timezone setting per store
- ✅ Store list
- ✅ View store details

**How to test:**
1. Go to **Dashboard → Stores**
2. Click **"Create Store"**
3. Fill in store name, code (e.g., "MAIN-001")
4. Add address and phone
5. View store in the list

#### **5. Point of Sale (POS)**
- ✅ Barcode scanning (keyboard wedge ready)
- ✅ Product search by barcode
- ✅ Add products to cart
- ✅ Adjust quantities
- ✅ Cart persistence (saved if you refresh)
- ✅ Multi-payment checkout (Cash, Card, QR, Bank Transfer)
- ✅ Calculate totals and change
- ✅ Process sale transactions
- ✅ Stock deduction on sale

**How to test:**
1. Go to **POS** (from sidebar)
2. In the search box, enter a barcode:
   - Try: `8934588123456` (Coca-Cola 330ml)
   - Try: `8934588456789` (Lay's Chips)
3. Product appears in the cart
4. Adjust quantity using +/- buttons
5. Click **"Checkout"**
6. Select payment method
7. For Cash: Enter amount received, see change calculated
8. Click **"Complete Sale"**
9. Success! Transaction is saved

**Payment Methods:**
- 💵 **Cash**: Customer pays with physical money
- 💳 **Card**: Credit/debit card payment
- 📱 **QR Code**: Mobile payment (Momo, ZaloPay, etc.)
- 🏦 **Bank Transfer**: Direct bank transfer

**Note:** You can split payment across multiple methods (e.g., 100,000₫ cash + 50,000₫ card)

#### **6. Inventory (Backend)**
- ✅ Stock levels per store
- ✅ Stock items created automatically
- ✅ Stock deduction on sales
- ✅ Purchase order system (backend)
- ✅ Supplier management (backend)
- ✅ Stock transfers (backend)

**Current Status:** Backend fully implemented, UI partially implemented

### 🟡 Partially Implemented Features

#### **7. Inventory Management (UI)**
- ✅ Inventory hub page
- ⚠️ Stock levels view (placeholder)
- ⚠️ Purchase orders UI (placeholder)
- ⚠️ Suppliers UI (placeholder)
- ❌ Stock adjustment form
- ❌ Stock transfer UI

**Current State:** You can see the inventory page, but it shows placeholders. The backend works, just needs UI.

#### **8. Reports**
- ✅ Reports hub page
- ⚠️ Sales summary (placeholder)
- ⚠️ Inventory valuation (placeholder)
- ⚠️ Top products (placeholder)
- ❌ X Report (mid-day cash report)
- ❌ Z Report (end-of-day report)
- ❌ Date range filters

**Current State:** Reports page exists but shows "Coming Soon" placeholders.

#### **9. Edit Functionality**
- ✅ View product details (read-only)
- ✅ View customer details (read-only)
- ✅ View store details (read-only)
- ❌ Edit existing products
- ❌ Edit existing customers
- ❌ Edit existing stores
- ❌ Delete products/customers/stores

**Current State:** You can view details, but the "Edit" button is disabled. Forms need to be updated to handle edit mode.

### 🔴 Not Yet Implemented

#### **10. Register Management**
**Priority:** 🔥 HIGH - Blocks real POS usage

- ❌ Open register with starting cash
- ❌ Close register with cash reconciliation
- ❌ X Report (mid-day snapshot)
- ❌ Z Report (end-of-day closeout)
- ❌ Register session tracking
- ❌ Multiple cashiers per shift

**Why it's needed:** Currently, POS uses a hardcoded register session. You can't properly open/close the register or reconcile cash.

#### **11. Receipt Printing**
**Priority:** 🔥 HIGH - Professional customer experience

- ❌ Receipt preview after sale
- ❌ Print receipt
- ❌ PDF receipt generation
- ❌ Email receipt to customer

**Why it's needed:** Customers need proof of purchase.

#### **12. Sales History**
**Priority:** 🔥 HIGH - Business visibility

- ❌ View past sales
- ❌ Filter sales by date, store, cashier
- ❌ View sale details
- ❌ Return/refund UI
- ❌ Sales analytics dashboard

**Why it's needed:** You can make sales, but can't view them afterward.

#### **13. Customer in POS**
**Priority:** Medium - Loyalty program activation

- ❌ Select customer during checkout
- ❌ Apply loyalty points as discount
- ❌ Award points on purchase
- ❌ Quick customer creation in POS

**Why it's needed:** To activate the loyalty points system.

#### **14. Product Images**
**Priority:** Medium - Better UX

- ❌ Upload product photos
- ❌ Display images in product list
- ❌ Show images in POS
- ❌ Multiple images per product

#### **15. Promotions & Discounts**
**Priority:** Medium - Marketing capability

- ❌ Percentage discounts
- ❌ Fixed amount discounts
- ❌ Buy X Get Y promotions
- ❌ Time-limited offers
- ❌ Coupon codes

#### **16. Advanced Features**
**Priority:** Low - Future enhancements

- ❌ Offline mode (PWA)
- ❌ Multi-currency support
- ❌ Barcode label printing
- ❌ Employee shift tracking
- ❌ Commission calculation
- ❌ Gift cards
- ❌ Layaway/hold orders

---

## 📘 Module Guide

### Dashboard (Home Page)

**URL:** `/dashboard`

**What you see:**
- Welcome message with your name
- Navigation sidebar with all modules

**Available Modules:**
1. **POS** - Process sales
2. **Products** - Manage product catalog
3. **Inventory** - Stock management
4. **Customers** - Customer database
5. **Stores** - Store locations
6. **Reports** - Business analytics
7. **Users** - Team management

---

### POS Module

**URL:** `/pos`

**Purpose:** Process customer sales at the checkout counter

**Screen Layout:**
```
┌─────────────────────────────────────────────────┐
│  [Cart - Left Side]     [Search - Right Side]  │
│                                                  │
│  Current Sale           Scan barcode or search  │
│  ═════════════          ═════════════════════    │
│                         [  Search box       ]    │
│  Item 1      Qty  Price                          │
│  Item 2      Qty  Price  Product results appear  │
│  Item 3      Qty  Price  here when you type      │
│                                                  │
│  Subtotal:   150,000₫                           │
│  Tax:          7,500₫                           │
│  Total:      157,500₫                           │
│                                                  │
│  [Checkout Button]                              │
└─────────────────────────────────────────────────┘
```

**How to use:**
1. **Add items:** Type barcode or product name in search box
2. **Adjust quantity:** Use +/- buttons on each line
3. **Remove item:** Click X button
4. **Checkout:** Click "Checkout" button
5. **Payment:** Select method, enter amount, complete sale

**Keyboard Shortcuts:**
- Use a **barcode scanner** - it types the barcode and presses Enter
- Type barcode manually and press **Enter**

**Tips:**
- Cart is saved automatically - you can close the browser and come back
- You can clear the entire cart with "Clear Cart" button
- Barcodes must match exactly

---

### Products Module

**URL:** `/dashboard/catalog/products`

**Purpose:** Manage your product catalog

**What you can do:**
1. **View all products** - See list of all products with variants and prices
2. **Create new product** - Click "Create Product" button
3. **View product details** - Click edit icon on any product
4. **Search products** - Use search box (coming soon)

**Creating a Product:**

1. Click **"Create Product"** button
2. Fill in **Basic Information:**
   - Product Name (e.g., "T-Shirt")
   - Description (optional)
   - Category (optional)
   - Tax Class (default: "standard")
   
3. Add **Variants:**
   - Each variant is a specific version of the product
   - Click "Add Variant" for each version
   - Example for T-Shirt:
     - Variant 1: Name="White - Small", SKU="TSHIRT-WHT-S", Price=150,000
     - Variant 2: Name="White - Medium", SKU="TSHIRT-WHT-M", Price=150,000
     - Variant 3: Name="Black - Large", SKU="TSHIRT-BLK-L", Price=150,000

4. For each variant, enter:
   - **Name**: Human-readable name (e.g., "Red - Large")
   - **SKU**: Unique product code (e.g., "TSHIRT-RED-L")
   - **Barcode**: Scannable barcode (optional, e.g., "8934588901234")
   - **Price**: Selling price in VND
   - **Cost**: Your cost price (optional, for profit tracking)

5. Click **"Create Product"**

**Understanding Variants:**
- Think of variants as different versions of the same product
- Example: A T-shirt in different sizes/colors
- Each variant has its own SKU and barcode
- Stock is tracked per variant, not per product

---

### Customers Module

**URL:** `/dashboard/customers`

**Purpose:** Manage customer information and loyalty points

**What you can do:**
1. **View all customers** - List with name, email, phone, loyalty points
2. **Create new customer** - Click "Create Customer"
3. **View customer details** - Click edit icon on any customer

**Creating a Customer:**
1. Click **"Create Customer"** button
2. Fill in information:
   - **Name**: Full name (required)
   - **Email**: Email address (optional)
   - **Phone**: Phone number (optional)
   - **Address**: Full address (optional)
   - **Loyalty Points**: Starting points (default: 0)
3. Click **"Create Customer"**

**Loyalty Points:**
- Points are accumulated with purchases (manual for now)
- Display tier badges:
  - 🥉 Bronze: 0-499 points
  - 🥈 Silver: 500-999 points
  - 🏆 Gold: 1000+ points
- Can be used for discounts (feature coming soon)

---

### Stores Module

**URL:** `/dashboard/stores`

**Purpose:** Manage multiple store locations

**What you can do:**
1. **View all stores** - List with name, code, address, phone
2. **Create new store** - Click "Create Store"
3. **View store details** - Click edit icon on any store

**Creating a Store:**
1. Click **"Create Store"** button
2. Fill in information:
   - **Store Name**: (e.g., "Main Store - Downtown")
   - **Store Code**: Unique code (e.g., "MAIN-001")
   - **Address**: Full street address
   - **Phone**: Store phone number
   - **Timezone**: (default: "Asia/Ho_Chi_Minh")
3. Click **"Create Store"**

**Why multiple stores?**
- Each store has its own inventory
- Sales are tracked per store
- Useful for businesses with multiple locations

---

### Inventory Module

**URL:** `/dashboard/inventory`

**Purpose:** Manage stock levels and purchasing

**Current Features:**
- ✅ Hub page with links to:
  - Stock Levels
  - Purchase Orders
  - Suppliers

**Status:** ⚠️ Placeholders only - UI coming soon

**How inventory works (backend):**
- Each product variant has stock per store
- Stock decreases when you make a sale
- Stock increases when you receive a purchase order
- Stock can be transferred between stores

---

### Reports Module

**URL:** `/dashboard/reports`

**Purpose:** View business analytics and reports

**Planned Reports:**
1. **Sales Summary** - Total sales, transactions, revenue
2. **Inventory Valuation** - Total inventory value
3. **Top Products** - Best-selling items
4. **X Report** - Mid-day cash count (register open)
5. **Z Report** - End-of-day cash reconciliation (register close)
6. **Low Stock Alerts** - Items needing reorder

**Status:** ⚠️ Placeholders only - Shows "Coming Soon"

---

### Users Module

**URL:** `/dashboard/users`

**Purpose:** Manage team members and permissions

**What you can do:**
1. **View all users** - Name, email, role
2. **Invite new user** - Click "Create User"
3. **Assign roles** - Select from Owner, Admin, Manager, Cashier
4. **Custom permissions** - Override role permissions per user

**Creating a User:**
1. Click **"Create User"** button
2. Fill in:
   - **Name**: User's full name
   - **Email**: Their email address
   - **Role**: Select from dropdown
3. Click **"Send Invitation"**
4. They receive an email to set their password

**Permission Levels:**
- Each role has predefined permissions
- You can customize permissions per user
- Permissions control what users can see and do

---

## 🧪 Test Data

### Seeding the Database

To quickly populate the system with test data:

```bash
bun run db:seed
```

**What gets created:**
- 2 Stores (Main Store Downtown, Branch Store District 7)
- 10 Product Categories
- 30 Products with 80+ Variants
- 20 Vietnamese Customers
- Stock inventory for all products in both stores

**Prerequisites:**
1. Register an account with email: `dunkbingg+1@gmail.com`
2. Make sure PostgreSQL is running
3. Run the seed script

### Sample Barcodes for Testing POS

Use these barcodes to test the POS scanner:

| Barcode | Product | Price |
|---------|---------|-------|
| `8934588123456` | Coca-Cola 330ml | 15,000₫ |
| `8934588123457` | Coca-Cola 1.5L | 25,000₫ |
| `8934588234567` | Pepsi 330ml | 15,000₫ |
| `8934588345678` | Red Bull 250ml | 35,000₫ |
| `8934588456789` | Lay's Original 50g | 20,000₫ |
| `8934588567890` | Oreo Original 137g | 25,000₫ |
| `8934588678901` | USB Cable 1m White | 50,000₫ |
| `8934588789012` | Phone Case Clear | 150,000₫ |
| `8934588901234` | T-Shirt White S | 150,000₫ |
| `8934590345678` | Coffee Ground 250g | 80,000₫ |

### Sample Test Scenarios

#### Test Scenario 1: Complete Sales Flow
1. **Setup:** Run seed script to populate products
2. **Action:** Go to POS
3. **Step 1:** Scan barcode `8934588123456` (Coca-Cola)
4. **Step 2:** Scan barcode `8934588456789` (Lay's Chips)
5. **Step 3:** Adjust Coca-Cola quantity to 2
6. **Step 4:** Click "Checkout"
7. **Step 5:** Select "Cash" payment
8. **Step 6:** Enter 100,000₫ received
9. **Step 7:** Verify change calculation
10. **Step 8:** Click "Complete Sale"
11. **Expected:** Success message, cart clears, stock deducted

**Total:** 50,000₫ (30,000₫ + 20,000₫)

#### Test Scenario 2: Multi-Payment
1. **Setup:** Add items totaling 200,000₫ to cart
2. **Action:** Click "Checkout"
3. **Step 1:** Click "Add Payment"
4. **Step 2:** Select "Cash", enter 100,000₫
5. **Step 3:** Click "Add Payment" again
6. **Step 4:** Select "Card", enter 100,000₫
7. **Step 5:** Verify total paid = 200,000₫
8. **Step 6:** Click "Complete Sale"
9. **Expected:** Sale successful with 2 payment records

#### Test Scenario 3: Create Product with Variants
1. **Action:** Go to Products → Create Product
2. **Step 1:** Name = "Water Bottle"
3. **Step 2:** Add Variant 1:
   - Name = "500ml"
   - SKU = "BOTTLE-500"
   - Barcode = "TEST001"
   - Price = 25,000
4. **Step 3:** Click "Add Variant"
5. **Step 4:** Add Variant 2:
   - Name = "1000ml"
   - SKU = "BOTTLE-1000"
   - Barcode = "TEST002"
   - Price = 40,000
6. **Step 5:** Click "Create Product"
7. **Expected:** Product created with 2 variants, visible in list

---

## ⚠️ Known Limitations

### Technical Limitations

1. **Register Session Hardcoded**
   - **Issue:** POS uses a fixed register session ID
   - **Impact:** Can't properly open/close registers
   - **Workaround:** Sales still work, but no cash reconciliation
   - **Fix:** Implement register management module

2. **No Edit Functionality**
   - **Issue:** Can't edit existing products/customers/stores
   - **Impact:** Must delete and recreate to make changes
   - **Workaround:** Be careful when creating records
   - **Fix:** Implement edit forms

3. **No Receipt Generation**
   - **Issue:** Sales complete but no receipt produced
   - **Impact:** No proof of purchase for customers
   - **Workaround:** Manually write receipts
   - **Fix:** Implement receipt printing

4. **No Sales History UI**
   - **Issue:** Sales are saved but can't be viewed
   - **Impact:** Can't look up past transactions
   - **Workaround:** Check database directly
   - **Fix:** Implement sales history page

5. **Inventory UI Incomplete**
   - **Issue:** Stock data exists but no UI to view/edit
   - **Impact:** Can't see stock levels or adjust manually
   - **Workaround:** Check database or use seed data
   - **Fix:** Complete inventory UI

### Business Limitations

1. **Single Currency (VND only)**
   - All prices displayed in Vietnamese Dong (₫)
   - No multi-currency support yet

2. **No Tax Configuration**
   - Tax rate is hardcoded (not applied currently)
   - Can't configure tax per product or region

3. **No Promotions/Discounts**
   - Can't apply percentage or fixed discounts
   - No coupon codes or promotional campaigns

4. **Manual Loyalty Points**
   - Points are tracked but not automatically applied
   - Can't redeem points during checkout

5. **No Product Images**
   - Products displayed as text only
   - No visual identification in POS

### Performance Limitations

1. **Large Datasets**
   - Product list loads all products (no pagination)
   - May slow down with 1000+ products
   - Consider adding pagination

2. **No Caching**
   - Product searches query database every time
   - Could be optimized with caching layer

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Who can use this system?**  
A: Anyone in retail business - stores, boutiques, cafes, restaurants, etc.

**Q: Do I need technical knowledge?**  
A: No! This system is designed for non-technical users. Just register and start selling.

**Q: How many stores can I manage?**  
A: Unlimited stores per company account.

**Q: How many products can I have?**  
A: Unlimited products and variants.

**Q: Is my data secure?**  
A: Yes, each company's data is completely isolated. Users can only see their own company's data.

**Q: Can I use this offline?**  
A: Not yet. Offline mode is planned for future releases.

---

### Account & Login

**Q: I forgot my password. How do I reset it?**  
A: Password reset is not yet implemented. Contact your system administrator.

**Q: Can I change my email address?**  
A: Not through the UI yet. Contact your system administrator.

**Q: How do I switch companies?**  
A: Each account belongs to one company. You'd need separate accounts for different companies.

---

### Products

**Q: What's the difference between a product and a variant?**  
A: 
- **Product** = The general item (e.g., "T-Shirt")
- **Variant** = A specific version (e.g., "White Small T-Shirt")
- Think: Product is the category, variant is what you actually sell

**Q: Can I sell a product without variants?**  
A: Yes, just create one variant for the product.

**Q: What happens if I use the same barcode for two products?**  
A: The system will find the first match. Barcodes should be unique.

**Q: Can I add images to products?**  
A: Not yet. This feature is planned.

**Q: How do I delete a product?**  
A: Delete functionality is not yet implemented. You can mark it as "inactive" for now.

---

### POS

**Q: Do I need a barcode scanner?**  
A: No, you can type barcodes manually. But a USB barcode scanner makes it much faster.

**Q: What barcode scanner should I buy?**  
A: Any USB barcode scanner that works as a "keyboard wedge" (types like a keyboard).

**Q: Can I make sales without a barcode?**  
A: Yes, you can search for products by name (type in the search box).

**Q: What if I scan the wrong item?**  
A: Click the X button to remove it from the cart.

**Q: Can I edit the price during checkout?**  
A: Not yet. Prices are fixed from the product catalog.

**Q: How do I apply a discount?**  
A: Discount functionality is not yet implemented.

**Q: What if the customer pays with multiple methods?**  
A: Click "Add Payment" multiple times to split the payment (e.g., 50% cash + 50% card).

**Q: Can I cancel a sale after completing it?**  
A: Not through the UI yet. Returns/refunds are planned.

---

### Inventory

**Q: How do I check stock levels?**  
A: The inventory UI is not complete yet. Stock data exists in the database.

**Q: What happens to stock when I make a sale?**  
A: Stock is automatically deducted from the store's inventory.

**Q: How do I add stock?**  
A: Stock adjustment UI is not yet implemented. Use purchase orders or contact your administrator.

**Q: Can I transfer stock between stores?**  
A: The backend supports it, but the UI is not built yet.

**Q: How do I know when stock is low?**  
A: Low stock alerts are planned but not yet implemented.

---

### Customers

**Q: Do I need to create customers before making sales?**  
A: No, you can make sales without linking to a customer.

**Q: How do customers earn loyalty points?**  
A: Currently manual. Automatic points on purchase is planned.

**Q: Can customers redeem points for discounts?**  
A: Not yet. Redemption feature is planned.

**Q: Can I import customers from Excel?**  
A: Not yet. Bulk import is planned.

---

### Reports

**Q: Where can I see my sales history?**  
A: Sales history UI is not yet implemented. Sales are saved in the database.

**Q: How do I close the register at end of day?**  
A: Register management (X/Z reports) is not yet implemented.

**Q: Can I export reports to Excel?**  
A: Not yet. Export functionality is planned.

---

### Language & Localization

**Q: What languages are supported?**  
A: Currently English and Vietnamese.

**Q: Can I add more languages?**  
A: Yes, but requires technical setup. French dictionary structure exists but was removed.

**Q: Does the language affect data?**  
A: No, only the interface changes. Your data stays the same.

---

### Troubleshooting

**Q: The POS search doesn't find my product**  
A: 
1. Check that the product exists in Products list
2. Verify the barcode is exactly correct
3. Make sure the variant status is "Active"

**Q: I can't log in**  
A:
1. Verify email and password are correct
2. Check Caps Lock is off
3. Try refreshing the page
4. Contact your administrator if issue persists

**Q: The page shows "No permission"**  
A:
1. Your role doesn't have access to this feature
2. Contact your company owner to adjust permissions

**Q: Changes I make don't appear**  
A:
1. Try refreshing the page (F5)
2. Check that you clicked the Save/Submit button
3. Look for error messages

**Q: Numbers show weird formatting**  
A:
1. Check your language setting (Globe icon)
2. Vietnamese uses comma for thousands (150,000)
3. English uses the same format

---

## 📞 Getting Help

### For Testers

When reporting bugs, please include:
1. **Steps to reproduce** - What did you click?
2. **Expected result** - What should happen?
3. **Actual result** - What actually happened?
4. **Screenshot** - If possible
5. **URL** - Which page were you on?
6. **User role** - What role were you logged in as?

**Example Bug Report:**
```
Title: POS doesn't calculate change correctly

Steps:
1. Add Coca-Cola to cart (15,000₫)
2. Click Checkout
3. Select Cash payment
4. Enter 50,000₫ received
5. Observe change calculation

Expected: Change = 35,000₫
Actual: Change shows 0₫

URL: /en/pos
Role: Cashier
Screenshot: [attached]
```

### For Business Analysts

When writing requirements, please specify:
1. **User role** - Who will use this feature?
2. **User goal** - What are they trying to achieve?
3. **Acceptance criteria** - How do we know it works?
4. **Business value** - Why is this important?

**Example Requirement:**
```
Feature: Receipt Printing

User Role: Cashier
User Goal: Provide customers with proof of purchase
Priority: High

Acceptance Criteria:
- After completing a sale, a receipt preview appears
- Receipt shows: date, items, quantities, prices, total, payment method
- Receipt can be printed with one click
- Receipt can be emailed to customer (optional)

Business Value:
- Professional customer experience
- Legal compliance (tax requirements)
- Reduces disputes about purchases
```

---

## 📝 Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Oct 21, 2025 | Initial documentation | System |

---

**Need something else documented?** Let your development team know!