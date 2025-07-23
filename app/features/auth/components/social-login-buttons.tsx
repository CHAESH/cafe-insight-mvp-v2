import { Button } from "~/core/components/ui/button";
import { useState } from "react";

interface SocialLoginButtonsProps {
  redirectTo?: string;
}

export function SocialLoginButtons({ redirectTo = "/dashboard" }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    setIsLoading(provider);
    // 직접 라우트로 이동 (loader가 처리)
    window.location.href = `/auth/social/start/${provider}`;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            간편 로그인
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading !== null}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading === 'google' ? '로그인 중...' : '구글로 계속하기'}
      </Button>

      {/* 네이버 로그인 - 준비 중 */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#03C75A] hover:bg-[#02B351] text-white border-[#03C75A]"
        disabled={true}
        title="준비 중입니다"
      >
        <span className="mr-2 font-bold text-lg">N</span>
        네이버로 계속하기 (준비 중)
      </Button>

      {/* 카카오 로그인 - 사업자 등록 후 활성화 예정 */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black border-[#FEE500] opacity-50 cursor-not-allowed"
        disabled={true}
        title="준비 중입니다"
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 3C6.477 3 2 6.477 2 10.5c0 2.633 1.825 4.933 4.558 6.2-.2.755-.73 2.736-.838 3.155-.133.522.19.573.402.418.163-.12 2.61-1.77 3.67-2.49.395.055.798.083 1.208.083 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"
          />
        </svg>
        카카오로 계속하기 (준비 중)
      </Button>
    </div>
  );
}