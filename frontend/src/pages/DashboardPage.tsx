import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'
import { apiClient, authApi, authTokens, deploymentApi, logsApi, projectsApi, unwrapApiResponse } from '../api'
import type { EnvPair } from '../api/types'
import { useTheme } from '../theme/ThemeContext'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import ProjectSearchModal from '../components/dashboard/ProjectSearchModal'
import ProjectsContent from '../components/dashboard/ProjectsContent'
import DeploymentsSection from '../components/dashboard/DeploymentsSection'
import LogsSection from '../components/dashboard/LogsSection'
import { EnvModal } from '../components/dashboard/EnvModal'
import type { DeploymentRecord, ProfileUser, ProjectRecord } from '../components/dashboard/types'
import type { LogsLimit } from '../api/logs.api'

const PROFILE_CACHE_KEY = 'veren-profile-cache'
const PROJECTS_CACHE_KEY = 'veren-projects-cache'
const SELECTED_PROJECT_CACHE_KEY = 'veren-selected-project'
const PROJECTS_CACHE_SECRET = 'veren-projects-cache-v1'

const DashboardPage: React.FC = () => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'
  const location = useLocation()
  const navigate = useNavigate()
  const { projectName: projectNameParam, deploymentId: deploymentIdParam } = useParams()

  const [profileUser, setProfileUser] = React.useState<ProfileUser | null>(null)
  const [activeItemLabel, setActiveItemLabel] = React.useState<string>('Projects')
  const [isFindModalOpen, setIsFindModalOpen] = React.useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [openSettingPanels, setOpenSettingPanels] = React.useState<Record<string, boolean>>({
    'deployment-settings': true,
  })
  const [projects, setProjects] = React.useState<ProjectRecord[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(false)
  const [deployments, setDeployments] = React.useState<DeploymentRecord[]>([])
  const [isLoadingDeployments, setIsLoadingDeployments] = React.useState(false)
  const [storedSelectedProject, setStoredSelectedProject] = React.useState<ProjectRecord | undefined>(undefined)
  const [buildLogLines, setBuildLogLines] = React.useState<string[]>([])
  const [isLoadingBuildLogs, setIsLoadingBuildLogs] = React.useState(false)
  const [logsLines, setLogsLines] = React.useState<string[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(false)
  const [manualLogsDeploymentId, setManualLogsDeploymentId] = React.useState('')
  const [logsLimit, setLogsLimit] = React.useState<LogsLimit | ''>('')
  const [logsCursor, setLogsCursor] = React.useState<string | undefined>(undefined)
  const [isLogsStreaming, setIsLogsStreaming] = React.useState(false)
  const [logsMode, setLogsMode] = React.useState<'live' | 'static'>('live')
  const [isEnvModalOpen, setIsEnvModalOpen] = React.useState(false)
  const [envVars, setEnvVars] = React.useState<EnvPair[]>([])
  const [isLoadingEnvVars, setIsLoadingEnvVars] = React.useState(false)

  const profileModalRef = React.useRef<HTMLDivElement | null>(null)
  const buildLogsTerminalRef = React.useRef<HTMLDivElement | null>(null)
  const logsTerminalRef = React.useRef<HTMLDivElement | null>(null)
  const locallyCompletedBuildDeploymentsRef = React.useRef<Set<string>>(new Set())

  const toBase64 = React.useCallback((bytes: Uint8Array): string => {
    let binary = ''

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })

    return window.btoa(binary)
  }, [])

  const fromBase64 = React.useCallback((value: string): ArrayBuffer => {
    const binary = window.atob(value)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    return bytes.buffer
  }, [])

  const deriveProjectsCacheKey = React.useCallback(async (): Promise<CryptoKey | null> => {
    if (!window.crypto?.subtle) {
      return null
    }

    const digest = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(PROJECTS_CACHE_SECRET),
    )

    return window.crypto.subtle.importKey(
      'raw',
      digest,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    )
  }, [])

  const encryptProjectsPayload = React.useCallback(async (items: ProjectRecord[]): Promise<string> => {
    const jsonValue = JSON.stringify(items)
    const secretKey = await deriveProjectsCacheKey()

    if (!secretKey || !window.crypto?.getRandomValues) {
      return window.btoa(jsonValue)
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encryptedValue = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      secretKey,
      new TextEncoder().encode(jsonValue),
    )

    return JSON.stringify({
      version: 1,
      iv: toBase64(iv),
      data: toBase64(new Uint8Array(encryptedValue)),
    })
  }, [deriveProjectsCacheKey, toBase64])

  const decryptProjectsPayload = React.useCallback(async (payload: string): Promise<ProjectRecord[] | null> => {
    try {
      const parsed = JSON.parse(payload) as { version?: number; iv?: string; data?: string }

      if (parsed.version === 1 && parsed.iv && parsed.data) {
        const secretKey = await deriveProjectsCacheKey()

        if (!secretKey || !window.crypto?.subtle) {
          return null
        }

        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fromBase64(parsed.iv) },
          secretKey,
          fromBase64(parsed.data),
        )

        return JSON.parse(new TextDecoder().decode(decrypted)) as ProjectRecord[]
      }
    } catch {
      try {
        return JSON.parse(window.atob(payload)) as ProjectRecord[]
      } catch {
        return null
      }
    }

    return null
  }, [deriveProjectsCacheKey, fromBase64])

  const normalizeProjects = React.useCallback((payload: unknown): ProjectRecord[] => {
    let list: unknown[] = []

    if (Array.isArray(payload)) {
      list = payload
    } else if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { data?: unknown[] }).data)
    ) {
      list = (payload as { data: unknown[] }).data
    }

    return list
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item, index) => {
        const toDeploymentRecord = (deployment: unknown): DeploymentRecord | undefined => {
          if (typeof deployment !== 'object' || deployment === null) {
            return undefined
          }

          const deploymentRecord = deployment as Record<string, unknown>
          const ownerValue = deploymentRecord.owner
          const errorValue = deploymentRecord.error as Record<string, unknown> | undefined

          return {
            id: typeof deploymentRecord._id === 'string'
              ? deploymentRecord._id
              : typeof deploymentRecord.id === 'string'
                ? deploymentRecord.id
                : undefined,
            owner: typeof ownerValue === 'string'
              ? ownerValue
              : typeof ownerValue === 'object' && ownerValue !== null
                ? typeof (ownerValue as Record<string, unknown>).userName === 'string'
                  ? (ownerValue as Record<string, unknown>).userName as string
                  : typeof (ownerValue as Record<string, unknown>).name === 'string'
                    ? (ownerValue as Record<string, unknown>).name as string
                    : typeof (ownerValue as Record<string, unknown>)._id === 'string'
                      ? (ownerValue as Record<string, unknown>)._id as string
                      : undefined
                : undefined,
            status: deploymentRecord.status === 'queued' || deploymentRecord.status === 'building' || deploymentRecord.status === 'deployed' || deploymentRecord.status === 'failed'
              ? deploymentRecord.status
              : undefined,
            number: typeof deploymentRecord.number === 'number' ? deploymentRecord.number : undefined,
            commitHash: typeof deploymentRecord.commitHash === 'string' ? deploymentRecord.commitHash : undefined,
            commitMessage: typeof deploymentRecord.commitMessage === 'string' ? deploymentRecord.commitMessage : undefined,
            buildLogsUrl: typeof deploymentRecord.buildLogsUrl === 'string' ? deploymentRecord.buildLogsUrl : undefined,
            artifactUrl: typeof deploymentRecord.artifactUrl === 'string' ? deploymentRecord.artifactUrl : undefined,
            rollBackArtifactUrl: typeof deploymentRecord.rollBackArtifactUrl === 'string' ? deploymentRecord.rollBackArtifactUrl : undefined,
            startedAt: typeof deploymentRecord.startedAt === 'string' ? deploymentRecord.startedAt : undefined,
            finishedAt: typeof deploymentRecord.finishedAt === 'string' ? deploymentRecord.finishedAt : undefined,
            createdAt: typeof deploymentRecord.createdAt === 'string'
              ? deploymentRecord.createdAt
              : typeof deploymentRecord.updatedAt === 'string'
                ? deploymentRecord.updatedAt
                : typeof errorValue?.message === 'string'
                  ? undefined
                  : undefined,
          }
        }

        const domains = item.domains as Record<string, unknown> | undefined
        const createdBy = item.createdBy as Record<string, unknown> | undefined
        const git = item.git as Record<string, unknown> | undefined
        const frontendBuild = item.frontendBuild as Record<string, unknown> | undefined
        const backendBuild = item.backendBuild as Record<string, unknown> | undefined
        const runtime = item.runtime as Record<string, unknown> | undefined
        const deploymentsRaw = Array.isArray(item.deployments) ? item.deployments : []
        const normalizedDeployments = deploymentsRaw
          .map((deployment) => toDeploymentRecord(deployment))
          .filter((deployment): deployment is DeploymentRecord => Boolean(deployment))

        const currentDeployment = (() => {
          if (typeof item.currentDeployment === 'string') {
            return item.currentDeployment
          }

          const normalizedCurrent = toDeploymentRecord(item.currentDeployment)
          return normalizedCurrent ?? undefined
        })()

        return {
          id: typeof item._id === 'string'
            ? item._id
            : typeof item.id === 'string'
              ? item.id
              : `project-${index}`,
          name: typeof item.name === 'string' ? item.name : 'Untitled Project',
          type: item.type === 'frontend' || item.type === 'backend' ? item.type : undefined,
          createdAt: typeof item.createdAt === 'string'
            ? item.createdAt
            : typeof item.created_at === 'string'
              ? item.created_at
              : typeof item.timestamp === 'string'
                ? item.timestamp
                : undefined,
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
          git: {
            provider: typeof git?.provider === 'string' ? git.provider : undefined,
            repoUrl: typeof git?.repoUrl === 'string' ? git.repoUrl : undefined,
            branch: typeof git?.branch === 'string' ? git.branch : undefined,
            rootDir: typeof git?.rootDir === 'string' ? git.rootDir : undefined,
          },
          entryDirectory: typeof item.entryDirectory === 'string' ? item.entryDirectory : undefined,
          domains: {
            subdomain: typeof domains?.subdomain === 'string' ? domains.subdomain : undefined,
          },
          frontendBuild: {
            framework: typeof frontendBuild?.framework === 'string' ? frontendBuild.framework : undefined,
            installCommand: typeof frontendBuild?.installCommand === 'string' ? frontendBuild.installCommand : undefined,
            buildCommand: typeof frontendBuild?.buildCommand === 'string' ? frontendBuild.buildCommand : undefined,
            outDir: typeof frontendBuild?.outDir === 'string' ? frontendBuild.outDir : undefined,
            version: typeof frontendBuild?.version === 'number' ? frontendBuild.version : undefined,
          },
          backendBuild: {
            installCommand: typeof backendBuild?.installCommand === 'string' ? backendBuild.installCommand : undefined,
            runCommand: typeof backendBuild?.runCommand === 'string' ? backendBuild.runCommand : undefined,
            version: typeof backendBuild?.version === 'number' ? backendBuild.version : undefined,
          },
          runtime: {
            rType: runtime?.rType === 'static' || runtime?.rType === 'server' ? runtime.rType : undefined,
            port: typeof runtime?.port === 'number' ? runtime.port : undefined,
          },
          status: item.status === 'active' || item.status === 'paused' || item.status === 'deleted' ? item.status : undefined,
          deployments: normalizedDeployments,
          currentDeployment,
          createdBy: {
            id: typeof createdBy?._id === 'string' ? createdBy._id : undefined,
            name: typeof createdBy?.name === 'string' ? createdBy.name : undefined,
            userName: typeof createdBy?.userName === 'string' ? createdBy.userName : undefined,
            avatar: typeof createdBy?.avatar === 'string' ? createdBy.avatar : undefined,
          },
          subdomain: typeof domains?.subdomain === 'string' ? domains.subdomain : undefined,
          ownerName: typeof createdBy?.userName === 'string'
            ? createdBy.userName
            : typeof createdBy?.name === 'string'
              ? createdBy.name
              : undefined,
          ownerAvatar: typeof createdBy?.avatar === 'string' ? createdBy.avatar : undefined,
          gitProvider: typeof git?.provider === 'string' ? git.provider : undefined,
          gitRepoUrl: typeof git?.repoUrl === 'string' ? git.repoUrl : undefined,
          gitBranch: typeof git?.branch === 'string' ? git.branch : undefined,
          gitRootDir: typeof git?.rootDir === 'string' ? git.rootDir : undefined,
        }
      })
  }, [])

  const normalizeDeployments = React.useCallback((payload: unknown): DeploymentRecord[] => {
    let list: unknown[] = []

    if (Array.isArray(payload)) {
      list = payload
    } else if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { data?: unknown[] }).data)
    ) {
      list = (payload as { data: unknown[] }).data
    }

    return list
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => {
        const owner = item.owner

        return {
          id: typeof item._id === 'string'
            ? item._id
            : typeof item.id === 'string'
              ? item.id
              : undefined,
          owner: typeof owner === 'string'
            ? owner
            : typeof owner === 'object' && owner !== null
              ? typeof (owner as Record<string, unknown>).userName === 'string'
                ? (owner as Record<string, unknown>).userName as string
                : typeof (owner as Record<string, unknown>).name === 'string'
                  ? (owner as Record<string, unknown>).name as string
                  : typeof (owner as Record<string, unknown>)._id === 'string'
                    ? (owner as Record<string, unknown>)._id as string
                    : undefined
              : undefined,
          status: item.status === 'queued' || item.status === 'building' || item.status === 'deployed' || item.status === 'failed'
            ? item.status
            : undefined,
          number: typeof item.number === 'number' ? item.number : undefined,
          commitHash: typeof item.commitHash === 'string' ? item.commitHash : undefined,
          commitMessage: typeof item.commitMessage === 'string' ? item.commitMessage : undefined,
          buildLogsUrl: typeof item.buildLogsUrl === 'string' ? item.buildLogsUrl : undefined,
          artifactUrl: typeof item.artifactUrl === 'string' ? item.artifactUrl : undefined,
          rollBackArtifactUrl: typeof item.rollBackArtifactUrl === 'string' ? item.rollBackArtifactUrl : undefined,
          startedAt: typeof item.startedAt === 'string' ? item.startedAt : undefined,
          finishedAt: typeof item.finishedAt === 'string' ? item.finishedAt : undefined,
          createdAt: typeof item.createdAt === 'string'
            ? item.createdAt
            : typeof item.updatedAt === 'string'
              ? item.updatedAt
              : undefined,
        }
      })
  }, [])

  const stripHttpPrefix = React.useCallback((value?: string): string => {
    if (!value) {
      return 'No project URL'
    }

    return value
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '')
  }, [])

  const getGithubRepoPath = React.useCallback((gitUrl?: string): string => {
    if (!gitUrl) {
      return 'unknown/unknown'
    }

    try {
      const parsed = new URL(gitUrl)
      const cleanPath = parsed.pathname.replace(/^\//, '').replace(/\.git$/i, '')
      const segments = cleanPath.split('/').filter(Boolean)

      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1]}`
      }

      return cleanPath || 'unknown/unknown'
    } catch {
      const cleanValue = gitUrl
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\.git$/i, '')

      const githubIndex = cleanValue.indexOf('github.com/')
      const path = githubIndex >= 0 ? cleanValue.slice(githubIndex + 'github.com/'.length) : cleanValue
      const segments = path.split('/').filter(Boolean)

      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1]}`
      }

      return 'unknown/unknown'
    }
  }, [])

  const getGitRepoHref = React.useCallback((gitUrl?: string): string | undefined => {
    if (!gitUrl) {
      return undefined
    }

    if (/^https?:\/\//i.test(gitUrl)) {
      return gitUrl
    }

    if (gitUrl.startsWith('git@github.com:')) {
      const repoPath = gitUrl.replace('git@github.com:', '').replace(/\.git$/i, '')
      return `https://github.com/${repoPath}`
    }

    return `https://${gitUrl.replace(/^\/+/, '')}`
  }, [])

  const getDomainHref = React.useCallback((domain?: string): string | undefined => {
    if (!domain) {
      return undefined
    }

    if (/^https?:\/\//i.test(domain)) {
      return domain
    }

    return `https://${domain}`
  }, [])

  const formatCreatedAt = React.useCallback((value?: string): string => {
    if (!value) {
      return '--'
    }

    const dateValue = new Date(value)

    if (Number.isNaN(dateValue.getTime())) {
      return '--'
    }

    const diffInMs = Date.now() - dateValue.getTime()
    const safeDiffInMinutes = Math.max(0, Math.floor(diffInMs / 60000))
    const minutes = safeDiffInMinutes % 60
    const totalHours = Math.floor(safeDiffInMinutes / 60)

    if (totalHours < 24) {
      return `${totalHours}h ${minutes} min`
    }

    return dateValue.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  const profileAvatar = profileUser?.avatar
  const selectedProjectNameFromRoute = projectNameParam ? decodeURIComponent(projectNameParam) : undefined
  const selectedDeploymentIdFromRoute = deploymentIdParam ? decodeURIComponent(deploymentIdParam) : undefined
  const selectedProjectRouteActive = Boolean(selectedProjectNameFromRoute)
  const isGlobalDeploymentsRoute = location.pathname.startsWith('/dashboard/~deployments')
  const isProjectDeploymentsRoute = Boolean(selectedProjectNameFromRoute) && /\/dashboard\/[^/]+\/deployments/.test(location.pathname)
  const isDeploymentsRoute = isGlobalDeploymentsRoute || isProjectDeploymentsRoute

  const normalizeProjectRouteKey = React.useCallback((value: string): string => {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  const cacheSelectedProject = React.useCallback((project: ProjectRecord) => {
    window.localStorage.setItem(SELECTED_PROJECT_CACHE_KEY, JSON.stringify(project))
    setStoredSelectedProject(project)
  }, [])

  const handleSelectProject = React.useCallback((project: ProjectRecord) => {
    cacheSelectedProject(project)
    navigate(`/dashboard/${encodeURIComponent(project.name)}`)
  }, [cacheSelectedProject, navigate])

  const fuzzyScore = React.useCallback((target: string, query: string): number => {
    const targetValue = target.toLowerCase()
    const queryValue = query.trim().toLowerCase()

    if (!queryValue) {
      return 1
    }

    if (targetValue.includes(queryValue)) {
      return 100 + queryValue.length
    }

    let score = 0
    let queryIndex = 0

    for (let index = 0; index < targetValue.length && queryIndex < queryValue.length; index += 1) {
      if (targetValue[index] === queryValue[queryIndex]) {
        score += 1
        queryIndex += 1
      }
    }

    return queryIndex === queryValue.length ? score : 0
  }, [])

  const filteredProjects = React.useMemo(() => {
    const rankedProjects = projects
      .map((project) => ({
        project,
        score: fuzzyScore(project.name, searchQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)

    return rankedProjects.map((entry) => entry.project)
  }, [fuzzyScore, projects, searchQuery])

  const selectedProject = React.useMemo(() => {
    if (!selectedProjectNameFromRoute) {
      return undefined
    }

    const routeKey = normalizeProjectRouteKey(selectedProjectNameFromRoute)

    const projectFromList = projects.find((project) => normalizeProjectRouteKey(project.name) === routeKey)

    if (projectFromList) {
      return projectFromList
    }

    if (storedSelectedProject && normalizeProjectRouteKey(storedSelectedProject.name) === routeKey) {
      return storedSelectedProject
    }

    return undefined
  }, [normalizeProjectRouteKey, projects, selectedProjectNameFromRoute, storedSelectedProject])

  const selectedDeployment = React.useMemo(() => {
    if (!selectedDeploymentIdFromRoute) {
      return undefined
    }

    return deployments.find((deployment) => deployment.id === selectedDeploymentIdFromRoute)
  }, [deployments, selectedDeploymentIdFromRoute])

  const getStatusDotClass = React.useCallback((status?: DeploymentRecord['status']): string => {
    if (status === 'queued') {
      return 'tw-bg-amber-400'
    }

    if (status === 'building') {
      return 'tw-bg-blue-400'
    }

    if (status === 'deployed') {
      return 'tw-bg-emerald-400'
    }

    if (status === 'failed') {
      return 'tw-bg-rose-500'
    }

    return 'tw-bg-slate-400'
    }, [])

  const deploymentsBaseRoute = React.useMemo(() => {
    if (selectedProjectNameFromRoute) {
      return `/dashboard/${encodeURIComponent(selectedProjectNameFromRoute)}/deployments`
    }

    return '/dashboard/~deployments'
  }, [selectedProjectNameFromRoute])

  const toggleSettingPanel = React.useCallback((panelKey: string) => {
    setOpenSettingPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }))
  }, [])

  const handleLogout = React.useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      authTokens.clear()
      window.localStorage.clear()
      navigate('/signup', { replace: true })
    }
  }, [navigate])

  const handleRedeployProject = React.useCallback(async (projectId: string) => {
    if (!projectId) {
      return
    }

    try {
      await deploymentApi.deploy(projectId)
    } catch {
    }
  }, [])

  const handleViewDeployments = React.useCallback((projectName: string) => {
    if (!projectName) {
      return
    }

    navigate(`/dashboard/${encodeURIComponent(projectName)}/deployments`)
  }, [navigate])

  const handleOpenEnvModal = React.useCallback(async () => {
    if (!selectedProject?.id) {
      return
    }

    setIsLoadingEnvVars(true)
    setIsEnvModalOpen(true)

    try {
      const response = await projectsApi.getEnv(selectedProject.id)
      console.log(response);
      const envData = unwrapApiResponse(response.data)

      setEnvVars(Array.isArray(envData) ? envData : envData.env || [])
    } catch (error) {
      console.error('Failed to fetch environment variables:', error)
      setEnvVars([])
    } finally {
      setIsLoadingEnvVars(false)
    }
  }, [selectedProject?.id])

  const handleSaveEnvVars = React.useCallback(async (newEnvVars: EnvPair[]) => {
    if (!selectedProject?.id) {
      return
    }

    try {
      await projectsApi.updateEnv(selectedProject.id, newEnvVars)
      setEnvVars(newEnvVars)
    } catch (error) {
      console.error('Failed to save environment variables:', error)
      throw error
    }
  }, [selectedProject?.id])

  const ownerGithubHref = React.useMemo(() => {
    const repoUrl = selectedProject?.git?.repoUrl ?? selectedProject?.gitRepoUrl

    if (!repoUrl) {
      return undefined
    }

    const repoPath = getGithubRepoPath(repoUrl)
    const owner = repoPath.split('/')[0]

    if (!owner || owner === 'unknown') {
      return undefined
    }

    return `https://github.com/${owner}`
  }, [getGithubRepoPath, selectedProject?.git?.repoUrl, selectedProject?.gitRepoUrl])

  const deploymentDurationLabel = React.useMemo(() => {
    if (!selectedDeployment?.startedAt || !selectedDeployment?.finishedAt) {
      return '--'
    }

    const startedAt = new Date(selectedDeployment.startedAt)
    const finishedAt = new Date(selectedDeployment.finishedAt)

    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(finishedAt.getTime())) {
      return '--'
    }

    const seconds = Math.max(0, Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000))
    return `${seconds}s`
  }, [selectedDeployment?.finishedAt, selectedDeployment?.startedAt])

  const selectedProjectLatestDeploymentId = React.useMemo(() => {
    const projectDeployments = selectedProject?.deployments ?? []

    if (projectDeployments.length === 0) {
      return undefined
    }

    const sortedDeployments = [...projectDeployments].sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightTime - leftTime
    })

    return sortedDeployments[0]?.id
  }, [selectedProject?.deployments])

  const targetLogsDeploymentId = React.useMemo(() => {
    const manualId = manualLogsDeploymentId.trim()
    return selectedDeployment?.id ?? selectedProjectLatestDeploymentId ?? (manualId || undefined)
  }, [manualLogsDeploymentId, selectedDeployment?.id, selectedProjectLatestDeploymentId])

  const extractLogLines = React.useCallback((payload: unknown): string[] => {
    const toStringLines = (value: string): string[] => {
      return value
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter(Boolean)
    }

    if (!payload) {
      return []
    }

    // Handle string payload - try to parse as JSON first
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload)
        return extractLogLines(parsed)
      } catch {
        return toStringLines(payload)
      }
    }

    if (Array.isArray(payload)) {
      return payload
        .flatMap((entry) => {
          if (typeof entry === 'string') {
            try {
              const parsed = JSON.parse(entry)
              return extractLogLines(parsed)
            } catch {
              return toStringLines(entry)
            }
          }

          if (typeof entry === 'object' && entry !== null) {
            const record = entry as Record<string, unknown>
            // Extract only message or log field
            const line = record.message ?? record.log

            if (typeof line === 'string') {
              return toStringLines(line)
            }
          }

          return []
        })
        .filter(Boolean)
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      const nested = record.logs ?? record.lines ?? record.items ?? record.events ?? record.data

      if (nested) {
        return extractLogLines(nested)
      }

      // Extract only message or log field
      const singleLine = record.message ?? record.log

      if (typeof singleLine === 'string') {
        return toStringLines(singleLine)
      }
    }

    return []
  }, [])

  React.useEffect(() => {
    if (!openSettingPanels['build-logs'] || !selectedDeployment?.id) {
      return
    }

    const selectedDeploymentId = selectedDeployment.id
    let isMounted = true
    let eventSource: EventSource | null = null
    let hasFetchedStaticLogs = false
    let hasReceivedStreamData = false

    const markDeploymentAsDeployedLocally = () => {
      if (locallyCompletedBuildDeploymentsRef.current.has(selectedDeploymentId)) {
        return
      }

      locallyCompletedBuildDeploymentsRef.current.add(selectedDeploymentId)

      setDeployments((previousDeployments) => {
        return previousDeployments.map((deployment) => {
          if (deployment.id !== selectedDeploymentId) {
            return deployment
          }

          return {
            ...deployment,
            status: 'deployed',
          }
        })
      })

      setProjects((previousProjects) => {
        return previousProjects.map((project) => {
          const nextDeployments = (project.deployments ?? []).map((deployment) => {
            if (deployment.id !== selectedDeploymentId) {
              return deployment
            }

            return {
              ...deployment,
              status: 'deployed' as const,
            }
          })

          const currentDeployment = project.currentDeployment
          const nextCurrentDeployment = (
            currentDeployment
            && typeof currentDeployment === 'object'
            && currentDeployment.id === selectedDeploymentId
          )
            ? {
              ...currentDeployment,
              status: 'deployed' as const,
            }
            : currentDeployment

          return {
            ...project,
            deployments: nextDeployments,
            currentDeployment: nextCurrentDeployment,
          }
        })
      })
    }

    const loadStaticBuildLogs = async () => {
      if (!isMounted || hasFetchedStaticLogs) {
        return
      }

      hasFetchedStaticLogs = true

      try {
        const staticResponse = await apiClient.get(logsApi.getBuildStaticUrl(selectedDeployment.id!))
        const staticData = unwrapApiResponse<unknown>(staticResponse.data)
        const staticLines = extractLogLines(staticData)

        if (isMounted) {
          setBuildLogLines(staticLines.length > 0 ? staticLines : ['No build logs available for this deployment.'])
        }
      } catch {
        try {
          const fallbackResponse = await logsApi.getBuildLogs(selectedDeployment.id!)
          const fallbackData = unwrapApiResponse<unknown>(fallbackResponse.data)
          const fallbackLines = extractLogLines(fallbackData)

          if (isMounted) {
            setBuildLogLines(fallbackLines.length > 0 ? fallbackLines : ['No build logs available for this deployment.'])
          }
        } catch {
          if (isMounted) {
            setBuildLogLines(['Failed to load build logs.'])
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingBuildLogs(false)
        }
      }
    }

    const loadBuildLogs = async () => {
      setIsLoadingBuildLogs(true)
      setBuildLogLines(['Connecting to build logs stream...'])

      try {
        eventSource = new EventSource(logsApi.getBuildStreamUrl(selectedDeploymentId))

        const finishAndLoadStatic = async () => {
          if (!isMounted) {
            return
          }

          if (hasReceivedStreamData) {
            markDeploymentAsDeployedLocally()
            setIsLoadingBuildLogs(false)
            eventSource?.close()
            return
          }

          eventSource?.close()
          await loadStaticBuildLogs()
        }

        eventSource.onmessage = (event) => {
          if (!isMounted) {
            return
          }

          const incomingLines = extractLogLines(event.data)

          if (incomingLines.length === 0) {
            return
          }

          hasReceivedStreamData = true

          setBuildLogLines((previousLines) => {
            if (
              previousLines.length === 1
              && previousLines[0] === 'Connecting to build logs stream...'
            ) {
              return incomingLines
            }

            return [...previousLines, ...incomingLines]
          })

          setIsLoadingBuildLogs(false)
        }

        eventSource.addEventListener('done', () => {
          void finishAndLoadStatic()
        })

        eventSource.onerror = () => {
          void finishAndLoadStatic()
        }
      } catch {
        await loadStaticBuildLogs()
      }
    }

    void loadBuildLogs()

    return () => {
      isMounted = false
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [extractLogLines, openSettingPanels, selectedDeployment?.id])

  React.useEffect(() => {
    const terminal = buildLogsTerminalRef.current

    if (!terminal) {
      return
    }

    terminal.scrollTop = terminal.scrollHeight
  }, [buildLogLines])

  React.useEffect(() => {
    const terminal = logsTerminalRef.current

    if (!terminal) {
      return
    }

    terminal.scrollTop = terminal.scrollHeight
  }, [logsLines])

  React.useEffect(() => {
    if (activeItemLabel !== 'Logs') {
      return
    }

    if (!targetLogsDeploymentId) {
      setLogsLines(['No deployment available for logs.'])
      return
    }

    let isMounted = true
    let eventSource: EventSource | null = null

    const run = async () => {
      const isLatestDeployment = Boolean(
        selectedProjectLatestDeploymentId && targetLogsDeploymentId === selectedProjectLatestDeploymentId,
      )

      // Determine if we should use stream mode
      const shouldUseStream = logsMode === 'live' && selectedProject?.type === 'backend' && isLatestDeployment && !logsLimit

      setIsLoadingLogs(true)

      if (shouldUseStream) {
        setLogsLines(['Connecting to live logs stream...'])
        setIsLogsStreaming(true)
        setLogsCursor(undefined)

        try {
          eventSource = new EventSource(logsApi.getStreamUrl(targetLogsDeploymentId))

          eventSource.onmessage = (event) => {
            if (!isMounted) {
              return
            }

            const incoming = extractLogLines(event.data)

            if (incoming.length > 0) {
              setLogsLines((prev) => [...prev, ...incoming])
            }

            setIsLoadingLogs(false)
          }

          eventSource.onerror = () => {
            if (!isMounted) {
              return
            }

            setLogsLines((prev) => [...prev, 'Live stream disconnected.'])
            setIsLoadingLogs(false)
            setIsLogsStreaming(false)
            eventSource?.close()
          }
        } catch {
          if (isMounted) {
            setLogsLines(['Failed to connect to live logs stream.'])
            setIsLoadingLogs(false)
            setIsLogsStreaming(false)
          }
        }

        return
      }

      // Use static logs mode
      setIsLogsStreaming(false)

      try {
        const staticLogsValue = logsLimit || 500
        const response = await logsApi.getStaticLogs(targetLogsDeploymentId, staticLogsValue)
        const data = unwrapApiResponse<unknown>(response.data)
        const lines = extractLogLines(data)

        if (isMounted) {
          // For pagination: if this is the first load, set the logs; otherwise append
          if (logsLimit === '' || logsLimit === 500) {
            setLogsLines(lines.length > 0 ? lines : ['No logs found for this deployment.'])
          } else {
            // Append new logs for pagination
            setLogsLines((prev) => [...prev, ...lines])
          }
        }
      } catch {
        if (isMounted) {
          setLogsLines(['Failed to load logs.'])
        }
      } finally {
        if (isMounted) {
          setIsLoadingLogs(false)
        }
      }
    }

    void run()

    return () => {
      isMounted = false

      if (eventSource) {
        eventSource.close()
      }

      setIsLogsStreaming(false)
    }
  }, [activeItemLabel, extractLogLines, logsCursor, logsLimit, selectedProjectLatestDeploymentId, targetLogsDeploymentId, logsMode, selectedProject?.type])

  React.useEffect(() => {
    if (!selectedProjectNameFromRoute) {
      setStoredSelectedProject(undefined)
      return
    }

    const rawSelectedProject = window.localStorage.getItem(SELECTED_PROJECT_CACHE_KEY)

    if (!rawSelectedProject) {
      return
    }

    try {
      const parsedProject = JSON.parse(rawSelectedProject) as ProjectRecord

      if (parsedProject?.name && normalizeProjectRouteKey(parsedProject.name) === normalizeProjectRouteKey(selectedProjectNameFromRoute)) {
        setStoredSelectedProject(parsedProject)
        return
      }

      setStoredSelectedProject(undefined)
    } catch {
      window.localStorage.removeItem(SELECTED_PROJECT_CACHE_KEY)
      setStoredSelectedProject(undefined)
    }
  }, [normalizeProjectRouteKey, selectedProjectNameFromRoute])

  React.useEffect(() => {
    if (!selectedProjectNameFromRoute || projects.length === 0) {
      return
    }

    const matchedProject = projects.find((project) => normalizeProjectRouteKey(project.name) === normalizeProjectRouteKey(selectedProjectNameFromRoute))

    if (matchedProject) {
      cacheSelectedProject(matchedProject)
    }
  }, [cacheSelectedProject, normalizeProjectRouteKey, projects, selectedProjectNameFromRoute])

  React.useEffect(() => {
    if (!isDeploymentsRoute) {
      return
    }

    setActiveItemLabel('Deployments')
  }, [isDeploymentsRoute])

  React.useEffect(() => {
    const rawProfile = window.localStorage.getItem(PROFILE_CACHE_KEY)

    if (!rawProfile) {
      setProfileUser(null)
      return
    }

    try {
      const parsedProfile = JSON.parse(rawProfile) as ProfileUser
      setProfileUser(parsedProfile)
    } catch {
      window.localStorage.removeItem(PROFILE_CACHE_KEY)
      setProfileUser(null)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const loadProjects = async () => {
      setIsLoadingProjects(true)

      try {
        const cachedProjects = window.localStorage.getItem(PROJECTS_CACHE_KEY)

        if (cachedProjects) {
          const decryptedProjects = await decryptProjectsPayload(cachedProjects)

          if (decryptedProjects && decryptedProjects.length > 0) {
            const hasCreatedAtData = decryptedProjects.some((project) => Boolean(project.createdAt))

            if (!hasCreatedAtData) {
              window.localStorage.removeItem(PROJECTS_CACHE_KEY)
            } else {
              if (isMounted) {
                setProjects(decryptedProjects)
                setIsLoadingProjects(false)
              }
              return
            }
          }

          window.localStorage.removeItem(PROJECTS_CACHE_KEY)
        }

        const response = await projectsApi.list()
        const normalizedProjects = normalizeProjects(unwrapApiResponse<unknown>(response.data))

        if (isMounted) {
          setProjects(normalizedProjects)
        }

        const encryptedProjects = await encryptProjectsPayload(normalizedProjects)
        window.localStorage.setItem(PROJECTS_CACHE_KEY, encryptedProjects)
      } catch {
        if (isMounted) {
          setProjects([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false)
        }
      }
    }

    void loadProjects()

    return () => {
      isMounted = false
    }
  }, [decryptProjectsPayload, encryptProjectsPayload, normalizeProjects])

  React.useEffect(() => {
    if (!isDeploymentsRoute) {
      setDeployments([])
      setIsLoadingDeployments(false)
      return
    }

    if (isProjectDeploymentsRoute && !selectedProject?.id) {
      return
    }

    let isMounted = true

    const loadDeployments = async () => {
      setIsLoadingDeployments(true)

      try {
        const response = isProjectDeploymentsRoute
          ? await deploymentApi.listByProject(selectedProject!.id)
          : await deploymentApi.listAll()

        const normalizedDeployments = normalizeDeployments(unwrapApiResponse<unknown>(response.data))

        if (isMounted) {
          setDeployments(normalizedDeployments)
        }
      } catch {
        if (isMounted) {
          setDeployments([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingDeployments(false)
        }
      }
    }

    void loadDeployments()

    return () => {
      isMounted = false
    }
  }, [isDeploymentsRoute, isProjectDeploymentsRoute, normalizeDeployments, selectedProject?.id])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmdPressed = event.ctrlKey || event.metaKey

      if (isCtrlOrCmdPressed && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setIsFindModalOpen(true)
      }

      if (event.key === 'Escape') {
        setIsFindModalOpen(false)
        setIsProfileModalOpen(false)
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
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

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isProfileModalOpen])

  return (
    <div className={isDarkTheme ? 'tw-h-screen tw-overflow-hidden tw-bg-black tw-text-white' : 'tw-h-screen tw-overflow-hidden tw-bg-slate-100 tw-text-slate-900'}>
      <div className="tw-flex tw-h-full tw-overflow-hidden">
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black/40 md:tw-hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <DashboardSidebar
          isDarkTheme={isDarkTheme}
          isMobileOpen={isMobileSidebarOpen}
          profileUser={profileUser}
          profileAvatar={profileAvatar}
          activeItemLabel={activeItemLabel}
          isProfileModalOpen={isProfileModalOpen}
          profileModalRef={profileModalRef}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onOpenFind={() => {
            setIsFindModalOpen(true)
            setIsMobileSidebarOpen(false)
          }}
          onSelectSidebarItem={(label) => {
            setActiveItemLabel(label)

            if (label === 'Deployments') {
              navigate(deploymentsBaseRoute)
              setIsProfileModalOpen(false)
              return
            }

            if (label === 'Projects') {
              navigate('/dashboard')
              setIsProfileModalOpen(false)
              return
            }

            if (selectedProjectRouteActive && label !== 'Logs') {
              navigate('/dashboard')
            }
            setIsProfileModalOpen(false)
            setIsMobileSidebarOpen(false)
          }}
          onGoDashboard={() => {
            setActiveItemLabel('Projects')
            navigate('/dashboard')
            setIsMobileSidebarOpen(false)
          }}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
          onToggleProfileModal={() => setIsProfileModalOpen((prev) => !prev)}
          onCloseProfileModal={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
        />

        <div className="tw-flex tw-min-h-0 tw-min-w-0 tw-flex-1 tw-flex-col tw-overflow-hidden">
          <section className={isDarkTheme ? 'tw-flex tw-h-14 tw-items-center tw-border-b tw-border-white/15 tw-bg-black tw-px-5' : 'tw-flex tw-h-14 tw-items-center tw-border-b tw-border-slate-300 tw-bg-white tw-px-5'}>
            <button
              type="button"
              aria-label="Open sidebar"
              className={isDarkTheme ? 'tw-mr-2 tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-text-white md:tw-hidden' : 'tw-mr-2 tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-300 tw-text-slate-900 md:tw-hidden'}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <FiMenu className="tw-text-base" />
            </button>
            <h2 className="tw-text-sm tw-font-semibold">{activeItemLabel}</h2>
          </section>

          <section className={isDarkTheme ? 'tw-min-h-0 tw-flex-1 tw-overflow-hidden tw-bg-black tw-p-4 md:tw-p-5' : 'tw-min-h-0 tw-flex-1 tw-overflow-hidden tw-bg-slate-100 tw-p-4 md:tw-p-5'}>
            <div className={isDarkTheme ? 'tw-h-full tw-overflow-y-auto tw-scrollbar-none tw-rounded-xl tw-border tw-border-white/15 tw-bg-black tw-p-4 md:tw-p-5' : 'tw-h-full tw-overflow-y-auto tw-scrollbar-none tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-p-4 md:tw-p-5'}>
              {isDeploymentsRoute ? (
                <DeploymentsSection
                  isDarkTheme={isDarkTheme}
                  isProjectDeploymentsRoute={isProjectDeploymentsRoute}
                  isLoadingDeployments={isLoadingDeployments}
                  selectedDeploymentIdFromRoute={selectedDeploymentIdFromRoute}
                  selectedDeployment={selectedDeployment}
                  selectedProject={selectedProject}
                  ownerGithubHref={ownerGithubHref}
                  getGithubRepoPath={getGithubRepoPath}
                  getStatusDotClass={getStatusDotClass}
                  openSettingPanels={openSettingPanels}
                  toggleSettingPanel={toggleSettingPanel}
                  deploymentDurationLabel={deploymentDurationLabel}
                  isLoadingBuildLogs={isLoadingBuildLogs}
                  buildLogLines={buildLogLines}
                  buildLogsTerminalRef={buildLogsTerminalRef}
                  deployments={deployments}
                  formatCreatedAt={formatCreatedAt}
                  navigate={navigate}
                  deploymentsBaseRoute={deploymentsBaseRoute}
                  getGitRepoHref={getGitRepoHref}
                />
              ) : activeItemLabel === 'Projects' ? (
                <ProjectsContent
                  isDarkTheme={isDarkTheme}
                  selectedProjectNameFromRoute={selectedProjectNameFromRoute}
                  selectedProject={selectedProject}
                  isLoadingProjects={isLoadingProjects}
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  stripHttpPrefix={stripHttpPrefix}
                  getGithubRepoPath={getGithubRepoPath}
                  getGitRepoHref={getGitRepoHref}
                  getDomainHref={getDomainHref}
                  formatCreatedAt={formatCreatedAt}
                  onRedeployProject={handleRedeployProject}
                  onViewDeployments={handleViewDeployments}
                  onOpenEnvModal={handleOpenEnvModal}
                />
              ) : activeItemLabel === 'Logs' ? (
                <LogsSection
                  isDarkTheme={isDarkTheme}
                  isLogsStreaming={isLogsStreaming}
                  targetLogsDeploymentId={targetLogsDeploymentId}
                  manualLogsDeploymentId={manualLogsDeploymentId}
                  onChangeManualLogsDeploymentId={setManualLogsDeploymentId}
                  logsLimit={logsLimit}
                  onChangeLogsLimit={setLogsLimit}
                  isLoadingLogs={isLoadingLogs}
                  logsLines={logsLines}
                  logsTerminalRef={logsTerminalRef}
                  logsMode={logsMode}
                  onChangeLogsMode={setLogsMode}
                  projectType={selectedProject?.type as 'frontend' | 'backend' | undefined}
                />
              ) : (
                <div>
                  <h3 className="tw-text-base tw-font-semibold">{activeItemLabel}</h3>
                  <p className={isDarkTheme ? 'tw-mt-1 tw-text-xs tw-text-slate-300' : 'tw-mt-1 tw-text-xs tw-text-slate-600'}>
                    Main content area for {activeItemLabel}.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ProjectSearchModal
        isOpen={isFindModalOpen}
        isDarkTheme={isDarkTheme}
        searchQuery={searchQuery}
        isLoadingProjects={isLoadingProjects}
        filteredProjects={filteredProjects}
        onChangeSearchQuery={setSearchQuery}
        onClose={() => setIsFindModalOpen(false)}
        onSelectProject={(project) => {
          handleSelectProject(project)
          setIsFindModalOpen(false)
        }}
      />

      <EnvModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        projectName={selectedProject?.name || ''}
        envVars={envVars}
        onSave={handleSaveEnvVars}
        isDarkTheme={isDarkTheme}
        isLoading={isLoadingEnvVars}
      />
    </div>
  )
}

export default DashboardPage