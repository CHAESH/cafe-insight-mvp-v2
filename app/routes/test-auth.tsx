import { type ActionFunctionArgs, type LoaderFunctionArgs, data } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { Button } from "~/core/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  return data({ action: "none", data: null, error: null });
}

export async function action({ request }: ActionFunctionArgs) {
  const [client] = makeServerClient(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "signup") {
    const { data: authData, error } = await client.auth.signUp({
      email: "test@example.com",
      password: "testpassword123",
      options: {
        data: {
          cafe_name: "테스트 카페",
          region: "서울특별시"
        }
      }
    });
    
    return data({ action: "signup", data: authData, error });
  }
  
  if (action === "check") {
    const { data: { user }, error } = await client.auth.getUser();
    return data({ action: "check", user, error });
  }
  
  return data({ action: "none" });
}

export default function TestAuth() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Auth 테스트</h1>
      
      <div className="space-y-4">
        <Form method="post">
          <input type="hidden" name="action" value="signup" />
          <Button type="submit">테스트 회원가입</Button>
        </Form>
        
        <Form method="post">
          <input type="hidden" name="action" value="check" />
          <Button type="submit" variant="outline">현재 사용자 확인</Button>
        </Form>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">결과:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>💡 회원가입이 실패한다면:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Supabase Dashboard → Authentication → Providers → Email 활성화 확인</li>
            <li>Email confirmations 비활성화 확인</li>
            <li>Site URL이 http://localhost:5173 으로 설정되어 있는지 확인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { Form, useLoaderData } from "react-router";