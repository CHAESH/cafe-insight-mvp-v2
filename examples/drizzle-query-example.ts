// Drizzle ORM 쿼리 패턴 예시 - 카페인사이트 데이터베이스 작업

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, gte, lte, desc, asc, sql, inArray, isNull, or } from "drizzle-orm";
import { 
  users, 
  calculations, 
  calculationIngredients, 
  ingredients,
  aiCostTips,
  subscriptions,
  priceSubmissions 
} from "~/core/db/schema";

// Drizzle 클라이언트 생성 (서버 사이드 전용)
export function createDrizzleClient(request: Request) {
  // Supabase 연결 정보는 환경변수에서 가져옴
  const db = drizzle(postgres(process.env.DATABASE_URL!));
  return db;
}

// 1. 기본 CRUD 작업
export const calculationQueries = {
  // CREATE - 계산 데이터 생성
  async create(db: ReturnType<typeof createDrizzleClient>, data: {
    user_id: string;
    menu_name: string;
    menu_category: string;
    selling_price: number;
    total_cost: number;
    profit_margin: number;
  }) {
    const [calculation] = await db
      .insert(calculations)
      .values(data)
      .returning();
    
    return calculation;
  },

  // READ - 단일 계산 조회 (관계 포함)
  async findById(db: ReturnType<typeof createDrizzleClient>, id: string, userId: string) {
    const result = await db.query.calculations.findFirst({
      where: and(
        eq(calculations.id, id),
        eq(calculations.user_id, userId) // RLS 보완
      ),
      with: {
        calculation_ingredients: {
          with: {
            ingredient: true
          }
        },
        ai_cost_tips: {
          where: gte(aiCostTips.expires_at, new Date()),
          limit: 1,
          orderBy: [desc(aiCostTips.created_at)]
        }
      }
    });

    return result;
  },

  // UPDATE - 계산 수정
  async update(db: ReturnType<typeof createDrizzleClient>, id: string, userId: string, data: Partial<{
    menu_name: string;
    selling_price: number;
    total_cost: number;
    profit_margin: number;
  }>) {
    const [updated] = await db
      .update(calculations)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(and(
        eq(calculations.id, id),
        eq(calculations.user_id, userId)
      ))
      .returning();

    return updated;
  },

  // DELETE - 계산 삭제 (소프트 삭제)
  async softDelete(db: ReturnType<typeof createDrizzleClient>, id: string, userId: string) {
    const [deleted] = await db
      .update(calculations)
      .set({ 
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .where(and(
        eq(calculations.id, id),
        eq(calculations.user_id, userId),
        isNull(calculations.deleted_at)
      ))
      .returning();

    return deleted;
  }
};

// 2. 복잡한 쿼리 패턴
export const advancedQueries = {
  // 사용자의 월별 계산 통계
  async getMonthlyStats(db: ReturnType<typeof createDrizzleClient>, userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const stats = await db
      .select({
        total_calculations: sql<number>`count(*)`,
        avg_profit_margin: sql<number>`avg(${calculations.profit_margin})`,
        total_revenue: sql<number>`sum(${calculations.selling_price})`,
        total_cost: sql<number>`sum(${calculations.total_cost})`,
        category: calculations.menu_category,
      })
      .from(calculations)
      .where(and(
        eq(calculations.user_id, userId),
        gte(calculations.created_at, startDate),
        lte(calculations.created_at, endDate),
        isNull(calculations.deleted_at)
      ))
      .groupBy(calculations.menu_category);

    return stats;
  },

  // 인기 재료 TOP 10
  async getTopIngredients(db: ReturnType<typeof createDrizzleClient>, userId: string) {
    const topIngredients = await db
      .select({
        ingredient_id: calculationIngredients.ingredient_id,
        ingredient_name: ingredients.name,
        usage_count: sql<number>`count(distinct ${calculationIngredients.calculation_id})`,
        total_quantity: sql<number>`sum(${calculationIngredients.quantity})`,
        avg_unit_price: sql<number>`avg(${calculationIngredients.unit_price})`,
      })
      .from(calculationIngredients)
      .innerJoin(
        calculations,
        eq(calculationIngredients.calculation_id, calculations.id)
      )
      .leftJoin(
        ingredients,
        eq(calculationIngredients.ingredient_id, ingredients.id)
      )
      .where(and(
        eq(calculations.user_id, userId),
        isNull(calculations.deleted_at)
      ))
      .groupBy(calculationIngredients.ingredient_id, ingredients.name)
      .orderBy(desc(sql`count(distinct ${calculationIngredients.calculation_id})`))
      .limit(10);

    return topIngredients;
  },

  // AI 팁이 있는 계산 목록 (페이지네이션)
  async getCalculationsWithAITips(
    db: ReturnType<typeof createDrizzleClient>, 
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      // 데이터 조회
      db.query.calculations.findMany({
        where: and(
          eq(calculations.user_id, userId),
          eq(calculations.has_ai_tips, true),
          isNull(calculations.deleted_at)
        ),
        with: {
          ai_cost_tips: {
            where: gte(aiCostTips.expires_at, new Date()),
            orderBy: [desc(aiCostTips.created_at)],
            limit: 1
          }
        },
        orderBy: [desc(calculations.created_at)],
        limit,
        offset
      }),
      
      // 전체 개수
      db
        .select({ count: sql<number>`count(*)` })
        .from(calculations)
        .where(and(
          eq(calculations.user_id, userId),
          eq(calculations.has_ai_tips, true),
          isNull(calculations.deleted_at)
        ))
    ]);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    };
  }
};

