import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiActivity,
  FiBarChart2,
  FiBox,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiFlag,
  FiFolder,
  FiGlobe,
  FiHelpCircle,
  FiLink2,
  FiMoreHorizontal,
  FiSearch,
  FiSettings,
  FiShield,
} from 'react-icons/fi'
import { CiCirclePlus } from 'react-icons/ci'
import { IoExitOutline } from 'react-icons/io5'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'
import type { ProfileUser, SidebarItem } from './types'
import type { ThemeMode } from '../../theme/ThemeContext'

const sidebarItems: SidebarItem[] = [
  { label: 'Find…', icon: FiSearch, shortcut: 'F' },
  { label: 'Projects', icon: FiFolder },
  { label: 'Analytics', icon: FiBarChart2 },
  { label: 'Speed Insights', icon: FiActivity },
  { label: 'Observability', icon: FiActivity },
  { label: 'Firewall', icon: FiShield },
  { label: 'Domains', icon: FiGlobe },
  { label: 'Integrations', icon: FiLink2 },
  { label: 'Storage', icon: FiDatabase },
  { label: 'Flags', icon: FiFlag },
  { label: 'Agent', icon: FiCpu },
  { label: 'AI Gateway', icon: FiCloud },
  { label: 'Sandboxes', icon: FiBox },
  { label: 'Usage', icon: FiBarChart2 },
  { label: 'Support', icon: FiHelpCircle },
  { label: 'Settings', icon: FiSettings },
]

