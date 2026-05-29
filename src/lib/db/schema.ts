import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// "admin" is the legacy full-access role — treated as a Super User.
// New staff accounts use "superuser" (full control) or "moderator" (operations only).
export const roleEnum = pgEnum("role", ["admin", "user", "superuser", "moderator"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "verified",
  "completed",
  "failed",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nameEn: varchar("name_en", { length: 500 }).notNull(),
  nameBn: varchar("name_bn", { length: 500 }).notNull(),
  shortDescEn: text("short_desc_en").notNull().default(""),
  shortDescBn: text("short_desc_bn").notNull().default(""),
  fullDescEn: text("full_desc_en").notNull().default(""),
  fullDescBn: text("full_desc_bn").notNull().default(""),
  image: text("image").notNull().default(""),
  icon: varchar("icon", { length: 10 }).notNull().default("📦"),
  iconBg: varchar("icon_bg", { length: 20 }).notNull().default("#e8f5e9"),
  category: varchar("category", { length: 255 }).notNull().default(""),
  tags: jsonb("tags").$type<string[]>().default([]),
  stock: integer("stock").notNull().default(0),
  sold: integer("sold").notNull().default(0),
  packages: jsonb("packages")
    .$type<{ duration: string; usdt: number; bdt: number }[]>()
    .default([]),
  options: jsonb("options")
    .$type<{
      guarantee: string;
      share: string;
      duration: string;
      accountType: string;
    }>()
    .default({
      guarantee: "",
      share: "",
      duration: "",
      accountType: "",
    }),
  isTop: boolean("is_top").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: varchar("order_code", { length: 50 }).notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  totalBdt: integer("total_bdt").notNull(),
  totalUsdt: integer("total_usdt").notNull().default(0),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(),
  trxId: varchar("trx_id", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  status: orderStatusEnum("order_status").default("pending").notNull(),
  items: jsonb("items")
    .$type<
      {
        nameEn: string;
        nameBn: string;
        quantity: number;
        duration: string;
        icon: string;
        iconBg: string;
        priceBdt: number;
        priceUsdt: number;
      }[]
    >()
    .default([]),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  author: varchar("author", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliveryCredentials = pgTable("delivery_credentials", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  orderCode: varchar("order_code", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  productName: varchar("product_name", { length: 500 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  notes: text("notes").default(""),
  totpSecret: text("totp_secret"),          // null = no TOTP for this credential
  startDate: timestamp("start_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  isReclaimed: boolean("is_reclaimed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lookupTokens = pgTable("lookup_tokens", {
  id:        serial("id").primaryKey(),
  token:     varchar("token", { length: 64 }).notNull().unique(),
  phone:     varchar("phone", { length: 50 }).notNull(),
  deviceId:  varchar("device_id", { length: 64 }),          // which device created this token
  ipAddress: varchar("ip_address", { length: 100 }),        // IP captured at login
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One phone number → one bound device. Admin can reset to allow re-binding.
export const phoneDeviceBindings = pgTable("phone_device_bindings", {
  id:          serial("id").primaryKey(),
  phone:       varchar("phone", { length: 50 }).notNull().unique(),
  deviceId:    varchar("device_id", { length: 64 }).notNull(),
  ipAddress:   varchar("ip_address", { length: 100 }),
  userAgent:   text("user_agent"),
  boundAt:     timestamp("bound_at").defaultNow().notNull(),
  resetAt:     timestamp("reset_at"),                       // last admin reset timestamp
});

export const supportMessages = pgTable("support_messages", {
  id:         serial("id").primaryKey(),
  phone:      varchar("phone", { length: 50 }).notNull(),
  token:      varchar("token", { length: 64 }),
  message:    text("message").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  adminNote:  text("admin_note").default(""),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// Push notification subscriptions — linked to phone (customer identity)
export const pushSubscriptions = pgTable("push_subscriptions", {
  id:        serial("id").primaryKey(),
  phone:     varchar("phone", { length: 50 }).notNull(),
  deviceId:  varchar("device_id", { length: 64 }).notNull(),
  endpoint:  text("endpoint").notNull(),            // Web Push service URL
  p256dh:    text("p256dh").notNull(),               // Client public encryption key
  auth:      text("auth").notNull(),                 // Auth secret
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site-wide settings editable from admin panel.
// Super User can edit all. Super User can grant moderators edit access per key
// by setting a companion key: "perm_<key>" = "true".
export const siteSettings = pgTable("site_settings", {
  key:       varchar("key", { length: 100 }).primaryKey(),
  value:     text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

