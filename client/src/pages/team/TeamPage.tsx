import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AtSign, Mail, ShieldCheck, Trash2, UserPlus, Users, UserCog, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/toast'
import { rolePermissions, teamMembers } from '@/data/mockTeam'
import type { TeamMember, TeamRole, TeamStatus } from '@/data/mockTeam'

const statusMeta: Record<TeamStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  INVITED: { label: 'Invited', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
}

const roleOptions: { value: TeamRole; label: string }[] = [
  { value: 'Owner', label: 'Owner' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Viewer', label: 'Viewer' },
]

const avatarTones = [
  'bg-emerald-600',
  'bg-sky-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
]

function initials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TeamPage() {
  const toast = useToast()
  const [members, setMembers] = useState<TeamMember[]>(teamMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('Staff')
  const [inviteBranch, setInviteBranch] = useState('Main Branch')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const stats = useMemo(
    () => ({
      total: members.length,
      active: members.filter(m => m.status === 'ACTIVE').length,
      managers: members.filter(m => m.role === 'Manager' || m.role === 'Owner').length,
      pending: members.filter(m => m.status === 'INVITED').length,
    }),
    [members],
  )

  const changeRole = (id: string, role: TeamRole) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, role } : m)))
    const member = members.find(m => m.id === id)
    toast.push('success', `${member?.name ?? 'Member'} is now ${role}`)
  }

  const submitInvite = (event: FormEvent) => {
    event.preventDefault()
    const name = inviteName.trim()
    const email = inviteEmail.trim().toLowerCase()
    if (name.length < 2) {
      setInviteError('Enter the member’s full name')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError('Enter a valid email address')
      return
    }
    if (members.some(m => m.email.toLowerCase() === email)) {
      setInviteError('This email is already on the team')
      return
    }
    setMembers(prev => [
      ...prev,
      {
        id: `t${Date.now()}`,
        name,
        email,
        role: inviteRole,
        branch: inviteBranch,
        lastActive: '—',
        status: 'INVITED',
      },
    ])
    setInviteName('')
    setInviteEmail('')
    setInviteRole('Staff')
    setInviteBranch('Main Branch')
    setInviteError(null)
    setInviteOpen(false)
    toast.push('success', `Invitation sent to ${email}`)
  }

  const confirmRemove = () => {
    if (!removeTarget) return
    setMembers(prev => prev.filter(m => m.id !== removeTarget.id))
    toast.push('success', `${removeTarget.name} removed from the team`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team &amp; Roles</h1>
          <p className="text-sm text-[var(--muted)]">
            Who can see and change stock. Roles decide which actions each person is allowed to take.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus size={16} aria-hidden /> Invite member
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Members" value={stats.total} hint="Including invited" icon={Users} tone="sky" />
        <KpiCard label="Active" value={stats.active} hint="Signed in recently" icon={ShieldCheck} tone="emerald" />
        <KpiCard label="Managers & owners" value={stats.managers} hint="Can approve actions" icon={UserCog} tone="purple" />
        <KpiCard label="Pending invites" value={stats.pending} hint="Not accepted yet" icon={Mail} tone="amber" />
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No team members"
          message="Invite the people who receive, pick and check stock for you."
          action={<Button onClick={() => setInviteOpen(true)}>Invite member</Button>}
        />
      ) : (
        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="font-semibold">Members</h2>
            <p className="text-sm text-[var(--muted)]">Change a role from the dropdown — it applies immediately.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Branch</th>
                  <th className="px-5 py-3 font-semibold">Last active</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={member.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarTones[index % avatarTones.length]}`}
                          aria-hidden
                        >
                          {initials(member.name)}
                        </span>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                            <AtSign size={12} aria-hidden /> {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        label={`Role for ${member.name}`}
                        labelHidden
                        className="w-36"
                        value={member.role}
                        onChange={event => changeRole(member.id, event.target.value as TeamRole)}
                        options={roleOptions}
                      />
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">{member.branch}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">{member.lastActive}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta[member.status].cls}`}>
                        {statusMeta[member.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${member.name}`}
                        disabled={member.role === 'Owner'}
                        title={member.role === 'Owner' ? 'The owner cannot be removed' : `Remove ${member.name}`}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10"
                        onClick={() => setRemoveTarget(member)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
            Showing {members.length} team members
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-1 text-lg font-semibold">Roles &amp; permissions</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">What each role is allowed to do in ExpiryGuard.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rolePermissions.map(({ role, summary, permissions }) => (
            <Card key={role}>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <ShieldCheck size={16} aria-hidden />
                </span>
                <h3 className="font-semibold">{role}</h3>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">{summary}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted)]">
                {permissions.map(permission => (
                  <li key={permission} className="flex gap-2">
                    <GitBranch size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite member"
        description="They receive an email invitation and pick their own password."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" form="invite-form">Send invitation</Button>
          </>
        }
      >
        <form id="invite-form" onSubmit={submitInvite} className="space-y-4">
          <Input
            label="Full name"
            name="invite-name"
            placeholder="Sara Ahmed"
            value={inviteName}
            onChange={event => setInviteName(event.target.value)}
            autoComplete="off"
          />
          <Input
            label="Email"
            name="invite-email"
            type="email"
            placeholder="sara@demo.example"
            value={inviteEmail}
            onChange={event => setInviteEmail(event.target.value)}
            autoComplete="off"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              name="invite-role"
              value={inviteRole}
              onChange={event => setInviteRole(event.target.value as TeamRole)}
              options={roleOptions}
            />
            <Select
              label="Branch"
              name="invite-branch"
              value={inviteBranch}
              onChange={event => setInviteBranch(event.target.value)}
              options={[
                { value: 'Main Branch', label: 'Main Branch' },
                { value: 'North Outlet', label: 'North Outlet' },
                { value: 'Riverside Store', label: 'Riverside Store' },
                { value: 'Airport Kiosk', label: 'Airport Kiosk' },
                { value: 'All branches', label: 'All branches' },
              ]}
            />
          </div>
          {inviteError && <p role="alert" className="text-sm text-red-600">{inviteError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove team member?"
        message={
          removeTarget
            ? `${removeTarget.name} (${removeTarget.email}) will lose access immediately. Their past activity stays in the audit log.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  )
}
