import { type ActionFunctionArgs, type LoaderFunctionArgs, data, redirect } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { requireUser } from "~/core/lib/guards.server";
import { CalculationForm } from "~/features/calculations/components/calculation-form";
import { db } from "~/core/db/drizzle-client.server";
import { calculations, calculationIngredients } from "~/core/db/schema";
import { calculateIngredientCost } from "~/core/lib/calculations";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  await requireUser(client);
  
  return data({});
}

export async function action({ request }: ActionFunctionArgs) {
  const [client, headers] = makeServerClient(request);
  const user = await requireUser(client);
  
  const formData = await request.formData();
  
  // 기본 정보 추출
  const menuName = formData.get("menuName") as string;
  const menuCategory = formData.get("menuCategory") as string;
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const servingSize = formData.get("servingSize") as string;
  const notes = formData.get("notes") as string;
  const totalCost = parseFloat(formData.get("totalCost") as string);
  const profitMargin = parseFloat(formData.get("profitMargin") as string);
  
  // 재료 정보 추출
  const ingredients = [];
  let i = 0;
  while (formData.has(`ingredients[${i}].customName`)) {
    const ingredient = {
      customName: formData.get(`ingredients[${i}].customName`) as string,
      quantity: parseFloat(formData.get(`ingredients[${i}].quantity`) as string),
      unit: formData.get(`ingredients[${i}].unit`) as string,
      unitPrice: parseFloat(formData.get(`ingredients[${i}].unitPrice`) as string),
      priceUnit: formData.get(`ingredients[${i}].priceUnit`) as string,
    };
    
    if (ingredient.customName && ingredient.quantity > 0) {
      ingredients.push(ingredient);
    }
    i++;
  }
  
  // 유효성 검사
  if (!menuName || !sellingPrice || ingredients.length === 0) {
    return data(
      { error: "필수 정보를 모두 입력해주세요" },
      { status: 400 }
    );
  }
  
  try {
    // 계산 정보 저장
    const [calculation] = await db.insert(calculations).values({
      userId: user.id,
      menuName,
      menuCategory: menuCategory as any,
      sellingPrice: sellingPrice.toString(),
      totalCost: totalCost.toString(),
      profitMargin: profitMargin.toString(),
      servingSize: servingSize || null,
      notes: notes || null,
    }).returning();
    
    // 재료 정보 저장
    const ingredientInserts = ingredients.map(ing => {
      const ingredientCost = calculateIngredientCost({
        customName: ing.customName,
        quantity: ing.quantity,
        unit: ing.unit,
        unitPrice: ing.unitPrice,
        priceUnit: ing.priceUnit,
      });
      
      return {
        calculationId: calculation.id,
        customIngredientName: ing.customName,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
        unitPrice: ing.unitPrice.toString(),
        priceUnit: ing.priceUnit,
        totalCost: ingredientCost.toString(),
      };
    });
    
    await db.insert(calculationIngredients).values(ingredientInserts);
    
    // 성공 시 계산 상세 페이지로 이동
    return redirect(`/calculations/${calculation.id}`, {
      headers,
    });
  } catch (error) {
    console.error("계산 저장 오류:", error);
    return data(
      { error: "계산 저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export default function NewCalculationRoute() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 원가계산</h1>
        <p className="text-muted-foreground mt-2">
          메뉴의 재료비를 입력하고 수익성을 분석해보세요
        </p>
      </div>
      
      <CalculationForm />
    </div>
  );
}