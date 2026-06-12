import type { IconType } from 'react-icons'

export type ProfileUser = {
  userName?: string
  email?: string
  avatar?: string
}

export type SidebarItem = {
  label: string
  icon: IconType
  shortcut?: string
}

export type DeploymentRecord = {
  id?: string
  owner?: string
  status?: 'queued' | 'building' | 'deployed' | 'failed'
  number?: number
  commitHash?: string
  commitMessage?: string
  buildLogsUrl?: string
  artifactUrl?: string
  rollBackArtifactUrl?: string
  startedAt?: string
  finishedAt?: string
  createdAt?: string
}

export type ProjectRecord = {
  id: string
  name: string
  type?: 'frontend' | 'backend'
  createdAt?: string
  updatedAt?: string
  git?: {
    provider?: string
    repoUrl?: string
    branch?: string
    rootDir?: string
  }
  entryDirectory?: string
  domains?: {
    subdomain?: string
  }
  frontendBuild?: {
    framework?: string
    installCommand?: string
    buildCommand?: string
    outDir?: string
    version?: number
  }
  backendBuild?: {
    installCommand?: string
    runCommand?: string
    version?: number
  }
  runtime?: {
    rType?: 'static' | 'server'
    port?: number
  }
  status?: 'active' | 'paused' | 'deleted'
  deployments?: DeploymentRecord[]
  currentDeployment?: string | DeploymentRecord
  createdBy?: {
    id?: string
    name?: string
    userName?: string
    avatar?: string
  }
  subdomain?: string
  ownerName?: string
  ownerAvatar?: string
  gitProvider?: string
  gitRepoUrl?: string
  gitBranch?: string
  gitRootDir?: string
}
