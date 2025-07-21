// Vercel AI SDK 클라이언트 - 카페인사이트 AI 기능

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface CalculationData {
  id: string;
  user_id: string;
  menu_name: string;
  menu_category: string;
  selling_price: number;
  total_cost: number;
  profit_margin: number;
  ingredients?: Array<{
    ingredient_name?: string;
    custom_ingredient_name?: string;
    quantity: number;
    unit: string;
    unit_price: number;
  }>;
}

export interface AICostTip {
  cost_saving_tip: string;
  expected_monthly_saving: number;
  confidence_level: 'high' | 'medium' | 'low';
  generated: boolean;
  fromCache: boolean;
}

/**
 * AI 절감 팁 생성을 위한 프롬프트 생성
 */
export function createCostSavingPrompt(calculation: CalculationData): string {
  const ingredients = calculation.ingredients
    ?.map(ing => `- ${ing.ingredient_name || ing.custom_ingredient_name}: ${ing.quantity}${ing.unit} (단가: ${ing.unit_price.toLocaleString()}원)`)
    .join('\n') || '';

  return `
카페 메뉴: ${calculation.menu_name}
카테고리: ${calculation.menu_category}
판매가: ${calculation.selling_price.toLocaleString()}원
원가: ${calculation.total_cost.toLocaleString()}원
마진율: ${calculation.profit_margin.toFixed(1)}%

재료 구성:
${ingredients}

위 카페 메뉴의 원가를 절감할 수 있는 구체적이고 실용적인 방법을 한국어로 제안해주세요.

다음 내용을 포함해서 200자 이내로 간결하게 작성해주세요:
1. 가장 효과적인 절감 방안 1-2가지
2. 예상 절감 금액 (월 기준)
3. 바로 실행 가능한 구체적 조언

응답은 카페 사장님이 즉시 이해하고 실행할 수 있는 실용적인 조언으로 작성해주세요.
예시: "원두를 A브랜드에서 B브랜드로 변경 시 월 15만원 절감 가능합니다."
`;
}

/**
 * AI 응답에서 예상 절감액 추출
 */
export function extractSavingAmount(text: string): number {
  // "월 15만원", "월 150,000원", "15만원" 등의 패턴 매칭
  const patterns = [
    /월\s*(\d{1,3}(?:,\d{3})*)\s*만\s*원/g,
    /월\s*(\d{1,3}(?:,\d{3})*)\s*원/g,
    /(\d{1,3}(?:,\d{3})*)\s*만\s*원/g,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const amount = matches[0][1].replace(/,/g, '');
      const isManWon = matches[0][0].includes('만');
      return parseInt(amount) * (isManWon ? 10000 : 1);
    }
  }

  return 0;
}

/**
 * 마진율 기반 신뢰도 계산
 */
export function calculateConfidenceLevel(profitMargin: number): 'high' | 'medium' | 'low' {
  if (profitMargin < 40) return 'high';    // 마진이 낮으면 개선 여지가 많음
  if (profitMargin < 70) return 'medium';
  return 'low';                            // 마진이 높으면 개선 여지가 적음
}

/**
 * AI 팁 생성 메인 함수 (서버에서만 사용)
 */
export async function generateCostSavingTips(calculation: CalculationData): Promise<AICostTip> {
  try {
    const prompt = createCostSavingPrompt(calculation);
    
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
      maxTokens: 300,
    });

    const expectedSaving = extractSavingAmount(text);
    const confidenceLevel = calculateConfidenceLevel(calculation.profit_margin);

    return {
      cost_saving_tip: text.trim(),
      expected_monthly_saving: expectedSaving,
      confidence_level: confidenceLevel,
      generated: true,
      fromCache: false,
    };
  } catch (error) {
    console.error('AI 팁 생성 실패:', error);
    
    // 폴백 응답
    return {
      cost_saving_tip: `현재 마진율 ${calculation.profit_margin.toFixed(1)}%는 ${
        calculation.profit_margin < 50 ? '개선이 필요합니다' : '적정 수준입니다'
      }. 재료 구매처를 다양화하여 원가를 낮춰보세요.`,
      expected_monthly_saving: 0,
      confidence_level: 'low',
      generated: false,
      fromCache: false,
    };
  }
}

/**
 * 신뢰도 텍스트 변환
 */
export function getConfidenceText(level: 'high' | 'medium' | 'low'): string {
  const texts = {
    high: '높음',
    medium: '보통', 
    low: '낮음'
  };
  return texts[level];
}