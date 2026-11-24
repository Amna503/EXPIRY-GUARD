export type TeamRole = 'Owner' | 'Manager' | 'Staff' | 'Viewer'

export type TeamStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamRole
  branch: string
  lastActive: string
  status: TeamStatus
}

// Demo team for the Team & Roles page. A real deployment replaces this with
// an invite flow backed by the auth service.
export const teamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'Ayesha Khan',
    email: 'ayesha@demo.example',
    role: 'Owner',
    branch: 'All branches',
    lastActive: '2026-11-24',
    status: 'ACTIVE',
  },
  {
    id: 't2',
    name: 'Bilal Ahmed',
    email: 'bilal@demo.example',
    role: 'Manager',
    branch: 'North Outlet',
    lastActive: '2026-11-23',
    status: 'ACTIVE',
  },
  {
    id: 't3',
    name: 'Hina Raza',
    email: 'hina@demo.example',
    role: 'Manager',
    branch: 'Riverside Store',
    lastActive: '2026-11-22',
    status: 'ACTIVE',
  },
  {
    id: 't4',
    name: 'Kamran Sheikh',
    email: 'kamran@demo.example',
    role: 'Staff',
    branch: 'Main Branch',
    lastActive: '2026-11-24',
    status: 'ACTIVE',
  },
  {
    id: 't5',
    name: 'Sana Iqbal',
    email: 'sana@demo.example',
    role: 'Staff',
    branch: 'Main Branch',
    lastActive: '2026-11-20',
    status: 'ACTIVE',
  },
  {
    id: 't6',
    name: 'Omar Farooq',
    email: 'omar@demo.example',
    role: 'Viewer',
    branch: 'All branches',
    lastActive: '2026-11-18',
    status: 'INVITED',
  },
  {
    id: 't7',
    name: 'Zoya Malik',
    email: 'zoya@demo.example',
    role: 'Staff',
    branch: 'Airport Kiosk',
    lastActive: '2026-11-12',
    status: 'SUSPENDED',
  },
]

export const rolePermissions: { role: TeamRole; summary: string; permissions: string[] }[] = [
  {
    role: 'Owner',
    summary: 'Full control of the account, billing and team.',
    permissions: ['Manage billing and subscription', 'Invite, change roles and remove members', 'All branch and stock actions'],
  },
  {
    role: 'Manager',
    summary: 'Runs day-to-day stock decisions for their branch.',
    permissions: ['Approve discounts and disposal', 'Receive, transfer and adjust stock', 'View analytics for their branch'],
  },
  {
    role: 'Staff',
    summary: 'Shop-floor tasks: receiving, picking and counting.',
    permissions: ['Receive stock and record batches', 'Pick orders using FEFO', 'Flag expired stock for disposal'],
  },
  {
    role: 'Viewer',
    summary: 'Read-only access to dashboards and reports.',
    permissions: ['View dashboard and expiry monitor', 'Export reports', 'No edits to stock or settings'],
  },
]
