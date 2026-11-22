import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Store, UtensilsCrossed, Pill, Warehouse, ShoppingBasket, Check } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your business name'),
    type: z.enum(['SUPERMARKET', 'RESTAURANT', 'PHARMACY', 'WAREHOUSE', 'SMALL_SHOP']),
    timezone: z.string().min(1, 'Choose a timezone'),
    currency: z.string().min(1, 'Choose a currency'),
    branchName: z.string().min(2, 'Enter a branch name'),
    city: z.string(),
    monitorDays: z.number({ message: 'Enter a number' }).int().min(2, 'Use at least 2 days').max(365, 'Use 365 days or less'),
    soonDays: z.number({ message: 'Enter a number' }).int().min(1, 'Use at least 1 day').max(90, 'Use 90 days or less'),
  })
  .refine(d => d.soonDays < d.monitorDays, {
    message: 'Must be smaller than the Monitor days',
    path: ['soonDays'],
  })
type FormValues = z.infer<typeof schema>

const businessTypes = [
  { value: 'SUPERMARKET', label: 'Supermarket', icon: Store },
  { value: 'RESTAURANT', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'PHARMACY', label: 'Pharmacy', icon: Pill },
  { value: 'WAREHOUSE', label: 'Warehouse', icon: Warehouse },
  { value: 'SMALL_SHOP', label: 'Small shop', icon: ShoppingBasket },
] as const

const timezones = [
  { value: 'Asia/Karachi', label: 'Pakistan (Asia/Karachi)' },
  { value: 'Asia/Dubai', label: 'UAE (Asia/Dubai)' },
  { value: 'Asia/Kolkata', label: 'India (Asia/Kolkata)' },
  { value: 'Europe/London', label: 'UK (Europe/London)' },
  { value: 'America/New_York', label: 'US East (America/New_York)' },
  { value: 'UTC', label: 'UTC' },
]

const currencies = [
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'INR', label: 'INR - Indian Rupee' },
]

const stepTitles = ['Business', 'Region', 'Branch', 'Alerts']

const stepFields: FieldPath<FormValues>[][] = [
  ['name', 'type'],
  ['timezone', 'currency'],
  ['branchName', 'city'],
  ['monitorDays', 'soonDays'],
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const last = stepTitles.length - 1

  const { register, handleSubmit, trigger, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      mode: 'onTouched',
      defaultValues: {
        name: '', type: 'SUPERMARKET', timezone: 'Asia/Karachi', currency: 'PKR',
        branchName: 'Main Branch', city: '', monitorDays: 30, soonDays: 7,
      },
    })

  const type = watch('type')
  const monitorDays = watch('monitorDays')
  const soonDays = watch('soonDays')

  const next = async () => {
    const ok = await trigger(stepFields[step])
    if (ok) setStep(s => s + 1)
  }

  const onFinish = async (values: FormValues) => {
    console.log('onboarding', values)
    await new Promise(r => setTimeout(r, 600))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4 text-lg font-bold">
          <ShieldCheck className="text-emerald-500" aria-hidden /> ExpiryGuard
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Set up your workspace</h1>
        <p className="mb-8 mt-1 text-sm text-[var(--muted)]">It takes about a minute. You can change everything later in Settings.</p>

        {/* Stepper */}
        <ol className="mb-8 flex items-center">
          {stepTitles.map((t, i) => (
            <li key={t} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    i < step && 'bg-emerald-600 text-white',
                    i === step && 'bg-navy-900 text-white dark:bg-emerald-600',
                    i > step && 'border border-[var(--border)] text-[var(--muted)]',
                  )}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i < step ? <Check size={16} aria-hidden /> : i + 1}
                </span>
                <span className={clsx('hidden text-sm font-medium sm:inline', i > step && 'text-[var(--muted)]')}>{t}</span>
              </div>
              {i < last && <div className={clsx('mx-3 h-px flex-1', i < step ? 'bg-emerald-600' : 'bg-[var(--border)]')} />}
            </li>
          ))}
        </ol>

        <Card className="p-6">
          <form
            noValidate
            onSubmit={e => {
              e.preventDefault()
              if (step < last) next()
              else handleSubmit(onFinish)(e)
            }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <Input label="Business name" placeholder="e.g. Fresh Mart" error={errors.name?.message} {...register('name')} />
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Business type</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {businessTypes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('type', value, { shouldValidate: true })}
                        aria-pressed={type === value}
                        className={clsx(
                          'flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition',
                          type === value
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : 'border-[var(--border)] hover:bg-slate-50 dark:hover:bg-white/5',
                        )}
                      >
                        <Icon size={18} aria-hidden /> {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 1 && (
              <>
                <Select label="Timezone" options={timezones} error={errors.timezone?.message} {...register('timezone')} />
                <Select label="Currency" options={currencies} error={errors.currency?.message} {...register('currency')} />
                <p className="text-xs text-[var(--muted)]">Expiry days are counted using your business timezone.</p>
              </>
            )}

            {step === 2 && (
              <>
                <Input label="First branch name" error={errors.branchName?.message} {...register('branchName')} />
                <Input label="City (optional)" placeholder="e.g. Faisalabad" error={errors.city?.message} {...register('city')} />
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Monitor window (days)" type="number" error={errors.monitorDays?.message}
                    {...register('monitorDays', { valueAsNumber: true })} />
                  <Input label="Expiring soon window (days)" type="number" error={errors.soonDays?.message}
                    {...register('soonDays', { valueAsNumber: true })} />
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
                  <p className="mb-2 font-semibold">How your batches will be labelled</p>
                  <ul className="space-y-1 text-[var(--muted)]">
                    <li>Safe: more than {Number.isFinite(monitorDays) ? monitorDays : '-'} days left</li>
                    <li>Monitor: {Number.isFinite(soonDays) ? soonDays + 1 : '-'} to {Number.isFinite(monitorDays) ? monitorDays : '-'} days left</li>
                    <li>Expiring soon: 1 to {Number.isFinite(soonDays) ? soonDays : '-'} days left</li>
                    <li>Expires today: 0 days left</li>
                    <li>Expired: past the expiry date</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
              {step < last ? (
                <Button type="submit">Continue</Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating workspace...' : 'Finish setup'}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
