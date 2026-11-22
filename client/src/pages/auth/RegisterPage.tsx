import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AuthShell from './AuthShell'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    console.log('register', values.email)
    await new Promise(r => setTimeout(r, 600))
    navigate('/onboarding')
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up your workspace in a few minutes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" autoComplete="name" placeholder="Your name"
          error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@business.com"
          error={errors.email?.message} {...register('email')} />
        <Input label="Password" type={show ? 'text' : 'password'} autoComplete="new-password"
          placeholder="At least 8 characters" error={errors.password?.message}
          right={
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          {...register('password')} />
        <Input label="Confirm password" type={show ? 'text' : 'password'} autoComplete="new-password"
          error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-600 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  )
}
