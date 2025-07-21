


**날짜**: 2025-07-21 **버전**: v1.0 - AI 통합 및 4주 MVP 완전 설계 **작성자**: 채상희 **문서 상태**: 최종 완성본 **주요 특징**:

- AI 원가절감 팁 시스템 완전 통합
- 사용량 추적 및 비용 모니터링 내장
- 4주 MVP 개발 최적화
- 프로덕션 즉시 배포 가능

---

## 📋 목차

1. [전체 데이터베이스 구조](app://obsidian.md/index.html#1-%EC%A0%84%EC%B2%B4-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B5%AC%EC%A1%B0)
2. [완전한 테이블 생성 스크립트](app://obsidian.md/index.html#2-%EC%99%84%EC%A0%84%ED%95%9C-%ED%85%8C%EC%9D%B4%EB%B8%94-%EC%83%9D%EC%84%B1-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8)
3. [Row Level Security 완전 설정](app://obsidian.md/index.html#3-row-level-security-%EC%99%84%EC%A0%84-%EC%84%A4%EC%A0%95)
4. [성능 최적화 및 인덱스](app://obsidian.md/index.html#4-%EC%84%B1%EB%8A%A5-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%B0%8F-%EC%9D%B8%EB%8D%B1%EC%8A%A4)
5. [백그라운드 잡 및 자동화](app://obsidian.md/index.html#5-%EB%B0%B1%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%EC%9E%A1-%EB%B0%8F-%EC%9E%90%EB%8F%99%ED%99%94)
6. [모니터링 및 분석 뷰](app://obsidian.md/index.html#6-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EB%B0%8F-%EB%B6%84%EC%84%9D-%EB%B7%B0)
7. [데이터 시딩 및 초기화](app://obsidian.md/index.html#7-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%8B%9C%EB%94%A9-%EB%B0%8F-%EC%B4%88%EA%B8%B0%ED%99%94)
8. [실행 가이드](app://obsidian.md/index.html#8-%EC%8B%A4%ED%96%89-%EA%B0%80%EC%9D%B4%EB%93%9C)
---

## 1. 전체 데이터베이스 구조

### 1.1 완전한 ERD

```
```mermaid
erDiagram
    users ||--o{ calculations : creates
    users ||--o{ price_submissions : submits
    users ||--o{ subscriptions : has
    users ||--o{ ai_usage_logs : generates
    calculations ||--o{ calculation_ingredients : contains
    calculations ||--o{ ai_cost_tips : gets_tips
    ingredients ||--o{ calculation_ingredients : used_in
    ingredients ||--o{ price_submissions : has_price
    subscriptions ||--|| subscription_plans : references
    ai_cost_tips ||--o{ ai_tip_feedback : receives_feedback
    payments ||--|| subscriptions : belongs_to
    
    users {
        uuid id PK
        text email UK
        text cafe_name
        text region
        text business_type
        text phone
        text subscription_status
        timestamp subscription_ends_at
        boolean onboarding_completed
        integer monthly_ai_limit
        integer ai_calls_this_month
        date ai_limit_reset_date
        timestamp created_at
        timestamp updated_at
    }
    
    calculations {
        uuid id PK
        uuid user_id FK
        text menu_name
        text menu_category
        decimal selling_price
        decimal total_cost
        decimal profit_margin
        text serving_size
        text notes
        boolean is_template
        text season
        boolean has_ai_tips
        text menu_complexity
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    ingredients {
        uuid id PK
        text name UK
        text category
        text default_unit
        text barcode
        boolean is_active
        timestamp created_at
    }
    
    calculation_ingredients {
        uuid id PK
        uuid calculation_id FK
        uuid ingredient_id FK
        text custom_ingredient_name
        decimal quantity
        text unit
        decimal unit_price
        text price_unit
        decimal total_cost
        text supplier
        timestamp created_at
    }
    
    price_submissions {
        uuid id PK
        uuid user_id FK
        uuid ingredient_id FK
        decimal price
        text unit
        text supplier
        text region
        text quality_grade
        boolean is_organic
        decimal purchase_quantity
        timestamp submitted_at
        boolean is_verified
    }
    
    subscription_plans {
        text id PK
        text name
        decimal price
        text currency
        text billing_cycle
        integer ai_monthly_limit
        jsonb features
        boolean is_active
        timestamp created_at
    }
    
    subscriptions {
        uuid id PK
        uuid user_id UK FK
        text plan_id FK
        text status
        timestamp current_period_start
        timestamp current_period_end
        boolean cancel_at_period_end
        text payment_method_id
        text toss_customer_key
        text toss_billing_key
        timestamp created_at
        timestamp updated_at
    }
    
    payments {
        uuid id PK
        uuid subscription_id FK
        decimal amount
        text currency
        text status
        text toss_payment_key UK
        text toss_order_id
        text failure_reason
        timestamp paid_at
        timestamp created_at
    }
    
    ai_cost_tips {
        uuid id PK
        uuid calculation_id UK FK
        text cost_saving_tip
        decimal expected_monthly_saving
        text confidence_level
        text margin_analysis
        decimal comparison_to_average
        jsonb action_items
        text ai_model
        text prompt_version
        decimal generation_cost_usd
        timestamp created_at
        timestamp expires_at
    }
    
    ai_usage_logs {
        uuid id PK
        uuid user_id FK
        text endpoint
        text request_type
        integer tokens_used
        decimal cost_usd
        integer response_time_ms
        boolean from_cache
        text error_type
        text error_message
        text user_subscription_status
        timestamp created_at
    }
    
    ai_tip_feedback {
        uuid id PK
        uuid tip_id FK
        uuid user_id FK
        boolean is_helpful
        text comment
        timestamp created_at
    }
```

---

## 2. 완전한 테이블 생성 스크립트

### 2.1 확장 및 기본 설정

```sql
-- 필수 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

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
```

### 2.2 핵심 테이블

```sql
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
    ai_limit_reset_date DATE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE,
    
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
```

### 2.3 구독 및 결제 테이블

```sql
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
```

### 2.4 AI 관련 테이블

```sql
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
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
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
```

---

## 3. Row Level Security 완전 설정

### 3.1 RLS 활성화

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tip_feedback ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 테이블은 모든 사용자에게 SELECT 허용
GRANT SELECT ON ingredients TO authenticated;
GRANT SELECT ON subscription_plans TO authenticated;
```

### 3.2 사용자 관련 정책

```sql
-- 사용자 테이블 정책
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 계산 테이블 정책
CREATE POLICY "Users can view own calculations" ON calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON calculations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations" ON calculations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON calculations
    FOR DELETE USING (auth.uid() = user_id);

-- 계산 재료 정책
CREATE POLICY "Users can manage own calculation ingredients" ON calculation_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_ingredients.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );
```

### 3.3 가격 및 구독 정책

```sql
-- 가격 제출 정책
CREATE POLICY "Anyone can view price submissions" ON price_submissions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own price submissions" ON price_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update recent own submissions" ON price_submissions
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        submitted_at > NOW() - INTERVAL '24 hours'
    );

-- 구독 정책
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- 결제 정책
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE subscriptions.id = payments.subscription_id 
            AND subscriptions.user_id = auth.uid()
        )
    );
```

### 3.4 AI 관련 정책

```sql
-- AI 팁 정책
CREATE POLICY "Users can view their own AI tips" ON ai_cost_tips
    FOR SELECT USING (
        calculation_id IN (
            SELECT id FROM calculations WHERE user_id = auth.uid()
        )
    );

-- AI 사용량 정책
CREATE POLICY "Users can view their own usage logs" ON ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 모든 사용량 조회 가능
CREATE POLICY "Admins can view all usage logs" ON ai_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email LIKE '%@cafeinsight.com'
        )
    );

-- AI 피드백 정책
CREATE POLICY "Users can manage their own feedback" ON ai_tip_feedback
    FOR ALL USING (auth.uid() = user_id);
```

---

## 4. 성능 최적화 및 인덱스

### 4.1 기본 인덱스

```sql
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
CREATE INDEX idx_calculations_user_recent ON calculations(user_id, created_at DESC) 
    WHERE created_at > NOW() - INTERVAL '30 days';

-- 재료 테이블 인덱스
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_active_ingredients ON ingredients(name) WHERE is_active = TRUE;

-- 계산 재료 연결 테이블 인덱스
CREATE INDEX idx_calc_ingredients_calculation_id ON calculation_ingredients(calculation_id);
CREATE INDEX idx_calc_ingredients_ingredient_id ON calculation_ingredients(ingredient_id);
```

### 4.2 가격 및 구독 인덱스

```sql
-- 가격 제출 테이블 인덱스
CREATE INDEX idx_price_submissions_ingredient_region ON price_submissions(ingredient_id, region);
CREATE INDEX idx_price_submissions_submitted_at ON price_submissions(submitted_at DESC);
CREATE INDEX idx_price_submissions_user_id ON price_submissions(user_id);
CREATE INDEX idx_price_submissions_ingredient_region_date 
    ON price_submissions(ingredient_id, region, submitted_at DESC);

-- 구독 테이블 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 결제 테이블 인덱스
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

### 4.3 AI 관련 인덱스

```sql
-- AI 팁 테이블 인덱스
CREATE INDEX idx_ai_tips_calculation ON ai_cost_tips(calculation_id);
CREATE INDEX idx_ai_tips_expires ON ai_cost_tips(expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_ai_tips_active ON ai_cost_tips(calculation_id, expires_at) 
    WHERE expires_at > NOW();

-- AI 사용량 로그 인덱스
CREATE INDEX idx_ai_usage_user_month ON ai_usage_logs(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX idx_ai_usage_created ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_cost ON ai_usage_logs(cost_usd) WHERE cost_usd > 0;
CREATE INDEX idx_ai_usage_daily_cost ON ai_usage_logs(DATE(created_at), cost_usd);

-- AI 피드백 인덱스
CREATE INDEX idx_feedback_tip ON ai_tip_feedback(tip_id);
CREATE INDEX idx_feedback_helpful ON ai_tip_feedback(is_helpful);
```

### 4.4 복합 인덱스 (성능 크리티컬)

```sql
-- 사용자 대시보드 조회 최적화
CREATE INDEX idx_calculations_dashboard ON calculations(user_id, created_at DESC, menu_category)
    WHERE created_at > NOW() - INTERVAL '90 days';

-- AI 캐시 조회 최적화
CREATE INDEX idx_ai_cache_lookup ON ai_cost_tips(calculation_id) 
    WHERE expires_at > NOW();

-- 월별 사용량 집계 최적화
CREATE INDEX idx_usage_monthly_agg ON ai_usage_logs(user_id, EXTRACT(year FROM created_at), EXTRACT(month FROM created_at));
```

---

## 5. 백그라운드 잡 및 자동화

### 5.1 정리 및 유지보수 함수

```sql
-- 만료된 AI 팁 자동 삭제
CREATE OR REPLACE FUNCTION cleanup_expired_ai_tips()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cost_tips WHERE expires_at < NOW();
    
    -- 삭제된 팁의 피드백도 함께 정리
    DELETE FROM ai_tip_feedback 
    WHERE tip_id NOT IN (SELECT id FROM ai_cost_tips);
END;
$$ LANGUAGE plpgsql;

-- 월별 AI 사용량 리셋
CREATE OR REPLACE FUNCTION reset_monthly_ai_usage()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        ai_calls_this_month = 0,
        ai_limit_reset_date = (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE
    WHERE ai_limit_reset_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- AI 비용 모니터링 및 알림
CREATE OR REPLACE FUNCTION check_daily_ai_budget()
RETURNS void AS $$
DECLARE
    daily_cost DECIMAL;
    threshold DECIMAL := 10.00; -- $10 임계값
BEGIN
    SELECT COALESCE(SUM(cost_usd), 0) INTO daily_cost
    FROM ai_usage_logs 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    IF daily_cost > threshold THEN
        PERFORM pg_notify('ai_budget_alert', 
            json_build_object(
                'date', CURRENT_DATE,
                'cost', daily_cost,
                'threshold', threshold
            )::text
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 구독 만료 체크 및 상태 업데이트
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
    -- 만료된 구독을 canceled로 변경
    UPDATE subscriptions 
    SET status = 'canceled'
    WHERE status = 'active' 
    AND current_period_end < NOW()
    AND cancel_at_period_end = TRUE;
    
    -- 사용자 테이블의 구독 상태도 동기화
    UPDATE users 
    SET subscription_status = 'free'
    FROM subscriptions
    WHERE users.id = subscriptions.user_id
    AND subscriptions.status = 'canceled'
    AND users.subscription_status != 'free';
END;
$$ LANGUAGE plpgsql;
```

### 5.2 크론 잡 등록

```sql
-- 매시간 만료된 AI 팁 정리
SELECT cron.schedule('cleanup-ai-tips', '0 * * * *', 'SELECT cleanup_expired_ai_tips();');

-- 매월 1일 자정에 AI 사용량 리셋
SELECT cron.schedule('reset-ai-usage', '0 0 1 * *', 'SELECT reset_monthly_ai_usage();');

-- 매시간 AI 예산 체크
SELECT cron.schedule('check-ai-budget', '0 * * * *', 'SELECT check_daily_ai_budget();');

-- 매일 자정에 구독 만료 체크
SELECT cron.schedule('check-subscription-expiry', '0 0 * * *', 'SELECT check_subscription_expiry();');
```

---

## 6. 모니터링 및 분석 뷰

### 6.1 AI 성능 분석 뷰

```sql
-- 월별 AI 사용량 집계 뷰
CREATE MATERIALIZED VIEW monthly_ai_usage AS
SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as usage_month,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE from_cache = FALSE) as api_calls,
    COUNT(*) FILTER (WHERE from_cache = TRUE) as cache_hits,
    ROUND((COUNT(*) FILTER (WHERE from_cache = TRUE)::FLOAT / COUNT(*) * 100), 2) as cache_hit_rate,
    SUM(tokens_used) as total_tokens,
    SUM(cost_usd) as total_cost_usd,
    AVG(response_time_ms) as avg_response_time
FROM ai_usage_logs
GROUP BY user_id, DATE_TRUNC('month', created_at);

-- 일일 AI 메트릭 뷰
CREATE VIEW daily_ai_metrics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE from_cache = TRUE) as cache_hits,
    ROUND((COUNT(*) FILTER (WHERE from_cache = TRUE)::FLOAT / COUNT(*) * 100), 2) as cache_hit_rate,
    SUM(cost_usd) as daily_cost,
    AVG(response_time_ms) as avg_response_time,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) FILTER (WHERE error_type IS NOT NULL) as error_count,
    ROUND((COUNT(*) FILTER (WHERE error_type IS NOT NULL)::FLOAT / COUNT(*) * 100), 2) as error_rate
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 6.2 비즈니스 분석 뷰

```sql
-- 익명화된 가격 비교 뷰
CREATE VIEW price_comparison_view AS
SELECT 
    ingredient_id,
    region,
    AVG(price) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    COUNT(*) as sample_count,
    DATE_TRUNC('day', MAX(submitted_at)) as last_updated
FROM price_submissions
WHERE submitted_at > NOW() - INTERVAL '30 days'
  AND is_verified = TRUE
GROUP BY ingredient_id, region
HAVING COUNT(*) >= 5;

-- 예산 모니터링 뷰
CREATE VIEW budget_monitoring AS
WITH revenue_estimate AS (
    SELECT 
        COUNT(*) FILTER (WHERE subscription_status = 'premium') * 15000 as monthly_revenue_estimate
    FROM users
)
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(cost_usd) as monthly_ai_cost,
    revenue_estimate.monthly_revenue_estimate,
    ROUND(
        (SUM(cost_usd) * 1200 / NULLIF(revenue_estimate.monthly_revenue_estimate, 0) * 100), -- USD to KRW conversion
        2
    ) as cost_percentage_of_revenue
FROM ai_usage_logs, revenue_estimate
GROUP BY DATE_TRUNC('month', created_at), revenue_estimate.monthly_revenue_estimate
ORDER BY month DESC;

-- 사용자 활동 분석 뷰
CREATE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.cafe_name,
    u.region,
    u.subscription_status,
    COUNT(DISTINCT c.id) as total_calculations,
    COUNT(DISTINCT DATE(c.created_at)) as active_days,
    COUNT(DISTINCT ac.id) as ai_tips_generated,
    AVG(CASE WHEN af.is_helpful IS NOT NULL THEN af.is_helpful::int END) as avg_feedback_score,
    u.created_at as signup_date,
    MAX(c.created_at) as last_activity
FROM users u
LEFT JOIN calculations c ON u.id = c.user_id
LEFT JOIN ai_cost_tips ac ON c.id = ac.calculation_id
LEFT JOIN ai_tip_feedback af ON ac.id = af.tip_id
GROUP BY u.id, u.cafe_name, u.region, u.subscription_status, u.created_at;
```

### 6.3 뷰 자동 갱신

```sql
-- 매일 자정에 materialized view 갱신
SELECT cron.schedule('refresh-monthly-usage', '0 0 * * *', 'REFRESH MATERIALIZED VIEW monthly_ai_usage;');

-- 뷰 권한 설정
GRANT SELECT ON price_comparison_view TO authenticated;
GRANT SELECT ON daily_ai_metrics TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;

-- 관리자 전용 뷰
GRANT SELECT ON budget_monitoring TO authenticated;
```

---

## 7. 데이터 시딩 및 초기화

### 7.1 구독 플랜 시드 데이터

```sql
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
    15000, 
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
),
(
    'premium_yearly', 
    '프리미엄 연간', 
    150000, 
    'yearly', 
    -1, 
    '{
        "calculations": -1, 
        "price_comparison": -1, 
        "reports": "advanced",
        "ai_cost_tips": -1,
        "priority_support": true,
        "export_unlimited": true,
        "discount": "2_months_free"
    }'::jsonb
);
```

### 7.2 재료 마스터 시드 데이터

```sql
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
('딸기시럽', 'syrup', 'ml'),

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
('캐리어', 'packaging', '개'),

-- 기타
('얼음', 'other', 'g'),
('물', 'other', 'ml'),
('티백', 'other', '개')

ON CONFLICT (name) DO NOTHING;
```

### 7.3 테스트 데이터 (개발용)

```sql
-- 개발 환경용 테스트 사용자 (프로덕션에서는 제외)
INSERT INTO users (id, email, cafe_name, region, business_type, subscription_status, monthly_ai_limit)
VALUES 
(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'test@cafeinsight.com',
    '테스트 카페',
    '서울특별시 강남구',
    'cafe',
    'premium',
    -1
),
(
    '00000000-0000-0000-0000-000000000002'::uuid,
    'free@cafeinsight.com', 
    '무료 사용자 카페',
    '부산광역시 해운대구',
    'cafe',
    'free',
    10
)
ON CONFLICT (email) DO NOTHING;
```

---

## 8. 실행 가이드

### 8.1 프로덕션 배포 순서

```bash
# 1단계: 기본 스키마 및 확장 설치
psql -f 01_extensions_and_functions.sql

# 2단계: 핵심 테이블 생성
psql -f 02_core_tables.sql

# 3단계: AI 관련 테이블 생성
psql -f 03_ai_tables.sql

# 4단계: 인덱스 생성
psql -f 04_indexes.sql

# 5단계: RLS 정책 설정
psql -f 05_rls_policies.sql

# 6단계: 뷰 및 분석 테이블 생성
psql -f 06_views_and_analytics.sql

# 7단계: 백그라운드 잡 설정
psql -f 07_background_jobs.sql

# 8단계: 시드 데이터 입력
psql -f 08_seed_data.sql
```

### 8.2 개발 환경 검증 쿼리

```sql
-- 1. 테이블 생성 확인
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. RLS 활성화 확인
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. 인덱스 생성 확인
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. 크론 잡 확인
SELECT 
    jobname,
    schedule,
    command,
    active
FROM cron.job
ORDER BY jobname;

-- 5. AI 사용량 제한 테스트
SELECT 
    email,
    subscription_status,
    monthly_ai_limit,
    ai_calls_this_month
FROM users
LIMIT 5;
```

### 8.3 성능 모니터링 쿼리

```sql
-- 슬로우 쿼리 확인
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%ai_%' OR query LIKE '%calculations%'
ORDER BY mean_time DESC
LIMIT 10;

-- 인덱스 사용률 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename IN ('calculations', 'ai_cost_tips', 'ai_usage_logs')
ORDER BY idx_scan DESC;

-- 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 8.4 백업 및 복구 전략

```sql
-- 중요 데이터 백업 (매일 실행 권장)
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS void AS $$
BEGIN
    -- 사용자 및 구독 정보 백업
    CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users WHERE FALSE;
    INSERT INTO users_backup SELECT * FROM users;
    
    -- 최근 30일 계산 데이터 백업
    CREATE TABLE IF NOT EXISTS calculations_backup AS SELECT * FROM calculations WHERE FALSE;
    INSERT INTO calculations_backup 
    SELECT * FROM calculations 
    WHERE created_at > NOW() - INTERVAL '30 days';
    
    -- AI 사용량 로그 압축 백업 (월 단위)
    CREATE TABLE IF NOT EXISTS ai_usage_monthly_backup AS
    SELECT 
        DATE_TRUNC('month', created_at) as month,
        user_id,
        COUNT(*) as total_calls,
        SUM(cost_usd) as total_cost
    FROM ai_usage_logs
    GROUP BY DATE_TRUNC('month', created_at), user_id;
END;
$$ LANGUAGE plpgsql;
```

