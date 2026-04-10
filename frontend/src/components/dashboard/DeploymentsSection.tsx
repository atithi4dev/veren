import React from 'react'
import {
  FiChevronDown,
  FiCopy,
  FiGitBranch,
  FiGlobe,
  FiGithub,
  FiServer,
  FiSettings,
} from 'react-icons/fi'
import type { DeploymentRecord, ProjectRecord } from './types'

type DeploymentsSectionProps = {
  isDarkTheme: boolean
  isProjectDeploymentsRoute: boolean
  isLoadingDeployments: boolean
  selectedDeploymentIdFromRoute?: string
  selectedDeployment?: DeploymentRecord
  selectedProject?: ProjectRecord
  ownerGithubHref?: string
  getGithubRepoPath: (gitUrl?: string) => string
  getGitRepoHref: (gitUrl?: string) => string | undefined
  getStatusDotClass: (status?: DeploymentRecord['status']) => string
  openSettingPanels: Record<string, boolean>
  toggleSettingPanel: (panelKey: string) => void
  deploymentDurationLabel: string
  isLoadingBuildLogs: boolean
  buildLogLines: string[]
  buildLogsTerminalRef: React.RefObject<HTMLDivElement | null>
  deployments: DeploymentRecord[]
  formatCreatedAt: (value?: string) => string
  navigate: (to: string) => void
  deploymentsBaseRoute: string
}

