import React from 'react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi2'
import { useTheme } from '../theme/ThemeContext'
import { authApi } from '../api'
import { env } from '../config/env'

const SignupPage: React.FC = () => {
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'
  const [showDummyNotice, setShowDummyNotice] = React.useState(false)

  const handleGithubSignup = () => {
    authApi.loginRedirect(new URL(env.apiBaseUrl).origin)
  }

  const handleDummyAction = () => {
    setShowDummyNotice(true)
  }

  const shellClass = isDarkTheme
    ? 'tw-bg-[#101113] tw-text-white'
    : 'tw-bg-[#f7f7f5] tw-text-[#171717]'
  const panelClass = isDarkTheme
    ? 'tw-border-white/10 tw-bg-[#18191c]'
    : 'tw-border-black/[0.07] tw-bg-white'
  const fieldClass = isDarkTheme
    ? 'tw-border-white/10 tw-bg-white/[0.04] tw-text-white placeholder:tw-text-zinc-500 focus:tw-border-[#8b7cff] focus:tw-ring-[#8b7cff]/20'
    : 'tw-border-zinc-200 tw-bg-white tw-text-zinc-900 placeholder:tw-text-zinc-400 focus:tw-border-[#6656dc] focus:tw-ring-[#6656dc]/15'
  const mutedText = isDarkTheme ? 'tw-text-zinc-400' : 'tw-text-zinc-500'

  return (
    <div className={`tw-min-h-screen tw-p-4 sm:tw-p-6 lg:tw-p-8 ${shellClass}`}>
      <div className={`tw-mx-auto tw-grid tw-min-h-[calc(100vh-2rem)] tw-max-w-[1440px] tw-overflow-hidden tw-rounded-[28px] tw-border ${panelClass} lg:tw-grid-cols-[minmax(0,0.96fr)_minmax(460px,1.04fr)] sm:tw-min-h-[calc(100vh-3rem)]`}>
        <section className="tw-relative tw-flex tw-items-center tw-justify-center tw-px-6 tw-py-12 sm:tw-px-12 lg:tw-px-16">
          <div className="tw-absolute tw-left-8 tw-top-8 tw-flex tw-items-center tw-gap-2.5 sm:tw-left-10 sm:tw-top-10">
            <span className="tw-grid tw-h-8 tw-w-8 tw-place-items-center tw-rounded-[10px] tw-bg-[#6656dc] tw-text-sm tw-font-black tw-text-white">V</span>
            <span className="tw-text-lg tw-font-semibold tw-tracking-[-0.04em]">veren</span>
          </div>

          <div className="tw-w-full tw-max-w-[410px] tw-pt-12">
            <p className="tw-text-sm tw-font-medium tw-text-[#7768e7]">GET STARTED</p>
            <h1 className="tw-mt-3 tw-text-4xl tw-font-semibold tw-tracking-[-0.055em] sm:tw-text-[42px]">Create your account</h1>
            <p className={`tw-mt-3 tw-text-[15px] tw-leading-6 ${mutedText}`}>Deploy, manage, and grow your projects from one thoughtful workspace.</p>

            <form className="tw-mt-9 tw-space-y-4" onSubmit={(event) => { event.preventDefault(); handleDummyAction() }}>
              <label className="tw-block">
                <span className="tw-mb-2 tw-block tw-text-sm tw-font-medium">Work email</span>
                <input className={`tw-h-12 tw-w-full tw-rounded-xl tw-border tw-px-4 tw-text-sm tw-outline-none tw-transition focus:tw-ring-4 ${fieldClass}`} type="email" placeholder="you@company.com" />
              </label>
              <label className="tw-block">
                <span className="tw-mb-2 tw-block tw-text-sm tw-font-medium">Password</span>
                <input className={`tw-h-12 tw-w-full tw-rounded-xl tw-border tw-px-4 tw-text-sm tw-outline-none tw-transition focus:tw-ring-4 ${fieldClass}`} type="password" placeholder="Create a password" />
              </label>
              <button className="tw-flex tw-h-12 tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-bg-[#6656dc] tw-text-sm tw-font-semibold tw-text-white tw-shadow-[0_12px_24px_rgba(102,86,220,0.22)] tw-transition hover:tw-bg-[#5949cf]" type="submit">
                Create account <HiOutlineArrowRight className="tw-text-lg" />
              </button>
            </form>

            {showDummyNotice && <p className={`tw-mt-3 tw-text-center tw-text-xs ${mutedText}`}>This sign-up option is coming soon. Please use GitHub below.</p>}

            <div className="tw-my-7 tw-flex tw-items-center tw-gap-4">
              <span className={`tw-h-px tw-flex-1 ${isDarkTheme ? 'tw-bg-white/10' : 'tw-bg-zinc-200'}`} />
              <span className={`tw-text-xs tw-font-medium tw-uppercase tw-tracking-[0.14em] ${mutedText}`}>or continue with</span>
              <span className={`tw-h-px tw-flex-1 ${isDarkTheme ? 'tw-bg-white/10' : 'tw-bg-zinc-200'}`} />
            </div>

            <button onClick={handleDummyAction} type="button" className={`tw-flex tw-h-12 tw-w-full tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-border tw-text-sm tw-font-semibold tw-transition ${isDarkTheme ? 'tw-border-white/10 tw-bg-white/[0.03] hover:tw-bg-white/[0.06]' : 'tw-border-zinc-200 tw-bg-white hover:tw-bg-zinc-50'}`}>
              <FaGoogle className="tw-text-base tw-text-[#4285F4]" /> Continue with Google
            </button>
            <button onClick={handleGithubSignup} type="button" className={`tw-mt-3 tw-flex tw-h-12 tw-w-full tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition ${isDarkTheme ? 'tw-bg-white tw-text-zinc-900 hover:tw-bg-zinc-200' : 'tw-bg-[#171717] tw-text-white hover:tw-bg-[#303030]'}`}>
              <FaGithub className="tw-text-lg" /> Continue with GitHub
            </button>

            <p className={`tw-mt-7 tw-text-center tw-text-xs tw-leading-5 ${mutedText}`}>By continuing, you agree to Veren&apos;s Terms of Service and Privacy Policy.</p>
          </div>
        </section>

        <aside className="tw-relative tw-hidden tw-overflow-hidden tw-bg-[#17142e] lg:tw-block">
          <img src="/signup_sidebar.jpg" alt="Creative workspace" className="tw-absolute tw-inset-0 tw-h-full tw-w-full tw-object-cover tw-opacity-70" />
          <div className="tw-absolute tw-inset-0 tw-bg-[linear-gradient(135deg,rgba(19,15,52,0.82),rgba(62,43,127,0.2)_55%,rgba(10,9,24,0.68))]" />
          <div className="tw-absolute tw--right-24 tw-top-16 tw-h-[440px] tw-w-[440px] tw-rounded-full tw-border tw-border-white/20" />
          <div className="tw-absolute tw--right-5 tw-top-32 tw-h-[310px] tw-w-[310px] tw-rounded-full tw-border tw-border-white/20" />
          <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-p-12 xl:tw-p-16">
            <div className="tw-mb-8 tw-h-px tw-w-14 tw-bg-[#a99fff]" />
            <blockquote className="tw-max-w-xl tw-text-3xl tw-font-medium tw-leading-[1.16] tw-tracking-[-0.045em] tw-text-white xl:tw-text-[39px]">“The calmest way to take an idea all the way to production.”</blockquote>
            <div className="tw-mt-9 tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-white/75"><span className="tw-grid tw-h-7 tw-w-7 tw-place-items-center tw-rounded-full tw-bg-white/15"><HiOutlineCheck /></span> Built for teams that ship with intention</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default SignupPage
