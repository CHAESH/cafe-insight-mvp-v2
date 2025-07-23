import { type LoaderFunctionArgs, type ActionFunctionArgs, data, redirect, Link, useLoaderData, Form } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { requireUser } from "~/core/lib/guards.server";
import { db } from "~/core/db/drizzle-client.server";
import { calculations, calculationIngredients } from "~/core/db/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { CalculationResult } from "~/features/calculations/components/calculation-result";
import { calculateIngredientCost } from "~/core/lib/calculations";
import { ArrowLeft, Edit, Trash2, Sparkles } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await requireUser(client);
  
  const calculationId = params.id;
  if (!calculationId) {
    throw new Response("계산을 찾을 수 없습니다", { status: 404 });
  }
  
  // 계산 정보 가져오기
  const calculation = await db.query.calculations.findFirst({
    where: and(
      eq(calculations.id, calculationId),
      eq(calculations.userId, user.id)
    ),
    with: {
      calculationIngredients: true,
      aiCostTips: true,
    },
  });
  
  if (!calculation) {
    throw new Response("계산을 찾을 수 없습니다", { status: 404 });
  }
  
  // 재료 정보 포맷팅
  const formattedCalculation = {
    ...calculation,
    menuName: calculation.menuName,
    menuCategory: calculation.menuCategory,
    sellingPrice: parseFloat(calculation.sellingPrice),
    totalCost: parseFloat(calculation.totalCost),
    profitMargin: parseFloat(calculation.profitMargin),
    ingredients: calculation.calculationIngredients.map(ing => ({
      customName: ing.customIngredientName || "",
      quantity: parseFloat(ing.quantity),
      unit: ing.unit,
      unitPrice: parseFloat(ing.unitPrice),
      totalCost: parseFloat(ing.totalCost),
    })),
  };
  
  return data({ user, calculation: formattedCalculation });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const [client, headers] = makeServerClient(request);
  const user = await requireUser(client);
  
  const calculationId = params.id;
  if (!calculationId) {
    throw new Response("계산을 찾을 수 없습니다", { status: 404 });
  }
  
  const formData = await request.formData();
  const action = formData.get("_action");
  
  if (action === "delete") {
    // 계산 삭제 (cascade로 관련 데이터도 삭제됨)
    await db.delete(calculations).where(
      and(
        eq(calculations.id, calculationId),
        eq(calculations.userId, user.id)
      )
    );
    
    return redirect("/calculations", { headers });
  }
  
  throw new Response("잘못된 요청입니다", { status: 400 });
}

export default function CalculationDetailRoute() {
  const { user, calculation } = useLoaderData<typeof loader>();
  
  return (
    <div className="container max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/calculations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{calculation.menuName}</h1>
            <p className="text-muted-foreground mt-1">
              {new Date(calculation.createdAt).toLocaleDateString('ko-KR')} 생성
              {calculation.updatedAt !== calculation.createdAt && 
                ` · ${new Date(calculation.updatedAt).toLocaleDateString('ko-KR')} 수정`
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!calculation.aiCostTips && user.aiCallsThisMonth < user.monthlyAiLimit && (
            <Link to={`/calculations/${calculation.id}/ai-tips`}>
              <Button variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                AI 팁 생성
              </Button>
            </Link>
          )}
          <Link to={`/calculations/${calculation.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </Link>
          <Form method="post" onSubmit={(e) => {
            if (!confirm("정말 이 계산을 삭제하시겠습니까?")) {
              e.preventDefault();
            }
          }}>
            <input type="hidden" name="_action" value="delete" />
            <Button type="submit" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </Form>
        </div>
      </div>

      {/* Calculation Result */}
      <CalculationResult calculation={calculation} showDetails={true} />

      {/* AI Tips */}
      {calculation.aiCostTips && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 원가절감 팁
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">💡 절감 방안</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {calculation.aiCostTips.costSavingTip}
              </p>
            </div>
            
            {calculation.aiCostTips.expectedMonthlySaving && (
              <div>
                <h4 className="font-medium mb-2">💰 예상 절감액</h4>
                <p className="text-2xl font-bold text-green-600">
                  월 {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                    minimumFractionDigits: 0,
                  }).format(parseFloat(calculation.aiCostTips.expectedMonthlySaving))} 절감 가능
                </p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">📊 마진 분석</h4>
              <p className="text-muted-foreground">
                {calculation.aiCostTips.marginAnalysis}
              </p>
            </div>
            
            {calculation.aiCostTips.actionItems && Array.isArray(calculation.aiCostTips.actionItems) && (
              <div>
                <h4 className="font-medium mb-2">✅ 실행 계획</h4>
                <ul className="space-y-1">
                  {calculation.aiCostTips.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {calculation.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {calculation.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}