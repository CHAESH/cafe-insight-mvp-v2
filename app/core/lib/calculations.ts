/**
 * 원가계산 유틸리티 함수들
 * 
 * 카페 메뉴의 원가계산, 마진율 계산 등 핵심 비즈니스 로직
 */

export interface IngredientInput {
  name?: string;
  customName?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  priceUnit: string;
}

/**
 * 재료별 원가 계산
 */
export function calculateIngredientCost(ingredient: IngredientInput): number {
  // 단위 변환이 필요한 경우 처리
  let normalizedQuantity = ingredient.quantity;
  
  // 예: kg -> g, L -> ml 변환
  if (ingredient.unit === 'g' && ingredient.priceUnit === 'kg') {
    normalizedQuantity = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'ml' && ingredient.priceUnit === 'L') {
    normalizedQuantity = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'kg' && ingredient.priceUnit === 'g') {
    normalizedQuantity = ingredient.quantity * 1000;
  } else if (ingredient.unit === 'L' && ingredient.priceUnit === 'ml') {
    normalizedQuantity = ingredient.quantity * 1000;
  }
  
  return normalizedQuantity * ingredient.unitPrice;
}

/**
 * 전체 원가 계산
 */
export function calculateTotalCost(ingredients: IngredientInput[]): number {
  return ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(ingredient);
  }, 0);
}

/**
 * 마진율 계산
 * @returns 마진율 (%)
 */
export function calculateProfitMargin(sellingPrice: number, totalCost: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
}

/**
 * 순이익 계산
 */
export function calculateProfit(sellingPrice: number, totalCost: number): number {
  return sellingPrice - totalCost;
}

/**
 * 권장 판매가격 계산 (목표 마진율 기준)
 */
export function calculateRecommendedPrice(totalCost: number, targetMargin: number): number {
  if (targetMargin >= 100) return Infinity;
  return totalCost / (1 - targetMargin / 100);
}

/**
 * 손익분기점 계산 (고정비용 포함 시)
 */
export function calculateBreakEvenPoint(
  fixedCosts: number,
  sellingPrice: number,
  variableCost: number
): number {
  const contributionMargin = sellingPrice - variableCost;
  if (contributionMargin <= 0) return Infinity;
  return Math.ceil(fixedCosts / contributionMargin);
}

/**
 * 카테고리별 권장 마진율
 */
export const RECOMMENDED_MARGINS = {
  coffee: { min: 60, ideal: 70, max: 80 },
  beverage: { min: 65, ideal: 75, max: 85 },
  dessert: { min: 50, ideal: 60, max: 70 },
  food: { min: 40, ideal: 50, max: 60 },
  other: { min: 50, ideal: 60, max: 70 },
};

/**
 * 마진율 상태 판단
 */
export function getMarginStatus(
  margin: number, 
  category: keyof typeof RECOMMENDED_MARGINS
): 'low' | 'ideal' | 'high' {
  const range = RECOMMENDED_MARGINS[category];
  
  if (margin < range.min) return 'low';
  if (margin > range.max) return 'high';
  return 'ideal';
}

/**
 * 포맷팅 헬퍼 함수들
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}