// 페이지 스크린 작성 예시 - app/features/[feature]/screens/ 폴더에 배치

import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { json, useLoaderData, Form, redirect } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getUserFromRequest } from '~/core/lib/guards.server'
import { db } from '~/core/db/drizzle-client.server'
import { users } from '~/database.types'
import { eq } from 'drizzle-orm'
import { UserForm } from '../components/user-form'

// 메타 정보 정의
export const meta: MetaFunction = () => {
  return [
    { title: '사용자 프로필 - Cafe Insight' },
    { name: 'description', content: '사용자 프로필 정보를 관리합니다' }
  ]
}

// 데이터 로더 함수
export async function loader({ request }: LoaderFunctionArgs) {
  // 인증 확인
  const user = await getUserFromRequest(request)
  if (!user) {
    throw redirect('/login')
  }

  // 사용자 정보 조회
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!userData.length) {
    throw new Response('사용자를 찾을 수 없습니다', { status: 404 })
  }

  return json({ user: userData[0] })
}

// 페이지 컴포넌트
export default function UserProfileScreen() {
  const { user } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('profile.title', '프로필 관리')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('profile.description', '개인 정보를 수정할 수 있습니다')}
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 프로필 카드 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* 수정 폼 */}
        <div className="lg:col-span-2">
          <Form method="post" action="/api/users/update">
            <UserForm 
              userId={user.id}
              defaultValues={{
                name: user.name || '',
                email: user.email || ''
              }}
            />
          </Form>
        </div>
      </div>
    </div>
  )
}