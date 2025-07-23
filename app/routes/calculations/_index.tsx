import { type LoaderFunctionArgs, data, Link, useLoaderData, Form } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { requireUser } from "~/core/lib/guards.server";
import { db } from "~/core/db/drizzle-client.server";
import { calculations } from "~/core/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/core/components/ui/select";
import { Badge } from "~/core/components/ui/badge";
import { formatCurrency, formatPercentage } from "~/core/lib/calculations";
import { Plus, Search, Filter } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await requireUser(client);
  
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "all";
  
  // 필터링 조건 구성
  const conditions = [eq(calculations.userId, user.id)];
  
  if (search) {
    conditions.push(like(calculations.menuName, `%${search}%`));
  }
  
  if (category !== "all") {
    conditions.push(eq(calculations.menuCategory, category as any));
  }
  
  // 계산 목록 가져오기
  const calculationsList = await db.query.calculations.findMany({
    where: and(...conditions),
    orderBy: [desc(calculations.createdAt)],
    with: {
      aiCostTips: {
        columns: {
          id: true,
        },
      },
    },
  });
  
  return data({ user, calculations: calculationsList, search, category });
}

export default function CalculationsListRoute() {
  const { user, calculations, search, category } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">원가계산 목록</h1>
          <p className="text-muted-foreground mt-2">
            총 {calculations.length}개의 계산이 있습니다
          </p>
        </div>
        <Link to="/calculations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 계산
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Form method="get" className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  name="search"
                  placeholder="메뉴명으로 검색..."
                  defaultValue={search}
                  className="pl-9"
                />
              </div>
            </div>
            <Select name="category" defaultValue={category}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="coffee">커피</SelectItem>
                <SelectItem value="beverage">음료</SelectItem>
                <SelectItem value="dessert">디저트</SelectItem>
                <SelectItem value="food">푸드</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              필터 적용
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* Calculations Grid */}
      {calculations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculations.map((calc) => (
            <Link key={calc.id} to={`/calculations/${calc.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{calc.menuName}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {calc.menuCategory === 'coffee' && '커피'}
                          {calc.menuCategory === 'beverage' && '음료'}
                          {calc.menuCategory === 'dessert' && '디저트'}
                          {calc.menuCategory === 'food' && '푸드'}
                          {calc.menuCategory === 'other' && '기타'}
                        </Badge>
                        {calc.aiCostTips && (
                          <Badge variant="default">AI 분석됨</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">판매가</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(calc.sellingPrice))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">원가</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(parseFloat(calc.totalCost))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">마진율</span>
                      <span className={`font-semibold ${
                        parseFloat(calc.profitMargin) >= 60 ? 'text-green-600' : 
                        parseFloat(calc.profitMargin) >= 40 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {formatPercentage(parseFloat(calc.profitMargin))}
                      </span>
                    </div>
                    {calc.servingSize && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">제공량</span>
                        <span className="text-sm">{calc.servingSize}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      {new Date(calc.createdAt).toLocaleDateString('ko-KR')} 생성
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">계산 결과가 없습니다</p>
            <p className="text-muted-foreground mb-6">
              {search || category !== "all" 
                ? "다른 검색 조건을 시도해보세요" 
                : "첫 번째 원가계산을 시작해보세요"}
            </p>
            <Link to="/calculations/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 계산 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}