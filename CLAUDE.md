# 카페인사이트 (CafeInsight) - AI 코딩 어시스턴트 개발 가이드

## 🎯 프로젝트 미션
**"5분 계산, 평생 절약 - AI가 찾아주는 숨은 수익 기회"**

카페인사이트는 AI 기반 카페 원가계산 & 스마트 인사이트 SaaS입니다. 
기술 친화적인 20-40대 카페 사장님들이 월평균 50만원 이상 절감할 수 있도록 돕습니다.

## 🤖 나의 역할 및 핵심 지침
저의 최우선 목표는 `docs/PRD.md`에 명시된 대로 '카페인사이트' MVP를 4주 안에 성공적으로 개발하는 것입니다. 이를 위해 다음 원칙을 반드시 준수합니다.

1.  **문서 우선주의**: 이 `CLAUDE.md` 문서를 포함한 모든 `docs/` 폴더의 내용을 최우선으로 따릅니다.
2.  **질문 우선주의**: 불확실한 부분이 있다면, 절대 추측하지 않고 반드시 당신에게 질문하여 확인받겠습니다.
3.  **보안 최우선**: 모든 데이터베이스 상호작용에서 Supabase의 Row Level Security (RLS) 정책을 신뢰하고, 이를 위반하는 코드를 작성하지 않습니다.
4.  **일관성 유지**: 프로젝트의 기존 코드 스타일, 네이밍 컨벤션, 아키텍처를 철저히 따릅니다.
5.  **한국어 사용**: 당신과의 모든 소통과 코드 내 주석은 한국어를 기본으로 사용합니다.

## 📋 핵심 컨텍스트 문서
**개발 전 필수 참고 문서들:**
- `docs/PRD.md` - 제품 요구사항 명세서 v1.0 (4주 MVP 계획)
- `docs/DB 스키마.md` - 완전한 ERD 및 데이터베이스 설계
- `INITIAL.md` - 카페인사이트 기능 요청 템플릿 (완성본)
- `examples/` - 코드 작성 패턴 및 예시

## 🛠️ 기술 스택 (AI-First 아키텍처)
- **Frontend**: React Router v7 + Vite + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + CRON)
- **AI 통합**: Vercel AI SDK + GPT-4o-mini (OpenAI API)
- **결제**: 토스페이먼츠 정기결제 API
- **이메일**: Resend (영수증, 알림)
- **배포**: Vercel Edge Runtime
- **모니터링**: Sentry (에러 추적)
- **테스팅**: Playwright (E2E)

## 📁 카페인사이트 프로젝트 구조
```
cafe-insight-mvp-v2/
├── app/
│   ├── core/                      # 핵심 공통 모듈
│   │   ├── components/            # 공통 UI 컴포넌트
│   │   │   ├── ui/               # shadcn/ui 기반 컴포넌트
│   │   │   └── layouts/          # 레이아웃 컴포넌트
│   │   ├── hooks/                # 공통 커스텀 훅
│   │   ├── lib/                  # 유틸리티 함수
│   │   │   ├── ai-client.ts      # Vercel AI SDK 클라이언트
│   │   │   ├── guards.server.ts  # 인증 가드
│   │   │   └── utils.ts          # 헬퍼 함수
│   │   └── db/                   # 데이터베이스
│   │       ├── schema.ts         # Drizzle ORM 스키마
│   │       └── drizzle-client.server.ts
│   ├── features/                 # 기능별 모듈
│   │   ├── auth/                 # 인증 기능
│   │   ├── calculations/         # 원가계산 기능
│   │   ├── insights/             # AI 인사이트 기능
│   │   ├── payments/             # 결제 기능
│   │   └── dashboard/            # 대시보드
│   ├── routes/                   # React Router v7 라우트
│   │   ├── _index.tsx           # 랜딩 페이지
│   │   ├── dashboard.tsx        # 대시보드
│   │   └── calculations/        # 계산 관련 라우트
│   ├── styles/                   # 스타일 파일
│   │   └── tailwind.css         # Tailwind 설정
│   └── root.tsx                 # 앱 루트 컴포넌트
├── public/                       # 정적 파일
│   ├── manifest.json            # PWA 매니페스트
│   └── sw.js                    # Service Worker
├── docs/                        # 프로젝트 문서
│   ├── PRD.md                   # 제품 요구사항
│   └── DB 스키마.md             # 데이터베이스 설계
├── examples/                    # 코드 예시
├── e2e/                        # E2E 테스트
└── package.json                # 프로젝트 설정
```

