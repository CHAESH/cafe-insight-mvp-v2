name: "카페인사이트 MVP v1.0 - AI 기반 카페 원가계산 & 스마트 인사이트 SaaS"
description: |

## Purpose
React Router v7 + Supabase + Vercel AI SDK를 사용하여 카페 사장님들을 위한 AI 기반 원가계산 및 인사이트 제공 플랫폼 구현. "5분 계산, 평생 절약" 컨셉으로 월평균 50만원 이상 절감 가능한 실용적 솔루션 제공.

## Core Principles
1. **모바일 우선**: 카페 현장에서 스마트폰으로 주로 사용
2. **AI-First**: AI 인사이트가 핵심 차별화 요소
3. **PWA 지원**: 앱 같은 경험 제공 (오프라인 지원)
4. **보안 우선**: Supabase RLS 정책 신뢰
5. **한국어 우선**: 타겟이 한국 카페 사장님

---

## Goal
기술 친화적인 20-40대 카페 사장님들이 5분 안에 메뉴별 원가를 계산하고, AI 기반 절감 팁을 받아 월평균 50만원 이상 절약할 수 있는 PWA 웹 플랫폼을 4주 안에 MVP로 구현.

## Why
- 기존 원가계산 앱들은 단순 계산기 수준으로 차별화 부족
- AI 인사이트를 통한 구체적 절약 방안 제시로 실질적 가치 제공
- 카페 사장님들의 수익성 개선에 직접적 기여
- 월 10,000원 구독료로 수익화 가능한 비즈니스 모델

## What
React Router v7 기반 PWA로 원가계산 엔진 + AI 절감 팁 생성 시스템 구축

### Success Criteria
- [ ] 메뉴별 원가 계산 및 마진율 표시 (실시간)
- [ ] GPT-4o-mini 기반 AI 절감 팁 생성 (1-5초 내 응답)
- [ ] 사용자별 계산 데이터 저장 및 조회
- [ ] 토스페이먼츠 정기결제 연동 (월 10,000원)
- [ ] 모바일 반응형 UI (PWA 매니페스트 포함)
- [ ] Free 플랜 월 10회, Premium 무제한 AI 사용
- [ ] Lighthouse 점수 90+ 달성

## All Needed Context

### Documentation & References
```yaml
- docfile: CLAUDE.md
  why: 프로젝트 전체 개발 가이드라인 및 AI 기능 구현 패턴

- docfile: INITIAL.md
  why: 카페인사이트 기능 요구사항 및 사용자 플로우

- docfile: docs/PRD.md
  why: 4주 MVP 개발 계획 및 AI-First 제품 전략

- docfile: docs/DB 스키마.md
  why: 완전한 ERD 및 Supabase RLS 정책

- file: examples/ai-integration-example.tsx
  why: Vercel AI SDK 통합 패턴 및 캐싱 구현

- file: examples/error-handling-example.tsx
  why: React Router v7 에러 처리 및 폼 검증 패턴

- file: examples/drizzle-query-example.ts
  why: Drizzle ORM 쿼리 패턴 및 트랜잭션 처리

- url: https://reactrouter.com/en/main
  why: React Router v7 loader/action 패턴 및 데이터 흐름

- url: https://sdk.vercel.ai/docs
  why: AI SDK generateText 사용법 및 스트리밍

- url: https://supabase.com/docs/guides/auth
  why: 이메일/비밀번호 인증 및 RLS 설정

- url: https://docs.tosspayments.com/reference
  why: 정기결제 API 연동 방법
```

### Current Codebase tree
```bash
cafe-insight-mvp-v2/
├── app/
│   ├── core/
│   │   ├── components/ui/          # shadcn/ui 컴포넌트들
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── guards.server.ts    # requireUser 인증 가드
│   │   │   └── utils.ts
│   │   └── db/
│   │       └── schema.ts           # Drizzle ORM 스키마 (미구현)
│   ├── features/                   # 기능별 모듈 (미구현)
│   ├── routes/                     # React Router v7 라우트 (미구현)
│   ├── styles/
│   │   └── tailwind.css
│   └── root.tsx
├── public/
├── docs/
│   ├── PRD.md
│   └── DB 스키마.md
├── examples/                       # 구현 패턴 예시들
└── package.json                    # React Router v7 설정됨
```

