import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@mashsia/ui"
import {
  MdDashboard,
  MdShoppingCart,
  MdAnalytics,
  MdPeople,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
} from 'react-icons/md'

export function AppSidebar() {
  const [openUser, setOpenUser] = useState(false)
  const { user, logout } = useAuthStore()

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'orders', label: 'Orders', icon: MdShoppingCart },
    { id: 'reports', label: 'Reports', icon: MdAnalytics },
    { id: 'staff', label: 'Staff', icon: MdPeople },
    { id: 'settings', label: 'Settings', icon: MdSettings },
  ]

  return (
    <Sidebar className="border-r h-lvh border-slate-800 bg-slate-950">
      {/* Header - Brand & Logo */}
      <SidebarHeader className="border-b border-slate-800 from-slate-900 to-slate-950">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg from-blue-500 to-blue-600 text-white font-bold text-lg">
            M
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Mashsia</h2>
            <p className="text-xs text-slate-400">POS System</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content - Flex between layout */}
      <SidebarContent className="bg-slate-950 px-2 py-4 flex flex-col justify-between overflow-hidden flex-1">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 uppercase tracking-wider text-xs font-semibold px-2 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      className="flex gap-3 px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      title={item.label}
                    >
                      <Icon className="h-5 w-5 text-slate-400" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Spacer - pushes footer to bottom */}
        <div className="flex-1" />
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter className="  bg-slate-900/50 px-2 py-4">
        <div className="relative">
          <button
            onClick={() => setOpenUser(!openUser)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full  from-slate-600 to-slate-700 text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <MdKeyboardArrowDown className={`h-5 w-5 text-slate-400 transition-transform ${openUser ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {openUser && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2">
                <MdSettings className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={() => {
                  logout()
                  setOpenUser(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <MdLogout className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}