## 📖 자주 묻는 작업별 수행 메뉴얼

### "새로운 UI 컴포넌트 추가" 요청 시:
1.  **위치 선정**:
    -   **공용 컴포넌트**: `app/core/components/ui/` 에 생성합니다.
    -   **특정 기능 전용**: `app/features/[기능명]/components/` 에 생성합니다.
2.  **스타일 적용**:
    -   `shadcn/ui`와 `TailwindCSS`를 사용합니다.
    -   `app/core/components/ui/button.tsx` 와 같은 기존 컴포넌트의 스타일과 구조를 참고하여 일관성을 유지합니다.
3.  **데이터 로직 분리**:
    -   컴포넌트가 데이터를 필요로 할 경우, `use-[기능명]` 형태의 커스텀 훅을 `app/core/hooks/` 또는 `app/features/[기능명]/hooks/` 에 만들어 로직을 분리합니다.

### "새로운 API 엔드포인트 추가" 요청 시:
1.  **위치 선정**:
    -   React Router v7의 `action` (데이터 변경) 또는 `loader` (데이터 조회) 함수를 사용합니다.
    -   해당 기능의 스크린 파일 (`app/features/[기능명]/screens/[스크린명].tsx`) 내에 직접 작성합니다.
2.  **사용자 인증**:
    -   모든 `action`과 `loader` 함수의 시작 부분에서 `await requireUser(request)`를 호출하여 사용자가 로그인했는지 반드시 확인합니다. (`app/core/lib/guards.server.ts` 참고)
3.  **데이터베이스 접근**:
    -   `createDrizzleClient(request)`를 사용하여 Drizzle 클라이언트를 생성합니다.
    -   `docs/DB 스키마.md`에 정의된 RLS 정책을 신뢰하고, 해당 정책에 맞게 쿼리를 작성합니다.

### "AI 기능 구현" 요청 시:
1.  **API 호출**: Vercel AI SDK (`generateText`)를 사용합니다. (`app/core/lib/ai-client.ts` 참고)
2.  **캐싱 구현**:
    -   `ai_cost_tips` 테이블을 사용하여 24시간 캐시를 구현합니다.
    -   AI API를 호출하기 전에, `calculation_id`를 기준으로 캐시된 데이터가 있는지 항상 먼저 확인합니다.
3.  **실패 대응 (Fallback)**:
    -   `try...catch` 블록을 사용하여 AI API 호출 실패에 반드시 대비합니다.
    -   실패 시, 사용자에게 보여줄 수 있는 안전한 기본 메시지(예: "현재 AI 분석이 어렵습니다.")를 반환합니다. 아래의 코드 패턴을 참고합니다.

## 💻 카페인사이트 코딩 컨벤션 (상세)

### ✅ DB 스키마 기반 타입 정의
```typescript
// docs/DB 스키마.md 의 'calculations' 테이블과 일치하는 타입
interface MenuCalculation {
  id: string; // uuid
  user_id: string; // uuid
  menu_name: string;
  menu_category: 'coffee' | 'beverage' | 'dessert' | 'food' | 'other';
  selling_price: number;
  total_cost: number;
  profit_margin: number;
  created_at: string; // timestamp
}

// 'calculation_ingredients' 테이블과 일치하는 타입
interface CalculationIngredient {
  ingredient_id?: string; // uuid
  custom_ingredient_name?: string;
  quantity: number;
  unit: string;
  unit_price: number;
}
```

