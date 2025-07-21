// 에러 처리 패턴 예시 - 카페인사이트 표준 에러 처리

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@react-router/node";
import { useRouteError, isRouteErrorResponse, useActionData } from "@react-router/react";
import { z } from "zod";
import { Button } from "~/core/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/core/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

// 커스텀 에러 클래스들
export class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super("유효성 검사 실패");
    this.name = "ValidationError";
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "BusinessLogicError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "인증이 필요합니다") {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Zod 스키마 예시
const calculationSchema = z.object({
  menu_name: z.string().min(1, "메뉴명을 입력해주세요").max(100, "메뉴명은 100자 이내로 입력해주세요"),
  selling_price: z.number().min(100, "판매가는 100원 이상이어야 합니다").max(1000000, "판매가가 너무 큽니다"),
  ingredients: z.array(z.object({
    name: z.string().min(1, "재료명을 입력해주세요"),
    quantity: z.number().positive("수량은 0보다 커야 합니다"),
    unit_price: z.number().positive("단가는 0보다 커야 합니다"),
  })).min(1, "최소 1개 이상의 재료를 입력해주세요"),
});

// Loader 에러 처리 예시
export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    if (!user) {
      throw new AuthenticationError();
    }

    const calculationId = params.calculationId;
    if (!calculationId) {
      throw new Response("계산 ID가 필요합니다", { status: 400 });
    }

    const calculation = await getCalculation(calculationId, user.id);
    if (!calculation) {
      throw new Response("계산 데이터를 찾을 수 없습니다", { status: 404 });
    }

    return json({ calculation });
  } catch (error) {
    // 인증 에러
    if (error instanceof AuthenticationError) {
      throw new Response(error.message, { status: 401 });
    }
    
    // 예상치 못한 에러
    console.error("Loader error:", error);
    throw new Response("서버 오류가 발생했습니다", { status: 500 });
  }
}

// Action 에러 처리 예시
export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // 1. 유효성 검사
    const result = calculationSchema.safeParse({
      menu_name: data.menu_name,
      selling_price: Number(data.selling_price),
      ingredients: JSON.parse(data.ingredients as string),
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return json({ errors }, { status: 400 });
    }

    // 2. 비즈니스 로직 검증
    const totalCost = calculateTotalCost(result.data.ingredients);
    const profitMargin = calculateProfitMargin(result.data.selling_price, totalCost);

    if (profitMargin < 0) {
      throw new BusinessLogicError(
        "원가가 판매가보다 높습니다. 가격을 다시 확인해주세요.",
        "NEGATIVE_MARGIN"
      );
    }

    if (profitMargin > 90) {
      throw new BusinessLogicError(
        "마진율이 90%를 초과합니다. 원가를 다시 확인해주세요.",
        "EXCESSIVE_MARGIN"
      );
    }

    // 3. 데이터베이스 작업
    const calculation = await createCalculation({
      ...result.data,
      user_id: user.id,
      total_cost: totalCost,
      profit_margin: profitMargin,
    });

    return json({ success: true, calculation });
  } catch (error) {
    // 비즈니스 로직 에러
    if (error instanceof BusinessLogicError) {
      return json(
        { error: error.message, code: error.code },
        { status: 422 }
      );
    }

    // 데이터베이스 에러
    if (error?.code === 'P2002') {
      return json(
        { error: "이미 같은 이름의 메뉴가 존재합니다." },
        { status: 409 }
      );
    }

    // 예상치 못한 에러
    console.error("Action error:", error);
    return json(
      { error: "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// 에러 바운더리 컴포넌트
export function ErrorBoundary() {
  const error = useRouteError();
  
  let errorMessage = "알 수 없는 오류가 발생했습니다.";
  let errorStatus = 500;
  let isRetryable = true;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data || error.statusText;
    isRetryable = errorStatus >= 500;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant={errorStatus >= 500 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {errorStatus === 404 ? "페이지를 찾을 수 없습니다" :
             errorStatus === 401 ? "로그인이 필요합니다" :
             errorStatus >= 500 ? "서버 오류" : "오류 발생"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {errorMessage}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 flex gap-2">
          {isRetryable && (
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          )}
          <Button onClick={() => window.history.back()} variant="ghost">
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}

// 폼 에러 표시 컴포넌트
export function FormError({ error }: { error?: string | string[] }) {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];
  
  return (
    <div className="mt-1 text-sm text-red-600">
      {errors.map((err, idx) => (
        <div key={idx}>{err}</div>
      ))}
    </div>
  );
}

// 액션 결과 처리 예시
export default function CalculationForm() {
  const actionData = useActionData<typeof action>();
  
  return (
    <form method="post" className="space-y-4">
      {/* 전체 에러 메시지 */}
      {actionData?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionData.error}</AlertDescription>
        </Alert>
      )}

      {/* 성공 메시지 */}
      {actionData?.success && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            계산이 성공적으로 저장되었습니다!
          </AlertDescription>
        </Alert>
      )}

      {/* 입력 필드들 */}
      <div>
        <label htmlFor="menu_name" className="block text-sm font-medium">
          메뉴명
        </label>
        <input
          id="menu_name"
          name="menu_name"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300"
          aria-invalid={!!actionData?.errors?.menu_name}
          aria-describedby="menu_name-error"
        />
        <FormError error={actionData?.errors?.menu_name} />
      </div>

      {/* 나머지 폼 필드들... */}

      <Button type="submit">계산 저장</Button>
    </form>
  );
}

// 헬퍼 함수들 (실제 구현 필요)
async function requireUser(request: Request) {
  // 사용자 인증 체크 로직
  return { id: "user-id" };
}

async function getCalculation(id: string, userId: string) {
  // 계산 데이터 조회 로직
  return null;
}

function calculateTotalCost(ingredients: any[]): number {
  return ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unit_price), 0);
}

function calculateProfitMargin(sellingPrice: number, totalCost: number): number {
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
}

async function createCalculation(data: any) {
  // 계산 데이터 생성 로직
  return { id: "calc-id", ...data };
}