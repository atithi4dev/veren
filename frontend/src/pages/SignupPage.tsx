import React from 'react'
import { authApi } from '../api'
import { useTheme } from '../theme/ThemeContext'

const getApiOrigin = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1'

  try {
    return new URL(apiBaseUrl).origin
  } catch {
    return 'http://localhost:8001'
  }
}

const SignupPage: React.FC = () => {
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'

  const handleGithubSignup = () => {
    authApi.loginRedirect(getApiOrigin())
  }

  return (
    <div className={isDarkTheme ? 'tw-min-h-screen tw-bg-slate-950 tw-text-white tw-flex tw-items-center tw-justify-center tw-px-6' : 'tw-min-h-screen tw-bg-slate-100 tw-text-slate-900 tw-flex tw-items-center tw-justify-center tw-px-6'}>
      <div className={isDarkTheme ? 'tw-w-full tw-max-w-md tw-rounded-2xl tw-border tw-border-slate-800 tw-bg-slate-900 tw-p-8' : 'tw-w-full tw-max-w-md tw-rounded-2xl tw-border tw-border-slate-300 tw-bg-white tw-p-8'}>
        <h1 className="tw-text-2xl tw-font-semibold tw-text-center">Create your account</h1>
        <p className={isDarkTheme ? 'tw-mt-2 tw-text-center tw-text-slate-300' : 'tw-mt-2 tw-text-center tw-text-slate-600'}>
          Continue with GitHub to sign up to Veren.
        </p>

        <button
          type="button"
          onClick={handleGithubSignup}
          className="tw-mt-6 tw-w-full tw-rounded-lg tw-bg-white tw-text-slate-900 tw-font-medium tw-px-4 tw-py-3 hover:tw-bg-slate-100"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  )
}

export default SignupPage