// 3. 트랜잭션 패턴
export const transactionQueries = {
  // 계산 및 재료 일괄 생성
  async createCalculationWithIngredients(
    db: ReturnType<typeof createDrizzleClient>,
    calculationData: {
      user_id: string;
      menu_name: string;
      menu_category: string;
      selling_price: number;
    },
    ingredientsData: Array<{
      ingredient_id?: string;
      custom_ingredient_name?: string;
      quantity: number;
      unit: string;
      unit_price: number;
    }>
  ) {
    // 트랜잭션 시작
    return await db.transaction(async (tx) => {
      // 1. 총 원가 계산
      const totalCost = ingredientsData.reduce(
        (sum, ing) => sum + (ing.quantity * ing.unit_price), 
        0
      );
      
      // 2. 마진율 계산
      const profitMargin = ((calculationData.selling_price - totalCost) / calculationData.selling_price) * 100;

      // 3. 계산 데이터 생성
      const [calculation] = await tx
        .insert(calculations)
        .values({
          ...calculationData,
          total_cost: totalCost,
          profit_margin: profitMargin,
          has_ai_tips: false
        })
        .returning();

      // 4. 재료 데이터 일괄 생성
      if (ingredientsData.length > 0) {
        await tx
          .insert(calculationIngredients)
          .values(
            ingredientsData.map(ing => ({
              calculation_id: calculation.id,
              ...ing
            }))
          );
      }

      // 5. 사용자 통계 업데이트
      await tx
        .update(users)
        .set({
          total_calculations: sql`${users.total_calculations} + 1`,
          updated_at: new Date()
        })
        .where(eq(users.id, calculationData.user_id));

      return calculation;
    });
  }
};

// 4. 검색 및 필터링 패턴
export const searchQueries = {
  // 다중 조건 검색
  async searchCalculations(
    db: ReturnType<typeof createDrizzleClient>,
    userId: string,
    filters: {
      search?: string;
      category?: string;
      minMargin?: number;
      maxMargin?: number;
      startDate?: Date;
      endDate?: Date;
      hasAITips?: boolean;
      sortBy?: 'created_at' | 'menu_name' | 'profit_margin';
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    // 동적 WHERE 조건 생성
    const conditions = [
      eq(calculations.user_id, userId),
      isNull(calculations.deleted_at)
    ];

    if (filters.search) {
      conditions.push(
        or(
          sql`${calculations.menu_name} ILIKE ${`%${filters.search}%`}`,
          sql`${calculations.menu_description} ILIKE ${`%${filters.search}%`}`
        )
      );
    }

    if (filters.category) {
      conditions.push(eq(calculations.menu_category, filters.category));
    }

    if (filters.minMargin !== undefined) {
      conditions.push(gte(calculations.profit_margin, filters.minMargin));
    }

    if (filters.maxMargin !== undefined) {
      conditions.push(lte(calculations.profit_margin, filters.maxMargin));
    }

    if (filters.startDate) {
      conditions.push(gte(calculations.created_at, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(calculations.created_at, filters.endDate));
    }

    if (filters.hasAITips !== undefined) {
      conditions.push(eq(calculations.has_ai_tips, filters.hasAITips));
    }

    // 정렬 설정
    const orderByColumn = filters.sortBy || 'created_at';
    const orderByDirection = filters.sortOrder === 'asc' ? asc : desc;

    return await db.query.calculations.findMany({
      where: and(...conditions),
      orderBy: [orderByDirection(calculations[orderByColumn])],
      with: {
        calculation_ingredients: {
          with: {
            ingredient: true
          }
        }
      }
    });
  }
};

// 5. 집계 및 분석 쿼리
export const analyticsQueries = {
  // 카테고리별 평균 마진율 및 베스트 메뉴
  async getCategoryAnalytics(db: ReturnType<typeof createDrizzleClient>, userId: string) {
    const analytics = await db
      .select({
        category: calculations.menu_category,
        avg_margin: sql<number>`avg(${calculations.profit_margin})`,
        min_margin: sql<number>`min(${calculations.profit_margin})`,
        max_margin: sql<number>`max(${calculations.profit_margin})`,
        menu_count: sql<number>`count(*)`,
        best_menu: sql<string>`
          (SELECT menu_name 
           FROM ${calculations} c2 
           WHERE c2.menu_category = ${calculations.menu_category} 
           AND c2.user_id = ${userId}
           AND c2.deleted_at IS NULL
           ORDER BY c2.profit_margin DESC 
           LIMIT 1)
        `,
      })
      .from(calculations)
      .where(and(
        eq(calculations.user_id, userId),
        isNull(calculations.deleted_at)
      ))
      .groupBy(calculations.menu_category);

    return analytics;
  },

  // 재료 가격 변동 추이
  async getIngredientPriceTrend(
    db: ReturnType<typeof createDrizzleClient>, 
    ingredientId: string, 
    days: number = 30
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const priceTrend = await db
      .select({
        date: sql<string>`DATE(${priceSubmissions.created_at})`,
        avg_price: sql<number>`avg(${priceSubmissions.unit_price})`,
        min_price: sql<number>`min(${priceSubmissions.unit_price})`,
        max_price: sql<number>`max(${priceSubmissions.unit_price})`,
        submission_count: sql<number>`count(*)`,
      })
      .from(priceSubmissions)
      .where(and(
        eq(priceSubmissions.ingredient_id, ingredientId),
        gte(priceSubmissions.created_at, startDate),
        eq(priceSubmissions.is_verified, true)
      ))
      .groupBy(sql`DATE(${priceSubmissions.created_at})`)
      .orderBy(asc(sql`DATE(${priceSubmissions.created_at})`));

    return priceTrend;
  }
};