### 🤖 AI 기능 구현 패턴 (상세)
```typescript
// AI 팁 생성 - 캐싱, 사용량 체크, 폴백 포함
import { db } from '~/core/db/drizzle-client.server';
import { aiCostTips, users } from '~/core/db/schema';
import { and, eq, gte } from 'drizzle-orm';

export async function getOrCreateCostSavingTips(calculation: MenuCalculation) {
  // 1. 캐시 확인 (24시간 유효)
  const cached = await db.query.aiCostTips.findFirst({
    where: and(
      eq(aiCostTips.calculation_id, calculation.id),
      gte(aiCostTips.expires_at, new Date())
    )
  });
  if (cached) {
    return { tips: cached.cost_saving_tip, generated: false, fromCache: true };
  }

  // 2. 사용자 AI 사용량 체크 (구현 필요)
  const user = await db.query.users.findFirst({ where: eq(users.id, calculation.user_id) });
  if (user?.ai_calls_this_month >= user?.monthly_ai_limit) {
    throw new Error("AI 사용 한도를 초과했습니다.");
  }

  try {
    // 3. AI API 호출 (Vercel AI SDK)
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: createCostSavingPrompt(calculation), // PRD 기반 프롬프트
      maxTokens: 200
    });
    
    // 4. 결과 캐싱 및 사용량 업데이트
    await db.insert(aiCostTips).values({
      calculation_id: calculation.id,
      cost_saving_tip: text,
      // ... 기타 ai_cost_tips 필드
    });
    await db.update(users).set({ ai_calls_this_month: (user?.ai_calls_this_month ?? 0) + 1 }).where(eq(users.id, calculation.user_id));
    
    return { tips: text, generated: true, fromCache: false };
  } catch (error) {
    // 5. 폴백 메시지 (AI 실패 시)
    return {
      tips: `마진율 ${calculation.profit_margin}%는 일반적으로 적정 수준입니다.`,
      generated: false,
      fromCache: false
    };
  }
}
```

### 📊 데이터베이스 쿼리 패턴 (Drizzle ORM)
```typescript
// RLS 정책을 신뢰하고, 현재 사용자의 데이터만 조회
import { db } from '~/core/db/drizzle-client.server';
import { calculations } from '~/core/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserCalculations(userId: string) {
  // RLS가 user_id를 필터링해주므로, 코드에서는 정렬과 같은 로직에 집중
  const result = await db.query.calculations.findMany({
    where: eq(calculations.user_id, userId), // RLS가 있지만, 명시적으로 한번 더 확인
    orderBy: [desc(calculations.created_at)],
    with: {
      calculation_ingredients: {
        with: {
          ingredient: true // ingredients 테이블 정보 조인
        }
      },
      ai_cost_tips: {
        columns: {
          cost_saving_tip: true,
          expected_monthly_saving: true
        }
      }
    }
  });
  return result;
}
```

## 보안 및 인증
- Supabase Row Level Security (RLS) 정책 필수 적용 (`docs/DB 스키마.md` 참고)
- 클라이언트 측에서 민감한 데이터 처리 금지. 모든 로직은 React Router v7 `loader`와 `action`에서 처리
- 모든 API 라우트(loader/action)에서 `requireUser(request)`로 인증 상태 확인

## 테스팅
- 새로운 기능은 E2E 테스트 작성 (Playwright)
- 테스트 파일은 `e2e/` 폴더에 기능별로 분류하여 배치
- 회원가입, 로그인, 계산, AI 팁 확인, 구독 플로우는 반드시 테스트 커버

## 성능 최적화
- 큰 컴포넌트는 `React.lazy()`로 코드 분할
- 이미지는 WebP 등 최적화된 포맷 사용하고, Vercel Image Optimization 활용
- 불필요한 리렌더링 방지를 위해 `useMemo`, `useCallback` 적극 활용

## 국제화 (i18n)
- MVP 단계에서는 한국어만 지원. `app/locales/ko.ts` 파일에 모든 텍스트 정의
- 향후 확장을 위해 `i18next` 구조는 유지

## 에러 처리
- 사용자 친화적인 에러 메시지 제공 (`FormError`, `FormSuccess` 컴포넌트 활용)
- Sentry를 통한 프로덕션 에러 추적
- 네트워크 에러 발생 시, 사용자에게 재시도 옵션 제공

## 접근성 (a11y)
- 시맨틱 HTML 태그 사용 (`<header>`, `<main>`, `<nav>` 등)
- 모든 입력 필드에 `<label>` 연결
- 키보드만으로 모든 기능 사용 가능하도록 구현

## Git 관리 규칙 및 워크플로우

