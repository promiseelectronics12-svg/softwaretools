"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type TabSetter = (tab: string) => void;

interface GuideStep {
  id: string;
  title: string;
  content: string;       // supports simple markdown-like formatting
  tips?: string[];
  warnings?: string[];
  goTo?: string;         // tab name to navigate to
  goToLabel?: string;
}

interface GuideSection {
  id: string;
  icon: string;
  title: string;
  superOnly?: boolean;
  steps: GuideStep[];
}

/* ─────────────────────────────────────────
   GUIDE DATA — 38 Topics, 12 Sections
───────────────────────────────────────── */
const GUIDES: GuideSection[] = [
  {
    id: "getting-started",
    icon: "🚀",
    title: "Getting Started",
    steps: [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        content: "Your admin panel is divided into three main areas:\n\n• **Sidebar** (left) — Navigate between all tabs: Orders, Products, Analytics, Credentials, Reviews, Support, Links, Staff, Settings, and this Guides tab.\n\n• **Top Bar** — Shows the current tab name, alert chips for pending orders / expiring credentials / unresolved messages, and a Refresh button.\n\n• **Metric Cards** — A row of colored cards showing live counts for Revenue, Orders, Products, Credentials, and Support. Click any card to jump directly to that section.",
        tips: ["Click any metric card to jump directly to the relevant tab.", "Red badges on sidebar tabs indicate items needing your attention."],
        goTo: "orders",
        goToLabel: "View Orders Tab",
      },
      {
        id: "navigation-shortcuts",
        title: "Navigation & Keyboard Shortcuts",
        content: "**Sidebar Navigation**\nClick any tab in the left sidebar to switch sections. Each tab shows a badge count if there are items needing attention (e.g., pending orders, expiring credentials).\n\n**Keyboard Shortcuts**\n• Press **R** on your keyboard to instantly refresh all data (orders, products, credentials, etc.)\n• This works from any tab as long as you're not typing in a text field.\n\n**Alert Chips**\nThe colored pills in the top bar are clickable:\n• ⏳ \"3 pending\" → jumps to Orders tab, filtered to pending\n• 🔑 \"2 expiring\" → jumps to Credentials tab, filtered to expiring\n• 📩 \"1 message\" → jumps to Support tab",
        tips: ["Press R anytime to refresh — it's faster than clicking the button.", "Alert chips pulse/animate when there are urgent items."],
      },
      {
        id: "metric-cards",
        title: "Understanding Metric Cards",
        content: "The row of cards at the top of every page shows real-time stats:\n\n• 💰 **Revenue** (Super User only) — Total earnings from completed orders in BDT and USDT\n• 🛒 **Orders** — Total order count + how many are pending\n• 📦 **Products** — Total products + how many have low stock (< 10)\n• 🔑 **Credentials** — Active credential count + how many need attention\n• 📩 **Support** — Unresolved message count\n\nEach card is clickable and takes you to the corresponding tab.",
        tips: ["Green sub-text = everything OK. Red/amber sub-text = something needs attention."],
      },
    ],
  },
  {
    id: "managing-orders",
    icon: "🛒",
    title: "Managing Orders",
    steps: [
      {
        id: "order-status-flow",
        title: "Understanding Order Status Flow",
        content: "Every order follows this lifecycle:\n\n```\npending  →  verified  →  completed (delivered)\n         ↘  failed\n```\n\n• **Pending** — Customer has paid and is waiting for you to act. This is the most common starting state.\n• **Verified** — You've confirmed the payment is valid (optional step — you can skip straight to delivery).\n• **Completed** — You've delivered the credentials. The customer receives a push notification.\n• **Failed** — Payment was invalid, fraudulent, or the order was cancelled.\n\nMost of your work happens on the **Pending → Completed** path.",
        goTo: "orders",
        goToLabel: "Go to Orders",
      },
      {
        id: "searching-filtering",
        title: "Searching & Filtering Orders",
        content: "**Search Bar**\nType in the search box to find orders by:\n• Order code (e.g., ORD-20250530-XYZ)\n• Phone number (e.g., 01712345678)\n• Transaction ID (e.g., 9A3B7C)\n\n**Status Filter Pills**\nClick the filter buttons below the search bar to show only specific statuses:\n• All — shows everything\n• Pending — orders waiting for your action\n• Verified — payment confirmed, ready to deliver\n• Completed — delivered orders\n• Failed — rejected orders\n\nEach filter shows a count in parentheses.",
        tips: ["The search works across order code, phone, AND transaction ID simultaneously.", "Combine search + status filter for precise results."],
        goTo: "orders",
        goToLabel: "Go to Orders",
      },
      {
        id: "delivering-credentials",
        title: "Delivering Credentials (Per-Item Focus Modal)",
        content: "This is your **most common daily action**. Each product in an order gets delivered individually through a focused popup, so you never mix up credentials.\n\n1. Click an order row to **expand** it\n2. You'll see every product in the order listed, each with its own **⚡ Deliver** button\n3. Click **⚡ Deliver** on the product you want to deliver\n4. A **focus modal** opens showing ONLY that product\n5. Fill in **Username / Email** and **Password** (required)\n6. **Expiry Date** is auto-calculated from the product's duration (editable)\n7. Optionally expand **+ TOTP Secret** or **+ Notes**\n8. Click **✓ Save & Deliver →**\n\nWhat happens:\n• A credential is created and linked to this order + product\n• That item shows a green **✓ Delivered** badge\n• When ALL items are delivered, the order auto-marks **completed**\n• The customer receives a push notification: \"✅ Your order is ready!\"",
        tips: ["The modal shows the product name, phone, and order code at the top so you always know what you're delivering.", "Password has a show/hide eye toggle.", "Expiry auto-fills from duration (1 Month = 30 days) — just confirm or adjust."],
        goTo: "orders",
        goToLabel: "Go to Orders",
      },
      {
        id: "partial-delivery",
        title: "Partial Delivery (Multi-Item Orders)",
        content: "When a customer orders **multiple products** and you only have some in stock right now, you can deliver them one at a time — partial delivery is fully supported.\n\n**How it works:**\n1. Expand the order — each product has its own **⚡ Deliver** button\n2. Deliver the products you have ready (e.g., 2 of 5)\n3. Those items show **✓ Delivered**; the rest still show **⚡ Deliver**\n4. The order stays in **Verified** status (not Completed) because items remain\n5. Later, when you get the rest, come back and deliver the remaining items\n6. Once the **last** item is delivered, the order auto-completes\n\nThe customer sees each credential on their lookup page as soon as you deliver it — they don't have to wait for the whole order.",
        tips: ["An order in 'Verified' with some delivered items = partial delivery in progress. That's your signal to come back.", "Each delivered item triggers its own push notification to the customer."],
        goTo: "orders",
        goToLabel: "Go to Orders",
      },
      {
        id: "verifying-orders",
        title: "Verifying Orders (Optional Step)",
        content: "The **Verify** step is an optional intermediate state between Pending and Completed.\n\n**When to use it:**\n• When you want to confirm the payment in your bKash/Nagad app before typing credentials\n• When you need to check something before delivery\n\n**When to skip it:**\n• If you're confident the payment is valid, go straight to ⚡ Deliver\n\nTo verify: Click the **✓ Verify** button on a pending order row. The status changes to \"Verified\" (blue). You can then click ⚡ Deliver when ready.",
        tips: ["For solo operators, skipping Verify and going straight to Deliver saves one click per order."],
      },
      {
        id: "bulk-actions",
        title: "Bulk Actions",
        content: "Need to process multiple orders at once? Use bulk actions:\n\n1. Check the boxes on the left side of each order row\n2. Or click the \"All\" checkbox at the top to select everything\n3. A dark **bulk action bar** appears at the bottom\n4. Choose: **Mark Verified**, **Mark Completed**, or **Mark Failed**\n5. All selected orders update simultaneously\n6. Click **Clear** to deselect all\n\nThis is useful for:\n• Marking multiple failed/spam orders at once\n• Bulk-verifying a batch of legitimate payments",
        tips: ["The bulk bar shows the count of selected orders.", "You can still search/filter while having orders selected."],
      },
      {
        id: "csv-export",
        title: "CSV Export",
        content: "Click the **⬇ CSV** button in the Orders toolbar to download all currently visible (filtered) orders as a CSV file.\n\nThe CSV includes:\n• Order Code, Date, Phone\n• Payment Method, Transaction ID\n• Status, Total BDT, Total USDT\n• Item names and durations\n\nThe file is named like: `orders-2025-05-30.csv`\n\nUseful for: accounting, tax records, dispute resolution, sharing with team members.",
        tips: ["Apply filters BEFORE exporting to get only the orders you need (e.g., only completed orders for this month)."],
      },
    ],
  },
  {
    id: "managing-products",
    icon: "📦",
    title: "Managing Products",
    steps: [
      {
        id: "adding-product",
        title: "Adding a New Product",
        content: "Click **+ Add Product** at the top of the Products tab. Here's every field:\n\n**Required Fields:**\n• **Name (English)** — Shown to customers (e.g., \"ChatGPT Pro\")\n• **Name (Bangla)** — Shown when site is in Bangla mode\n• **Category** — AI Tools, Streaming, Educational, etc.\n• **At least one Package** — Duration + BDT price + USDT price\n\n**Optional but Recommended:**\n• **Short Description** (EN/BN) — Shown on product cards\n• **Full Description** (EN/BN) — Shown on product detail page\n• **Image** — Upload via the image button (hosted on ImgBB)\n• **Icon** — Emoji shown as fallback when no image\n• **Icon Background** — Color behind the emoji\n• **Tags** — Comma-separated keywords for search\n• **Guarantee** — e.g., \"100% Replacement Warranty\"\n• **Share type** — \"Private Account\" or \"Shared Account\"\n• **Featured** — Toggle ON to show on homepage",
        tips: ["Always upload an image — products with images convert much better.", "Use the Featured toggle for your best-selling or newest products."],
        goTo: "products",
        goToLabel: "Go to Products",
      },
      {
        id: "editing-deleting",
        title: "Editing & Deleting Products",
        content: "**Editing:**\nClick the **✏️ Edit** button on any product card. The form opens with all existing data pre-filled. Make your changes and click Save.\n\n**Deleting:**\nClick the **🗑️ Delete** button. A confirmation dialog appears. Once confirmed, the product is permanently removed.\n\n**Important:** Deleting a product does NOT delete orders or credentials already associated with it. Those remain in the system.",
        warnings: ["Product deletion is permanent and cannot be undone.", "Active orders for a deleted product will still exist but won't have a product page to link to."],
      },
      {
        id: "stock-management",
        title: "Stock Management",
        content: "Each product has a stock number that tracks available inventory.\n\n**Quick Stock Edit:**\n• On the product card, you'll see the current stock number\n• Type a new number directly and click the save button\n• No need to open the full edit form\n\n**Stock Alerts:**\n• Stock < 10 → product card shows amber warning\n• Stock < 5 → product card shows red warning\n• Stock = 0 → product shows \"Out of Stock\" to customers\n\n**Low Stock Filter:**\nClick the **⚠️ Low Stock** filter pill to see only products with stock < 10.",
        tips: ["Set stock to 0 to temporarily hide a product from purchase.", "The Analytics tab has a stock health chart for a visual overview."],
      },
      {
        id: "image-upload",
        title: "Image Upload",
        content: "In the product form, click the **image upload area** to select an image file from your device.\n\n• Images are uploaded to **ImgBB** (free cloud hosting)\n• The returned URL is saved with the product\n• Supported formats: JPG, PNG, WEBP, GIF\n• Max file size: ~32MB\n\nThe image appears on:\n• Product cards (homepage + shop page)\n• Product detail page\n• Cart (as a thumbnail)\n\nIf no image is uploaded, the emoji icon is shown as a fallback.",
        tips: ["Use square images (1:1 ratio) for the best appearance on product cards.", "Compress large images before uploading for faster page loads."],
      },
      {
        id: "packages-pricing",
        title: "Packages & Pricing",
        content: "Each product can have **multiple packages** — different durations at different prices.\n\nExample for Netflix Premium:\n• 1 Month — ৳300 / 2 USDT\n• 3 Months — ৳800 / 5.5 USDT\n• 1 Year — ৳2,500 / 18 USDT\n\n**How to set up:**\n1. In the product form, you'll see one package row by default\n2. Set the **Duration** (e.g., \"1 Month\")\n3. Set the **BDT price** and **USDT price**\n4. Click **+ Add Package** for additional tiers\n5. To remove a package, click the ✕ button on its row\n\nCustomers see all packages on the product page and can choose which one to add to cart.",
      },
      {
        id: "categories-tags",
        title: "Categories & Tags",
        content: "**Categories** group products in the shop page sidebar:\n• AI Tools\n• Streaming\n• Educational\n• Microsoft Office\n• Design Tools\n• VPN & Security\n• SEO Tools\n\nSelect one category per product.\n\n**Tags** are comma-separated keywords that help with search:\nExample: `ai, chatbot, openai, gpt4`\n\nCustomers can find products by searching for any tag word.",
      },
    ],
  },
  {
    id: "analytics",
    icon: "📊",
    title: "Analytics",
    superOnly: true,
    steps: [
      {
        id: "revenue-charts",
        title: "Revenue & Order Charts",
        content: "The Analytics tab shows two interactive charts:\n\n**Orders by Status (Doughnut Chart)**\nA visual breakdown of all orders by status: Pending (amber), Verified (blue), Completed (green), Failed (red). Hover to see exact counts.\n\n**Stock Levels (Horizontal Bar Chart)**\nShows every product's current stock level, sorted from lowest to highest. Color-coded:\n• 🔴 Red — Stock < 5 (critical)\n• 🟡 Amber — Stock < 10 (low)\n• 🟢 Green — Stock ≥ 20 (healthy)",
        tips: ["Charts update when you refresh data (press R or click Refresh)."],
        goTo: "analytics",
        goToLabel: "Go to Analytics",
      },
      {
        id: "key-metrics",
        title: "Key Metrics",
        content: "The Analytics tab displays:\n\n• **Total Revenue** — Sum of all completed orders in BDT + USDT\n• **Average Order Value** — Total revenue ÷ number of completed orders\n• **Completed Orders** — Total orders with status \"completed\"\n\nThese numbers give you a quick snapshot of your business performance.",
      },
      {
        id: "top-products",
        title: "Top Products",
        content: "Below the charts, you'll see the **Top 5 Best-Selling Products** ranked by their `sold` count.\n\nThis helps you identify:\n• Which products to stock more of\n• Which products to feature on the homepage\n• Pricing opportunities (high-demand products might support higher margins)",
      },
    ],
  },
  {
    id: "credentials",
    icon: "🔑",
    title: "Credentials",
    steps: [
      {
        id: "auto-created",
        title: "Auto-Created via Deliver",
        content: "Every time you click **⚡ Deliver** on a product and save, a credential record is **automatically created** with:\n• Order code and phone number (from the order)\n• Product name and duration (from that specific item)\n• Username and password (from your delivery modal)\n• Start date (today) and expiry date (calculated from duration)\n• Optional: TOTP secret and notes\n\nMulti-item orders create one credential per delivered product — all linked to the same order code. You don't need to add anything manually.",
        goTo: "credentials",
        goToLabel: "Go to Credentials",
      },
      {
        id: "manual-credential",
        title: "Manual Credential Entry",
        content: "Click **+ Add Credential** in the Credentials tab to create one manually.\n\n**When to use this:**\n• Multi-item orders (second/third items)\n• Credentials for products delivered outside the normal flow\n• Correcting or replacing a credential\n\n**Required fields:**\n• Order Code, Phone, Product Name, Duration\n• Username, Password\n• Expiry Date\n\n**Optional:** TOTP Secret, Notes",
        tips: ["Use the same Order Code as the original order to keep everything linked.", "The customer will see all credentials for their phone number on the lookup page."],
      },
      {
        id: "credential-statuses",
        title: "Status: Active / Expiring / Expired / Reclaimed",
        content: "Each credential has a status based on its expiry date:\n\n• 🟢 **Active** — Valid and not expiring soon. No action needed.\n• 🟡 **Expiring** — Expires within 7 days. Shows a yellow warning with countdown (e.g., \"3d left\").\n• 🔴 **Expired** — Past the expiry date. Shows red with \"Expired 5d ago\".\n• ⬛ **Reclaimed** — You've marked it as taken back. Permanently flagged.\n\n**Filter pills** let you view credentials by status. The badge on the Credentials tab shows the count of expiring + expired credentials.",
      },
      {
        id: "reclaiming",
        title: "Reclaiming Credentials",
        content: "When a subscription expires and you take back the account (e.g., change the password for a shared Netflix account), click **Reclaim** on the credential.\n\nThis:\n• Marks the credential as \"Reclaimed\" (gray, struck-through)\n• Prevents the customer from seeing it as active\n• Cannot be undone\n\n**Use this when:**\n• A subscription has expired and you're recycling the account\n• A customer's access period is over",
        warnings: ["Reclaiming is permanent. You cannot un-reclaim a credential."],
      },
      {
        id: "totp-testing",
        title: "TOTP Testing",
        content: "Some services use two-factor authentication with TOTP codes (like Google Authenticator).\n\nIf a credential has a TOTP secret stored:\n1. Click the **Test Code** button\n2. The system generates the current 6-digit code\n3. The code refreshes every 30 seconds\n\nThis is useful for:\n• Verifying the TOTP secret is correct before giving it to a customer\n• Quickly getting a 2FA code when you need to log into the account",
        tips: ["TOTP codes change every 30 seconds. Test right before you need to use it."],
      },
      {
        id: "password-copy",
        title: "Password Reveal & Copy",
        content: "For security, passwords are hidden by default (shown as •••••••).\n\n• Click the **👁 eye icon** to reveal the password\n• Click **📋** next to username or password to copy to clipboard\n• The \"Copied!\" confirmation appears briefly\n\nThis makes it easy to:\n• Verify credentials are correct\n• Copy credentials for troubleshooting\n• Share credentials securely (copy, don't screenshot)",
      },
    ],
  },
  {
    id: "customers",
    icon: "🧑",
    title: "Customers",
    steps: [
      {
        id: "customer-list",
        title: "Customer List Overview",
        content: "The **Customers** tab automatically lists every customer — there's no manual entry. A customer is identified by their **phone number**, and they appear the moment they place their first order.\n\nEach customer card shows:\n• 📱 Phone number\n• Order count and total amount spent (completed orders)\n• 🔔 **ON** / 🔕 **OFF** — whether they've enabled push notifications\n• ⚠️ Expiring count — how many of their credentials expire soon\n\nClick a card to expand it and see all their credentials (active + past) and actions.",
        tips: ["Search by phone number to quickly find a specific customer.", "Customers are sorted by most recent order first."],
        goTo: "customers",
        goToLabel: "Go to Customers",
      },
      {
        id: "notification-status",
        title: "Notification Status (🔔 ON / 🔕 OFF)",
        content: "The bell on each customer shows whether that customer can receive push notifications:\n\n• 🔔 **ON** — The customer has a registered push subscription. You can send them reminders.\n• 🔕 **OFF** — No subscription. They haven't enabled notifications yet.\n\n**How a customer turns it ON:** They open `/lookup`, log in with their phone, and tap **Allow** when the notification banner appears (requires Chrome/Android or an installed PWA).\n\nThis status is **live** — it reflects the real database. You cannot toggle it from admin; only the customer's own device can register.",
        tips: ["If a customer says they enabled notifications but it shows OFF, have them re-open /lookup — the subscription self-registers on visit."],
      },
      {
        id: "renewal-reminders",
        title: "Sending Renewal Reminders",
        content: "When a customer's subscription is **expiring soon**, you can nudge them to renew:\n\n1. Expand the customer card\n2. Find the credential marked **expiring** (amber, e.g. \"3d left\")\n3. Click **🔔 Remind** next to it — OR use **🔔 Send Renewal Reminder** at the bottom for a general reminder\n4. A push notification is sent to their device: \"⏰ Your subscription is ending soon. Tap to renew.\"\n\nThe button is **disabled** if the customer has notifications OFF (🔕) — you can't reach a device that never subscribed.",
        tips: ["Reminders open the customer's shop page so they can re-purchase quickly.", "Only customers with 🔔 ON can receive reminders."],
        goTo: "customers",
        goToLabel: "Go to Customers",
      },
      {
        id: "reset-device-fingerprint",
        title: "Reset Device Fingerprint",
        content: "Each phone is **locked to one device** for security — only the device that first verified can view the credentials. If a customer gets a **new phone** and can't see their credentials, reset their device binding:\n\n1. Expand the customer card\n2. Click **📱 Reset Device Fingerprint**\n3. Confirm\n\nThis:\n• Removes the old device lock\n• Logs out all their existing sessions\n• Lets them re-verify on their new device (they'll need their phone + transaction ID again)\n\nDo a quick **manual verification** (confirm they're the real customer) before resetting, since this unlocks credential access on a new device.",
        warnings: ["Only reset after confirming the request is genuine — this unlocks credentials on a new device."],
        goTo: "customers",
        goToLabel: "Go to Customers",
      },
    ],
  },
  {
    id: "reviews",
    icon: "⭐",
    title: "Reviews",
    steps: [
      {
        id: "viewing-reviews",
        title: "Viewing Customer Reviews",
        content: "The Reviews tab shows all customer-submitted reviews, sorted newest first.\n\nEach review shows:\n• **Author name** — Who wrote it\n• **Star rating** — 1 to 5 stars\n• **Comment** — The review text\n• **Date** — When it was submitted\n\nReviews are displayed publicly on the homepage of your website in the \"Customer Reviews\" section.",
        goTo: "reviews",
        goToLabel: "Go to Reviews",
      },
      {
        id: "deleting-reviews",
        title: "Deleting Reviews",
        content: "Click the **Delete** button on any review to remove it. A confirmation dialog will appear.\n\n**When to delete:**\n• Spam or fake reviews\n• Inappropriate language\n• Reviews from test/demo orders\n\nDeleted reviews are permanently removed from both the admin panel and the public website.",
        warnings: ["Review deletion is permanent and cannot be undone."],
      },
    ],
  },
  {
    id: "support",
    icon: "📩",
    title: "Support Messages",
    steps: [
      {
        id: "realtime-incoming",
        title: "Real-Time Incoming Messages",
        content: "When a customer sends a support message from the Contact page, it appears in your Support tab **instantly**.\n\nYou'll be alerted with:\n• 🔊 **Sound notification** — a chime plays\n• 🖥️ **Desktop notification** — browser popup (if you allowed notifications)\n• 🔴 **Badge update** — the Support tab badge count increases\n• 📢 **Toast message** — \"New support message\" appears at the top\n\nThis works even if you're on a different tab — you'll always know when a customer needs help.",
        tips: ["Allow browser notifications when prompted — they work even when you're in another browser tab."],
        goTo: "support",
        goToLabel: "Go to Support",
      },
      {
        id: "replying",
        title: "Replying with Admin Notes",
        content: "Each support message has an **Admin Note** text field below it.\n\n1. Type your response in the text field\n2. Click **Save Note**\n3. Your note is saved and visible to the customer in their support conversation\n\nThe customer sees your reply the next time they visit the website or check their support status.",
      },
      {
        id: "resolving",
        title: "Resolving Messages",
        content: "Click **Resolve** to mark a support message as handled.\n\n• Resolved messages show a green \"Resolved\" badge\n• They move to the bottom of the list\n• The unresolved count badge on the Support tab decreases\n\nYou can still view and edit resolved messages — resolving just means \"I've handled this.\"",
      },
    ],
  },
  {
    id: "short-links",
    icon: "🔗",
    title: "Short Links",
    steps: [
      {
        id: "creating-link",
        title: "Creating a Short Link",
        content: "Short links are shareable URLs that redirect customers directly to a product page.\n\n**How to create one:**\n1. Go to the **Links** tab\n2. Select a **Product** from the dropdown\n3. Enter a **Short code** (letters, numbers, hyphens only)\n   Example: `chatgpt-1mo`\n4. Optionally add a **Label** for your reference (e.g., \"FB Post May\")\n5. Click **Create Link →**\n\nThe generated URL looks like: `yoursite.com/s/chatgpt-1mo`",
        tips: ["Use short, memorable codes that describe the product.", "The label is only visible to you — use it to track where you shared the link."],
        goTo: "links",
        goToLabel: "Go to Links",
      },
      {
        id: "click-tracking",
        title: "Click Tracking",
        content: "Each short link tracks how many times it's been clicked.\n\nThe click count is shown as a blue pill on each link card: \"👁 24 clicks\"\n\nThis helps you measure:\n• Which social media posts drive the most traffic\n• Which products people are most interested in\n• Whether your marketing campaigns are working",
      },
      {
        id: "sharing-social",
        title: "Sharing on Social Media",
        content: "Click the **📋 Copy** button to copy the full short link URL to your clipboard.\n\nPaste it in:\n• Facebook posts and comments\n• Telegram groups and channels\n• WhatsApp messages\n• Instagram bio\n• Any other platform\n\nThe customer clicks the link → lands directly on the product page → can add to cart immediately.",
      },
    ],
  },
  {
    id: "staff",
    icon: "👥",
    title: "Staff Management",
    superOnly: true,
    steps: [
      {
        id: "adding-staff",
        title: "Adding Staff Members",
        content: "Click **+ Add Staff** to create a new admin account.\n\n**Required fields:**\n• **Name** — Display name\n• **Email** — Login email (must be unique)\n• **Password** — Login password\n• **Role** — Moderator or Super User\n\nOnce created, the staff member can log in at `/admin` with their email and password.",
        goTo: "staff",
        goToLabel: "Go to Staff",
      },
      {
        id: "roles-explained",
        title: "Roles: Super User vs Moderator",
        content: "**Super User** (full access):\n• ✅ Orders, Products, Credentials, Reviews, Support, Links\n• ✅ Analytics (charts, revenue data)\n• ✅ Staff Management (add, remove, change roles)\n• ✅ Settings (store info, payment numbers, policies)\n• ✅ This Guides tab\n\n**Moderator** (operations only):\n• ✅ Orders, Products, Credentials, Reviews, Support, Links\n• ❌ No Analytics\n• ❌ No Staff Management\n• ❌ No Settings (unless specifically permitted by a Super User)\n• ✅ This Guides tab\n\nModerators are ideal for employees who handle daily operations but shouldn't access business analytics or system settings.",
      },
      {
        id: "changing-roles",
        title: "Changing Staff Roles",
        content: "On the Staff tab, each staff member has a role indicator.\n\n• Click the **role button** to promote (Moderator → Super User) or demote (Super User → Moderator)\n• A confirmation dialog appears\n• Changes take effect immediately\n\nThe staff member's access updates on their next page load.",
        warnings: ["Be careful promoting to Super User — they get full access including Staff management and Settings."],
      },
      {
        id: "removing-staff",
        title: "Removing Staff Members",
        content: "Click **Delete** on a staff member's card to permanently remove their account.\n\n• A confirmation dialog appears\n• Once deleted, they immediately lose all access\n• They cannot log in anymore\n• This cannot be undone",
        warnings: ["Staff deletion is permanent. You'll need to recreate the account if you change your mind."],
      },
    ],
  },
  {
    id: "settings",
    icon: "⚙️",
    title: "Settings",
    superOnly: true,
    steps: [
      {
        id: "store-info",
        title: "Store Info & Contact Details",
        content: "Configure your store's public information:\n\n• **Store Name** — Displayed in the website footer and browser title\n• **WhatsApp Number** — Digits with country code (e.g., 8801879009680)\n• **WhatsApp Link** — Full URL (e.g., https://wa.me/8801879009680)\n• **Telegram Link** — Full URL (e.g., https://t.me/yourusername)\n• **Support Email** — Shown in footer and contact page\n\nChanges apply **immediately** across the entire website.",
        goTo: "settings",
        goToLabel: "Go to Settings",
      },
      {
        id: "payment-phone",
        title: "Payment Phone Number",
        content: "The **Payment Phone** setting controls the phone number displayed on the checkout page — this is where customers send their bKash/Nagad payment.\n\nIf you change your payment number:\n1. Go to Settings\n2. Update the **Payment Phone** field\n3. Click Save\n4. The checkout page immediately shows the new number",
        warnings: ["Double-check this number carefully. A wrong payment number means customers send money to the wrong place."],
      },
      {
        id: "terms-refund-privacy",
        title: "Terms, Refund & Privacy Policies",
        content: "Write your policies in plain text:\n\n• **Terms & Conditions** → displayed at `/terms`\n• **Refund Policy** → displayed at `/refund`\n• **Privacy Policy** → displayed at `/privacy` (optional)\n\nThese pages are linked in the website footer. Write clearly and keep them up-to-date for customer trust.",
        tips: ["Include your refund/replacement policy clearly to reduce support disputes."],
      },
      {
        id: "moderator-permissions",
        title: "Moderator Permissions",
        content: "Each setting has a lock toggle:\n\n• 🔒 **Super User only** — Only Super Users can edit this setting\n• 🔓 **Moderator can edit** — Moderators can also change this setting\n\nClick the toggle to switch. This lets you selectively grant Moderators the ability to update specific settings (e.g., letting them update the payment phone number without giving them access to everything).",
      },
    ],
  },
  {
    id: "customer-journey",
    icon: "🌐",
    title: "Customer Journey",
    steps: [
      {
        id: "browsing",
        title: "How Customers Browse Your Store",
        content: "The customer experience flow:\n\n1. **Homepage** — Featured products, best sellers, reviews, how-it-works section\n2. **Shop page** (`/shop`) — All products, filterable by category, searchable\n3. **Product Detail** (`/product/[id]`) — Full description, package selector, add to cart\n4. **Header** — Search bar, category navigation, cart icon with count\n5. **Mobile Dock** — Bottom navigation bar on mobile (Home, Shop, Cart, My Subscription, Menu)\n\nThe website supports **English and Bangla** — customers can switch language anytime.",
      },
      {
        id: "cart-checkout",
        title: "Cart & Checkout Flow",
        content: "1. Customer adds products to cart (selects package/duration)\n2. Goes to Cart page — sees items, prices, order summary\n3. Clicks \"Checkout\"\n4. **Checkout page:**\n   • Selects payment method (bKash or Nagad)\n   • Sees your payment phone number\n   • Enters THEIR phone number\n   • Enters the Transaction ID from their payment\n   • Optional: adds a note\n5. Submits order → gets an order confirmation with order code\n6. Customer is redirected to the Orders page",
      },
      {
        id: "order-tracking",
        title: "Order Tracking (/orders)",
        content: "Customers can track their orders at `/orders` by entering their phone number.\n\nThey see:\n• Order code and date\n• Product name and duration\n• Payment method and amount\n• Status (Pending → Completed)\n• Any notes from the admin\n\nThe status updates in real-time — when you mark an order as completed, the customer sees it immediately on refresh.",
      },
      {
        id: "credential-lookup",
        title: "Credential Lookup (/lookup)",
        content: "After you deliver credentials, the customer retrieves them at `/lookup` (labelled **My Subscription** in the site nav):\n\n1. Customer enters their **phone number**\n2. **First device / new device:** they're asked for their **Transaction ID** (from their original payment) to prove ownership\n3. Once verified, the device is **bound** — future visits from that same device skip the Transaction ID step\n4. They see all credentials for their phone:\n   • Product name and duration\n   • Username / email\n   • Password (hidden by default, revealable)\n   • Expiry date with countdown\n   • TOTP code generator (if applicable)\n\nThe Transaction ID match is **case-insensitive**. If a customer can't get in on a new device, use **Customers → Reset Device Fingerprint**.",
      },
      {
        id: "push-notifications",
        title: "Push Notifications (PWA)",
        content: "Your website is a **Progressive Web App (PWA)**:\n\n• Customers can **install** it on their phone (like an app)\n• An install prompt appears automatically on mobile\n• Once installed, push notifications work:\n\n**When you deliver an order**, the customer automatically receives:\n> \"✅ Your Order is Ready!\"\n> \"Your Netflix Premium credential has been delivered. Tap to view.\"\n\nTapping the notification opens the app directly to the `/lookup` page.\n\nThis works even when the customer's browser is closed.",
        tips: ["Push notifications only work if the customer allowed notifications and installed the PWA.", "iOS users must install the PWA first (Add to Home Screen) for push to work."],
      },
      {
        id: "customer-support",
        title: "Customer Support Messages",
        content: "Customers can send you support messages from:\n• The **Contact page** (`/contact`)\n• The support form on the `/lookup` page (after viewing credentials)\n\nMessages arrive in your **Support tab** in real-time with sound + desktop notifications.\n\nCustomers can also reach you via:\n• WhatsApp (link in footer)\n• Telegram (link in footer)\n• Email (shown in footer)",
      },
    ],
  },
  {
    id: "testing",
    icon: "🧪",
    title: "Testing (Pilot)",
    superOnly: true,
    steps: [
      {
        id: "test-push",
        title: "Test Push Notification",
        content: "**This is a temporary pilot tab** for verifying that push notifications reach a customer's device. It will be removed after testing is complete.\n\n**How to use:**\n1. Go to the **🧪 Testing** tab\n2. Enter a customer's phone number\n3. Have the customer's device ready (PWA installed + notifications allowed)\n4. Click **🔔 Send Test**\n5. Read the **Diagnostics**:\n   • **Registered devices** — how many devices subscribed under this phone\n   • **Delivered** — how many got the push\n   • **Failed** — delivery failures (usually expired subscriptions)\n   • **Push services** — which provider (FCM = Android/Chrome, etc.)\n\n**Reading the result:**\n• Delivered > 0 → device buzzes with the signature vibration → working ✓\n• Registered devices = 0 → customer never enabled notifications\n• Failed > 0 → subscription expired, customer should re-allow",
        tips: ["The test push uses the same signature vibration pattern as real notifications.", "If 0 registered devices, send the customer to /lookup to enable notifications first."],
        goTo: "testing",
        goToLabel: "Go to Testing",
      },
    ],
  },
  {
    id: "system",
    icon: "🔧",
    title: "System & Architecture",
    steps: [
      {
        id: "tech-stack",
        title: "Tech Stack Overview",
        content: "Your store is built with:\n\n• **Next.js 15** (App Router) — React-based web framework\n• **PostgreSQL** (Neon Serverless) — Cloud database\n• **Drizzle ORM** — Database queries and migrations\n• **Vercel** — Recommended hosting platform\n• **ImgBB** — Free image hosting for product images\n• **Web Push (VAPID)** — Push notifications via service worker\n• **Chart.js** — Analytics charts\n\nAll code is in a single repository. The admin panel and customer website share the same codebase.",
      },
      {
        id: "env-vars",
        title: "Environment Variables",
        content: "Your `.env` file contains sensitive configuration:\n\n• `DATABASE_URL` — Neon PostgreSQL connection string\n• `NEXTAUTH_SECRET` — Secret key for admin session cookies\n• `NEXTAUTH_URL` — Your site URL (e.g., http://localhost:3000)\n• `IMGBB_API_KEY` — API key for image uploads\n• `NEXT_PUBLIC_VAPID_KEY` — Public key for push notifications (client-side)\n• `VAPID_PRIVATE_KEY` — Private key for push notifications (server-side)\n• `VAPID_EMAIL` — Contact email for push notification service",
        warnings: ["Never share your .env file publicly.", "The VAPID_PRIVATE_KEY and NEXTAUTH_SECRET must be kept secret.", "If you deploy to Vercel, add these as Environment Variables in your project settings."],
      },
      {
        id: "database-schema",
        title: "Database Tables",
        content: "Your database has these main tables:\n\n• **products** — All store products with packages, descriptions, stock\n• **orders** — Customer orders with items, payment info, status\n• **credentials** — Delivered account credentials linked to orders\n• **reviews** — Customer reviews (author, rating, comment)\n• **support_messages** — Customer support messages + admin replies\n• **users** — Admin/staff accounts (email, password hash, role)\n• **lookup_tokens** — Time-based tokens for customer credential access\n• **phone_device_bindings** — Links phones to authorized devices\n• **push_subscriptions** — Push notification subscriptions per device\n• **settings** — Key-value store for site configuration\n• **short_links** — Trackable short URLs for products",
      },
      {
        id: "api-routes",
        title: "API Routes Quick Reference",
        content: "All API routes are under `/api/`:\n\n**Products**\n• `GET /api/products` — List all products\n• `POST /api/products` — Create product\n• `PATCH /api/products/[id]` — Update product\n• `DELETE /api/products/[id]` — Delete product\n\n**Orders**\n• `GET /api/orders` — List all orders\n• `POST /api/orders` — Create order (from checkout)\n• `PATCH /api/orders/[id]` — Update order status\n\n**Credentials**\n• `GET /api/credentials` — List all credentials\n• `POST /api/credentials` — Create credential\n• `PATCH /api/credentials/[id]` — Update credential\n• `DELETE /api/credentials/[id]` — Delete credential\n\n**Customers**\n• `GET /api/customers` — Aggregated customer list (by phone)\n• `POST /api/customers/remind` — Send renewal reminder push\n\n**Other**\n• `POST /api/admin/login` — Admin login\n• `GET /api/admin/me` — Check admin session\n• `GET/POST /api/reviews` — List/create reviews\n• `GET/POST /api/support` — Support messages\n• `PUT /api/settings` — Update settings\n• `GET/POST/DELETE /api/links` — Short link management\n• `POST /api/push/subscribe` — Push subscription\n• `POST /api/lookup` — Customer phone + transaction ID verification\n• `DELETE /api/lookup/device/[phone]` — Reset device binding\n• `POST /api/testing/push` — (Pilot) Test notification with diagnostics",
      },
    ],
  },
];

