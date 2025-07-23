import { pgTable, text, uuid, decimal, integer, boolean, timestamp, date, jsonb, pgEnum, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const businessTypeEnum = pgEnum('business_type', ['cafe', 'restaurant', 'bakery', 'other']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['free', 'premium', 'canceled']);
export const menuCategoryEnum = pgEnum('menu_category', ['coffee', 'beverage', 'dessert', 'food', 'other']);
export const seasonEnum = pgEnum('season', ['spring', 'summer', 'fall', 'winter']);
export const menuComplexityEnum = pgEnum('menu_complexity', ['simple', 'medium', 'complex']);
export const ingredientCategoryEnum = pgEnum('ingredient_category', ['coffee', 'dairy', 'syrup', 'powder', 'packaging', 'other']);
export const unitEnum = pgEnum('unit', ['g', 'kg', 'ml', 'L', '개', '포']);
export const qualityGradeEnum = pgEnum('quality_grade', ['premium', 'standard', 'economy']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'yearly']);
export const subscriptionPlanStatusEnum = pgEnum('subscription_plan_status', ['active', 'canceled', 'past_due', 'paused']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded']);
export const confidenceLevelEnum = pgEnum('confidence_level', ['high', 'medium', 'low']);

// 사용자 테이블
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  cafeName: text('cafe_name').notNull(),
  region: text('region').notNull(),
  businessType: businessTypeEnum('business_type').default('cafe'),
  phone: text('phone'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('free'),
  subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  
  // AI 사용량 관리
  monthlyAiLimit: integer('monthly_ai_limit').default(10),
  aiCallsThisMonth: integer('ai_calls_this_month').default(0),
  aiLimitResetDate: date('ai_limit_reset_date').defaultNow(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    emailIdx: index('idx_users_email').on(table.email),
    regionIdx: index('idx_users_region').on(table.region),
    subscriptionStatusIdx: index('idx_users_subscription_status').on(table.subscriptionStatus),
    aiUsageIdx: index('idx_users_ai_usage').on(table.id, table.aiCallsThisMonth, table.monthlyAiLimit),
  };
});

// 원가계산 테이블
export const calculations = pgTable('calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  menuName: text('menu_name').notNull(),
  menuCategory: menuCategoryEnum('menu_category').default('coffee'),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }).notNull(),
  servingSize: text('serving_size'),
  notes: text('notes'),
  isTemplate: boolean('is_template').default(false),
  
  // AI 관련 필드
  season: seasonEnum('season'),
  hasAiTips: boolean('has_ai_tips').default(false),
  menuComplexity: menuComplexityEnum('menu_complexity').default('simple'),
  
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('idx_calculations_user_id').on(table.userId),
    createdAtIdx: index('idx_calculations_created_at').on(table.createdAt),
    menuCategoryIdx: index('idx_calculations_menu_category').on(table.menuCategory),
    isTemplateIdx: index('idx_calculations_is_template').on(table.isTemplate),
    userCategoryIdx: index('idx_calculations_user_category').on(table.userId, table.menuCategory),
  };
});

// 재료 마스터 테이블
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: ingredientCategoryEnum('category').notNull(),
  defaultUnit: unitEnum('default_unit').notNull(),
  barcode: text('barcode'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    nameIdx: index('idx_ingredients_name').on(table.name),
    categoryIdx: index('idx_ingredients_category').on(table.category),
  };
});

// 계산-재료 연결 테이블
export const calculationIngredients = pgTable('calculation_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  calculationId: uuid('calculation_id').notNull().references(() => calculations.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id),
  customIngredientName: text('custom_ingredient_name'),
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unit: text('unit').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  priceUnit: text('price_unit').notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  supplier: text('supplier'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    calculationIdIdx: index('idx_calc_ingredients_calculation_id').on(table.calculationId),
    ingredientIdIdx: index('idx_calc_ingredients_ingredient_id').on(table.ingredientId),
  };
});

// 가격 제출 테이블
export const priceSubmissions = pgTable('price_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(),
  supplier: text('supplier'),
  region: text('region').notNull(),
  qualityGrade: qualityGradeEnum('quality_grade'),
  isOrganic: boolean('is_organic').default(false),
  purchaseQuantity: decimal('purchase_quantity', { precision: 10, scale: 2 }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  isVerified: boolean('is_verified').default(false),
}, (table) => {
  return {
    ingredientRegionIdx: index('idx_price_submissions_ingredient_region').on(table.ingredientId, table.region),
    submittedAtIdx: index('idx_price_submissions_submitted_at').on(table.submittedAt),
    userIdIdx: index('idx_price_submissions_user_id').on(table.userId),
  };
});

// 구독 플랜 테이블
export const subscriptionPlans = pgTable('subscription_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('KRW'),
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  aiMonthlyLimit: integer('ai_monthly_limit').default(0), // 0: 비활성, -1: 무제한
  features: jsonb('features').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 구독 테이블
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => subscriptionPlans.id),
  status: subscriptionPlanStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  paymentMethodId: text('payment_method_id'),
  tossCustomerKey: text('toss_customer_key'),
  tossBillingKey: text('toss_billing_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('idx_subscriptions_user_id').on(table.userId),
    statusIdx: index('idx_subscriptions_status').on(table.status),
  };
});

