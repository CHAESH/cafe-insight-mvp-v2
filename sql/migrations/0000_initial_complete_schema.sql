-- 카페인사이트 완전한 데이터베이스 스키마
-- Generated from docs/DB 스키마.md

-- =============================================
-- 1. 확장 및 기본 설정
-- =============================================

-- 필수 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 시즌 자동 설정 함수
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS TEXT AS $$
DECLARE
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
    CASE 
        WHEN current_month IN (3, 4, 5) THEN RETURN 'spring';
        WHEN current_month IN (6, 7, 8) THEN RETURN 'summer';
        WHEN current_month IN (9, 10, 11) THEN RETURN 'fall';
        ELSE RETURN 'winter';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. 핵심 테이블
-- =============================================

-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    cafe_name TEXT NOT NULL,
    region TEXT NOT NULL,
    business_type TEXT DEFAULT 'cafe' CHECK (business_type IN ('cafe', 'restaurant', 'bakery', 'other')),
    phone TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'canceled')),
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- AI 사용량 관리
    monthly_ai_limit INTEGER DEFAULT 10,
    ai_calls_this_month INTEGER DEFAULT 0,
    ai_limit_reset_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 month',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 원가계산 테이블
CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_name TEXT NOT NULL,
    menu_category TEXT DEFAULT 'coffee' CHECK (menu_category IN ('coffee', 'beverage', 'dessert', 'food', 'other')),
    selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price > 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    profit_margin DECIMAL(5,2) NOT NULL,
    serving_size TEXT,
    notes TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    
    -- AI 관련 필드
    season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
    has_ai_tips BOOLEAN DEFAULT FALSE,
    menu_complexity TEXT DEFAULT 'simple' CHECK (menu_complexity IN ('simple', 'medium', 'complex')),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_calculations_updated_at BEFORE UPDATE ON calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 시즌 자동 설정 트리거
CREATE OR REPLACE FUNCTION set_season_on_calculation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.season IS NULL THEN
        NEW.season := get_current_season();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_season 
    BEFORE INSERT ON calculations
    FOR EACH ROW 
    EXECUTE FUNCTION set_season_on_calculation();

-- 재료 마스터 테이블
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('coffee', 'dairy', 'syrup', 'powder', 'packaging', 'other')),
    default_unit TEXT NOT NULL CHECK (default_unit IN ('g', 'kg', 'ml', 'L', '개', '포')),
    barcode TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 계산-재료 연결 테이블
CREATE TABLE calculation_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_id UUID NOT NULL REFERENCES calculations(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    custom_ingredient_name TEXT,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    price_unit TEXT NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT either_ingredient_or_custom CHECK (
        (ingredient_id IS NOT NULL AND custom_ingredient_name IS NULL) OR
        (ingredient_id IS NULL AND custom_ingredient_name IS NOT NULL)
    )
);

-- 가격 제출 테이블
CREATE TABLE price_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    unit TEXT NOT NULL,
    supplier TEXT,
    region TEXT NOT NULL,
    quality_grade TEXT CHECK (quality_grade IN ('premium', 'standard', 'economy')),
    is_organic BOOLEAN DEFAULT FALSE,
    purchase_quantity DECIMAL(10,2),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE
);

-- =============================================
-- 3. 구독 및 결제 테이블
-- =============================================

-- 구독 플랜 테이블
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KRW',
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    ai_monthly_limit INTEGER DEFAULT 0, -- 0: 비활성, -1: 무제한
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 구독 테이블
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_method_id TEXT,
    toss_customer_key TEXT,
    toss_billing_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 결제 기록 테이블
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KRW',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    toss_payment_key TEXT UNIQUE,
    toss_order_id TEXT,
    failure_reason TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. AI 관련 테이블
-- =============================================

-- AI 원가절감 팁 테이블
CREATE TABLE ai_cost_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_id UUID NOT NULL REFERENCES calculations(id) ON DELETE CASCADE,
    
    -- 핵심 절감 팁 내용
    cost_saving_tip TEXT NOT NULL,
    expected_monthly_saving DECIMAL(10,2) CHECK (expected_monthly_saving >= 0),
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
    
    -- 마진 분석
    margin_analysis TEXT NOT NULL,
    comparison_to_average DECIMAL(5,2), -- 업계 평균 대비 %
    
    -- 실행 가능한 액션
    action_items JSONB DEFAULT '[]',
    
    -- 메타데이터
    ai_model TEXT DEFAULT 'gpt-4o-mini',
    prompt_version TEXT DEFAULT 'v1.0',
    generation_cost_usd DECIMAL(8,5) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
    
    -- 유니크 제약 (동일 calculation에 대해 하나의 활성 팁만)
    CONSTRAINT unique_active_tip UNIQUE (calculation_id)
);

-- AI 사용량 로그 테이블
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- API 호출 정보
    endpoint TEXT NOT NULL,
    request_type TEXT DEFAULT 'cost_saving_tip',
    
    -- 비용 추적
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(8,5) DEFAULT 0.0,
    
    -- 성능 추적
    response_time_ms INTEGER,
    from_cache BOOLEAN DEFAULT FALSE,
    
    -- 에러 추적
    error_type TEXT,
    error_message TEXT,
    
    -- 메타데이터
    user_subscription_status TEXT DEFAULT 'free',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 팁 피드백 테이블
