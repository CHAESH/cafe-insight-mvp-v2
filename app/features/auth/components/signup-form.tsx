import { Form, Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/core/components/ui/card";
import { FormError } from "~/core/components/form-error";
import { FormSuccess } from "~/core/components/form-success";
import { SocialLoginButtons } from "./social-login-buttons";

interface SignupFormProps {
  error?: string;
  success?: string;
}

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

export function SignupForm({ error, success }: SignupFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>
          카페인사이트와 함께 스마트한 카페 운영을 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialLoginButtons />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는 이메일로 가입
            </span>
          </div>
        </div>
        
        <Form method="post" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="cafe@example.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              최소 8자 이상 입력해주세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cafeName">카페명</Label>
            <Input
              id="cafeName"
              name="cafeName"
              type="text"
              placeholder="스마트 카페"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">지역</Label>
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

          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          <Button type="submit" className="w-full">
            회원가입
          </Button>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}