// 결제 기록 테이블
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('KRW'),
  status: paymentStatusEnum('status').notNull(),
  tossPaymentKey: text('toss_payment_key').unique(),
  tossOrderId: text('toss_order_id'),
  failureReason: text('failure_reason'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    subscriptionIdIdx: index('idx_payments_subscription_id').on(table.subscriptionId),
    statusIdx: index('idx_payments_status').on(table.status),
    createdAtIdx: index('idx_payments_created_at').on(table.createdAt),
  };
});

// AI 원가절감 팁 테이블
export const aiCostTips = pgTable('ai_cost_tips', {
  id: uuid('id').primaryKey().defaultRandom(),
  calculationId: uuid('calculation_id').notNull().unique().references(() => calculations.id, { onDelete: 'cascade' }),
  
  // 핵심 절감 팁 내용
  costSavingTip: text('cost_saving_tip').notNull(),
  expectedMonthlySaving: decimal('expected_monthly_saving', { precision: 10, scale: 2 }),
  confidenceLevel: confidenceLevelEnum('confidence_level').notNull(),
  
  // 마진 분석
  marginAnalysis: text('margin_analysis').notNull(),
  comparisonToAverage: decimal('comparison_to_average', { precision: 5, scale: 2 }), // 업계 평균 대비 %
  
  // 실행 가능한 액션
  actionItems: jsonb('action_items').default('[]'),
  
  // 메타데이터
  aiModel: text('ai_model').default('gpt-4o-mini'),
  promptVersion: text('prompt_version').default('v1.0'),
  generationCostUsd: decimal('generation_cost_usd', { precision: 8, scale: 5 }).default('0.0'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => {
  return {
    calculationIdIdx: index('idx_ai_tips_calculation').on(table.calculationId),
    expiresAtIdx: index('idx_ai_tips_expires').on(table.expiresAt),
  };
});

// AI 사용량 로그 테이블
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // API 호출 정보
  endpoint: text('endpoint').notNull(),
  requestType: text('request_type').default('cost_saving_tip'),
  
  // 비용 추적
  tokensUsed: integer('tokens_used').default(0),
  costUsd: decimal('cost_usd', { precision: 8, scale: 5 }).default('0.0'),
  
  // 성능 추적
  responseTimeMs: integer('response_time_ms'),
  fromCache: boolean('from_cache').default(false),
  
  // 에러 추적
  errorType: text('error_type'),
  errorMessage: text('error_message'),
  
  // 메타데이터
  userSubscriptionStatus: text('user_subscription_status').default('free'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userMonthIdx: index('idx_ai_usage_user_month').on(table.userId, table.createdAt),
    createdAtIdx: index('idx_ai_usage_created').on(table.createdAt),
    costIdx: index('idx_ai_usage_cost').on(table.costUsd),
  };
});

// AI 팁 피드백 테이블
export const aiTipFeedback = pgTable('ai_tip_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipId: uuid('tip_id').notNull().references(() => aiCostTips.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // 피드백 내용
  isHelpful: boolean('is_helpful').notNull(),
  comment: text('comment'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    tipIdIdx: index('idx_feedback_tip').on(table.tipId),
    helpfulIdx: index('idx_feedback_helpful').on(table.isHelpful),
    uniqueUserTipFeedback: unique().on(table.tipId, table.userId),
  };
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  calculations: many(calculations),
  priceSubmissions: many(priceSubmissions),
  subscriptions: many(subscriptions),
  aiUsageLogs: many(aiUsageLogs),
  aiTipFeedback: many(aiTipFeedback),
}));

export const calculationsRelations = relations(calculations, ({ one, many }) => ({
  user: one(users, {
    fields: [calculations.userId],
    references: [users.id],
  }),
  calculationIngredients: many(calculationIngredients),
  aiCostTips: one(aiCostTips),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  calculationIngredients: many(calculationIngredients),
  priceSubmissions: many(priceSubmissions),
}));

export const calculationIngredientsRelations = relations(calculationIngredients, ({ one }) => ({
  calculation: one(calculations, {
    fields: [calculationIngredients.calculationId],
    references: [calculations.id],
  }),
  ingredient: one(ingredients, {
    fields: [calculationIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const priceSubmissionsRelations = relations(priceSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [priceSubmissions.userId],
    references: [users.id],
  }),
  ingredient: one(ingredients, {
    fields: [priceSubmissions.ingredientId],
    references: [ingredients.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const aiCostTipsRelations = relations(aiCostTips, ({ one, many }) => ({
  calculation: one(calculations, {
    fields: [aiCostTips.calculationId],
    references: [calculations.id],
  }),
  feedback: many(aiTipFeedback),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
}));

export const aiTipFeedbackRelations = relations(aiTipFeedback, ({ one }) => ({
  tip: one(aiCostTips, {
    fields: [aiTipFeedback.tipId],
    references: [aiCostTips.id],
  }),
  user: one(users, {
    fields: [aiTipFeedback.userId],
    references: [users.id],
  }),
}));