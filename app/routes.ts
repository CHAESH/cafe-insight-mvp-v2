/**
 * 카페인사이트 Routes Configuration
 * 
 * React Router v7 기반 카페인사이트 MVP 라우팅 설정
 * - 모바일 우선 PWA 지원
 * - AI 기반 원가계산 및 인사이트 기능
 */
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/robots.txt", "core/screens/robots.ts"),
  route("/sitemap.xml", "core/screens/sitemap.ts"),
  
  // API Routes - AI 및 결제 API
  ...prefix("/api", [
    ...prefix("/settings", [
      route("/theme", "features/settings/api/set-theme.tsx"),
      route("/locale", "features/settings/api/set-locale.tsx"),
    ]),
    ...prefix("/users", [
      index("features/users/api/delete-account.tsx"),
      route("/password", "features/users/api/change-password.tsx"),
      route("/email", "features/users/api/change-email.tsx"),
      route("/profile", "features/users/api/edit-profile.tsx"),
      route("/providers", "features/users/api/connect-provider.tsx"),
      route(
        "/providers/:provider",
        "features/users/api/disconnect-provider.tsx",
      ),
    ]),
    // 카페인사이트 전용 API
    ...prefix("/calculations", [
      route("/ai-tips", "features/calculations/api/ai-tips.tsx"),
    ]),
    ...prefix("/payments", [
      route("/toss", "features/payments/api/toss.tsx"),
    ]),
  ]),

  layout("core/layouts/navigation.layout.tsx", [
    route("/auth/confirm", "features/auth/screens/confirm.tsx"),
    index("routes/_index.tsx"),
    route("/error", "core/screens/error.tsx"),
    
    // 테스트 라우트
    route("/test-auth", "routes/test-auth.tsx"),
    route("/debug", "routes/debug.tsx"),
    route("/test-supabase", "routes/test-supabase.tsx"),
    route("/test-navigation", "routes/test-navigation.tsx"),
    
    layout("core/layouts/public.layout.tsx", [
      // 로그인하지 않은 사용자용 라우트
      ...prefix("/auth", [
        route("/login", "routes/auth/login.tsx"),
        route("/signup", "routes/auth/signup.tsx"),
        route("/api/resend", "features/auth/api/resend.tsx"),
        route(
          "/forgot-password/reset",
          "features/auth/screens/forgot-password.tsx",
        ),
        route("/magic-link", "features/auth/screens/magic-link.tsx"),
        ...prefix("/otp", [
          route("/start", "features/auth/screens/otp/start.tsx"),
          route("/complete", "features/auth/screens/otp/complete.tsx"),
        ]),
        ...prefix("/social", [
          route("/start/:provider", "features/auth/screens/social/start.tsx"),
          route(
            "/complete/:provider",
            "features/auth/screens/social/complete.tsx",
          ),
          route(
            "/complete-profile",
            "features/auth/screens/social/complete-profile.tsx",
          ),
        ]),
      ]),
    ]),
    
    layout("core/layouts/private.layout.tsx", { id: "private-auth" }, [
      ...prefix("/auth", [
        route(
          "/forgot-password/create",
          "features/auth/screens/new-password.tsx",
        ),
        route("/email-verified", "features/auth/screens/email-verified.tsx"),
      ]),
      route("/logout", "features/auth/screens/logout.tsx"),
    ]),
    
    // 결제 관련 라우트 - Task 6에서 구현 예정
    // ...prefix("/payments", [
    //   route("/checkout", "features/payments/screens/checkout.tsx"),
    //   layout("core/layouts/private.layout.tsx", { id: "private-payments" }, [
    //     route("/success", "features/payments/screens/success.tsx"),
    //     route("/failure", "features/payments/screens/failure.tsx"),
    //   ]),
    // ]),
  ]),

  // 인증된 사용자 전용 - 카페인사이트 메인 기능
  layout("core/layouts/private.layout.tsx", { id: "private-dashboard" }, [
    // layout("features/users/layouts/dashboard.layout.tsx", [
      route("/dashboard", "routes/dashboard.tsx"),
      
      // 원가계산 기능
      ...prefix("/calculations", [
        index("routes/calculations/_index.tsx"),
        route("/new", "routes/calculations/new.tsx"),
        route("/:id", "routes/calculations/$id.tsx"),
      ]),
      
      // 사용자 계정 관리 - 추후 구현
      // route("/account/edit", "features/users/screens/account.tsx"),
      
      // 구독 관리 - Task 6에서 구현 예정
      // route("/subscription", "features/payments/screens/subscription.tsx"),
    // ]),
  ]),
] satisfies RouteConfig;
