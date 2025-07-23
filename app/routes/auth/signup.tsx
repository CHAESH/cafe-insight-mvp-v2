import { type ActionFunctionArgs, type LoaderFunctionArgs, data, redirect, useLoaderData } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { SignupForm } from "~/features/auth/components/signup-form";
import { getCurrentUser } from "~/core/lib/guards.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const [client] = makeServerClient(request);
  const user = await getCurrentUser(client);
  
  // 이미 로그인한 경우 대시보드로 리다이렉트
  if (user) {
    return redirect("/dashboard");
  }
  
  return data({ error: null, success: null });
}

export async function action({ request }: ActionFunctionArgs) {
  const [client, headers] = makeServerClient(request);
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const cafeName = formData.get("cafeName") as string;
  const region = formData.get("region") as string;
  const businessType = formData.get("businessType") as string;
  const phone = formData.get("phone") as string;
  
  // 유효성 검사
  if (!email || !password || !cafeName || !region) {
    return data(
      { error: "필수 정보를 모두 입력해주세요", success: null },
      { status: 400 }
    );
  }
  
  if (password !== confirmPassword) {
    return data(
      { error: "비밀번호가 일치하지 않습니다", success: null },
      { status: 400 }
    );
  }
  
  if (password.length < 8) {
    return data(
      { error: "비밀번호는 최소 8자 이상이어야 합니다", success: null },
      { status: 400 }
    );
  }
  
  try {
    // Supabase Auth에 사용자 생성 (메타데이터 포함)
    console.log("회원가입 시도:", { email, cafeName, region, businessType });
    
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL}/dashboard`,
        data: {
          cafe_name: cafeName,
          region,
          business_type: businessType,
          phone: phone || null,
        },
      },
    });
    
    console.log("Supabase signUp 응답:", { authData, authError });
    
    if (authError) {
      console.error("회원가입 오류 상세:", {
        error: authError,
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      
      if (authError.message.includes("already registered")) {
        return data(
          { error: "이미 등록된 이메일입니다", success: null },
          { status: 400 }
        );
      }
      return data(
        { error: `회원가입 중 오류가 발생했습니다: ${authError.message}`, success: null },
        { status: 400 }
      );
    }
    
    if (!authData.user) {
      return data(
        { error: "회원가입 중 오류가 발생했습니다", success: null },
        { status: 400 }
      );
    }
    
    // 🚨 Drizzle 관련 코드를 일단 주석처리하고 Auth만 테스트
    // 트리거가 자동으로 users 테이블에 데이터를 생성할 것입니다
    
    /*
    try {
      // 잠시 대기하여 트리거가 실행될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 추가 정보 업데이트
      await db.update(users)
        .set({
          cafeName,
          region,
          businessType: businessType as any,
          phone: phone || null,
          onboardingCompleted: true,
        })
        .where(eq(users.id, authData.user.id));
    } catch (error) {
      console.error("사용자 정보 업데이트 오류:", error);
      // 트리거로 생성은 되었을 수 있으므로 계속 진행
    }
    */
    
    // 회원가입 성공 - 로그인 페이지로 이동
    // (Supabase 이메일 확인 설정에 따라 바로 로그인이 안 될 수 있음)
    return redirect("/auth/login?success=signup");
  } catch (error) {
    console.error("회원가입 처리 중 예외 발생:", error);
    return data(
      { error: "회원가입 처리 중 오류가 발생했습니다", success: null },
      { status: 500 }
    );
  }
}

export default function SignupRoute() {
  const { error, success } = useLoaderData<typeof loader>();
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <SignupForm error={error || undefined} success={success || undefined} />
    </div>
  );
}