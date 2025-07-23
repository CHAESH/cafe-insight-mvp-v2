import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";

export default function TestNavigation() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">네비게이션 테스트</h1>
      
      <div className="space-y-8">
        {/* 기본 Link 테스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">1. 기본 Link 컴포넌트</h2>
          <div className="flex gap-4">
            <Link to="/auth/signup" className="text-blue-600 underline">
              회원가입 (기본 Link)
            </Link>
            <Link to="/auth/login" className="text-blue-600 underline">
              로그인 (기본 Link)
            </Link>
          </div>
        </div>

        {/* Button + Link 테스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">2. Button 안의 Link</h2>
          <div className="flex gap-4">
            <Button>
              <Link to="/auth/signup">회원가입 (Button 안의 Link)</Link>
            </Button>
            <Button variant="outline">
              <Link to="/auth/login">로그인 (Button 안의 Link)</Link>
            </Button>
          </div>
        </div>

        {/* Button asChild + Link 테스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">3. Button asChild + Link</h2>
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/auth/signup">회원가입 (Button asChild)</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth/login">로그인 (Button asChild)</Link>
            </Button>
          </div>
        </div>

        {/* a 태그 테스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">4. 일반 a 태그</h2>
          <div className="flex gap-4">
            <a href="/auth/signup" className="text-blue-600 underline">
              회원가입 (a 태그)
            </a>
            <a href="/auth/login" className="text-blue-600 underline">
              로그인 (a 태그)
            </a>
          </div>
        </div>

        {/* onClick 테스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">5. onClick 이벤트</h2>
          <div className="flex gap-4">
            <Button onClick={() => window.location.href = '/auth/signup'}>
              회원가입 (onClick)
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
              로그인 (onClick)
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          어떤 방법이 작동하는지 확인해주세요. 
          클릭했을 때 페이지가 이동하면 성공입니다.
        </p>
      </div>
    </div>
  );
}