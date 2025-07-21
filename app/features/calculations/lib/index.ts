// 원가계산 핵심 로직

export interface Ingredient {
  id?: string;
  ingredient_id?: string;
  custom_ingredient_name?: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export interface CalculationResult {
  total_cost: number;
  profit_margin: number;
  profit_amount: number;
}

/**
 * 총 원가 계산
 */
export function calculateTotalCost(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.quantity * ingredient.unit_price);
  }, 0);
}

/**
 * 마진율 계산 (백분율)
 */
export function calculateProfitMargin(sellingPrice: number, totalCost: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
}

/**
 * 수익 금액 계산
 */
export function calculateProfitAmount(sellingPrice: number, totalCost: number): number {
  return Math.max(0, sellingPrice - totalCost);
}

/**
 * 실시간 계산 결과 생성
 */
export function calculateAll(sellingPrice: number, ingredients: Ingredient[]): CalculationResult {
  const total_cost = calculateTotalCost(ingredients);
  const profit_margin = calculateProfitMargin(sellingPrice, total_cost);
  const profit_amount = calculateProfitAmount(sellingPrice, total_cost);

  return {
    total_cost,
    profit_margin,
    profit_amount
  };
}

/**
 * 마진율 상태 판정
 */
export function getMarginStatus(margin: number): 'low' | 'medium' | 'high' {
  if (margin < 30) return 'low';
  if (margin < 60) return 'medium';
  return 'high';
}

/**
 * 원가율 계산 (총 원가 / 판매가 * 100)
 */
export function calculateCostRatio(sellingPrice: number, totalCost: number): number {
  if (sellingPrice <= 0) return 0;
  return (totalCost / sellingPrice) * 100;
}