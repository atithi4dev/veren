import React from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import type { ProjectRecord } from './types'

type ProjectSearchModalProps = {
  isOpen: boolean
  isDarkTheme: boolean
  searchQuery: string
  isLoadingProjects: boolean
  filteredProjects: ProjectRecord[]
  onChangeSearchQuery: (value: string) => void
  onClose: () => void
  onSelectProject: (project: ProjectRecord) => void
}

const ProjectSearchModal: React.FC<ProjectSearchModalProps> = ({
  isOpen,
  isDarkTheme,
  searchQuery,
  isLoadingProjects,
  filteredProjects,
  onChangeSearchQuery,
  onClose,
  onSelectProject,
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-start tw-justify-center tw-pt-20">
      <button
        type="button"
        aria-label="Close find modal"
        onClick={onClose}
        className="tw-absolute tw-inset-0 tw-bg-black/40"
      />

      <div className={isDarkTheme ? 'tw-relative tw-z-10 tw-w-full tw-max-w-xl tw-rounded-xl tw-border tw-border-white/20 tw-bg-black tw-shadow-2xl' : 'tw-relative tw-z-10 tw-w-full tw-max-w-xl tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-shadow-2xl'}>
        <div className={isDarkTheme ? 'tw-flex tw-items-center tw-gap-2 tw-border-b tw-border-white/15 tw-p-3' : 'tw-flex tw-items-center tw-gap-2 tw-border-b tw-border-slate-300 tw-p-3'}>
          <FiSearch className={isDarkTheme ? 'tw-text-slate-300' : 'tw-text-slate-500'} />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(event) => onChangeSearchQuery(event.target.value)}
            placeholder="Search projects"
            className={isDarkTheme ? 'tw-w-full tw-bg-transparent tw-text-[14px] md:tw-text-[14.5px] tw-text-white tw-outline-none placeholder:tw-text-slate-500' : 'tw-w-full tw-bg-transparent tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-900 tw-outline-none placeholder:tw-text-slate-500'}
          />
          <button
            type="button"
            onClick={onClose}
            className={isDarkTheme ? 'tw-rounded-md tw-p-1 hover:tw-bg-white/10' : 'tw-rounded-md tw-p-1 hover:tw-bg-slate-100'}
          >
            <FiX className={isDarkTheme ? 'tw-text-slate-300' : 'tw-text-slate-600'} />
          </button>
        </div>

        <div className="tw-max-h-80 tw-overflow-y-auto tw-p-2">
          {isLoadingProjects && (
            <p className={isDarkTheme ? 'tw-px-2 tw-py-2 tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-300' : 'tw-px-2 tw-py-2 tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-600'}>
              Loading projects...
            </p>
          )}

          {!isLoadingProjects && filteredProjects.length === 0 && (
            <p className={isDarkTheme ? 'tw-px-2 tw-py-2 tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-400' : 'tw-px-2 tw-py-2 tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-500'}>
              No projects found.
            </p>
          )}

          {!isLoadingProjects && filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelectProject(project)}
              className={isDarkTheme ? 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-white/10' : 'tw-flex tw-w-full tw-items-center tw-justify-between tw-rounded-md tw-px-3 tw-py-2 tw-text-left hover:tw-bg-slate-100'}
            >
              <span className={isDarkTheme ? 'tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-100' : 'tw-text-[14px] md:tw-text-[14.5px] tw-text-slate-800'}>{project.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectSearchModal
