export type InstallMode = 'all' | 'skills' | 'agents' | 'agents-md'
export type OverwriteMode = 'backup' | 'overwrite'

export interface Repository {
  owner: string
  repo: string
}

export interface GithubContentFile {
  name: string
  path: string
  type: 'file'
  download_url: string | null
}

export interface GithubContentDirectory {
  name: string
  path: string
  type: 'dir'
}

export type GithubContent = GithubContentFile | GithubContentDirectory | { name: string, path: string, type: string }

export interface InstallOptions {
  codexHome: string
  repository: Repository
  ref: string
  installAgents: boolean
  installSkills: boolean
  installAgentsMd: boolean
  overwriteMode: OverwriteMode
}

export interface InstallTask {
  label: string
  run: () => Promise<number>
}

export interface GithubPathInstallOptions {
  repository: Repository
  ref: string
  repositoryPath: string
  repositoryPathPrefix: string
  targetRoot: string
}

export interface BackupResult {
  name: string
  path: string
}
