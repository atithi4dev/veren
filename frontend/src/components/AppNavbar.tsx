import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import {
  LuSparkles,
  LuCloud,
  LuShield,
  LuWrench,
  LuBookOpen,
  LuCpu,
  LuRocket,
  LuDatabase,
  LuUsers,
  LuMoon,
  LuSun,
  LuMonitor,
} from 'react-icons/lu'
import { CiCirclePlus } from 'react-icons/ci'
import { IoExitOutline } from 'react-icons/io5'
import { useTheme } from '../theme/ThemeContext'
import { authApi, authTokens } from '../api'

type ProfileUser = {
  userName?: string
  email?: string
}

const PROFILE_CACHE_KEY = 'veren-profile-cache'

type DropdownKey = 'products' | 'resources' | 'solutions'

type DropdownSection = {
  title: string
  items: Array<{
    name: string
    description: string
  }>
}

const dropdownItems: Record<DropdownKey, DropdownSection[]> = {
  products: [
    {
      title: 'AI Cloud',
      items: [
        { name: 'v0', description: 'Generate UI flows and app scaffolds quickly.' },
        { name: 'AI SDK', description: 'Build AI features with a clean developer API.' },
        { name: 'AI Gateway', description: 'Route model traffic with unified controls.' },
        { name: 'Veren Agent', description: 'Automate deployment and project operations.' },
        { name: 'Sandbox', description: 'Run isolated experiments before production rollout.' },
      ],
    },
    {
      title: 'Core Platform',
      items: [
        { name: 'CI/CD', description: 'Ship every commit through automated pipelines.' },
        { name: 'Content Delivery', description: 'Serve content fast through edge distribution.' },
        { name: 'Fluid Compute', description: 'Scale runtime capacity with dynamic workloads.' },
        { name: 'Observility', description: 'Monitor health, performance, and deployment states.' },
      ],
    },
    {
      title: 'Security',
      items: [
        { name: 'Bot Management', description: 'Detect and control automated traffic patterns.' },
        { name: 'BotId', description: 'Identify clients with stronger trust signals.' },
        { name: 'Platform Security', description: 'Protect services with secure platform defaults.' },
        { name: 'Web Application Firewall', description: 'Block malicious requests at the edge layer.' },
      ],
    },
  ],
  resources: [
    {
      title: 'Company',
      items: [
        { name: 'Customer', description: 'Stories and outcomes from real platform users.' },
        { name: 'Blog', description: 'Product updates, ideas, and engineering insights.' },
        { name: 'Changelog', description: 'Track new releases and platform improvements.' },
        { name: 'Press', description: 'Company announcements and media resources.' },
        { name: 'Events', description: 'Join launches, sessions, and community meetups.' },
      ],
    },
    {
      title: 'Learn',
      items: [
        { name: 'Docs', description: 'Reference guides for setup and day-to-day usage.' },
        { name: 'Academy', description: 'Step-by-step learning tracks for teams.' },
        { name: 'Knowledge Base', description: 'Answers for common platform workflows.' },
        { name: 'Community', description: 'Ask questions and share implementation tips.' },
      ],
    },
    {
      title: 'Open Source',
      items: [
        { name: 'Nextjs', description: 'Framework support for modern React delivery.' },
        { name: 'Nust', description: 'Nuxt ecosystem workflows for Vue teams.' },
        { name: 'Svelte', description: 'Ship lightweight apps with Svelte tooling.' },
        { name: 'Turborepo', description: 'Speed up monorepo builds and deploy steps.' },
      ],
    },
  ],
  solutions: [
    {
      title: 'Use Cases',
      items: [
        { name: 'Ai Apps', description: 'Launch AI-powered products with controlled pipelines.' },
        { name: 'Composable Commerce', description: 'Connect modular commerce services at scale.' },
        { name: 'Marketting Sites', description: 'Deliver campaign pages with fast global load.' },
        { name: 'MultiTenant Platform', description: 'Manage tenant-aware deployments efficiently.' },
        { name: 'WebApps', description: 'Run full web applications with unified operations.' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { name: 'MarketPlace', description: 'Discover integrations and ready platform add-ons.' },
        { name: 'templates', description: 'Start quickly with production-ready starter kits.' },
        { name: 'Partner Finder', description: 'Find implementation and delivery partners.' },
      ],
    },
    {
      title: 'Users',
      items: [
        { name: 'Platform enginners', description: 'Govern infra, policies, and release reliability.' },
        { name: 'Design Enginners', description: 'Ship polished UX faster with scalable systems.' },
      ],
    },
  ],
}

const optionIconByName: Record<string, React.ComponentType<{ className?: string }>> = {
  'v0': LuSparkles,
  'AI SDK': LuCpu,
  'AI Gateway': LuCloud,
  'Veren Agent': LuRocket,
  Sandbox: LuDatabase,
  'CI/CD': LuWrench,
  'Content Delivery': LuCloud,
  'Fluid Compute': LuCpu,
  Observility: LuDatabase,
  'Bot Management': LuShield,
  BotId: LuShield,
  'Platform Security': LuShield,
  'Web Application Firewall': LuShield,
  Customer: LuUsers,
  Blog: LuBookOpen,
  Changelog: LuBookOpen,
  Press: LuBookOpen,
  Events: LuRocket,
  Docs: LuBookOpen,
  Academy: LuBookOpen,
  'Knowledge Base': LuDatabase,
  Community: LuUsers,
  Nextjs: LuRocket,
  Nust: LuRocket,
  Svelte: LuSparkles,
  Turborepo: LuDatabase,
  'Ai Apps': LuSparkles,
  'Composable Commerce': LuDatabase,
  'Marketting Sites': LuCloud,
  'MultiTenant Platform': LuUsers,
  WebApps: LuCloud,
  MarketPlace: LuDatabase,
  templates: LuWrench,
  'Partner Finder': LuUsers,
  'Platform enginners': LuWrench,
  'Design Enginners': LuSparkles,
}

const AppNavbar: React.FC = () => {
  const navigate = useNavigate()
  const { themeMode, resolvedTheme, setThemeMode } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'
  const [activeDropdown, setActiveDropdown] = React.useState<DropdownKey | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
  const [profileUser, setProfileUser] = React.useState<ProfileUser | null>(null)
  const profileModalRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      const cachedProfile = window.localStorage.getItem(PROFILE_CACHE_KEY)

      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile) as ProfileUser

          if (isMounted) {
            setProfileUser(parsedProfile)
          }

          return
        } catch {
          window.localStorage.removeItem(PROFILE_CACHE_KEY)
        }
      }

      try {
        const response = await authApi.me()
        const payload = response.data?.data ?? response.data
        const nextProfile = {
          userName: payload?.userName,
          email: payload?.email,
        }

        if (isMounted) {
          setProfileUser(nextProfile)
        }

        window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile))
      } catch {
        if (isMounted) {
          setProfileUser(null)
        }
      }
    }

    void fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!isProfileModalOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target as Node)) {
        setIsProfileModalOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isProfileModalOpen])

  const renderDropdownButton = (label: string, key: DropdownKey) => {
    const isActive = activeDropdown === key

    return (
      <button
        type="button"
        onMouseEnter={() => setActiveDropdown(key)}
        className={isDarkTheme
          ? 'tw-inline-flex tw-items-center tw-gap-0.5 tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-400 hover:tw-bg-white/10 hover:tw-text-white'
          : 'tw-inline-flex tw-items-center tw-gap-0.5 tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-600 hover:tw-bg-slate-900/10 hover:tw-text-slate-900'}
      >
        {label}
        <motion.span
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="tw-inline-flex"
        >
          <MdOutlineKeyboardArrowDown className="tw-text-lg" />
        </motion.span>
      </button>
    )
  }

  const handleLogout = React.useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      authTokens.clear()
      window.localStorage.clear()
      setProfileUser(null)
      setIsProfileModalOpen(false)
      navigate('/signup', { replace: true })
    }
  }, [navigate])

  return (
    <nav className={isDarkTheme
      ? 'tw-fixed tw-top-0 tw-z-50 tw-w-full tw-border-b tw-border-white/10 tw-bg-black/95 tw-backdrop-blur'
      : 'tw-fixed tw-top-0 tw-z-50 tw-w-full tw-border-b tw-border-slate-300/80 tw-bg-white/95 tw-backdrop-blur'}>
      <div className="tw-mx-auto tw-flex tw-h-16 tw-w-full tw-max-w-7xl tw-items-center tw-justify-between tw-px-6">
        <div className="tw-flex tw-items-center tw-gap-8">
          <Link to="/" className={isDarkTheme
            ? 'tw-text-2xl tw-font-bold tw-tracking-wide tw-text-white md:tw-text-3xl'
            : 'tw-text-2xl tw-font-bold tw-tracking-wide tw-text-slate-900 md:tw-text-3xl'}>
            Veren
          </Link>

          <div
            className="tw-relative tw-hidden tw-items-center tw-gap-6 tw-text-xs md:tw-flex"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {renderDropdownButton('Products', 'products')}
            {renderDropdownButton('Resources', 'resources')}
            {renderDropdownButton('Solutions', 'solutions')}
            <button type="button" className={isDarkTheme ? 'tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-400 hover:tw-bg-white/10 hover:tw-text-white' : 'tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-600 hover:tw-bg-slate-900/10 hover:tw-text-slate-900'}>Enterprise</button>
            <button type="button" className={isDarkTheme ? 'tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-400 hover:tw-bg-white/10 hover:tw-text-white' : 'tw-rounded-md tw-px-2 tw-py-1 tw-text-slate-600 hover:tw-bg-slate-900/10 hover:tw-text-slate-900'}>Pricing</button>

            <AnimatePresence>
              {activeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.16 }}
                  className={isDarkTheme
                    ? 'tw-absolute tw-left-0 tw-top-full tw-z-50 tw-mt-3 tw-w-[46rem] tw-overflow-hidden tw-rounded-xl tw-border tw-border-white/15 tw-bg-black/95 tw-p-4 tw-shadow-2xl'
                    : 'tw-absolute tw-left-0 tw-top-full tw-z-50 tw-mt-3 tw-w-[46rem] tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-p-4 tw-shadow-2xl'}
                >
                  <motion.ul
                    key={activeDropdown}
                    initial={{ x: 12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -12, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="tw-grid tw-grid-cols-3 tw-gap-4"
                  >
                    {dropdownItems[activeDropdown].map((section, sectionIndex) => (
                      <motion.li
                        key={section.title}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.14, delay: sectionIndex * 0.035 }}
                        className={isDarkTheme ? 'tw-space-y-2 tw-rounded-lg tw-bg-white/[0.02] tw-p-3' : 'tw-space-y-2 tw-rounded-lg tw-bg-white tw-p-3'}
                      >
                        <div className="tw-flex tw-items-center tw-gap-2 tw-px-1">
                          <p className={isDarkTheme ? 'tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500' : 'tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500'}>
                            {section.title}
                          </p>
                        </div>
                        {section.items.map((item) => {
                          const OptionIcon = optionIconByName[item.name] ?? LuSparkles

                          return (
                            <button
                              key={item.name}
                              type="button"
                              className={isDarkTheme ? 'tw-flex tw-w-full tw-items-start tw-gap-2 tw-rounded-md tw-px-2 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-start tw-gap-2 tw-rounded-md tw-px-2 tw-py-2 tw-text-left hover:tw-bg-slate-100'}
                            >
                              <span className={isDarkTheme ? 'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-black/40 tw-p-[4px]' : 'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-p-[4px]'}>
                                <OptionIcon className={isDarkTheme ? 'tw-text-[12px] tw-text-slate-200' : 'tw-text-[12px] tw-text-slate-700'} />
                              </span>
                              <span className="tw-flex tw-flex-col">
                                <span className={isDarkTheme ? 'tw-text-sm tw-text-slate-100' : 'tw-text-sm tw-text-slate-900'}>{item.name}</span>
                                <span className="tw-text-[11px] tw-leading-4 tw-text-slate-400">{item.description}</span>
                              </span>
                            </button>
                          )
                        })}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="tw-relative tw-flex tw-items-center tw-gap-3" ref={profileModalRef}>
          <button
            type="button"
            className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/25 tw-bg-black tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-white hover:tw-bg-white/10' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-slate-900 hover:tw-bg-slate-100'}
          >
            Ask AI
          </button>
          <button
            type="button"
            className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/25 tw-bg-black tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-white hover:tw-bg-white/10' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-slate-900 hover:tw-bg-slate-100'}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen((prev) => !prev)}
            aria-label="Profile"
            title="Profile"
            className="tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-white/30 tw-bg-gradient-to-br tw-from-blue-500 tw-via-fuchsia-500 tw-to-amber-300 tw-transition-opacity hover:tw-opacity-90 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-white/60"
          />

          <AnimatePresence>
            {isProfileModalOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                className={isDarkTheme
                  ? 'tw-absolute tw-right-0 tw-top-full tw-z-50 tw-mt-3 tw-w-[20rem] tw-rounded-xl tw-border tw-border-white/15 tw-bg-black/95 tw-p-3 tw-text-xs tw-shadow-2xl'
                  : 'tw-absolute tw-right-0 tw-top-full tw-z-50 tw-mt-3 tw-w-[20rem] tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-p-3 tw-text-xs tw-shadow-2xl'}
              >
                <div className={isDarkTheme ? 'tw-rounded-lg tw-bg-black tw-p-3' : 'tw-rounded-lg tw-bg-white tw-p-3'}>
                  <p className={isDarkTheme ? 'tw-text-xs tw-font-semibold tw-text-white' : 'tw-text-xs tw-font-semibold tw-text-slate-900'}>{profileUser?.userName ?? 'codewithatith'}</p>
                  <p className="tw-mt-1 tw-text-xs tw-text-slate-400">{profileUser?.email ?? 'mikeycodespace@gmail.com'}</p>
                </div>

                <div className="tw-mt-3 tw-space-y-1 tw-text-xs tw-text-slate-300">
                  <Link to="/dashboard" className={isDarkTheme ? 'tw-flex tw-items-center tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-slate-700 hover:tw-bg-slate-100'} onClick={() => setIsProfileModalOpen(false)}>
                    Dashboard
                  </Link>
                  <button type="button" className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-rounded-md tw-px-3 tw-py-2 tw-text-left tw-text-slate-700 hover:tw-bg-slate-100'}>
                    Account Settings
                  </button>
                  <button type="button" className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left tw-text-slate-700 hover:tw-bg-slate-100'}>
                    <span>Create Team</span>
                    <span className={isDarkTheme
                      ? 'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-full tw-bg-black'
                      : 'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-full tw-bg-white'}>
                      <CiCirclePlus className={isDarkTheme ? 'tw-text-lg tw-text-white' : 'tw-text-lg tw-text-black'} />
                    </span>
                  </button>
                  <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-white/15' : 'tw-my-1 tw-h-px tw-bg-slate-300'} />
                  <div className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-slate-700 hover:tw-bg-slate-100'}>
                    <span>Command Menu</span>
                    <button type="button" className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-white/25 tw-bg-white/5 tw-px-2 tw-py-0.5 tw-text-[10px] tw-font-medium tw-text-slate-300' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-px-2 tw-py-0.5 tw-text-[10px] tw-font-medium tw-text-slate-700'}>Ctrl K</button>
                  </div>
                  <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-slate-700 hover:tw-bg-slate-100'}>
                    <span>Theme</span>
                    <span className="tw-flex tw-items-center tw-gap-2">
                      <button
                        type="button"
                        aria-label="Set dark theme"
                        onClick={() => setThemeMode('dark')}
                        className={themeMode === 'dark' ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-400 hover:tw-bg-white/10'}
                      >
                        <LuMoon className="tw-text-sm" />
                      </button>
                      <button
                        type="button"
                        aria-label="Set light theme"
                        onClick={() => setThemeMode('light')}
                        className={themeMode === 'light' ? (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-slate-900/10 tw-text-slate-900') : (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-400 hover:tw-bg-white/10' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-500 hover:tw-bg-slate-900/10')}
                      >
                        <LuSun className="tw-text-sm" />
                      </button>
                      <button
                        type="button"
                        aria-label="Use system theme"
                        onClick={() => setThemeMode('system')}
                        className={themeMode === 'system' ? (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/20 tw-text-white' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-bg-slate-900/10 tw-text-slate-900') : (isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-400 hover:tw-bg-white/10' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-500 hover:tw-bg-slate-900/10')}
                      >
                        <LuMonitor className="tw-text-sm" />
                      </button>
                    </span>
                  </div>
                  <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-white/15' : 'tw-my-1 tw-h-px tw-bg-slate-300'} />
                  <Link to="/" className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-slate-700 hover:tw-bg-slate-100'} onClick={() => setIsProfileModalOpen(false)}>
                    <span>Home Page</span>
                    <span className="tw-text-xs tw-text-slate-300">▲</span>
                  </Link>
                  <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 hover:tw-bg-white/10' : 'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-slate-700 hover:tw-bg-slate-100'}>
                    <span>Log Out</span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={isDarkTheme
                        ? 'tw-rounded-md tw-border tw-border-white/60 tw-bg-transparent tw-px-2 tw-py-1 tw-text-white hover:tw-bg-white/10'
                        : 'tw-rounded-md tw-border tw-border-black tw-bg-white tw-px-2 tw-py-1 tw-text-black hover:tw-bg-slate-100'}
                    >
                      <IoExitOutline className="tw-text-base" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="tw-mt-2 tw-w-full tw-rounded-md tw-border tw-border-white/70 tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-medium tw-text-black hover:tw-bg-slate-100"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
