CREATE TYPE "public"."order_status" AS ENUM('pending', 'verified', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'superuser', 'moderator');--> statement-breakpoint
CREATE TABLE "delivery_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"order_code" varchar(50) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"product_name" varchar(500) NOT NULL,
	"duration" varchar(100) NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"notes" text DEFAULT '',
	"totp_secret" text,
	"start_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"is_reclaimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lookup_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"device_id" varchar(64),
	"ip_address" varchar(100),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"total_bdt" integer NOT NULL,
	"total_usdt" integer DEFAULT 0 NOT NULL,
	"payment_method" varchar(100) NOT NULL,
	"trx_id" varchar(255),
	"phone" varchar(50),
	"order_status" "order_status" DEFAULT 'pending' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "phone_device_bindings" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(50) NOT NULL,
	"device_id" varchar(64) NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"bound_at" timestamp DEFAULT now() NOT NULL,
	"reset_at" timestamp,
	CONSTRAINT "phone_device_bindings_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" varchar(500) NOT NULL,
	"name_bn" varchar(500) NOT NULL,
	"short_desc_en" text DEFAULT '' NOT NULL,
	"short_desc_bn" text DEFAULT '' NOT NULL,
	"full_desc_en" text DEFAULT '' NOT NULL,
	"full_desc_bn" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"icon" varchar(10) DEFAULT '📦' NOT NULL,
	"icon_bg" varchar(20) DEFAULT '#e8f5e9' NOT NULL,
	"category" varchar(255) DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"stock" integer DEFAULT 0 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"packages" jsonb DEFAULT '[]'::jsonb,
	"options" jsonb DEFAULT '{"guarantee":"","share":"","duration":"","accountType":""}'::jsonb,
	"is_top" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"author" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(50) NOT NULL,
	"token" varchar(64),
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"admin_note" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "delivery_credentials" ADD CONSTRAINT "delivery_credentials_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;