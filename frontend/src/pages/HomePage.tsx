import React from 'react'
import HeroSection from '../components/HeroSection'
import { useTheme } from '../theme/ThemeContext'

const HomePage: React.FC = () => {
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'

  return (
    <div className={isDarkTheme ? 'tw-min-h-screen tw-bg-black tw-text-white' : 'tw-min-h-screen tw-bg-slate-100 tw-text-slate-900'}>
      <HeroSection />

      {/* <section className={isDarkTheme ? 'tw-border-t tw-border-white/10 tw-bg-black' : 'tw-border-t tw-border-slate-300 tw-bg-slate-100'}>
        <div className="tw-mx-auto tw-w-full tw-max-w-6xl tw-px-6 tw-py-10">
          <h2 className="tw-text-xl tw-font-semibold">Dashboard Overview</h2>
          <p className={isDarkTheme ? 'tw-mt-2 tw-text-sm tw-text-slate-300' : 'tw-mt-2 tw-text-sm tw-text-slate-600'}>
            Your deployment activity, projects, and environments will appear here.
          </p>
        </div>
      </section> */}
    </div>
  )
}

export default HomePage
