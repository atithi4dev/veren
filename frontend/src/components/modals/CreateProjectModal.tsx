import React from 'react'
import { FiChevronDown, FiCode, FiGithub, FiServer, FiX, FiZap } from 'react-icons/fi'
import type { BackendProjectPayload, FrontendProjectPayload, ProjectType } from '../../api/types'

type CreateProjectValues = {
  type: ProjectType
  projectName: string
  gitUrl: string
  branch: string
  entryDirectory: string
  installCommand: string
  buildCommand: string
  buildOutDirectory: string
  runCommand: string
  version: string
}

type CreateProjectModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (type: ProjectType, payload: FrontendProjectPayload | BackendProjectPayload) => Promise<void>
  isDarkTheme: boolean
  isCreating?: boolean
}

const initialValues: CreateProjectValues = {
  type: 'frontend',
  projectName: '',
  gitUrl: '',
  branch: 'main',
  entryDirectory: './',
  installCommand: 'npm install',
  buildCommand: 'npm run build',
  buildOutDirectory: 'dist',
  runCommand: 'npm start',
  version: '20',
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isDarkTheme,
  isCreating = false,
}) => {
  const [values, setValues] = React.useState<CreateProjectValues>(initialValues)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isVersionMenuOpen, setIsVersionMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setValues(initialValues)
      setErrorMessage('')
      setIsVersionMenuOpen(false)
    }
  }, [isOpen])

  const inputClass = isDarkTheme
    ? 'tw-h-11 tw-w-full tw-rounded-lg tw-border tw-border-white/10 tw-bg-black/35 tw-px-3.5 tw-py-0 tw-text-sm tw-text-md-neutral-95 tw-shadow-inner placeholder:tw-text-md-neutral-50 focus:tw-border-blue-400/70 focus:tw-bg-black/45 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-blue-500/15 disabled:tw-opacity-50'
    : 'tw-h-11 tw-w-full tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white tw-px-3.5 tw-py-0 tw-text-sm tw-text-md-neutral-10 tw-shadow-sm placeholder:tw-text-md-neutral-40 focus:tw-border-blue-500/70 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-blue-500/10 disabled:tw-opacity-50'

  const labelClass = isDarkTheme
    ? 'tw-mb-1.5 tw-block tw-text-[11px] tw-font-semibold tw-uppercase tw-text-md-neutral-70'
    : 'tw-mb-1.5 tw-block tw-text-[11px] tw-font-semibold tw-uppercase tw-text-md-neutral-40'

  const updateValue = (key: keyof CreateProjectValues, value: string) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmedValues = {
      ...values,
      projectName: values.projectName.trim(),
      gitUrl: values.gitUrl.trim(),
      branch: 'main',
      entryDirectory: values.entryDirectory.trim() || './',
      installCommand: values.installCommand.trim(),
      buildCommand: values.buildCommand.trim(),
      buildOutDirectory: values.buildOutDirectory.trim(),
      runCommand: values.runCommand.trim(),
      version: values.version.trim() || '20',
    }

    if (!trimmedValues.projectName || !trimmedValues.gitUrl || !trimmedValues.installCommand) {
      setErrorMessage('Project name, Git URL, and install command are required.')
      return
    }

    if (trimmedValues.type === 'frontend' && (!trimmedValues.buildCommand || !trimmedValues.buildOutDirectory)) {
      setErrorMessage('Build command and output directory are required for frontend projects.')
      return
    }

    if (trimmedValues.type === 'backend' && !trimmedValues.runCommand) {
      setErrorMessage('Run command is required for backend projects.')
      return
    }

    try {
      if (trimmedValues.type === 'frontend') {
        await onCreate('frontend', {
          projectName: trimmedValues.projectName,
          gitUrl: trimmedValues.gitUrl,
          branch: trimmedValues.branch,
          entryDirectory: trimmedValues.entryDirectory,
          installCommand: trimmedValues.installCommand,
          buildCommand: trimmedValues.buildCommand,
          buildOutDirectory: trimmedValues.buildOutDirectory,
          version: trimmedValues.version,
        })
      } else {
        await onCreate('backend', {
          projectName: trimmedValues.projectName,
          gitUrl: trimmedValues.gitUrl,
          branch: trimmedValues.branch,
          entryDirectory: trimmedValues.entryDirectory,
          installCommand: trimmedValues.installCommand,
          runCommand: trimmedValues.runCommand,
          version: trimmedValues.version,
        })
      }

      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create project.'
      setErrorMessage(message)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/65 tw-p-4 tw-backdrop-blur-sm">
      <div className={isDarkTheme ? 'tw-flex tw-h-[88vh] tw-w-full tw-max-w-4xl tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border tw-border-white/10 tw-bg-[#0b0d10] tw-shadow-2xl tw-shadow-black/50' : 'tw-flex tw-h-[88vh] tw-w-full tw-max-w-4xl tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-2xl tw-shadow-slate-900/15'}>
        <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-between tw-border-b tw-border-white/10 tw-bg-white/[0.03] tw-px-6 tw-py-5' : 'tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-200 tw-bg-slate-50 tw-px-6 tw-py-5'}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <span className={isDarkTheme ? 'tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-400/30 tw-bg-blue-500/15 tw-text-blue-300' : 'tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-blue-200 tw-bg-blue-50 tw-text-blue-600'}>
              <FiZap size={18} />
            </span>
            <div>
              <h2 className={isDarkTheme ? 'tw-text-lg tw-font-semibold tw-text-md-neutral-95' : 'tw-text-lg tw-font-semibold tw-text-md-neutral-10'}>Create Project</h2>
              <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-md-neutral-70' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-40'}>Connect a GitHub repository to Veren.</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close create project modal"
            onClick={onClose}
            disabled={isCreating}
            className={isDarkTheme ? 'tw-rounded-lg tw-p-2 tw-text-md-neutral-60 hover:tw-bg-white/10 hover:tw-text-white disabled:tw-opacity-50' : 'tw-rounded-lg tw-p-2 tw-text-md-neutral-40 hover:tw-bg-slate-100 hover:tw-text-slate-900 disabled:tw-opacity-50'}
          >
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tw-flex tw-min-h-0 tw-flex-1 tw-flex-col">
          <div className="tw-flex-1 tw-overflow-y-auto tw-p-6">
            <div className={isDarkTheme ? 'tw-grid tw-grid-cols-2 tw-gap-2 tw-rounded-xl tw-border tw-border-white/10 tw-bg-black/30 tw-p-1.5' : 'tw-grid tw-grid-cols-2 tw-gap-2 tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-100 tw-p-1.5'}>
              <button
                type="button"
                onClick={() => updateValue('type', 'frontend')}
                disabled={isCreating}
                className={values.type === 'frontend'
                  ? 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-bg-blue-500 tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-white tw-shadow-lg tw-shadow-blue-500/20'
                  : isDarkTheme
                    ? 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-md-neutral-80 hover:tw-bg-white/5'
                    : 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-md-neutral-30 hover:tw-bg-white'}
              >
                <FiCode />
                <span>Frontend</span>
              </button>
              <button
                type="button"
                onClick={() => updateValue('type', 'backend')}
                disabled={isCreating}
                className={values.type === 'backend'
                  ? 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-bg-blue-500 tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-white tw-shadow-lg tw-shadow-blue-500/20'
                  : isDarkTheme
                    ? 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-md-neutral-80 hover:tw-bg-white/5'
                    : 'tw-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-3 tw-text-sm tw-font-semibold tw-text-md-neutral-30 hover:tw-bg-white'}
              >
                <FiServer />
                <span>Backend</span>
              </button>
            </div>

            {errorMessage && (
              <div className="tw-mt-4 tw-rounded-md tw-border tw-border-red-500/40 tw-bg-red-500/10 tw-px-3 tw-py-2 tw-text-sm tw-text-red-500">
                {errorMessage}
              </div>
            )}

            <div className="tw-mt-5 tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="projectName">Project name</label>
                <input id="projectName" className={inputClass} value={values.projectName} onChange={(event) => updateValue('projectName', event.target.value)} placeholder="my-app" disabled={isCreating} />
              </div>
              <div>
                <label className={labelClass} htmlFor="version">Node version</label>
                <div className="tw-relative">
                  <button
                    id="version"
                    type="button"
                    className={isDarkTheme
                      ? 'tw-flex tw-h-11 tw-w-full tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-white/10 tw-bg-black/35 tw-px-3.5 tw-text-left tw-text-sm tw-text-md-neutral-95 tw-shadow-inner tw-transition-all hover:tw-border-blue-400/50 hover:tw-bg-black/45 focus:tw-border-blue-400/70 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-blue-500/15 disabled:tw-opacity-50'
                      : 'tw-flex tw-h-11 tw-w-full tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white tw-px-3.5 tw-text-left tw-text-sm tw-text-md-neutral-10 tw-shadow-sm tw-transition-all hover:tw-border-blue-300 hover:tw-bg-slate-50 focus:tw-border-blue-500/70 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-blue-500/10 disabled:tw-opacity-50'}
                    onClick={() => setIsVersionMenuOpen((previous) => !previous)}
                    disabled={isCreating}
                  >
                    <span className="tw-flex tw-items-center tw-gap-2">
                      <span className={isDarkTheme ? 'tw-h-2 tw-w-2 tw-rounded-full tw-bg-emerald-300' : 'tw-h-2 tw-w-2 tw-rounded-full tw-bg-emerald-500'} />
                      <span className="tw-text-sm tw-font-semibold">{values.version}</span>
                    </span>
                    <span className={isDarkTheme ? 'tw-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-bg-white/5 tw-text-md-neutral-70' : 'tw-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-bg-slate-100 tw-text-md-neutral-40'}>
                      <FiChevronDown className={isVersionMenuOpen ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} size={15} />
                    </span>
                  </button>

                  {isVersionMenuOpen && (
                    <div className={isDarkTheme ? 'tw-absolute tw-left-0 tw-right-0 tw-top-full tw-z-20 tw-mt-2 tw-overflow-hidden tw-rounded-lg tw-border tw-border-white/10 tw-bg-[#111418] tw-p-1.5 tw-shadow-2xl tw-shadow-black/40' : 'tw-absolute tw-left-0 tw-right-0 tw-top-full tw-z-20 tw-mt-2 tw-overflow-hidden tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white tw-p-1.5 tw-shadow-xl tw-shadow-slate-900/10'}>
                      {['20', '18'].map((version) => {
                        const isSelected = values.version === version

                        return (
                          <button
                            key={version}
                            type="button"
                            onClick={() => {
                              updateValue('version', version)
                              setIsVersionMenuOpen(false)
                            }}
                            className={isSelected
                              ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-bg-blue-500 tw-px-3 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white'
                              : isDarkTheme
                                ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-md-neutral-90 hover:tw-bg-white/7'
                                : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-md-neutral-10 hover:tw-bg-slate-100'}
                          >
                            <span>{version}</span>
                            <span className={isSelected ? 'tw-text-xs tw-text-white/80' : isDarkTheme ? 'tw-text-xs tw-text-md-neutral-70' : 'tw-text-xs tw-text-md-neutral-50'}>
                              Node
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:tw-col-span-2">
                <label className={labelClass} htmlFor="gitUrl">GitHub repository URL</label>
                <div className="tw-relative">
                  <FiGithub className={isDarkTheme ? 'tw-pointer-events-none tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-md-neutral-60' : 'tw-pointer-events-none tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-md-neutral-40'} />
                  <input id="gitUrl" className={`${inputClass} tw-pl-10`} value={values.gitUrl} onChange={(event) => updateValue('gitUrl', event.target.value)} placeholder="https://github.com/user/repo" disabled={isCreating} />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="entryDirectory">Entry directory</label>
                <input id="entryDirectory" className={inputClass} value={values.entryDirectory} onChange={(event) => updateValue('entryDirectory', event.target.value)} placeholder="./" disabled={isCreating} />
              </div>
              <div className="md:tw-col-span-2">
                <label className={labelClass} htmlFor="installCommand">Install command</label>
                <input id="installCommand" className={inputClass} value={values.installCommand} onChange={(event) => updateValue('installCommand', event.target.value)} placeholder="npm install" disabled={isCreating} />
              </div>

              {values.type === 'frontend' ? (
                <>
                  <div>
                    <label className={labelClass} htmlFor="buildCommand">Build command</label>
                    <input id="buildCommand" className={inputClass} value={values.buildCommand} onChange={(event) => updateValue('buildCommand', event.target.value)} placeholder="npm run build" disabled={isCreating} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="buildOutDirectory">Output directory</label>
                    <input id="buildOutDirectory" className={inputClass} value={values.buildOutDirectory} onChange={(event) => updateValue('buildOutDirectory', event.target.value)} placeholder="dist" disabled={isCreating} />
                  </div>
                </>
              ) : (
                <div className="md:tw-col-span-2">
                  <label className={labelClass} htmlFor="runCommand">Run command</label>
                  <input id="runCommand" className={inputClass} value={values.runCommand} onChange={(event) => updateValue('runCommand', event.target.value)} placeholder="npm start" disabled={isCreating} />
                </div>
              )}
            </div>
          </div>

          <div className={isDarkTheme ? 'tw-flex tw-items-center tw-justify-end tw-gap-3 tw-border-t tw-border-white/10 tw-bg-white/[0.03] tw-px-6 tw-py-5' : 'tw-flex tw-items-center tw-justify-end tw-gap-3 tw-border-t tw-border-slate-200 tw-bg-slate-50 tw-px-6 tw-py-5'}>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className={isDarkTheme ? 'tw-rounded-lg tw-border tw-border-white/10 tw-bg-black/20 tw-px-4 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-md-neutral-90 hover:tw-bg-white/10 disabled:tw-opacity-50' : 'tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white tw-px-4 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-md-neutral-10 tw-shadow-sm hover:tw-bg-slate-100 disabled:tw-opacity-50'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="tw-rounded-lg tw-bg-blue-500 tw-px-5 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-lg tw-shadow-blue-500/25 tw-transition-all hover:tw--translate-y-0.5 hover:tw-bg-blue-600 disabled:tw-translate-y-0 disabled:tw-opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
