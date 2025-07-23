import { Form, Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/core/components/ui/card";
import { FormError } from "~/core/components/form-error";
import { FormSuccess } from "~/core/components/form-success";
import { SocialLoginButtons } from "./social-login-buttons";

interface LoginFormProps {
  error?: string;
  success?: string;
}

export function LoginForm({ error, success }: LoginFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>
          카페인사이트에 오신 것을 환영합니다
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
              또는 이메일로 로그인
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
              autoComplete="current-password"
            />
          </div>

          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          <Button type="submit" className="w-full">
            로그인
          </Button>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link 
          to="/auth/forgot-password" 
          className="text-sm text-muted-foreground hover:underline"
        >
          비밀번호를 잊으셨나요?
        </Link>
        <div className="text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link to="/auth/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}