type DashboardSidebarProps = {
  isDarkTheme: boolean
  isMobileOpen: boolean
  profileUser: ProfileUser | null
  profileAvatar?: string
  activeItemLabel: string
  isProfileModalOpen: boolean
  profileModalRef: React.RefObject<HTMLDivElement | null>
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  onOpenFind: () => void
  onSelectSidebarItem: (label: string) => void
  onGoDashboard: () => void
  onCloseMobileSidebar: () => void
  onToggleProfileModal: () => void
  onCloseProfileModal: () => void
  onLogout: () => void
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isDarkTheme,
  isMobileOpen,
  profileUser,
  profileAvatar,
  activeItemLabel,
  isProfileModalOpen,
  profileModalRef,
  themeMode,
  setThemeMode,
  onOpenFind,
  onSelectSidebarItem,
  onGoDashboard,
  onCloseMobileSidebar,
  onToggleProfileModal,
  onCloseProfileModal,
  onLogout,
}) => {
  return (
    <aside className={isDarkTheme
      ? `tw-fixed tw-inset-y-0 tw-left-0 tw-z-50 tw-flex tw-h-screen tw-w-[17rem] tw-transform tw-flex-col tw-border-r tw-border-md-neutral-30 tw-bg-md-neutral-12 tw-p-4 tw-transition-transform md:tw-static md:tw-z-auto md:tw-w-[19rem] md:tw-translate-x-0 ${isMobileOpen ? 'tw-translate-x-0' : '-tw-translate-x-full'}`
      : `tw-fixed tw-inset-y-0 tw-left-0 tw-z-50 tw-flex tw-h-screen tw-w-[17rem] tw-transform tw-flex-col tw-border-r tw-border-md-neutral-80 tw-bg-md-neutral-99 tw-p-4 tw-transition-transform md:tw-static md:tw-z-auto md:tw-w-[19rem] md:tw-translate-x-0 ${isMobileOpen ? 'tw-translate-x-0' : '-tw-translate-x-full'}`}
      data-dashboard-sidebar="true"
    >
      <div className={isDarkTheme ? 'tw-rounded-lg tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-p-3' : 'tw-rounded-lg tw-border tw-border-md-neutral-80 tw-bg-md-neutral-98 tw-p-3'}>
        <div className="tw-flex tw-items-center tw-gap-2.5">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt="User avatar"
              className="tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-white/30 tw-object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-white/30 tw-bg-gradient-to-br tw-from-blue-500 tw-via-fuchsia-500 tw-to-amber-300"
            />
          )}
          <p className={isDarkTheme ? 'tw-text-sm tw-font-semibold tw-text-white' : 'tw-text-sm tw-font-semibold tw-text-md-neutral-10'}>{profileUser?.userName ?? 'codewithatith'}</p>
        </div>
      </div>

      <div className="tw-mt-4 tw-flex-1 tw-space-y-1.5 tw-overflow-y-auto tw-scrollbar-none tw-pr-1">
        {sidebarItems.map((item) => {
          const ItemIcon = item.icon
          const isActive = activeItemLabel === item.label
          const isFindButton = item.label === 'Find…'
          const hasDividerBelow = item.label === 'Firewall' || item.label === 'Sandboxes'

          return (
            <React.Fragment key={item.label}>
              <button
                type="button"
                onClick={() => {
                  if (isFindButton) {
                    onOpenFind()
                    onCloseMobileSidebar()
                    return
                  }

                  onSelectSidebarItem(item.label)
                  onCloseMobileSidebar()
                }}
                aria-current={isActive ? 'page' : undefined}
                className={isDarkTheme
                  ? `tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2.5 tw-text-left ${isFindButton ? 'tw-mb-3 tw-border tw-border-white/25' : ''} ${isActive ? 'tw-bg-white/15' : 'hover:tw-bg-white/10'}`
                  : `tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2.5 tw-text-left ${isFindButton ? 'tw-mb-3 tw-border tw-border-md-neutral-80' : ''} ${isActive ? 'tw-bg-md-neutral-95' : 'hover:tw-bg-md-neutral-98'}`}
              >
                <span className="tw-flex tw-items-center tw-gap-2.5">
                  <ItemIcon className={isDarkTheme ? (isActive ? 'tw-text-[14px] md:tw-text-[14.5px] tw-text-white' : 'tw-text-[14px] md:tw-text-[14.5px] tw-text-md-neutral-80') : (isActive ? 'tw-text-[14px] md:tw-text-[14.5px] tw-text-md-neutral-10' : 'tw-text-[14px] md:tw-text-[14.5px] tw-text-md-neutral-50')} />
                  <span className={isDarkTheme ? (isActive ? 'tw-text-[14px] md:tw-text-[14.5px] tw-font-bold tw-text-white' : 'tw-text-[14px] md:tw-text-[14.5px] tw-font-semibold tw-text-md-neutral-80') : (isActive ? 'tw-text-[14px] md:tw-text-[14.5px] tw-font-bold tw-text-md-neutral-10' : 'tw-text-[14px] md:tw-text-[14.5px] tw-font-semibold tw-text-md-neutral-50')}>{item.label}</span>
                </span>
                {item.shortcut && (
                  <span className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/25 tw-bg-black tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-md-neutral-80' : 'tw-rounded-md tw-border tw-border-md-neutral-80 tw-bg-md-neutral-99 tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-md-neutral-50'}>
                    {item.shortcut}
                  </span>
                )}
              </button>
              {hasDividerBelow && (
                <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-white/15' : 'tw-my-1 tw-h-px tw-bg-md-neutral-80'} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div className={isDarkTheme ? 'tw-relative tw-mt-3 tw-rounded-lg tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-p-3' : 'tw-relative tw-mt-3 tw-rounded-lg tw-border tw-border-md-neutral-80 tw-bg-md-neutral-98 tw-p-3'} ref={profileModalRef}>
        <div className={isDarkTheme ? 'tw-flex tw-items-center tw-gap-2.5 tw-rounded-lg tw-border tw-border-md-neutral-40 tw-bg-md-neutral-25 tw-p-3' : 'tw-flex tw-items-center tw-gap-2.5 tw-rounded-lg tw-border tw-border-md-neutral-80 tw-bg-md-neutral-95 tw-p-3'}>
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt="User avatar"
              className="tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-white/30 tw-object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-white/30 tw-bg-gradient-to-br tw-from-blue-500 tw-via-fuchsia-500 tw-to-amber-300"
            />
          )}

          <p className={isDarkTheme ? 'tw-min-w-0 tw-flex-1 tw-truncate tw-text-base tw-font-medium tw-text-white' : 'tw-min-w-0 tw-flex-1 tw-truncate tw-text-base tw-font-medium tw-text-md-neutral-10'}>
            {profileUser?.email ?? 'mikeycodespace@gmail.com'}
          </p>

          <button
            type="button"
            onClick={onToggleProfileModal}
            aria-label="Open profile menu"
            title="Open profile menu"
            className={isDarkTheme ? 'tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-black tw-text-white hover:tw-bg-white/10' : 'tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-md-neutral-80 tw-bg-md-neutral-99 tw-text-md-neutral-10 hover:tw-bg-md-neutral-98'}
          >
            <FiMoreHorizontal className="tw-text-base" />
          </button>
        </div>

        {isProfileModalOpen && (
          <div className={isDarkTheme
            ? 'tw-absolute tw-bottom-full tw-left-0 tw-z-50 tw-mb-3 tw-w-[18rem] tw-rounded-xl tw-border tw-border-white/15 tw-bg-black/95 tw-p-3 tw-text-xs tw-shadow-2xl'
            : 'tw-absolute tw-bottom-full tw-left-0 tw-z-50 tw-mb-3 tw-w-[18rem] tw-rounded-xl tw-border tw-border-md-neutral-80 tw-bg-md-neutral-99 tw-p-3 tw-text-xs tw-shadow-2xl'}
          >
            <div className={isDarkTheme ? 'tw-rounded-lg tw-bg-black tw-p-3' : 'tw-rounded-lg tw-bg-md-neutral-99 tw-p-3'}>
              <p className={isDarkTheme ? 'tw-text-xs tw-font-semibold tw-text-white' : 'tw-text-xs tw-font-semibold tw-text-md-neutral-10'}>{profileUser?.userName ?? 'codewithatith'}</p>
              <p className="tw-mt-1 tw-text-xs tw-text-slate-400">{profileUser?.email ?? 'mikeycodespace@gmail.com'}</p>
            </div>

            <div className="tw-mt-3 tw-space-y-1 tw-text-xs tw-text-md-neutral-80">
              <button
                type="button"
                className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'}
                onClick={() => {
                  onGoDashboard()
                  onCloseProfileModal()
                }}
              >
                Dashboard
              </button>
              <button type="button" className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'}>
                Account Settings
              </button>
              <button type="button" className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'}>
                <span>Create Team</span>
                <span className={isDarkTheme
                  ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-black'
                  : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-md-neutral-99'}>
                  <CiCirclePlus className={isDarkTheme ? 'tw-text-base tw-text-white' : 'tw-text-base tw-text-black'} />
                </span>
              </button>
              <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-white/15' : 'tw-my-1 tw-h-px tw-bg-md-neutral-80'} />
              <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'}>
                <span>Theme</span>
                <span className="tw-flex tw-items-center tw-gap-2">
                  <button
                    type="button"
                    aria-label="Set dark theme"
                    onClick={() => setThemeMode('dark')}
                    className={themeMode === 'dark' ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-md-neutral-50 hover:tw-bg-white/10'}
                  >
                    <LuMoon className="tw-text-sm" />
                  </button>
                  <button
                    type="button"
                    aria-label="Set light theme"
                    onClick={() => setThemeMode('light')}
                    className={themeMode === 'light' ? (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-md-neutral-10/10 tw-text-md-neutral-10') : (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-md-neutral-50 hover:tw-bg-white/10' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-md-neutral-40 hover:tw-bg-md-neutral-10/10')}
                  >
                    <LuSun className="tw-text-sm" />
                  </button>
                  <button
                    type="button"
                    aria-label="Use system theme"
                    onClick={() => setThemeMode('system')}
                    className={themeMode === 'system' ? (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-md-neutral-10/10 tw-text-md-neutral-10') : (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-md-neutral-50 hover:tw-bg-white/10' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-md-neutral-40 hover:tw-bg-md-neutral-10/10')}
                  >
                    <LuMonitor className="tw-text-sm" />
                  </button>
                </span>
              </div>
              <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-white/15' : 'tw-my-1 tw-h-px tw-bg-slate-300'} />
              <Link to="/" className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'} onClick={onCloseProfileModal}>
                <span>Home Page</span>
                <span className="tw-text-xs tw-text-md-neutral-80">▲</span>
              </Link>
              <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-md-neutral-40 hover:tw-bg-md-neutral-95'}>
                <span>Log Out</span>
                <button
                  type="button"
                  onClick={() => {
                    onCloseProfileModal()
                    onLogout()
                  }}
                  className={isDarkTheme
                    ? 'tw-rounded-md tw-border tw-border-white/60 tw-bg-transparent tw-px-2 tw-py-1 tw-text-white hover:tw-bg-white/10'
                    : 'tw-rounded-md tw-border tw-border-md-neutral-10 tw-bg-md-neutral-99 tw-px-2 tw-py-1 tw-text-md-neutral-10 hover:tw-bg-md-neutral-98'}
                >
                  <IoExitOutline className="tw-text-base" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default DashboardSidebar
