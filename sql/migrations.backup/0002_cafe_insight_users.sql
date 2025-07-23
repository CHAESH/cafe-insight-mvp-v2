-- 카페인사이트 users 테이블 트리거
-- 기존 profiles 관련 트리거 제거 (있는 경우)
DROP TRIGGER IF EXISTS sign_up_handler ON auth.users;
DROP FUNCTION IF EXISTS handle_sign_up();

-- 카페인사이트 users 테이블 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_cafe_user()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.users에 새 사용자가 생성되면 public.users에도 기본 정보 생성
  INSERT INTO public.users (
    id, 
    email, 
    cafe_name, 
    region, 
    business_type,
    onboarding_completed,
    monthly_ai_limit,
    ai_calls_this_month,
    ai_limit_reset_date
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cafe_name', '미등록 카페'),
    COALESCE(NEW.raw_user_meta_data->>'region', '서울특별시'),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'cafe')::business_type,
    false,
    10, -- 무료 플랜 기본값
    0,
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE
  )
  ON CONFLICT (id) DO NOTHING; -- 중복 방지
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 생성
CREATE TRIGGER on_auth_user_created_cafe_insight
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_cafe_user();

-- 기존 사용자를 위한 users 테이블 동기화 (있는 경우)
-- 이미 auth.users에 있지만 public.users에 없는 경우를 위해
INSERT INTO public.users (id, email, cafe_name, region, business_type)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'cafe_name', '미등록 카페'),
  COALESCE(raw_user_meta_data->>'region', '서울특별시'),
  COALESCE(raw_user_meta_data->>'business_type', 'cafe')::business_type
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;