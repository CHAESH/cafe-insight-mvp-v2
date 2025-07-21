// API 라우트 작성 예시 - app/features/[feature]/api/ 폴더에 배치

import type { ActionFunctionArgs } from 'react-router'
import { json } from 'react-router'
import { z } from 'zod'
import { getUserFromRequest } from '~/core/lib/guards.server'
import { db } from '~/core/db/drizzle-client.server'
import { users } from '~/database.types'
import { eq } from 'drizzle-orm'

// 유효성 검사 스키마 정의
const updateUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다')
})

export async function action({ request }: ActionFunctionArgs) {
  // 1. 인증 확인 (필수)
  const user = await getUserFromRequest(request)
  if (!user) {
    return json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  try {
    // 2. 요청 데이터 파싱 및 검증
    const formData = await request.formData()
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email')
    }

    const validatedData = updateUserSchema.parse(rawData)

    // 3. 데이터베이스 작업
    const updatedUser = await db
      .update(users)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning()

    // 4. 성공 응답
    return json({ 
      success: true, 
      user: updatedUser[0],
      message: '사용자 정보가 성공적으로 업데이트되었습니다'
    })

  } catch (error) {
    // 5. 에러 처리
    console.error('사용자 업데이트 에러:', error)
    
    if (error instanceof z.ZodError) {
      return json({ 
        error: '입력 데이터가 올바르지 않습니다',
        details: error.errors 
      }, { status: 400 })
    }

    return json({ 
      error: '사용자 정보 업데이트에 실패했습니다' 
    }, { status: 500 })
  }
}