/* ─────────────────────────────────────────
   PROGRESS HELPERS
───────────────────────────────────────── */
const STORAGE_KEY = "dizi_guide_progress";

function getProgress(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(progress: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...progress]));
  } catch {}
}

/* ─────────────────────────────────────────
   TOTAL STEP COUNT
───────────────────────────────────────── */
function getTotalSteps(isSuper: boolean): number {
  return GUIDES.filter((s) => !s.superOnly || isSuper)
    .reduce((sum, s) => sum + s.steps.length, 0);
}

/* ─────────────────────────────────────────
   SIMPLE MARKDOWN-LIKE RENDERER
───────────────────────────────────────── */
function renderContent(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
      } else {
        // Close code block — render it
        inCodeBlock = false;
        result.push(
          <pre key={`code-${i}`} style={{ background: "#0f172a", color: "#e2e8f0", padding: "0.875rem 1rem", borderRadius: "0.75rem", fontSize: "0.8125rem", fontFamily: "monospace", overflowX: "auto", margin: "0.75rem 0", lineHeight: 1.6, whiteSpace: "pre" }}>
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim() === "") { result.push(<br key={i} />); continue; }
    if (line.startsWith("• ")) {
      result.push(
        <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem", paddingLeft: "0.25rem" }}>
          <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0 }}>•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1] || "";
      const rest = line.replace(/^\d+\.\s/, "");
      result.push(
        <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", paddingLeft: "0.25rem" }}>
          <span style={{ color: "#059669", fontWeight: 800, fontSize: "0.8125rem", minWidth: 18, flexShrink: 0 }}>{num}.</span>
          <span>{renderInline(rest)}</span>
        </div>
      );
      continue;
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      result.push(<p key={i} style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem", margin: "0.75rem 0 0.35rem" }}>{line.replace(/\*\*/g, "")}</p>);
      continue;
    }
    result.push(<p key={i} style={{ margin: "0.2rem 0", lineHeight: 1.65 }}>{renderInline(line)}</p>);
  }
  return result;
}

