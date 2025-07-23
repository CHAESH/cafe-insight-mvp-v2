import { data, type LoaderFunctionArgs } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "설정됨" : "없음",
    DATABASE_URL: process.env.DATABASE_URL ? "설정됨" : "없음",
  };
  
  let supabaseTest = { status: "실패", error: null };
  
  try {
    const [client] = makeServerClient(request);
    const { error } = await client.from('users').select('count').limit(1);
    
    if (!error) {
      supabaseTest = { status: "성공", error: null };
    } else {
      supabaseTest = { status: "실패", error: error.message };
    }
  } catch (e) {
    supabaseTest = { status: "실패", error: e.message };
  }
  
  return data({ env, supabaseTest });
}

export default function Debug() {
  const { env, supabaseTest } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">환경 디버깅</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">환경 변수</h2>
          <pre className="text-sm">
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Supabase 연결 테스트</h2>
          <pre className="text-sm">
            {JSON.stringify(supabaseTest, null, 2)}
          </pre>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>✅ 체크리스트:</p>
          <ul className="list-disc list-inside mt-2">
            <li>SUPABASE_URL이 https://로 시작하는지 확인</li>
            <li>SUPABASE_ANON_KEY가 설정되어 있는지 확인</li>
            <li>서버를 재시작했는지 확인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useLoaderData } from "react-router";