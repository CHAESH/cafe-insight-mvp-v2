import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/core/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Textarea } from "~/core/components/ui/textarea";
import { calculateTotalCost, calculateProfitMargin, formatCurrency, type IngredientInput } from "~/core/lib/calculations";
import { Trash2, Plus } from "lucide-react";

interface CalculationFormProps {
  initialData?: {
    menuName?: string;
    menuCategory?: string;
    sellingPrice?: number;
    servingSize?: string;
    notes?: string;
    ingredients?: IngredientInput[];
  };
}

export function CalculationForm({ initialData }: CalculationFormProps) {
  const [menuName, setMenuName] = useState(initialData?.menuName || "");
  const [menuCategory, setMenuCategory] = useState(initialData?.menuCategory || "coffee");
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice?.toString() || "");
  const [servingSize, setServingSize] = useState(initialData?.servingSize || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialData?.ingredients || [
      { customName: "", quantity: 0, unit: "g", unitPrice: 0, priceUnit: "kg" }
    ]
  );
  
  const [totalCost, setTotalCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  // 실시간 계산
  useEffect(() => {
    const cost = calculateTotalCost(ingredients);
    const price = parseFloat(sellingPrice) || 0;
    const margin = calculateProfitMargin(price, cost);
    
    setTotalCost(cost);
    setProfitMargin(margin);
  }, [ingredients, sellingPrice]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { customName: "", quantity: 0, unit: "g", unitPrice: 0, priceUnit: "kg" }
    ]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  return (
    <Form method="post" className="space-y-6">
      {/* 메뉴 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>메뉴 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">메뉴명 *</Label>
              <Input
                id="menuName"
                name="menuName"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="아메리카노"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="menuCategory">카테고리 *</Label>
              <Select 
                name="menuCategory" 
                value={menuCategory}
                onValueChange={setMenuCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">커피</SelectItem>
                  <SelectItem value="beverage">음료</SelectItem>
                  <SelectItem value="dessert">디저트</SelectItem>
                  <SelectItem value="food">푸드</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">판매가격 *</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="4500"
                required
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servingSize">제공량</Label>
              <Input
                id="servingSize"
                name="servingSize"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="355ml (톨 사이즈)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 재료 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>재료 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>재료명</Label>
                    <Input
                      value={ingredient.customName}
                      onChange={(e) => updateIngredient(index, "customName", e.target.value)}
                      placeholder="원두"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>사용량</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={ingredient.quantity || ""}
                        onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="20"
                        required
                        min="0"
                        step="0.001"
                      />
                      <Select
                        value={ingredient.unit}
                        onValueChange={(value) => updateIngredient(index, "unit", value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="개">개</SelectItem>
                          <SelectItem value="포">포</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>단가</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={ingredient.unitPrice || ""}
                        onChange={(e) => updateIngredient(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        placeholder="15000"
                        required
                        min="0"
                        step="0.01"
                      />
                      <Select
                        value={ingredient.priceUnit}
                        onValueChange={(value) => updateIngredient(index, "priceUnit", value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="개">개</SelectItem>
                          <SelectItem value="포">포</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Hidden inputs for form submission */}
              <input type="hidden" name={`ingredients[${index}].customName`} value={ingredient.customName} />
              <input type="hidden" name={`ingredients[${index}].quantity`} value={ingredient.quantity} />
              <input type="hidden" name={`ingredients[${index}].unit`} value={ingredient.unit} />
              <input type="hidden" name={`ingredients[${index}].unitPrice`} value={ingredient.unitPrice} />
              <input type="hidden" name={`ingredients[${index}].priceUnit`} value={ingredient.priceUnit} />
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            재료 추가
          </Button>
        </CardContent>
      </Card>

      {/* 메모 */}
      <Card>
        <CardHeader>
          <CardTitle>메모</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="레시피 메모, 특이사항 등을 입력하세요"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* 실시간 계산 결과 */}
      <Card>
        <CardHeader>
          <CardTitle>계산 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">총 원가</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">판매가격</p>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(sellingPrice) || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">마진율</p>
              <p className={`text-2xl font-bold ${
                profitMargin >= 60 ? 'text-green-600' : 
                profitMargin >= 40 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden inputs for calculated values */}
      <input type="hidden" name="totalCost" value={totalCost} />
      <input type="hidden" name="profitMargin" value={profitMargin} />

      <Button type="submit" className="w-full" size="lg">
        계산 저장하기
      </Button>
    </Form>
  );
}