### Desired Codebase tree with files to be added and responsibility
```bash
cafe-insight-mvp-v2/
├── app/
│   ├── core/
│   │   ├── components/
│   │   │   ├── ui/                 # 기존 shadcn/ui
│   │   │   └── layouts/
│   │   │       ├── header.tsx      # 네비게이션 헤더
│   │   │       └── dashboard-layout.tsx # 대시보드 레이아웃
│   │   ├── hooks/
│   │   │   └── use-calculations.ts # 계산 데이터 관리
│   │   ├── lib/
│   │   │   ├── ai-client.ts        # Vercel AI SDK 클라이언트
│   │   │   ├── guards.server.ts    # 인증 가드
│   │   │   └── calculations.ts     # 원가계산 로직
│   │   └── db/
│   │       ├── schema.ts           # Drizzle 스키마 (10개 테이블)
│   │       └── drizzle-client.server.ts # DB 클라이언트
│   ├── features/
│   │   ├── auth/
│   │   │   └── components/
│   │   │       ├── login-form.tsx  # 로그인 폼
│   │   │       └── signup-form.tsx # 회원가입 폼
│   │   ├── calculations/
│   │   │   ├── components/
│   │   │   │   ├── calculation-form.tsx # 계산 입력 폼
│   │   │   │   ├── calculation-result.tsx # 결과 표시
│   │   │   │   └── ai-tips-panel.tsx # AI 팁 패널
│   │   │   └── hooks/
│   │   │       └── use-ai-tips.ts  # AI 팁 관리
│   │   ├── dashboard/
│   │   │   └── components/
│   │   │       ├── calculation-list.tsx # 계산 목록
│   │   │       └── stats-cards.tsx # 통계 카드들
│   │   └── payments/
│   │       └── components/
│   │           └── subscription-form.tsx # 결제 폼
│   ├── routes/
│   │   ├── _index.tsx              # 랜딩 페이지
│   │   ├── auth/
│   │   │   ├── login.tsx           # 로그인 라우트
│   │   │   └── signup.tsx          # 회원가입 라우트
│   │   ├── dashboard.tsx           # 대시보드
│   │   ├── calculations/
│   │   │   ├── _index.tsx          # 계산 목록
│   │   │   ├── new.tsx             # 새 계산
│   │   │   └── $id.tsx             # 계산 상세/수정
│   │   ├── api/
│   │   │   ├── ai-tips.tsx         # AI 팁 생성 API
│   │   │   └── payments.tsx        # 결제 API
│   │   └── subscription.tsx        # 구독 관리
│   └── root.tsx                    # PWA 매니페스트 연결
├── public/
│   ├── manifest.json               # PWA 매니페스트
│   ├── sw.js                       # Service Worker
│   └── icons/                      # PWA 아이콘들
└── e2e/
    ├── auth.spec.ts                # 인증 E2E 테스트
    ├── calculations.spec.ts        # 계산 E2E 테스트
    └── ai-tips.spec.ts             # AI 기능 E2E 테스트
```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: React Router v7 requires loader/action for data fetching
// Example: 모든 서버 데이터는 loader에서, 변경은 action에서 처리

// CRITICAL: Supabase RLS는 user_id 기반으로 자동 필터링
// Example: await requireUser(request) 후 user.id 사용 필수

// CRITICAL: Vercel AI SDK는 Edge Runtime에서만 사용
// Example: generateText는 api 라우트에서만 호출 가능

// CRITICAL: AI 사용량 제한 구현 필수
// Example: monthly_ai_limit 체크 후 AI API 호출

// GOTCHA: PWA manifest.json은 public/ 폴더에 배치
// Example: start_url과 scope 설정 중요

// GOTCHA: TailwindCSS 모바일 우선으로 스타일링
// Example: sm: md: lg: 순서로 반응형 구현
```

## Implementation Blueprint

### Data models and structure

Supabase 데이터베이스 스키마 구현 (docs/DB 스키마.md 기반)
```typescript
// 주요 테이블들:
// - users (사용자 + AI 사용량 추적)
// - calculations (원가 계산 데이터)  
// - calculation_ingredients (계산-재료 연결)
// - ingredients (재료 마스터)
// - ai_cost_tips (AI 팁 캐싱)
// - subscriptions (구독 관리)
// - payments (결제 기록)

// Drizzle ORM 스키마 정의
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  monthly_ai_limit: integer('monthly_ai_limit').default(10),
  ai_calls_this_month: integer('ai_calls_this_month').default(0),
  // ... 기타 필드들
});
```

### List of tasks to be completed to fulfill the PRP in order

```yaml
Task 1 - Database Schema Setup:
CREATE app/core/db/schema.ts:
  - IMPLEMENT 10개 테이블 스키마 (docs/DB 스키마.md 기반)
  - ADD RLS 정책 SQL 주석 포함
  - EXPORT all table schemas

