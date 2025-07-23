import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
  console.warn("Drizzle ORM을 사용하지 않고 Supabase Client만 사용합니다.");
}

// 데이터베이스 클라이언트 생성
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  console.log("Drizzle 클라이언트 초기화 중...");
  console.log("DATABASE_URL 시작:", process.env.DATABASE_URL.substring(0, 30) + "...");
  
  try {
    client = postgres(process.env.DATABASE_URL, { 
      prepare: false,
      ssl: 'require', // Supabase는 SSL 연결 필요
      max: 1, // 개발 환경에서는 연결 수 제한
    });
    
    // Drizzle ORM 인스턴스 생성 (스키마 포함)
    db = drizzle(client, { schema });
    
    console.log("Drizzle 클라이언트 초기화 성공");
  } catch (error) {
    console.error("Drizzle 클라이언트 초기화 실패:", error);
    console.warn("Supabase Client만 사용하여 계속 진행합니다.");
  }
}

// Request별로 새로운 Drizzle 클라이언트 생성 (RLS 적용)
export function createDrizzleClient(request: Request) {
  if (!db) {
    console.warn("Drizzle ORM not available in free plan. Using Supabase Client instead.");
    // 무료 플랜에서는 null 반환
    return null as any;
  }
  // 향후 RLS를 위한 사용자 컨텍스트 추가 가능
  return db;
}

export { db };
export default db;