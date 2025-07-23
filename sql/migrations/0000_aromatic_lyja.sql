CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('cafe', 'restaurant', 'bakery', 'other');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."ingredient_category" AS ENUM('coffee', 'dairy', 'syrup', 'powder', 'packaging', 'other');--> statement-breakpoint
CREATE TYPE "public"."menu_category" AS ENUM('coffee', 'beverage', 'dessert', 'food', 'other');--> statement-breakpoint
CREATE TYPE "public"."menu_complexity" AS ENUM('simple', 'medium', 'complex');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."quality_grade" AS ENUM('premium', 'standard', 'economy');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('spring', 'summer', 'fall', 'winter');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan_status" AS ENUM('active', 'canceled', 'past_due', 'paused');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('free', 'premium', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('g', 'kg', 'ml', 'L', '개', '포');--> statement-breakpoint
CREATE TABLE "ai_cost_tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"cost_saving_tip" text NOT NULL,
	"expected_monthly_saving" numeric(10, 2),
	"confidence_level" "confidence_level" NOT NULL,
	"margin_analysis" text NOT NULL,
	"comparison_to_average" numeric(5, 2),
	"action_items" jsonb DEFAULT '[]',
	"ai_model" text DEFAULT 'gpt-4o-mini',
	"prompt_version" text DEFAULT 'v1.0',
	"generation_cost_usd" numeric(8, 5) DEFAULT '0.0',
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "ai_cost_tips_calculation_id_unique" UNIQUE("calculation_id")
);
--> statement-breakpoint
CREATE TABLE "ai_tip_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_helpful" boolean NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ai_tip_feedback_tip_id_user_id_unique" UNIQUE("tip_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"request_type" text DEFAULT 'cost_saving_tip',
	"tokens_used" integer DEFAULT 0,
	"cost_usd" numeric(8, 5) DEFAULT '0.0',
	"response_time_ms" integer,
	"from_cache" boolean DEFAULT false,
	"error_type" text,
	"error_message" text,
	"user_subscription_status" text DEFAULT 'free',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calculation_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"ingredient_id" uuid,
	"custom_ingredient_name" text,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" text NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"price_unit" text NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"supplier" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"menu_name" text NOT NULL,
	"menu_category" "menu_category" DEFAULT 'coffee',
	"selling_price" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"profit_margin" numeric(5, 2) NOT NULL,
	"serving_size" text,
	"notes" text,
	"is_template" boolean DEFAULT false,
	"season" "season",
	"has_ai_tips" boolean DEFAULT false,
	"menu_complexity" "menu_complexity" DEFAULT 'simple',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "ingredient_category" NOT NULL,
	"default_unit" "unit" NOT NULL,
	"barcode" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ingredients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'KRW',
	"status" "payment_status" NOT NULL,
	"toss_payment_key" text,
	"toss_order_id" text,
	"failure_reason" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_toss_payment_key_unique" UNIQUE("toss_payment_key")
);
--> statement-breakpoint
CREATE TABLE "price_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"supplier" text,
	"region" text NOT NULL,
	"quality_grade" "quality_grade",
	"is_organic" boolean DEFAULT false,
	"purchase_quantity" numeric(10, 2),
	"submitted_at" timestamp with time zone DEFAULT now(),
	"is_verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'KRW',
	"billing_cycle" "billing_cycle" NOT NULL,
	"ai_monthly_limit" integer DEFAULT 0,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_plan_status" NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"payment_method_id" text,
	"toss_customer_key" text,
	"toss_billing_key" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"cafe_name" text NOT NULL,
	"region" text NOT NULL,
	"business_type" "business_type" DEFAULT 'cafe',
	"phone" text,
	"subscription_status" "subscription_status" DEFAULT 'free',
	"subscription_ends_at" timestamp with time zone,
	"onboarding_completed" boolean DEFAULT false,
	"monthly_ai_limit" integer DEFAULT 10,
	"ai_calls_this_month" integer DEFAULT 0,
	"ai_limit_reset_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_cost_tips" ADD CONSTRAINT "ai_cost_tips_calculation_id_calculations_id_fk" FOREIGN KEY ("calculation_id") REFERENCES "public"."calculations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tip_feedback" ADD CONSTRAINT "ai_tip_feedback_tip_id_ai_cost_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."ai_cost_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tip_feedback" ADD CONSTRAINT "ai_tip_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_ingredients" ADD CONSTRAINT "calculation_ingredients_calculation_id_calculations_id_fk" FOREIGN KEY ("calculation_id") REFERENCES "public"."calculations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_ingredients" ADD CONSTRAINT "calculation_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_tips_calculation" ON "ai_cost_tips" USING btree ("calculation_id");--> statement-breakpoint
CREATE INDEX "idx_ai_tips_expires" ON "ai_cost_tips" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_feedback_tip" ON "ai_tip_feedback" USING btree ("tip_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_helpful" ON "ai_tip_feedback" USING btree ("is_helpful");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_month" ON "ai_usage_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_created" ON "ai_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_cost" ON "ai_usage_logs" USING btree ("cost_usd");--> statement-breakpoint
CREATE INDEX "idx_calc_ingredients_calculation_id" ON "calculation_ingredients" USING btree ("calculation_id");--> statement-breakpoint
CREATE INDEX "idx_calc_ingredients_ingredient_id" ON "calculation_ingredients" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_calculations_user_id" ON "calculations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_calculations_created_at" ON "calculations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_calculations_menu_category" ON "calculations" USING btree ("menu_category");--> statement-breakpoint
CREATE INDEX "idx_calculations_is_template" ON "calculations" USING btree ("is_template");--> statement-breakpoint
CREATE INDEX "idx_calculations_user_category" ON "calculations" USING btree ("user_id","menu_category");--> statement-breakpoint
CREATE INDEX "idx_ingredients_name" ON "ingredients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_ingredients_category" ON "ingredients" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_payments_subscription_id" ON "payments" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_created_at" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_price_submissions_ingredient_region" ON "price_submissions" USING btree ("ingredient_id","region");--> statement-breakpoint
CREATE INDEX "idx_price_submissions_submitted_at" ON "price_submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "idx_price_submissions_user_id" ON "price_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_region" ON "users" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_users_subscription_status" ON "users" USING btree ("subscription_status");--> statement-breakpoint
CREATE INDEX "idx_users_ai_usage" ON "users" USING btree ("id","ai_calls_this_month","monthly_ai_limit");