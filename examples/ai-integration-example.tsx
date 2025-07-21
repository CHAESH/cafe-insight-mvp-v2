// AI 기능 통합 예시 - 카페인사이트 AI 원가절감 팁 구현 패턴

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@react-router/node";
import { useLoaderData, useFetcher } from "@react-router/react";
import { useState } from "react";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { requireUser } from "~/core/lib/guards.server";
import { createDrizzleClient } from "~/core/db/drizzle-client.server";
import { aiCostTips, calculations } from "~/core/db/schema";
import { and, eq, gte } from "drizzle-orm";

// 타입 정의
interface AICostTip {
  id: string;
  calculation_id: string;
  cost_saving_tip: string;
  expected_monthly_saving: number;
  confidence_level: 'high' | 'medium' | 'low';
  expires_at: string;
  created_at: string;
}

interface CalculationWithTips {
  id: string;
  menu_name: string;
  profit_margin: number;
  ai_tips?: AICostTip;
}

// Loader: 계산 데이터와 캐시된 AI 팁 조회
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const db = createDrizzleClient(request);
  const calculationId = params.calculationId;

  // 계산 데이터 조회 (RLS 적용)
  const calculation = await db.query.calculations.findFirst({
    where: and(
      eq(calculations.id, calculationId),
      eq(calculations.user_id, user.id)
    ),
    with: {
      ai_cost_tips: {
        where: gte(aiCostTips.expires_at, new Date()),
        limit: 1,
        orderBy: (tips, { desc }) => [desc(tips.created_at)]
      }
    }
  });

  if (!calculation) {
    throw new Response("계산 데이터를 찾을 수 없습니다", { status: 404 });
  }

  return json({ calculation });
}

// Action: AI 팁 생성
export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const db = createDrizzleClient(request);
  const calculationId = params.calculationId;

  // 사용자 AI 사용량 체크
  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  if (userData.ai_calls_this_month >= userData.monthly_ai_limit) {
    return json(
      { error: "이번 달 AI 사용 한도를 초과했습니다." },
      { status: 429 }
    );
  }

  // 계산 데이터 조회
  const calculation = await db.query.calculations.findFirst({
    where: and(
      eq(calculations.id, calculationId),
      eq(calculations.user_id, user.id)
    ),
    with: {
      calculation_ingredients: {
        with: {
          ingredient: true
        }
      }
    }
  });

  if (!calculation) {
    return json({ error: "계산 데이터를 찾을 수 없습니다" }, { status: 404 });
  }

  try {
    // AI 프롬프트 생성
    const prompt = createCostSavingPrompt(calculation);
    
    // Vercel AI SDK를 사용한 AI 응답 생성
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
      maxTokens: 300,
    });

    // 예상 절감액 추출 (AI 응답에서 파싱)
    const savingAmount = extractSavingAmount(text);

    // AI 팁 저장 (24시간 캐시)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const [savedTip] = await db.insert(aiCostTips).values({
      calculation_id: calculationId,
      cost_saving_tip: text,
      expected_monthly_saving: savingAmount,
      confidence_level: calculateConfidenceLevel(calculation.profit_margin),
      expires_at: expiresAt,
    }).returning();

    // 사용량 업데이트
    await db.update(users)
      .set({ ai_calls_this_month: userData.ai_calls_this_month + 1 })
      .where(eq(users.id, user.id));

    return json({ tip: savedTip });
  } catch (error) {
    console.error('AI 팁 생성 실패:', error);
    
    // 폴백 응답
    return json({
      tip: {
        cost_saving_tip: `현재 마진율 ${calculation.profit_margin}%는 적정 수준입니다. 재료 구매처를 다양화하여 원가를 낮춰보세요.`,
        expected_monthly_saving: 0,
        confidence_level: 'low',
      }
    });
  }
}

// 컴포넌트: AI 팁 표시
export default function AIInsightExample() {
  const { calculation } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [showTip, setShowTip] = useState(!!calculation.ai_tips);

  const handleGenerateTip = () => {
    fetcher.submit({}, { method: "post" });
  };

  const isLoading = fetcher.state === "submitting";
  const tip = fetcher.data?.tip || calculation.ai_tips?.[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{calculation.menu_name} - AI 원가절감 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            현재 마진율: {calculation.profit_margin}%
          </div>

          {!showTip && !tip ? (
            <Button 
              onClick={handleGenerateTip} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 절감 팁 받기
                </>
              )}
            </Button>
          ) : tip ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900">{tip.cost_saving_tip}</p>
                    {tip.expected_monthly_saving > 0 && (
                      <p className="mt-2 text-sm font-semibold text-green-700">
                        예상 월 절감액: {tip.expected_monthly_saving.toLocaleString()}원
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                신뢰도: {getConfidenceText(tip.confidence_level)} • 
                {tip.expires_at && ` 다음 업데이트: ${new Date(tip.expires_at).toLocaleDateString()}`}
              </div>
            </div>
          ) : null}

          {fetcher.data?.error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {fetcher.data.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 헬퍼 함수들
function createCostSavingPrompt(calculation: any): string {
  const ingredients = calculation.calculation_ingredients
    .map(ci => `- ${ci.ingredient?.name || ci.custom_ingredient_name}: ${ci.quantity}${ci.unit} (단가: ${ci.unit_price}원)`)
    .join('\n');

  return `
카페 메뉴: ${calculation.menu_name}
카테고리: ${calculation.menu_category}
판매가: ${calculation.selling_price}원
원가: ${calculation.total_cost}원
마진율: ${calculation.profit_margin}%

재료 구성:
${ingredients}

위 카페 메뉴의 원가를 절감할 수 있는 구체적이고 실용적인 방법을 한국어로 제안해주세요.
다음 내용을 포함해주세요:
1. 대체 가능한 저렴한 재료나 구매처
2. 구매 단위 최적화 방법
3. 예상 절감 금액

응답은 카페 사장님이 바로 실행할 수 있는 구체적인 조언으로 작성해주세요.
`;
}

function extractSavingAmount(text: string): number {
  // AI 응답에서 절감액 추출 (간단한 정규식 예시)
  const match = text.match(/월\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:만\s*)?원/);
  if (match) {
    const amount = match[1].replace(/,/g, '');
    const isManWon = match[0].includes('만');
    return parseInt(amount) * (isManWon ? 10000 : 1);
  }
  return 0;
}

function calculateConfidenceLevel(profitMargin: number): 'high' | 'medium' | 'low' {
  if (profitMargin < 50) return 'high'; // 마진이 낮으면 개선 여지가 많음
  if (profitMargin < 70) return 'medium';
  return 'low';
}

function getConfidenceText(level: string): string {
  const texts = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  };
  return texts[level] || '보통';
}