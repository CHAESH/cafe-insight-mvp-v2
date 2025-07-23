import { Form, useLoaderData, useNavigate } from "react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs, data, redirect } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { FormError } from "~/core/components/form-error";
import { getCurrentUser } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
// import { createDrizzleClient } from "~/core/db/drizzle-client.server";
// import { users } from "~/core/db/schema";
// import { eq } from "drizzle-orm";

const regions = [
  "서울특별시",
  "부산광역시", 
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도"
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await getCurrentUser(client);
  
  if (!user) {
    return redirect("/auth/login");
  }
  
  // 이미 이메일이 있는 경우 대시보드로
  if (user.email) {
    return redirect("/dashboard");
  }
  
  return data({ 
    user: {
      id: user.id,
      email: user.email,
      // 카카오 메타데이터에서 닉네임 가져오기
      nickname: user.user_metadata?.nickname || "",
    }
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await getCurrentUser(client);
  
  if (!user) {
    return redirect("/auth/login");
  }
  
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const cafeName = formData.get("cafeName") as string;
  const region = formData.get("region") as string;
  const businessType = formData.get("businessType") as string;
  const phone = formData.get("phone") as string;
  
  // 유효성 검사
  if (!email || !cafeName || !region) {
    return data(
      { error: "필수 정보를 모두 입력해주세요" },
      { status: 400 }
    );
  }
  
  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return data(
      { error: "올바른 이메일 주소를 입력해주세요" },
      { status: 400 }
    );
  }
  
  try {
    // 이메일 업데이트 (Supabase Auth)
    const { error: updateError } = await client.auth.updateUser({
      email: email,
      data: {
        cafe_name: cafeName,
        region,
        business_type: businessType,
        phone: phone || null,
      }
    });
    
    if (updateError) {
      console.error("이메일 업데이트 오류:", updateError);
      return data(
        { error: "이메일 업데이트 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }
    
    return redirect("/dashboard");
  } catch (error) {
    console.error("프로필 완성 중 오류:", error);
    return data(
      { error: "프로필 완성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export default function CompleteProfile() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">프로필 완성하기</CardTitle>
          <CardDescription>
            {user.nickname ? `안녕하세요 ${user.nickname}님!` : '환영합니다!'} 
            카페인사이트 이용을 위해 추가 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="cafe@example.com"
                defaultValue={user.email || ""}
                required
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                알림 및 로그인에 사용됩니다
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cafeName">카페명 *</Label>
              <Input
                id="cafeName"
                name="cafeName"
                type="text"
                placeholder="스마트 카페"
                defaultValue={user.nickname || ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">지역 *</Label>
              <div className="relative">
                <select
                  id="region"
                  name="region"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ 
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">지역을 선택하세요</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">업종</Label>
              <div className="relative">
                <select
                  id="businessType"
                  name="businessType"
                  defaultValue="cafe"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ 
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="cafe">카페</option>
                  <option value="restaurant">레스토랑</option>
                  <option value="bakery">베이커리</option>
                  <option value="other">기타</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                전화번호 <span className="text-muted-foreground">(선택)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-1234-5678"
                autoComplete="tel"
              />
            </div>

            <Button type="submit" className="w-full">
              시작하기
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}