CREATE app/core/db/drizzle-client.server.ts:
  - SETUP Supabase 연결
  - IMPLEMENT createDrizzleClient 함수
  - ADD connection pooling

Task 2 - Authentication System:
CREATE app/core/lib/guards.server.ts:
  - IMPLEMENT requireUser 함수
  - ADD session validation
  - HANDLE authentication errors

CREATE app/features/auth/components/:
  - BUILD login-form.tsx (email/password)
  - BUILD signup-form.tsx
  - USE existing UI components
  - ADD form validation with Zod

CREATE app/routes/auth/:
  - IMPLEMENT login.tsx with loader/action
  - IMPLEMENT signup.tsx with loader/action
  - HANDLE Supabase auth integration

Task 3 - Core Calculation Engine:
CREATE app/core/lib/calculations.ts:
  - IMPLEMENT calculateTotalCost function
  - IMPLEMENT calculateProfitMargin function
  - ADD validation logic

CREATE app/features/calculations/components/calculation-form.tsx:
  - BUILD 재료 입력 폼 (동적 추가/삭제)
  - ADD 실시간 계산 표시
  - IMPLEMENT mobile-friendly UI

CREATE app/features/calculations/components/calculation-result.tsx:
  - DISPLAY 원가, 마진율, 수익
  - ADD 시각적 차트 (간단한 것)
  - SHOW 계산 내역

Task 4 - AI Integration:
CREATE app/core/lib/ai-client.ts:
  - SETUP Vercel AI SDK client
  - IMPLEMENT generateCostSavingTips function
  - ADD caching logic (24시간)
  - HANDLE rate limiting

CREATE app/features/calculations/components/ai-tips-panel.tsx:
  - BUILD AI 팁 표시 UI
  - ADD loading states
  - IMPLEMENT fallback messages
  - SHOW 예상 절감액

CREATE app/routes/api/ai-tips.tsx:
  - IMPLEMENT AI 팁 생성 action
  - ADD usage validation
  - HANDLE API errors gracefully

Task 5 - Dashboard & Data Management:
CREATE app/features/dashboard/components/:
  - BUILD calculation-list.tsx (최근 계산들)
  - BUILD stats-cards.tsx (월별 통계)
  - ADD search/filter functionality

CREATE app/routes/calculations/:
  - IMPLEMENT _index.tsx (목록 페이지)
  - IMPLEMENT new.tsx (새 계산)
  - IMPLEMENT $id.tsx (상세/수정)
  - ADD CRUD operations

Task 6 - Payment Integration:
CREATE app/features/payments/components/subscription-form.tsx:
  - INTEGRATE 토스페이먼츠 API
  - HANDLE 정기결제 플로우
  - ADD 결제 상태 관리

CREATE app/routes/api/payments.tsx:
  - IMPLEMENT 결제 webhook 처리
  - UPDATE 구독 상태
  - HANDLE 결제 실패

Task 7 - PWA Configuration:
CREATE public/manifest.json:
  - SET 앱 메타데이터
  - ADD 아이콘 설정
  - CONFIGURE start_url, scope

CREATE public/sw.js:
  - IMPLEMENT 기본 캐싱 전략
  - ADD 오프라인 계산 지원
  - HANDLE 네트워크 우선 패턴

UPDATE app/root.tsx:
  - ADD PWA manifest 링크
  - REGISTER service worker
  - ADD mobile viewport meta

Task 8 - E2E Testing:
CREATE e2e/auth.spec.ts:
  - TEST 회원가입/로그인 플로우
  - VERIFY 인증 상태 지속

CREATE e2e/calculations.spec.ts:
  - TEST 계산 생성/수정/삭제
  - VERIFY 실시간 계산 결과

CREATE e2e/ai-tips.spec.ts:
  - TEST AI 팁 생성
  - VERIFY 사용량 제한
  - CHECK 캐싱 동작
```

### Per task pseudocode as needed

```typescript
// Task 4 - AI Integration 핵심 로직
async function generateCostSavingTips(calculation: Calculation, userId: string) {
  // PATTERN: 캐시 확인 먼저
  const cached = await getCachedTip(calculation.id);
  if (cached && !isExpired(cached)) {
    return cached;
  }

  // PATTERN: 사용량 체크
  const user = await getUser(userId);
  if (user.ai_calls_this_month >= user.monthly_ai_limit) {
    throw new Error("AI 사용 한도 초과");
  }

  // CRITICAL: Edge Runtime에서 AI API 호출
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: createPrompt(calculation),
    maxTokens: 200,
  });

  // PATTERN: 결과 캐싱 및 사용량 업데이트
  await Promise.all([
    saveTipToCache(calculation.id, text),
    incrementAIUsage(userId)
  ]);

  return { tips: text, generated: true };
}