### 브랜치 전략
- **main**: 프로덕션 배포 가능한 안정적인 코드
- **feature/기능명**: 새로운 기능 개발 (예: `feature/ai-cost-tips`, `feature/payment-integration`)
- **fix/이슈명**: 버그 수정 (예: `fix/calculation-error`, `fix/mobile-ui`)
- **docs/문서명**: 문서 업데이트 (예: `docs/api-documentation`)

### 커밋 메시지 규칙 (Conventional Commits)
```
<type>(<scope>): <description>

[optional body]

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**타입 (Type):**
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 과정 또는 도구 변경

**스코프 (Scope) 예시:**
- `ai`: AI 기능 관련
- `calc`: 원가계산 관련  
- `auth`: 인증 관련
- `payment`: 결제 관련
- `ui`: UI/UX 관련
- `pwa`: PWA 관련

**예시 커밋 메시지:**
```
feat(ai): AI 원가절감 팁 생성 기능 추가

- Vercel AI SDK 통합
- GPT-4o-mini 모델 사용
- 24시간 캐싱 구현
- 사용량 제한 적용

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 개발 워크플로우
1. **브랜치 생성**: `git checkout -b feature/기능명`
2. **개발 및 테스트**: 기능 구현 후 로컬 테스트
3. **품질 검증**: Validation Gates 통과 확인
4. **커밋**: 규칙에 맞는 커밋 메시지 작성
5. **푸시**: `git push origin feature/기능명`
6. **PR 생성**: GitHub에서 Pull Request 생성
7. **코드 리뷰**: 필요시 피드백 반영
8. **병합**: Squash and Merge로 main에 병합

### 자동 Git 관리 시 적용 규칙
제가 Git 작업을 수행할 때 다음 규칙을 자동으로 적용합니다:

1. **커밋 전 체크리스트**:
   - TypeScript 컴파일 확인
   - 테스트 통과 확인
   - console.log() 제거 확인

2. **커밋 메시지 자동 생성**:
   - Conventional Commits 형식 준수
   - 적절한 타입과 스코프 자동 선택
   - Claude Code 서명 자동 추가

3. **브랜치 관리**:
   - 기능별 적절한 브랜치명 생성
   - main 브랜치 보호 (직접 커밋 금지)

4. **PR 관리**:
   - 상세한 PR 설명 자동 생성
   - 체크리스트 포함
   - 적절한 라벨 제안

### Git 훅 설정 (권장)
```bash
# pre-commit: 커밋 전 검증
npm run typecheck && npm run format

# pre-push: 푸시 전 테스트
npm run test:e2e
```

## Validation Gates (품질 검증 기준)
개발 진행 시 다음 단계별 검증을 반드시 통과해야 합니다:

### 1. 코드 커밋 전
- ✅ TypeScript 컴파일 에러 없음 (`npm run typecheck`)
- ✅ ESLint 경고/에러 없음
- ✅ Prettier 포맷팅 완료 (`npm run format`)
- ✅ console.log() 제거 확인

### 2. Pull Request 생성 전
- ✅ 모든 E2E 테스트 통과 (`npm run test:e2e`)
- ✅ 로컬 빌드 성공 (`npm run build`)
- ✅ 모바일 반응형 테스트 완료
- ✅ AI 기능 실제 테스트 (API 연동 확인)

### 3. 프로덕션 배포 전
- ✅ Lighthouse 점수 90+ 확인
  - Performance: 90+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 90+
- ✅ PWA 체크리스트 완료
  - manifest.json 설정
  - Service Worker 동작 확인
  - 오프라인 모드 테스트
- ✅ 보안 체크
  - 환경변수 확인 (API 키 노출 없음)
  - RLS 정책 동작 확인
  - HTTPS 강제 적용

## 금지사항
- `console.log()`를 프로덕션 코드에 절대 남기지 말 것
- `.env` 파일에 API 키나 비밀번호를 직접 하드코딩하지 말고, Vercel 환경 변수 사용
- `any` 타입은 불가피한 경우를 제외하고 절대 사용 금지
- 인라인 스타일(`style={{}}`) 사용 금지. 모든 스타일은 `TailwindCSS` 클래스로 처리
