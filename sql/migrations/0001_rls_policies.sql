-- Row Level Security (RLS) 정책 설정
-- 모든 테이블에 대해 RLS 활성화 및 정책 설정

-- =============================================
-- 1. RLS 활성화
-- =============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tip_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. Users 테이블 정책
-- =============================================

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" 
    ON users FOR SELECT 
    USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" 
    ON users FOR UPDATE 
    USING (auth.uid() = id);

-- 새 사용자는 회원가입 시 생성됨 (트리거를 통해)
-- INSERT는 service role만 가능

-- =============================================
-- 3. Calculations 테이블 정책
-- =============================================

-- 사용자는 자신의 계산만 조회 가능
CREATE POLICY "Users can view own calculations" 
    ON calculations FOR SELECT 
    USING (auth.uid() = user_id);

-- 사용자는 자신의 계산만 생성 가능
CREATE POLICY "Users can create own calculations" 
    ON calculations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 계산만 수정 가능
CREATE POLICY "Users can update own calculations" 
    ON calculations FOR UPDATE 
    USING (auth.uid() = user_id);

-- 사용자는 자신의 계산만 삭제 가능
CREATE POLICY "Users can delete own calculations" 
    ON calculations FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- 4. Ingredients 테이블 정책
-- =============================================

-- 모든 인증된 사용자가 재료 목록 조회 가능
CREATE POLICY "Anyone can view ingredients" 
    ON ingredients FOR SELECT 
    USING (true);

-- 재료 추가/수정/삭제는 관리자만 가능 (현재는 제한)

-- =============================================
-- 5. Calculation_ingredients 테이블 정책
-- =============================================

-- 사용자는 자신의 계산에 속한 재료만 조회 가능
CREATE POLICY "Users can view own calculation ingredients" 
    ON calculation_ingredients FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_ingredients.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 계산에만 재료 추가 가능
CREATE POLICY "Users can add ingredients to own calculations" 
    ON calculation_ingredients FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_ingredients.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 계산의 재료만 수정 가능
CREATE POLICY "Users can update own calculation ingredients" 
    ON calculation_ingredients FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_ingredients.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 계산의 재료만 삭제 가능
CREATE POLICY "Users can delete own calculation ingredients" 
    ON calculation_ingredients FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_ingredients.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- =============================================
-- 6. Price_submissions 테이블 정책
-- =============================================

-- 사용자는 자신이 제출한 가격만 조회 가능
CREATE POLICY "Users can view own price submissions" 
    ON price_submissions FOR SELECT 
    USING (auth.uid() = user_id);

-- 사용자는 가격 제출 가능
CREATE POLICY "Users can submit prices" 
    ON price_submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신이 제출한 가격만 수정 가능
CREATE POLICY "Users can update own price submissions" 
    ON price_submissions FOR UPDATE 
    USING (auth.uid() = user_id);

-- =============================================
-- 7. Subscription_plans 테이블 정책
-- =============================================

-- 모든 사용자가 구독 플랜 조회 가능
CREATE POLICY "Anyone can view subscription plans" 
    ON subscription_plans FOR SELECT 
    USING (is_active = true);

-- =============================================
-- 8. Subscriptions 테이블 정책
-- =============================================

-- 사용자는 자신의 구독만 조회 가능
CREATE POLICY "Users can view own subscription" 
    ON subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

-- 구독 생성/수정/삭제는 백엔드 서비스를 통해서만 가능

-- =============================================
-- 9. Payments 테이블 정책
-- =============================================

-- 사용자는 자신의 구독에 대한 결제만 조회 가능
CREATE POLICY "Users can view own payments" 
    ON payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE subscriptions.id = payments.subscription_id 
            AND subscriptions.user_id = auth.uid()
        )
    );

-- =============================================
-- 10. AI_cost_tips 테이블 정책
-- =============================================

-- 사용자는 자신의 계산에 대한 AI 팁만 조회 가능
CREATE POLICY "Users can view own AI tips" 
    ON ai_cost_tips FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = ai_cost_tips.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- AI 팁 생성은 백엔드 서비스를 통해서만 가능

-- =============================================
-- 11. AI_usage_logs 테이블 정책
-- =============================================

-- 사용자는 자신의 AI 사용 로그만 조회 가능
CREATE POLICY "Users can view own AI usage logs" 
    ON ai_usage_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- AI 사용 로그는 백엔드 서비스를 통해서만 생성

-- =============================================
-- 12. AI_tip_feedback 테이블 정책
-- =============================================

-- 사용자는 자신이 남긴 피드백만 조회 가능
CREATE POLICY "Users can view own feedback" 
    ON ai_tip_feedback FOR SELECT 
    USING (auth.uid() = user_id);

-- 사용자는 피드백 생성 가능
CREATE POLICY "Users can create feedback" 
    ON ai_tip_feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 피드백만 수정 가능
CREATE POLICY "Users can update own feedback" 
    ON ai_tip_feedback FOR UPDATE 
    USING (auth.uid() = user_id);

-- =============================================
-- 13. Service Role 권한 부여
-- =============================================

-- Service role에 모든 테이블 권한 부여 (백엔드 작업용)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Authenticated role에 필요한 권한만 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;