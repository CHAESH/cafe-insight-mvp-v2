import { type LoaderFunctionArgs, data, Link, useLoaderData, redirect } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { getCurrentUser } from "~/core/lib/guards.server";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Coffee, Calculator, TrendingUp, Zap } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await getCurrentUser(client);
  
  // 로그인한 사용자는 대시보드로 자동 리다이렉션
  if (user) {
    return redirect("/dashboard");
  }
  
  return data({ user });
}

export default function IndexRoute() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          카페인사이트
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          AI 기반 카페 원가계산 & 스마트 인사이트 SaaS
        </p>
        <p className="text-2xl font-semibold text-primary mb-8">
          "5분 계산, 평생 절약"
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/auth/signup">
            <Button size="lg">무료로 시작하기</Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline">로그인</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          카페 사장님을 위한 필수 기능
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary mb-2" />
              <CardTitle>정확한 원가계산</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                재료별 상세 원가를 입력하고 메뉴별 수익성을 한눈에 파악하세요
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI 절감 팁</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                GPT-4 기반 AI가 월평균 50만원 이상 절감 가능한 맞춤형 팁을 제공합니다
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>마진율 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                업계 평균과 비교하여 적정 마진율을 유지하고 있는지 실시간으로 확인하세요
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Coffee className="h-10 w-10 text-primary mb-2" />
              <CardTitle>카테고리별 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                커피, 음료, 디저트 등 카테고리별로 원가를 관리하고 분석하세요
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          합리적인 가격
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>무료 플랜</CardTitle>
              <p className="text-3xl font-bold">₩0</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  무제한 원가계산
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  기본 마진율 분석
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  월 10회 AI 팁 생성
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  30일 데이터 보관
                </li>
              </ul>
              <Link to="/auth/signup">
                <Button className="w-full mt-6">무료로 시작하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>프리미엄 플랜</CardTitle>
              <p className="text-3xl font-bold">₩10,000<span className="text-lg font-normal">/월</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  무제한 원가계산
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  고급 마진율 분석
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>무제한 AI 팁 생성</strong>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>무제한 데이터 보관</strong>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>엑셀 내보내기</strong>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>우선 고객 지원</strong>
                </li>
              </ul>
              <Link to="/auth/signup">
                <Button className="w-full mt-6" variant="default">
                  프리미엄 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          지금 시작하고 매달 50만원을 절약하세요
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          5분 투자로 평생 수익을 개선하는 스마트한 선택
        </p>
        <Link to="/auth/signup">
          <Button size="lg">
            무료로 시작하기
          </Button>
        </Link>
      </section>
    </div>
  );
}