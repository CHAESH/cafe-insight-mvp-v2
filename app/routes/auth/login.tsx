import { type ActionFunctionArgs, type LoaderFunctionArgs, data, redirect, useLoaderData } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { LoginForm } from "~/features/auth/components/login-form";
import { getCurrentUser } from "~/core/lib/guards.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await getCurrentUser(client);
  
  // 이미 로그인한 경우 대시보드로 리다이렉트
  if (user) {
    return redirect("/dashboard");
  }
  
  // URL 파라미터에서 성공 메시지 확인
  const url = new URL(request.url);
  const success = url.searchParams.get("success");
  
  let successMessage = null;
  if (success === "signup") {
    successMessage = "회원가입이 완료되었습니다. 로그인해주세요.";
  }
  
  return data({ error: null, success: successMessage });
}

export async function action({ request }: ActionFunctionArgs) {
  const [client, headers] = makeServerClient(request);
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return data(
      { error: "이메일과 비밀번호를 입력해주세요", success: null },
      { status: 400 }
    );
  }
  
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("로그인 오류:", error);
    let errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
    
    if (error.message.includes("Email not confirmed")) {
      errorMessage = "이메일 인증이 필요합니다. 메일함을 확인해주세요.";
    } else if (error.message.includes("Invalid login credentials")) {
      errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
    }
    
    return data(
      { error: errorMessage, success: null },
      { status: 400 }
    );
  }
  
  return redirect("/dashboard", {
    headers,
  });
}

export default function LoginRoute() {
  const { error, success } = useLoaderData<typeof loader>();
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <LoginForm error={error || undefined} success={success || undefined} />
    </div>
  );
}