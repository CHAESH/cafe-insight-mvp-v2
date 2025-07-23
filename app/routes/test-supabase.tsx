import { type LoaderFunctionArgs, data } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [client] = makeServerClient(request);
    
    // Supabase 연결 테스트
    const { data: testData, error: testError } = await client
      .from('users')
      .select('count')
      .limit(1);
    
    // Auth 상태 확인
    const { data: { user }, error: authError } = await client.auth.getUser();
    
    return data({
      supabaseUrl: process.env.SUPABASE_URL,
      connectionTest: {
        success: !testError,
        error: testError?.message || null,
        data: testData
      },
      authTest: {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message || null
      }
    });
  } catch (error) {
    return data({
      error: error instanceof Error ? error.message : 'Unknown error',
      supabaseUrl: process.env.SUPABASE_URL
    });
  }
}

export default function TestSupabase() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">환경 변수</h2>
          <pre className="text-sm">
            {JSON.stringify({ supabaseUrl: data.supabaseUrl }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">데이터베이스 연결 테스트</h2>
          <pre className="text-sm">
            {JSON.stringify(data.connectionTest, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth 테스트</h2>
          <pre className="text-sm">
            {JSON.stringify(data.authTest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

import { useLoaderData } from "react-router";