// Task 3 - 실시간 계산 로직  
function calculateInRealTime(ingredients: Ingredient[]) {
  // PATTERN: useEffect로 의존성 감지
  useEffect(() => {
    const totalCost = ingredients.reduce(
      (sum, ing) => sum + (ing.quantity * ing.unit_price), 
      0
    );
    const margin = ((sellingPrice - totalCost) / sellingPrice) * 100;
    
    setCalculationResult({ totalCost, margin });
  }, [ingredients, sellingPrice]);
}
```

### Integration Points
```yaml
DATABASE:
  - migration: "Supabase 프로젝트에 schema.sql 실행"
  - RLS: "모든 테이블에 user_id 기반 정책 적용"
  
CONFIG:
  - add to: .env
  - variables: "OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, TOSS_CLIENT_KEY"
  
ROUTES:
  - add to: app/routes/
  - pattern: "loader/action 기반 서버사이드 데이터 처리"
  
PWA:
  - add to: public/manifest.json
  - register: "root.tsx에서 service worker 등록"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# React Router v7 컴파일 확인
npm run typecheck

# TailwindCSS 빌드 확인  
npm run build

# Expected: 컴파일 에러 없음
```

### Level 2: Unit Tests (기능별 테스트)
```typescript
// TEST 원가계산 로직
describe('calculations', () => {
  test('총 원가 계산이 정확한가', () => {
    const ingredients = [
      { quantity: 10, unit_price: 100 },
      { quantity: 5, unit_price: 50 }
    ];
    expect(calculateTotalCost(ingredients)).toBe(1250);
  });

  test('마진율 계산이 정확한가', () => {
    expect(calculateProfitMargin(2000, 800)).toBe(60);
  });
});

// TEST AI 기능
describe('AI integration', () => {
  test('사용량 한도 체크', async () => {
    const user = { ai_calls_this_month: 10, monthly_ai_limit: 10 };
    await expect(generateTips(calculation, user)).rejects.toThrow('한도 초과');
  });
});
```

```bash
# 테스트 실행
npm run test

# E2E 테스트 
npm run test:e2e
```

### Level 3: Integration Test
```bash
# 개발 서버 실행
npm run dev

# 회원가입 테스트
curl -X POST http://localhost:5173/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@cafe.com", "password": "password123"}'

# 계산 생성 테스트  
curl -X POST http://localhost:5173/calculations \
  -H "Content-Type: application/json" \
  -d '{"menu_name": "아메리카노", "selling_price": 4000, "ingredients": [...]}'

# AI 팁 생성 테스트
curl -X POST http://localhost:5173/api/ai-tips \
  -d '{"calculation_id": "calc-123"}'

# Expected: 각각 성공 응답 및 정상 동작
```

## Final validation Checklist
- [ ] 모든 E2E 테스트 통과: `npm run test:e2e`
- [ ] TypeScript 컴파일 성공: `npm run typecheck`  
- [ ] 모바일 반응형 확인: 개발자 도구 모바일 모드
- [ ] PWA 동작 확인: Chrome DevTools > Application > Service Workers
- [ ] Lighthouse 점수 90+: Performance, Accessibility, Best Practices, SEO
- [ ] AI 기능 실제 테스트: OpenAI API 연동 확인
- [ ] 결제 플로우 테스트: 토스페이먼츠 샌드박스
- [ ] 사용량 제한 동작: Free 플랜 10회 제한 확인
- [ ] 오프라인 모드 테스트: 네트워크 차단 후 기본 기능 동작
- [ ] 한국어 현지화: 모든 메시지가 한국어로 표시

---

## Anti-Patterns to Avoid
- ❌ 클라이언트에서 민감한 데이터 처리 (모든 로직은 loader/action에서)
- ❌ AI API를 클라이언트에서 직접 호출
- ❌ RLS 없이 직접 데이터베이스 쿼리
- ❌ 하드코딩된 API 키나 설정값
- ❌ 인라인 스타일 사용 (TailwindCSS 클래스만 사용)
- ❌ console.log를 프로덕션에 남기기
- ❌ any 타입 사용 (TypeScript 엄격 모드)
- ❌ 테스트 없이 AI 기능 배포
- ❌ 모바일 최적화 없이 데스크톱 우선 개발