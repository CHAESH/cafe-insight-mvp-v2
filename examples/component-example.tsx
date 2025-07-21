// 컴포넌트 작성 예시 - 이 프로젝트의 표준 패턴

import { useState } from 'react'
import { Button } from '~/core/components/ui/button'
import { Input } from '~/core/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/core/components/ui/card'

// 타입 정의는 상단에
interface UserFormProps {
  userId?: string
  onSubmit: (data: UserFormData) => void
  isLoading?: boolean
}

interface UserFormData {
  name: string
  email: string
}

// 컴포넌트 정의
export function UserForm({ userId, onSubmit, isLoading = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{userId ? '사용자 정보 수정' : '새 사용자 등록'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              이름
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : (userId ? '수정하기' : '등록하기')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}