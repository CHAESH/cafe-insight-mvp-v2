import { type LoaderFunctionArgs, data, Link, useLoaderData } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { requireUser } from "~/core/lib/guards.server";
import { db } from "~/core/db/drizzle-client.server";
import { calculations } from "~/core/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { formatCurrency, formatPercentage } from "~/core/lib/calculations";
import { Plus, Calculator, TrendingUp, Package, CreditCard } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await requireUser(client);
  
  // 최근 계산 목록 가져오기
  const recentCalculations = await db.query.calculations.findMany({
    where: eq(calculations.userId, user.id),
    orderBy: [desc(calculations.createdAt)],
    limit: 5,
  });
  
  // 통계 계산
  const allCalculations = await db.query.calculations.findMany({
    where: eq(calculations.userId, user.id),
  });
  
  const stats = {
    totalCalculations: allCalculations.length,
    averageMargin: allCalculations.length > 0 
      ? allCalculations.reduce((sum, calc) => sum + parseFloat(calc.profitMargin), 0) / allCalculations.length 
      : 0,
    totalMenus: new Set(allCalculations.map(calc => calc.menuName)).size,
  };
  
  return data({ user, recentCalculations, stats });
}

export default function DashboardRoute() {
  const { user, recentCalculations, stats } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-2">
          안녕하세요, {user.cafeName} 사장님! 오늘도 성공적인 하루 되세요.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/calculations/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                새 원가계산
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                메뉴의 원가를 계산하고 수익성을 분석하세요
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/calculations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                계산 목록
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                모든 원가계산 내역을 확인하고 관리하세요
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/insights">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                AI 인사이트
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                AI가 분석한 절감 방안을 확인하세요
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscription">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                구독 관리
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {user.subscriptionStatus === 'premium' ? '프리미엄 플랜' : '무료 플랜'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">총 계산 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCalculations}</p>
            <p className="text-xs text-muted-foreground mt-1">
              등록된 원가계산
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">평균 마진율</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatPercentage(stats.averageMargin)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              전체 메뉴 평균
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {user.aiCallsThisMonth} / {user.monthlyAiLimit === -1 ? '∞' : user.monthlyAiLimit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 AI 팁 생성
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>최근 계산</CardTitle>
            <Link to="/calculations">
              <Button variant="ghost" size="sm">
                전체보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentCalculations.length > 0 ? (
            <div className="space-y-4">
              {recentCalculations.map((calc) => (
                <Link key={calc.id} to={`/calculations/${calc.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{calc.menuName}</p>
                      <p className="text-sm text-muted-foreground">
                        {calc.menuCategory === 'coffee' && '커피'}
                        {calc.menuCategory === 'beverage' && '음료'}
                        {calc.menuCategory === 'dessert' && '디저트'}
                        {calc.menuCategory === 'food' && '푸드'}
                        {calc.menuCategory === 'other' && '기타'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(parseFloat(calc.sellingPrice))}</p>
                      <p className={`text-sm ${
                        parseFloat(calc.profitMargin) >= 60 ? 'text-green-600' : 
                        parseFloat(calc.profitMargin) >= 40 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        마진 {formatPercentage(parseFloat(calc.profitMargin))}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                아직 계산된 메뉴가 없습니다
              </p>
              <Link to="/calculations/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 계산 시작하기
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}