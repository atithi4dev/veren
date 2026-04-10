import React from 'react'
import {
  FiActivity,
  FiChevronDown,
  FiClock,
  FiGitBranch,
  FiGlobe,
  FiGithub,
  FiMoreHorizontal,
  FiRefreshCcw,
  FiServer,
  FiSettings,
} from 'react-icons/fi'
import type { ProjectRecord } from './types'

type ProjectsContentProps = {
  isDarkTheme: boolean
  selectedProjectNameFromRoute?: string
  selectedProject?: ProjectRecord
  isLoadingProjects: boolean
  projects: ProjectRecord[]
  onSelectProject: (project: ProjectRecord) => void
  stripHttpPrefix: (value?: string) => string
  getGithubRepoPath: (gitUrl?: string) => string
  getGitRepoHref: (gitUrl?: string) => string | undefined
  getDomainHref: (domain?: string) => string | undefined
  formatCreatedAt: (value?: string) => string
  onRedeployProject: (projectId: string) => void
  onViewDeployments: (projectName: string) => void
  onOpenEnvModal: () => void
}

const ProjectsContent: React.FC<ProjectsContentProps> = ({
  isDarkTheme,
  selectedProjectNameFromRoute,
  selectedProject,
  isLoadingProjects,
  projects,
  onSelectProject,
  stripHttpPrefix,
  getGithubRepoPath,
  getGitRepoHref,
  getDomainHref,
  formatCreatedAt,
  onRedeployProject,
  onViewDeployments,
  onOpenEnvModal,
}) => {
  const [isVisitMenuOpen, setIsVisitMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setIsVisitMenuOpen(false)
  }, [selectedProjectNameFromRoute])

  if (selectedProjectNameFromRoute) {
    const projectTypeLabel = selectedProject?.type ?? 'frontend'
    const repositoryUrl = getGitRepoHref(selectedProject?.git?.repoUrl ?? selectedProject?.gitRepoUrl)
    const domainValue = selectedProject?.domains?.subdomain ?? selectedProject?.subdomain ?? '--'
    const resolvedDeployment = (() => {
      if (!selectedProject) {
        return undefined
      }

      if (selectedProject.currentDeployment && typeof selectedProject.currentDeployment === 'object') {
        return selectedProject.currentDeployment
      }

      if (typeof selectedProject.currentDeployment === 'string' && selectedProject.deployments?.length) {
        return selectedProject.deployments.find((deployment) => deployment.id === selectedProject.currentDeployment)
      }

      return selectedProject.deployments?.[0]
    })()

    const deploymentOwner = resolvedDeployment?.owner
      ?? selectedProject?.createdBy?.userName
      ?? selectedProject?.createdBy?.name
      ?? selectedProject?.ownerName
      ?? '--'
    const deploymentStatus = resolvedDeployment?.status ?? '--'
    const sourceBranch = selectedProject?.git?.branch ?? selectedProject?.gitBranch ?? '--'
    const repositoryPath = getGithubRepoPath(selectedProject?.git?.repoUrl ?? selectedProject?.gitRepoUrl)
    const ownerName = deploymentOwner
    const ownerAvatar = selectedProject?.createdBy?.avatar ?? selectedProject?.ownerAvatar
    const createdAtLabel = formatCreatedAt(resolvedDeployment?.createdAt ?? selectedProject?.createdAt)
    const statusLabel = deploymentStatus !== '--' ? deploymentStatus : 'queued'
    const statusDotClass = (() => {
      if (statusLabel === 'queued') {
        return 'tw-bg-amber-400'
      }

      if (statusLabel === 'building') {
        return 'tw-bg-blue-400'
      }

      if (statusLabel === 'deployed') {
        return 'tw-bg-emerald-400'
      }

      if (statusLabel === 'failed') {
        return 'tw-bg-rose-500'
      }

      return 'tw-bg-slate-400'
    })()

    return (
      <>
        {!selectedProject && (
          <div className={isDarkTheme ? 'tw-rounded-lg tw-border tw-border-white/15 tw-bg-black tw-p-4' : 'tw-rounded-lg tw-border tw-border-md-neutral-70 tw-bg-md-neutral-99 tw-p-4'}>
            <h3 className="tw-text-base tw-font-semibold">Project not found</h3>
            <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-slate-300' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
              Could not find project: {selectedProjectNameFromRoute}
            </p>
          </div>
        )}

        {selectedProject && (
          <div className={isDarkTheme ? 'tw-w-full tw-rounded-xl tw-border tw-border-white/15 tw-bg-black tw-p-4' : 'tw-w-full tw-rounded-xl tw-border tw-border-md-neutral-70 tw-bg-md-neutral-99 tw-p-4'}>
            <div className="tw-flex tw-flex-col tw-gap-3 md:tw-flex-row md:tw-items-center md:tw-justify-between">
              <div>
                <h3 className="tw-text-base tw-font-semibold">{selectedProject.name}</h3>
                <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-slate-300' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
                  {projectTypeLabel}
                </p>
              </div>

              <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedProject.id) {
                      return
                    }

                    onRedeployProject(selectedProject.id)
                  }}
                  className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-90 hover:tw-bg-md-neutral-25 tw-transition-all' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-70 tw-bg-md-neutral-95 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-10 hover:tw-bg-md-neutral-90 tw-transition-all'}
                >
                  <FiRefreshCcw className="tw-text-base" />
                  <span>Redeploy</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewDeployments(selectedProject.name)}
                  className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-90 hover:tw-bg-md-neutral-25 tw-transition-all' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-70 tw-bg-md-neutral-95 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-10 hover:tw-bg-md-neutral-90 tw-transition-all'}
                >
                  <FiActivity className="tw-text-base" />
                  <span>Deployments</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenEnvModal}
                  className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-90 hover:tw-bg-md-neutral-25 tw-transition-all' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-70 tw-bg-md-neutral-95 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-10 hover:tw-bg-md-neutral-90 tw-transition-all'}
                >
                  <FiSettings className="tw-text-base" />
                  <span>Edit Environment</span>
                </button>

                <div className="tw-relative">
                  <button
                    type="button"
                    onClick={() => setIsVisitMenuOpen((prev) => !prev)}
                    className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-40 tw-bg-md-neutral-17 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-90 hover:tw-bg-md-neutral-25 tw-transition-all' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-70 tw-bg-md-neutral-95 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-md-neutral-10 hover:tw-bg-md-neutral-90 tw-transition-all'}
                  >
                    <span>Visit</span>
                    <FiChevronDown className="tw-text-base" />
                  </button>

                  {isVisitMenuOpen && (
                    <div className={isDarkTheme ? 'tw-absolute tw-right-0 tw-z-20 tw-mt-2 tw-rounded-lg tw-border tw-border-emerald-500/30 tw-bg-gradient-to-br tw-from-slate-900 tw-to-slate-800 tw-p-4 tw-backdrop-blur-sm' : 'tw-absolute tw-right-0 tw-z-20 tw-mt-2 tw-rounded-lg tw-border tw-border-emerald-300/50 tw-bg-gradient-to-br tw-from-md-neutral-99 tw-to-md-neutral-95 tw-p-4'}>
                      <div className={isDarkTheme ? 'tw-grid tw-h-36 tw-w-36 tw-grid-cols-6 tw-gap-[3px] tw-rounded-md tw-bg-slate-950/50 tw-p-2 tw-border tw-border-md-neutral-40/50' : 'tw-grid tw-h-36 tw-w-36 tw-grid-cols-6 tw-gap-[3px] tw-rounded-md tw-bg-md-neutral-95 tw-p-2 tw-border tw-border-md-neutral-70'}>
                        {Array.from({ length: 36 }).map((_, index) => (
                          <span
                            key={index}
                            className={index % 2 === 0 || index % 5 === 0 || index % 7 === 0
                              ? (isDarkTheme ? 'tw-block tw-h-4 tw-w-4 tw-bg-emerald-500/70 tw-rounded-sm' : 'tw-block tw-h-4 tw-w-4 tw-bg-emerald-400 tw-rounded-sm')
                              : (isDarkTheme ? 'tw-block tw-h-4 tw-w-4 tw-bg-md-neutral-25/50 tw-rounded-sm' : 'tw-block tw-h-4 tw-w-4 tw-bg-md-neutral-90 tw-rounded-sm')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-white/15' : 'tw-my-4 tw-h-px tw-bg-md-neutral-70'} />

            <div className="tw-grid tw-grid-cols-1 tw-items-stretch tw-gap-4 lg:tw-grid-cols-3">
              <div className="tw-h-full tw-min-h-[16rem] tw-w-full tw-overflow-hidden tw-rounded-lg tw-bg-md-neutral-99 lg:tw-col-span-1">
                <img
                  src="/preview.jpg"
                  alt="Project preview"
                  className="tw-h-full tw-min-h-[16rem] tw-w-full tw-object-cover"
                />
              </div>

              <div className="tw-space-y-4 lg:tw-col-span-2">
                <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2 xl:tw-grid-cols-4">
                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Created</p>
                    <div className="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                      {ownerAvatar ? (
                        <img
                          src={ownerAvatar}
                          alt="Owner avatar"
                          className="tw-h-7 tw-w-7 tw-rounded-full tw-border tw-border-white/25 tw-object-cover"
                        />
                      ) : (
                        <span className="tw-h-7 tw-w-7 tw-rounded-full tw-bg-gradient-to-br tw-from-blue-500 tw-via-fuchsia-500 tw-to-amber-300" />
                      )}
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>{ownerName}</span>
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Status</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <span className={`tw-inline-block tw-h-2.5 tw-w-2.5 tw-rounded-full ${statusDotClass}`} />
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>{statusLabel}</span>
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>CreatedAt</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <FiClock className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <p className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>{createdAtLabel}</p>
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Environment</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <FiServer className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <p className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>production</p>
                    </div>
                  </div>
                </div>

                <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-white/15' : 'tw-my-4 tw-h-px tw-bg-md-neutral-70'} />

                <div>
                  <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Domains</p>
                  <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                    <FiGlobe className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-md-neutral-40'} />
                    <span className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>{domainValue !== '--' ? domainValue : 'all domains available'}</span>
                  </div>
                </div>

                <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-white/15' : 'tw-my-4 tw-h-px tw-bg-md-neutral-70'} />

                <div>
                  <h4 className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-slate-300' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Source</h4>
                  <div className="tw-mt-3 tw-space-y-2">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <FiGithub className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <a
                        href={repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isDarkTheme ? 'tw-text-[14px] tw-text-white hover:tw-text-slate-400 tw-transition-colors tw-cursor-pointer' : 'tw-text-[14px] tw-text-md-neutral-10 hover:tw-text-md-neutral-50 tw-transition-colors tw-cursor-pointer'}
                      >
                        {repositoryPath}
                      </a>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <FiGitBranch className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-white' : 'tw-text-[14px] tw-text-md-neutral-10'}>{sourceBranch}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <h3 className="tw-text-base tw-font-semibold">Projects</h3>
      <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-slate-300' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
        Your deployed and connected projects.
      </p>

      {isLoadingProjects && (
        <p className={isDarkTheme ? 'tw-mt-4 tw-text-xs tw-text-slate-300' : 'tw-mt-4 tw-text-xs tw-text-md-neutral-60'}>
          Loading projects...
        </p>
      )}

      {!isLoadingProjects && projects.length === 0 && (
        <p className={isDarkTheme ? 'tw-mt-4 tw-text-xs tw-text-md-neutral-70' : 'tw-mt-4 tw-text-xs tw-text-md-neutral-60'}>
          No projects available yet.
        </p>
      )}

      {!isLoadingProjects && projects.length > 0 && (
        <div className="tw-mt-4 tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2 xl:tw-grid-cols-3">
          {projects.map((project) => {
            const projectUrl = stripHttpPrefix(project.subdomain)
            const repoPath = getGithubRepoPath(project.gitRepoUrl)
            const repoHref = getGitRepoHref(project.gitRepoUrl)
            const domainHref = getDomainHref(project.subdomain)

            return (
              <article
                key={project.id}
                className={isDarkTheme ? 'tw-rounded-lg tw-border tw-border-white/15 tw-bg-black/80 tw-p-3' : 'tw-rounded-lg tw-border tw-border-md-neutral-70 tw-bg-md-neutral-99 tw-p-3'}
              >
                <div className="tw-flex tw-items-start tw-justify-between tw-gap-2.5">
                  <div className="tw-flex tw-min-w-0 tw-items-start tw-gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className={isDarkTheme ? 'tw-relative tw-h-9 tw-w-9 tw-shrink-0 tw-overflow-hidden tw-rounded-sm tw-border tw-border-white/20 hover:tw-opacity-90' : 'tw-relative tw-h-9 tw-w-9 tw-shrink-0 tw-overflow-hidden tw-rounded-sm tw-border tw-border-md-neutral-70 hover:tw-opacity-90'}
                    >
                      <span
                        className="tw-absolute tw-inset-0 tw-bg-gradient-to-tr tw-from-blue-500 tw-to-cyan-400"
                        style={{ clipPath: 'polygon(0 0,100% 0,0 100%)' }}
                      />
                      <span
                        className="tw-absolute tw-inset-0 tw-bg-gradient-to-bl tw-from-fuchsia-500 tw-to-amber-300"
                        style={{ clipPath: 'polygon(100% 0,100% 100%,0 100%)' }}
                      />
                      <span
                        className={isDarkTheme ? 'tw-absolute tw-left-1/2 tw-top-[-20%] tw-h-[140%] tw-w-px tw-origin-center tw-rotate-45 tw-bg-md-neutral-99' : 'tw-absolute tw-left-1/2 tw-top-[-20%] tw-h-[140%] tw-w-px tw-origin-center tw-rotate-45 tw-bg-black'}
                      />
                    </button>

                    <div className="tw-min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        className={isDarkTheme ? 'tw-truncate tw-text-left tw-text-sm tw-font-semibold tw-text-white hover:tw-underline' : 'tw-truncate tw-text-left tw-text-sm tw-font-semibold tw-text-md-neutral-10 hover:tw-underline'}
                      >
                        {project.name}
                      </button>
                      <p className={isDarkTheme ? 'tw-mt-0.5 tw-truncate tw-text-xs tw-text-slate-300' : 'tw-mt-0.5 tw-truncate tw-text-xs tw-text-md-neutral-60'}>
                        {domainHref ? (
                          <a
                            href={domainHref}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={isDarkTheme ? 'hover:tw-text-white hover:tw-underline' : 'hover:tw-text-md-neutral-10 hover:tw-underline'}
                          >
                            {projectUrl}
                          </a>
                        ) : projectUrl}
                      </p>
                    </div>
                  </div>

                  <div className="tw-flex tw-items-center tw-gap-1.5">
                    <button type="button" className={isDarkTheme ? 'tw-rounded-md tw-p-1 hover:tw-bg-white/10' : 'tw-rounded-md tw-p-1 hover:tw-bg-md-neutral-90'}>
                      <FiMoreHorizontal className={isDarkTheme ? 'tw-text-sm tw-text-white' : 'tw-text-sm tw-text-md-neutral-10'} />
                    </button>
                    <span className={isDarkTheme ? 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-border tw-border-white/70' : 'tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-border tw-border-md-neutral-10'}>
                      <FiActivity className={isDarkTheme ? 'tw-text-[11px] tw-text-white' : 'tw-text-[11px] tw-text-md-neutral-10'} />
                    </span>
                  </div>
                </div>

                <div className={isDarkTheme ? 'tw-mt-2 tw-inline-flex tw-max-w-full tw-items-center tw-gap-1.5 tw-rounded-md tw-border tw-border-white/20 tw-bg-black tw-px-2 tw-py-1' : 'tw-mt-2 tw-inline-flex tw-max-w-full tw-items-center tw-gap-1.5 tw-rounded-md tw-border tw-border-md-neutral-70 tw-bg-md-neutral-99 tw-px-2 tw-py-1'}>
                  <FiGithub className={isDarkTheme ? 'tw-shrink-0 tw-text-[10px] tw-text-md-neutral-90' : 'tw-shrink-0 tw-text-[10px] tw-text-md-neutral-40'} />
                  {repoHref ? (
                    <a
                      href={repoHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={isDarkTheme ? 'tw-truncate tw-text-[10px] tw-text-md-neutral-90 hover:tw-text-white hover:tw-underline' : 'tw-truncate tw-text-[10px] tw-text-md-neutral-40 hover:tw-text-md-neutral-10 hover:tw-underline'}
                    >
                      {repoPath}
                    </a>
                  ) : (
                    <span className={isDarkTheme ? 'tw-truncate tw-text-[10px] tw-text-md-neutral-90' : 'tw-truncate tw-text-[10px] tw-text-md-neutral-40'}>{repoPath}</span>
                  )}
                </div>

                <div className="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                  <p className={isDarkTheme ? 'tw-truncate tw-text-[10px] tw-text-md-neutral-70' : 'tw-truncate tw-text-[10px] tw-text-md-neutral-60'}>{formatCreatedAt(project.createdAt)}</p>
                  <div className="tw-flex tw-shrink-0 tw-items-center tw-gap-1.5">
                    <FiGitBranch className={isDarkTheme ? 'tw-text-[10px] tw-text-md-neutral-90' : 'tw-text-[10px] tw-text-md-neutral-60'} />
                    <span className={isDarkTheme ? 'tw-text-[10px] tw-text-md-neutral-90' : 'tw-text-[10px] tw-text-md-neutral-60'}>{project.gitBranch ?? 'main'}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

export default ProjectsContent
