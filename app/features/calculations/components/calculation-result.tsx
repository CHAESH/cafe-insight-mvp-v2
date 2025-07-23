import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { formatCurrency, formatPercentage, getMarginStatus, RECOMMENDED_MARGINS } from "~/core/lib/calculations";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface CalculationResultProps {
  calculation: {
    menuName: string;
    menuCategory: string;
    sellingPrice: number;
    totalCost: number;
    profitMargin: number;
    servingSize?: string;
    ingredients: Array<{
      name?: string;
      customName?: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalCost: number;
    }>;
  };
  showDetails?: boolean;
}

export function CalculationResult({ calculation, showDetails = true }: CalculationResultProps) {
  const marginStatus = getMarginStatus(
    calculation.profitMargin, 
    calculation.menuCategory as keyof typeof RECOMMENDED_MARGINS
  );
  
  const profit = calculation.sellingPrice - calculation.totalCost;
  const recommendedMargin = RECOMMENDED_MARGINS[calculation.menuCategory as keyof typeof RECOMMENDED_MARGINS];

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">판매가격</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(calculation.sellingPrice)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 원가</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(calculation.totalCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">순이익</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">마진율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${
                marginStatus === 'ideal' ? 'text-green-600' :
                marginStatus === 'high' ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {formatPercentage(calculation.profitMargin)}
              </p>
              {marginStatus === 'ideal' && <TrendingUp className="h-5 w-5 text-green-600" />}
              {marginStatus === 'low' && <TrendingDown className="h-5 w-5 text-orange-600" />}
              {marginStatus === 'high' && <AlertCircle className="h-5 w-5 text-blue-600" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              권장: {recommendedMargin.min}~{recommendedMargin.max}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 마진율 상태 메시지 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {marginStatus === 'ideal' && (
              <>
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-600">적정 마진율입니다!</p>
                  <p className="text-sm text-muted-foreground">
                    현재 마진율이 {calculation.menuCategory} 카테고리의 권장 범위 내에 있습니다.
                  </p>
                </div>
              </>
            )}
            {marginStatus === 'low' && (
              <>
                <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-600">마진율이 낮습니다</p>
                  <p className="text-sm text-muted-foreground">
                    원가를 낮추거나 판매가격을 높이는 것을 고려해보세요. 
                    권장 마진율은 {recommendedMargin.min}% 이상입니다.
                  </p>
                </div>
              </>
            )}
            {marginStatus === 'high' && (
              <>
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-600">마진율이 매우 높습니다</p>
                  <p className="text-sm text-muted-foreground">
                    경쟁력 있는 가격인지 검토해보세요. 
                    일반적인 {calculation.menuCategory} 마진율은 {recommendedMargin.max}% 이하입니다.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 재료별 원가 상세 */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>재료별 원가 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculation.ingredients.map((ingredient, index) => {
                const costPercentage = (ingredient.totalCost / calculation.totalCost) * 100;
                return (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">
                        {ingredient.name || ingredient.customName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.quantity}{ingredient.unit} × {formatCurrency(ingredient.unitPrice)}/단위
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(ingredient.totalCost)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercentage(costPercentage)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="font-semibold">총 원가</p>
                <p className="font-semibold text-lg">{formatCurrency(calculation.totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 추가 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">판매 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">카테고리</span>
              <Badge variant="secondary">
                {calculation.menuCategory === 'coffee' && '커피'}
                {calculation.menuCategory === 'beverage' && '음료'}
                {calculation.menuCategory === 'dessert' && '디저트'}
                {calculation.menuCategory === 'food' && '푸드'}
                {calculation.menuCategory === 'other' && '기타'}
              </Badge>
            </div>
            {calculation.servingSize && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">제공량</span>
                <span>{calculation.servingSize}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">수익성 지표</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">원가율</span>
              <span>{formatPercentage(100 - calculation.profitMargin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">1일 100잔 판매 시</span>
              <span className="font-medium">{formatCurrency(profit * 100)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}