CREATE TABLE ai_tip_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tip_id UUID NOT NULL REFERENCES ai_cost_tips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 피드백 내용
    is_helpful BOOLEAN NOT NULL,
    comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 피드백 방지
    CONSTRAINT unique_user_tip_feedback UNIQUE (tip_id, user_id)
);

-- =============================================
-- 5. 인덱스
-- =============================================

-- 사용자 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_region ON users(region);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_ai_usage ON users(id, ai_calls_this_month, monthly_ai_limit);

-- 계산 테이블 인덱스
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX idx_calculations_menu_category ON calculations(menu_category);
CREATE INDEX idx_calculations_is_template ON calculations(is_template);
CREATE INDEX idx_calculations_user_category ON calculations(user_id, menu_category);

-- 재료 테이블 인덱스
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- 계산 재료 연결 테이블 인덱스
CREATE INDEX idx_calc_ingredients_calculation_id ON calculation_ingredients(calculation_id);
CREATE INDEX idx_calc_ingredients_ingredient_id ON calculation_ingredients(ingredient_id);

-- 가격 제출 테이블 인덱스
CREATE INDEX idx_price_submissions_ingredient_region ON price_submissions(ingredient_id, region);
CREATE INDEX idx_price_submissions_submitted_at ON price_submissions(submitted_at DESC);
CREATE INDEX idx_price_submissions_user_id ON price_submissions(user_id);

-- 구독 테이블 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 결제 테이블 인덱스
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- AI 팁 테이블 인덱스
CREATE INDEX idx_ai_tips_calculation ON ai_cost_tips(calculation_id);
-- expires_at 조건부 인덱스 (NOW() 함수는 volatile이므로 제거)
CREATE INDEX idx_ai_tips_expires ON ai_cost_tips(expires_at);

-- AI 사용량 로그 인덱스
-- DATE_TRUNC 함수를 사용하는 인덱스는 expression index이므로 별도 처리 필요
CREATE INDEX idx_ai_usage_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_cost ON ai_usage_logs(cost_usd) WHERE cost_usd > 0;

-- AI 피드백 인덱스
CREATE INDEX idx_feedback_tip ON ai_tip_feedback(tip_id);
CREATE INDEX idx_feedback_helpful ON ai_tip_feedback(is_helpful);

-- =============================================
-- 6. Auth 연동 트리거
-- =============================================

-- auth.users와 public.users 연동
CREATE OR REPLACE FUNCTION handle_new_cafe_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    cafe_name, 
    region, 
    business_type,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cafe_name', '미등록 카페'),
    COALESCE(NEW.raw_user_meta_data->>'region', '서울특별시'),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'cafe'),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created_cafe_insight
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_cafe_user();

-- =============================================
-- 7. 초기 데이터
-- =============================================

-- 구독 플랜 초기 데이터
INSERT INTO subscription_plans (id, name, price, billing_cycle, ai_monthly_limit, features) VALUES
(
    'free', 
    '무료 플랜', 
    0, 
    'monthly', 
    10, 
    '{
        "calculations": -1, 
        "price_comparison": "limited", 
        "reports": "basic",
        "ai_cost_tips": 10,
        "priority_support": false
    }'::jsonb
),
(
    'premium_monthly', 
    '프리미엄 월간', 
    10000, 
    'monthly', 
    -1, 
    '{
        "calculations": -1, 
        "price_comparison": -1, 
        "reports": "advanced",
        "ai_cost_tips": -1,
        "priority_support": true,
        "export_unlimited": true
    }'::jsonb
);

-- 기본 재료 데이터
INSERT INTO ingredients (name, category, default_unit) VALUES
-- 커피 관련
('원두', 'coffee', 'g'),
('디카페인 원두', 'coffee', 'g'),
('에스프레소 원두', 'coffee', 'g'),
-- 유제품
('우유', 'dairy', 'ml'),
('두유', 'dairy', 'ml'),
('귀리우유', 'dairy', 'ml'),
('아몬드우유', 'dairy', 'ml'),
('휘핑크림', 'dairy', 'ml'),
-- 시럽 및 소스
('바닐라시럽', 'syrup', 'ml'),
('카라멜시럽', 'syrup', 'ml'),
('헤이즐넛시럽', 'syrup', 'ml'),
('초콜릿소스', 'syrup', 'ml'),
-- 파우더
('초콜릿파우더', 'powder', 'g'),
('녹차파우더', 'powder', 'g'),
('계피파우더', 'powder', 'g'),
('설탕', 'powder', 'g'),
-- 포장재
('일회용컵(8oz)', 'packaging', '개'),
('일회용컵(12oz)', 'packaging', '개'),
('일회용컵(16oz)', 'packaging', '개'),
('빨대', 'packaging', '개'),
('뚜껑', 'packaging', '개'),
-- 기타
('얼음', 'other', 'g'),
('물', 'other', 'ml')
ON CONFLICT (name) DO NOTHING;