function renderInline(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 700, color: "#0f172a" }}>{part.slice(2, -2)}</strong>;
    }
    // Inline code `text`
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith("`") && cp.endsWith("`")) {
        return <code key={`${i}-${j}`} style={{ background: "rgba(16,185,129,0.08)", padding: "0.1rem 0.4rem", borderRadius: "0.3rem", fontSize: "0.8125rem", fontWeight: 600, color: "#059669" }}>{cp.slice(1, -1)}</code>;
      }
      return cp;
    });
  });
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const SIDEBAR_SECTION: React.CSSProperties = {
  marginBottom: "0.25rem",
};

const SIDEBAR_SECTION_TITLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const SIDEBAR_STEP = (active: boolean, visited: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.4rem 0.75rem 0.4rem 2rem",
  fontSize: "0.8125rem",
  fontWeight: active ? 700 : 600,
  color: active ? "#059669" : visited ? "#475569" : "#94a3b8",
  background: active ? "rgba(16,185,129,0.08)" : "transparent",
  borderLeft: active ? "3px solid #10b981" : "3px solid transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  border: "none",
  width: "100%",
  textAlign: "left" as const,
  transition: "all 0.12s ease",
  borderRadius: 0,
});

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function GuidesTab({ setTab, isSuper }: { setTab: TabSetter; isSuper: boolean }) {
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState(GUIDES[0].id);
  const [activeStep, setActiveStep] = useState(GUIDES[0].steps[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load progress on mount
  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Mark step as visited
  const markVisited = useCallback((stepId: string) => {
    setProgress((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      saveProgress(next);
      return next;
    });
  }, []);

  // Navigate to a step
  const goToStep = useCallback((sectionId: string, stepId: string) => {
    setActiveSection(sectionId);
    setActiveStep(stepId);
    markVisited(stepId);
    setMobileOpen(false);
  }, [markVisited]);

  // Find current position for prev/next
  const visibleSections = GUIDES.filter((s) => !s.superOnly || isSuper);
  const allSteps: { sectionId: string; stepId: string }[] = [];
  for (const section of visibleSections) {
    for (const step of section.steps) {
      allSteps.push({ sectionId: section.id, stepId: step.id });
    }
  }
  const currentIdx = allSteps.findIndex((s) => s.stepId === activeStep);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allSteps.length - 1;

  const goPrev = () => {
    if (hasPrev) {
      const prev = allSteps[currentIdx - 1];
      goToStep(prev.sectionId, prev.stepId);
    }
  };
  const goNext = () => {
    if (hasNext) {
      const next = allSteps[currentIdx + 1];
      goToStep(next.sectionId, next.stepId);
    }
  };

  const resetProgress = () => {
    setProgress(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  // Find current step data
  const currentSection = visibleSections.find((s) => s.id === activeSection);
  const currentStep = currentSection?.steps.find((s) => s.id === activeStep);

  const totalSteps = getTotalSteps(isSuper);
  const completedCount = allSteps.filter((s) => progress.has(s.stepId)).length;

  // Mark current step as visited on mount/change
  useEffect(() => {
    if (activeStep) markVisited(activeStep);
  }, [activeStep, markVisited]);

  return (
    <div style={{ display: "flex", gap: "1.5rem", minHeight: "calc(100vh - 200px)" }}>

      {/* ═══ SIDEBAR ═══ */}
      <div className="guides-sidebar" style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Progress bar */}
        <div style={{ padding: "0.875rem", background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
              {completedCount} / {totalSteps} completed
            </span>
            <button
              onClick={resetProgress}
              style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
            >
              Reset
            </button>
          </div>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0}%`,
                background: "linear-gradient(90deg, #00c853, #059669)",
                borderRadius: 9999,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Sections & steps */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", flex: 1, overflowY: "auto" }}>
          {visibleSections.map((section) => (
            <div key={section.id} style={SIDEBAR_SECTION}>
              <div style={SIDEBAR_SECTION_TITLE}>
                <span>{section.icon}</span>
                <span>{section.title}</span>
                {section.superOnly && (
                  <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "0 0.35rem", borderRadius: "9999px" }}>SU</span>
                )}
              </div>
              {section.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(section.id, step.id)}
                  style={SIDEBAR_STEP(activeStep === step.id, progress.has(step.id))}
                >
                  <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>
                    {progress.has(step.id) ? "✅" : "○"}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{step.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Mobile toggle */}
        <button
          className="guides-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            width: "100%",
            height: 44,
            marginBottom: mobileOpen ? 0 : "0.75rem",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: mobileOpen ? "0.875rem 0.875rem 0 0" : "0.875rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#0f172a",
            cursor: "pointer",
            fontFamily: "inherit",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 1rem",
          }}
        >
          <span>📖 {currentStep?.title || "Select a guide"}</span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", transition: "transform 0.2s", transform: mobileOpen ? "rotate(180deg)" : "none", display: "inline-block" }}>▾</span>
        </button>

        {/* Mobile dropdown — guide list */}
        {mobileOpen && (
          <div className="guides-mobile-dropdown" style={{
            display: "none",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderTop: "none",
            borderRadius: "0 0 0.875rem 0.875rem",
            marginBottom: "0.75rem",
            maxHeight: 320,
            overflowY: "auto",
          }}>
            {visibleSections.map((section) => (
              <div key={section.id}>
                <div style={{ padding: "0.5rem 1rem 0.25rem", fontSize: "0.6875rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.06em", background: "#f8fafc" }}>
                  {section.icon} {section.title}
                </div>
                {section.steps.map((step) => (
                  <button key={step.id} onClick={() => goToStep(section.id, step.id)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.625rem 1.25rem", background: activeStep === step.id ? "rgba(16,185,129,0.06)" : "transparent", border: "none", borderLeft: `3px solid ${activeStep === step.id ? "#10b981" : "transparent"}`, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8125rem", fontWeight: activeStep === step.id ? 700 : 600, color: activeStep === step.id ? "#059669" : "#475569", textAlign: "left" as const }}>
                    <span style={{ fontSize: "0.75rem" }}>{progress.has(step.id) ? "✅" : "○"}</span>
                    {step.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {currentStep && (
          <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              padding: "1.5rem 1.75rem 1.25rem",
              borderBottom: "1px solid #f1f5f9",
              background: "linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(255,255,255,0) 100%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{currentSection?.icon}</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {currentSection?.title}
                </span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8" }}>
                  — Step {(currentSection?.steps.findIndex((s) => s.id === activeStep) || 0) + 1} of {currentSection?.steps.length}
                </span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "#0f172a", letterSpacing: "-0.025em", margin: 0 }}>
                {currentStep.title}
              </h2>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem 1.75rem", fontSize: "0.875rem", color: "#475569", lineHeight: 1.7 }}>
              {renderContent(currentStep.content)}

              {/* Tips */}
              {currentStep.tips && currentStep.tips.length > 0 && (
                <div style={{
                  marginTop: "1.25rem",
                  padding: "1rem 1.25rem",
                  background: "rgba(16,185,129,0.04)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  borderRadius: "0.875rem",
                }}>
                  <p style={{ fontWeight: 800, fontSize: "0.75rem", color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                    💡 Pro Tips
                  </p>
                  {currentStep.tips.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#10b981", flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: "0.8125rem", color: "#065f46", fontWeight: 600 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {currentStep.warnings && currentStep.warnings.length > 0 && (
                <div style={{
                  marginTop: "1rem",
                  padding: "1rem 1.25rem",
                  background: "rgba(245,158,11,0.05)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: "0.875rem",
                }}>
                  <p style={{ fontWeight: 800, fontSize: "0.75rem", color: "#b45309", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                    ⚠️ Important
                  </p>
                  {currentStep.warnings.map((warn, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#f59e0b", flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: "0.8125rem", color: "#92400e", fontWeight: 600 }}>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Go There button */}
              {currentStep.goTo && (
                <button
                  onClick={() => setTab(currentStep.goTo!)}
                  style={{
                    marginTop: "1.25rem",
                    height: 40,
                    padding: "0 1.25rem",
                    background: "linear-gradient(135deg, #00c853, #059669)",
                    border: "none",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    transition: "transform 0.12s, box-shadow 0.12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
                >
                  → {currentStep.goToLabel || `Go to ${currentStep.goTo}`}
                </button>
              )}
            </div>

            {/* Navigation footer */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.75rem",
              borderTop: "1px solid #f1f5f9",
              background: "#fafbfc",
            }}>
              <button
                onClick={goPrev}
                disabled={!hasPrev}
                style={{
                  height: 38,
                  padding: "0 1rem",
                  borderRadius: "0.625rem",
                  background: hasPrev ? "#f8fafc" : "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  color: hasPrev ? "#475569" : "#cbd5e1",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: hasPrev ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                ← Previous
              </button>

              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                {currentIdx + 1} / {allSteps.length}
              </span>

              <button
                onClick={goNext}
                disabled={!hasNext}
                style={{
                  height: 38,
                  padding: "0 1rem",
                  borderRadius: "0.625rem",
                  background: hasNext ? "linear-gradient(135deg, #00c853, #059669)" : "#f8fafc",
                  border: hasNext ? "none" : "1.5px solid #e2e8f0",
                  color: hasNext ? "#fff" : "#cbd5e1",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: hasNext ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                Next Step →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ RESPONSIVE STYLES ═══ */}
      <style>{`
        @media (max-width: 860px) {
          .guides-sidebar {
            display: none !important;
          }
          .guides-mobile-toggle {
            display: flex !important;
          }
          .guides-mobile-dropdown {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