const DeploymentsSection: React.FC<DeploymentsSectionProps> = ({
  isDarkTheme,
  isProjectDeploymentsRoute,
  isLoadingDeployments,
  selectedDeploymentIdFromRoute,
  selectedDeployment,
  selectedProject,
  ownerGithubHref,
  getGithubRepoPath,
  getGitRepoHref,
  getStatusDotClass,
  openSettingPanels,
  toggleSettingPanel,
  deploymentDurationLabel,
  isLoadingBuildLogs,
  buildLogLines,
  buildLogsTerminalRef,
  deployments,
  formatCreatedAt,
  navigate,
  deploymentsBaseRoute,
}) => {
  const projectStatusLabel = selectedDeployment?.status ?? selectedProject?.status ?? '--'

  return (
    <div>
      <h3 className="tw-text-base tw-font-semibold">Deployments</h3>
      <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-md-neutral-80' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
        {isProjectDeploymentsRoute ? 'Deployments for this project.' : 'All deployments for your account.'}
      </p>

      {isLoadingDeployments && (
        <p className={isDarkTheme ? 'tw-mt-4 tw-text-xs tw-text-md-neutral-80' : 'tw-mt-4 tw-text-xs tw-text-md-neutral-60'}>
          Loading deployments...
        </p>
      )}

      {!isLoadingDeployments && selectedDeploymentIdFromRoute && !selectedDeployment && (
        <div className={isDarkTheme ? 'tw-mt-4 tw-rounded-lg tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-10 tw-p-4' : 'tw-mt-4 tw-rounded-lg tw-border tw-border-slate-300 tw-bg-md-neutral-99 tw-p-4'}>
          <h4 className="tw-text-sm tw-font-semibold">Deployment not found</h4>
          <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-md-neutral-80' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
            Could not find deployment: {selectedDeploymentIdFromRoute}
          </p>
        </div>
      )}

      {!isLoadingDeployments && selectedDeploymentIdFromRoute && selectedDeployment && (
        <>
          <div className={isDarkTheme ? 'tw-mt-4 tw-w-full tw-rounded-xl tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-10 tw-p-4' : 'tw-mt-4 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-md-neutral-99 tw-p-4'}>
            <div className="tw-flex tw-flex-col tw-gap-3 md:tw-flex-row md:tw-items-center md:tw-justify-between">
              <div>
                <h4 className="tw-text-base tw-font-semibold">Deployment {selectedDeployment.number ? `#${selectedDeployment.number}` : ''}</h4>
                <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-md-neutral-80' : 'tw-mt-1 tw-text-xs tw-text-md-neutral-60'}>
                  ID: {selectedDeployment.id ? `${selectedDeployment.id.slice(0, 8)}...${selectedDeployment.id.slice(-4)}` : '--'}
                </p>
              </div>
            </div>

            <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-md-neutral-40/20' : 'tw-my-4 tw-h-px tw-bg-slate-300'} />

            <div className="tw-grid tw-grid-cols-1 tw-items-stretch tw-gap-4 lg:tw-grid-cols-3">
              <div className="tw-h-full tw-min-h-[16rem] tw-w-full tw-overflow-hidden tw-rounded-lg tw-bg-md-neutral-99 lg:tw-col-span-1">
                <img
                  src="/preview.jpg"
                  alt="Deployment preview"
                  className="tw-h-full tw-min-h-[16rem] tw-w-full tw-object-cover"
                />
              </div>

              <div className="tw-space-y-4 lg:tw-col-span-2">
                <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2 xl:tw-grid-cols-4">
                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Owner</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      {selectedProject?.createdBy?.avatar || selectedProject?.ownerAvatar ? (
                        <img
                          src={selectedProject?.createdBy?.avatar ?? selectedProject?.ownerAvatar}
                          alt="Owner avatar"
                          className="tw-h-6 tw-w-6 tw-rounded-full tw-border tw-border-md-neutral-40/20 tw-object-cover"
                        />
                      ) : (
                        <span className="tw-h-6 tw-w-6 tw-rounded-full tw-bg-gradient-to-br tw-from-blue-500 tw-via-fuchsia-500 tw-to-amber-300" />
                      )}
                      {ownerGithubHref ? (
                        <a
                          href={ownerGithubHref}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95 hover:tw-underline' : 'tw-text-[14px] tw-text-md-neutral-10 hover:tw-underline'}
                        >
                          {selectedDeployment.owner ?? '--'}
                        </a>
                      ) : (
                        <span className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95' : 'tw-text-[14px] tw-text-md-neutral-10'}>{selectedDeployment.owner ?? '--'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Project Status</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <span className={`tw-inline-block tw-h-2.5 tw-w-2.5 tw-rounded-full ${getStatusDotClass(selectedDeployment.status)}`} />
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95' : 'tw-text-[14px] tw-text-md-neutral-10'}>{projectStatusLabel}</span>
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Deployment ID</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <span className={isDarkTheme ? 'tw-max-w-[13rem] tw-truncate tw-text-[14px] tw-text-md-neutral-95' : 'tw-max-w-[13rem] tw-truncate tw-text-[14px] tw-text-md-neutral-10'}>
                        {selectedDeployment.id ?? '--'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Environment</p>
                    <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                      <FiServer className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-80' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95' : 'tw-text-[14px] tw-text-md-neutral-10'}>production</span>
                    </div>
                  </div>
                </div>

                <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-md-neutral-40/20' : 'tw-my-4 tw-h-px tw-bg-slate-300'} />

                <div>
                  <p className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Domains</p>
                  <div className="tw-mt-1 tw-flex tw-items-center tw-gap-2">
                    <FiGlobe className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-80' : 'tw-text-xs tw-text-md-neutral-40'} />
                    <span className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95' : 'tw-text-[14px] tw-text-md-neutral-10'}>{selectedProject?.subdomain ?? selectedProject?.domains?.subdomain ?? 'all domains available'}</span>
                  </div>
                </div>

                <div className={isDarkTheme ? 'tw-my-4 tw-h-px tw-bg-md-neutral-40/20' : 'tw-my-4 tw-h-px tw-bg-slate-300'} />

                <div>
                  <h4 className={isDarkTheme ? 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-80' : 'tw-text-[14.5px] tw-font-medium tw-text-md-neutral-60'}>Source</h4>
                  <div className="tw-mt-3 tw-space-y-2">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <FiGithub className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-80' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <a
                        href={getGitRepoHref(selectedProject?.git?.repoUrl ?? selectedProject?.gitRepoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95 hover:tw-text-slate-400 tw-transition-colors tw-cursor-pointer' : 'tw-text-[14px] tw-text-md-neutral-10 hover:tw-text-md-neutral-50 tw-transition-colors tw-cursor-pointer'}
                      >
                        {selectedProject ? getGithubRepoPath(selectedProject.git?.repoUrl ?? selectedProject.gitRepoUrl) : 'unknown/unknown'}
                      </a>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <FiGitBranch className={isDarkTheme ? 'tw-text-xs tw-text-md-neutral-80' : 'tw-text-xs tw-text-md-neutral-40'} />
                      <span className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-95' : 'tw-text-[14px] tw-text-md-neutral-10'}>{selectedProject?.git?.branch ?? selectedProject?.gitBranch ?? 'main'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={isDarkTheme ? 'tw-mt-4 tw-rounded-xl tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-10 tw-p-4' : 'tw-mt-4 tw-rounded-xl tw-border tw-border-slate-300 tw-bg-md-neutral-99 tw-p-4'}>
            <div className="tw-flex tw-items-center tw-gap-2">
              <FiSettings className={isDarkTheme ? 'tw-text-blue-400' : 'tw-text-blue-600'} />
              <h4 className="tw-text-base tw-font-semibold">Deployment Settings</h4>
            </div>

            <div className="tw-mt-3 tw-space-y-2">
              <div className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-12' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-md-neutral-99'}>
                <button
                  type="button"
                  onClick={() => toggleSettingPanel('build-logs')}
                  className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-400 hover:tw-bg-md-neutral-40/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-600 hover:tw-bg-md-neutral-98'}
                >
                  <span>Build Logs</span>
                  <FiChevronDown className={openSettingPanels['build-logs'] ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} />
                </button>
                {openSettingPanels['build-logs'] && (
                  <div className={isDarkTheme ? 'tw-border-t tw-border-md-neutral-40/20 tw-p-3' : 'tw-border-t tw-border-slate-300 tw-p-3'}>
                    <p className={isDarkTheme ? 'tw-mb-2 tw-text-[12px] tw-text-md-neutral-70' : 'tw-mb-2 tw-text-[12px] tw-text-md-neutral-65'}>Duration: {deploymentDurationLabel}</p>
                    <div
                      ref={buildLogsTerminalRef}
                      className={isDarkTheme ? 'tw-h-96 tw-overflow-y-auto tw-rounded-lg tw-border-2 tw-border-blue-500/30 tw-bg-gradient-to-br tw-from-md-neutral-12 tw-to-md-neutral-10 tw-p-4 tw-text-base tw-shadow-lg scrollbar-aesthetic' : 'tw-h-96 tw-overflow-y-auto tw-rounded-lg tw-border-2 tw-border-blue-400/20 tw-bg-gradient-to-br tw-from-md-neutral-95 tw-to-md-neutral-99 tw-p-4 tw-text-base tw-shadow-md scrollbar-aesthetic'}
                      style={{
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace",
                        letterSpacing: '0.02em',
                      }}
                    >
                      {isLoadingBuildLogs && buildLogLines.length === 0 ? (
                        <p className="tw-text-white">Loading build logs...</p>
                      ) : (
                        buildLogLines.map((line, index) => (
                          <div key={`${line}-${index}`}>
                            <p className="tw-whitespace-pre-wrap tw-break-words tw-text-white tw-leading-tight">{line}</p>
                            <div className={isDarkTheme ? 'tw-my-1 tw-h-px tw-bg-md-neutral-40/40' : 'tw-my-1 tw-h-px tw-bg-md-neutral-80/30'} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-12' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-md-neutral-99'}>
                <button
                  type="button"
                  onClick={() => toggleSettingPanel('deployment-summary')}
                  className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-400 hover:tw-bg-md-neutral-40/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-600 hover:tw-bg-md-neutral-98'}
                >
                  <span>Deployment Summary</span>
                  <FiChevronDown className={openSettingPanels['deployment-summary'] ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} />
                </button>
                {openSettingPanels['deployment-summary'] && (
                  <div className={isDarkTheme ? 'tw-border-t tw-border-md-neutral-40/20 tw-p-3' : 'tw-border-t tw-border-slate-300 tw-p-3'}>
                    <p className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-85' : 'tw-text-[14px] tw-text-md-neutral-20'}>Status: {selectedDeployment.status ?? '--'}</p>
                  </div>
                )}
              </div>

              <div className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-12' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-md-neutral-99'}>
                <button
                  type="button"
                  onClick={() => toggleSettingPanel('deployment-checks')}
                  className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-400 hover:tw-bg-md-neutral-40/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-600 hover:tw-bg-md-neutral-98'}
                >
                  <span>Deployment Checks</span>
                  <FiChevronDown className={openSettingPanels['deployment-checks'] ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} />
                </button>
                {openSettingPanels['deployment-checks'] && (
                  <div className={isDarkTheme ? 'tw-border-t tw-border-md-neutral-40/20 tw-p-3' : 'tw-border-t tw-border-slate-300 tw-p-3'}>
                    <p className={isDarkTheme ? 'tw-text-[14px] tw-text-md-neutral-85' : 'tw-text-[14px] tw-text-md-neutral-20'}>All checks are passing.</p>
                  </div>
                )}
              </div>

              <div className={isDarkTheme ? 'tw-rounded-md tw-border tw-border-md-neutral-40/20 tw-bg-md-neutral-12' : 'tw-rounded-md tw-border tw-border-slate-300 tw-bg-md-neutral-99'}>
                <button
                  type="button"
                  onClick={() => toggleSettingPanel('copy-id')}
                  className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-400 hover:tw-bg-md-neutral-40/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-left tw-text-[14px] tw-text-blue-600 hover:tw-bg-md-neutral-98'}
                >
                  <span>Copy Deployment ID</span>
                  <FiChevronDown className={openSettingPanels['copy-id'] ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} />
                </button>
                {openSettingPanels['copy-id'] && (
                  <div className={isDarkTheme ? 'tw-border-t tw-border-md-neutral-40/20 tw-p-3' : 'tw-border-t tw-border-slate-300 tw-p-3'}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedDeployment.id) {
                          return
                        }

                        void window.navigator.clipboard?.writeText(selectedDeployment.id)
                      }}
                      className={isDarkTheme ? 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-md-neutral-40/20 tw-px-3 tw-py-2 tw-text-[14px] tw-text-blue-400 hover:tw-bg-md-neutral-40/10' : 'tw-inline-flex tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-slate-300 tw-px-3 tw-py-2 tw-text-[14px] tw-text-blue-600 hover:tw-bg-md-neutral-98'}
                    >
                      <FiCopy />
                      <span>Copy now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!isLoadingDeployments && !selectedDeploymentIdFromRoute && deployments.length === 0 && (
        <p className={isDarkTheme ? 'tw-mt-4 tw-text-xs tw-text-slate-400' : 'tw-mt-4 tw-text-xs tw-text-slate-500'}>
          No deployments found.
        </p>
      )}

      {!isLoadingDeployments && !selectedDeploymentIdFromRoute && deployments.length > 0 && (
        <div className="tw-mt-4 tw-space-y-2">
          {deployments.map((deployment) => (
            <button
              type="button"
              key={deployment.id ?? `${deployment.number ?? 'deployment'}-${deployment.createdAt ?? 'na'}`}
              onClick={() => {
                if (!deployment.id) {
                  return
                }

                navigate(`${deploymentsBaseRoute}/${encodeURIComponent(deployment.id)}`)
              }}
              className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-white/15 tw-bg-black tw-p-3 tw-text-left hover:tw-bg-white/5' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-p-3 tw-text-left hover:tw-bg-slate-50'}
            >
              <span className="tw-min-w-0">
                <span className={isDarkTheme ? 'tw-block tw-truncate tw-text-sm tw-font-medium tw-text-white' : 'tw-block tw-truncate tw-text-sm tw-font-medium tw-text-slate-900'}>
                  {deployment.id ?? 'Unknown deployment'}
                </span>
                <span className={isDarkTheme ? 'tw-mt-0.5 tw-block tw-text-xs tw-text-slate-300' : 'tw-mt-0.5 tw-block tw-text-xs tw-text-slate-600'}>
                  {deployment.status ?? 'queued'} • {formatCreatedAt(deployment.createdAt)}
                </span>
              </span>
              <span className={isDarkTheme ? 'tw-text-xs tw-text-slate-300' : 'tw-text-xs tw-text-slate-600'}>
                {deployment.number ? `#${deployment.number}` : '--'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeploymentsSection
