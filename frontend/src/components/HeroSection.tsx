import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'

const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'

  return (
    <section className={isDarkTheme ? 'tw-relative tw-min-h-screen tw-border-b tw-border-white/10 tw-bg-black' : 'tw-relative tw-min-h-screen tw-border-b tw-border-slate-300 tw-bg-slate-100'}>

      <div className="tw-relative tw-z-10 tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-6xl tw-items-center tw-justify-center tw-px-6 tw-py-16">
        <div className={isDarkTheme ? 'tw-relative tw-w-full tw-max-w-4xl tw-overflow-hidden tw-border tw-border-white/15 tw-bg-black tw-p-8 md:tw-p-10' : 'tw-relative tw-w-full tw-max-w-4xl tw-overflow-hidden tw-border tw-border-slate-300 tw-bg-white tw-p-8 md:tw-p-10'}>
          <div className="tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[radial-gradient(circle_at_12%_50%,rgba(59,130,246,0.42),transparent_42%),radial-gradient(circle_at_88%_50%,rgba(239,68,68,0.44),transparent_42%),radial-gradient(circle_at_64%_48%,rgba(251,146,60,0.36),transparent_28%),radial-gradient(circle_at_38%_48%,rgba(250,204,21,0.32),transparent_28%)]" />
          <div className="tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(90deg,rgba(37,99,235,0.25)_0%,rgba(59,130,246,0.18)_20%,rgba(251,146,60,0.22)_50%,rgba(250,204,21,0.2)_70%,rgba(239,68,68,0.26)_100%)]" />
          <div className={isDarkTheme
            ? 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] tw-bg-[size:46px_46px]'
            : 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] tw-bg-[size:46px_46px]'} />
          <div className={isDarkTheme ? 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_bottom,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.25)_28%,transparent_52%)]' : 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_bottom,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.2)_28%,transparent_52%)]'} />
          <div className={isDarkTheme ? 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_right,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.42)_20%,transparent_40%,transparent_60%,rgba(0,0,0,0.42)_80%,rgba(0,0,0,0.78)_100%)]' : 'tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[linear-gradient(to_right,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.42)_20%,transparent_40%,transparent_60%,rgba(255,255,255,0.42)_80%,rgba(255,255,255,0.78)_100%)]'} />

          <div className="tw-pointer-events-none tw-absolute tw-left-0 tw-top-0 tw-z-20 tw-h-7 tw-w-7">
            <span className={isDarkTheme ? 'tw-absolute tw-left-0 tw-top-3 tw-h-px tw-w-7 tw-bg-white' : 'tw-absolute tw-left-0 tw-top-3 tw-h-px tw-w-7 tw-bg-slate-700'} />
            <span className={isDarkTheme ? 'tw-absolute tw-left-3 tw-top-0 tw-h-7 tw-w-px tw-bg-white' : 'tw-absolute tw-left-3 tw-top-0 tw-h-7 tw-w-px tw-bg-slate-700'} />
          </div>
          <div className="tw-pointer-events-none tw-absolute tw-bottom-0 tw-right-0 tw-z-20 tw-h-7 tw-w-7">
            <span className={isDarkTheme ? 'tw-absolute tw-bottom-3 tw-left-0 tw-h-px tw-w-7 tw-bg-white' : 'tw-absolute tw-bottom-3 tw-left-0 tw-h-px tw-w-7 tw-bg-slate-700'} />
            <span className={isDarkTheme ? 'tw-absolute tw-left-3 tw-top-0 tw-h-7 tw-w-px tw-bg-white' : 'tw-absolute tw-left-3 tw-top-0 tw-h-7 tw-w-px tw-bg-slate-700'} />
          </div>

          <div className="tw-relative tw-z-10 tw-text-center">
            <h1 className={isDarkTheme ? 'tw-text-4xl tw-font-semibold tw-tracking-tight md:tw-text-6xl' : 'tw-text-4xl tw-font-semibold tw-tracking-tight tw-text-slate-900 md:tw-text-6xl'}>
              Build and deploy on Veren Cloud.
            </h1>
            <p className={isDarkTheme ? 'tw-mt-5 tw-text-base tw-leading-7 tw-text-slate-300 md:tw-text-xl' : 'tw-mt-5 tw-text-base tw-leading-7 tw-text-slate-600 md:tw-text-xl'}>
              Veren provides the deployment workflow and cloud-ready pipeline to build, scale, and
              ship frontend and backend apps from one control plane.
            </p>
          </div>

          <div className="tw-relative tw-z-10 tw-mt-8 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-white tw-px-6 tw-py-3 tw-text-sm tw-font-semibold tw-text-black hover:tw-bg-slate-200' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-black tw-px-6 tw-py-3 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-black/90'}
            >
              <svg aria-hidden="true" viewBox="0 0 74 64" className="tw-h-3.5 tw-w-4" fill="none">
                <path d="M37 0L74 64H0L37 0Z" fill={isDarkTheme ? 'black' : 'white'} />
              </svg>
              Start Deploying
            </button>
            <button
              type="button"
              className={isDarkTheme ? 'tw-rounded-full tw-border tw-border-white/30 tw-bg-black tw-px-6 tw-py-3 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-black/65' : 'tw-rounded-full tw-border tw-border-slate-300 tw-bg-white tw-px-6 tw-py-3 tw-text-sm tw-font-semibold tw-text-black hover:tw-bg-slate-100'}
            >
              Get a Demo
            </button>
          </div>

          <div className="tw-relative tw-z-10 tw-mt-1 tw-flex tw-items-center tw-justify-center">
            <svg
              aria-label="Veren deployment triangle"
              role="img"
              viewBox="460 445 280 210"
              className="tw-h-56 tw-w-56 md:tw-h-[20rem] md:tw-w-[20rem]"
              fill="none"
            >
              <path fill="black" stroke="white" strokeOpacity="1" d="M715 650.4 L600 451.21 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.94" d="M715 650.4 L600 458 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.88" d="M715 650.4 L600 464.8 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.82" d="M715 650.4 L600 471.6 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.75" d="M715 650.4 L600 478.4 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.68" d="M715 650.4 L600 485.2 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.61" d="M715 650.4 L600 492 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.54" d="M715 650.4 L600 498.8 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.47" d="M715 650.4 L600 505.6 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.4" d="M715 650.4 L600 512.4 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.33" d="M715 650.4 L600 519.2 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.26" d="M715 650.4 L600 526 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.2" d="M715 650.4 L600 532.8 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.14" d="M715 650.4 L600 539.6 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.09" d="M715 650.4 L600 546.4 L485 650.4 Z" />
              <path fill="black" stroke="white" strokeOpacity="0.05" d="M715 650.4 L600 553.2 L485 650.4 Z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
