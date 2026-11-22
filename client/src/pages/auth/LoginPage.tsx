import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AuthShell from './AuthShell'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    console.log('login', values.email)
    await new Promise(r => setTimeout(r, 600))
    navigate('/dashboard')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your ExpiryGuard workspace.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" placeholder="you@business.com"
          error={errors.email?.message} {...register('email')} />
        <Input label="Password" type={show ? 'text' : 'password'} autoComplete="current-password"
          placeholder="At least 8 characters" error={errors.password?.message}
          right={
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          {...register('password')} />
        <div className="text-right text-sm">
          <a href="#" className="font-medium text-emerald-600 hover:underline">Forgot password?</a>
        </div>
        <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        New to ExpiryGuard?{' '}
        <Link to="/register" className="font-semibold text-emerald-600 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
