import type { BackupResult, GithubContentFile, GithubPathInstallOptions, InstallOptions, InstallTask } from './types.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathExists } from './fs-utils.js'
import { downloadGithubFile, listGithubFiles } from './github.js'

/**
 * 生成本次安装使用的时间戳。
 *
 * @returns 本次安装时间戳。
 */
export function createTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+$/, '')
    .replace('T', '-')
}

/**
 * 生成本次安装使用的备份目录路径。
 *
 * @param codexHome Codex 目标目录。
 * @param timestamp 本次安装时间戳。
 * @returns 备份目录路径。
 */
export function createBackupRoot(codexHome: string, timestamp: string): string {
  return join(codexHome, 'backups', `workflow-install-${timestamp}`)
}

/**
 * 给备份文件名追加时间戳。
 *
 * @param path 原始备份路径。
 * @param timestamp 本次安装时间戳。
 * @returns 带时间戳的备份路径。
 */
function createTimestampedBackupPath(path: string, timestamp: string): string {
  return `${path}.${timestamp}.bak`
}

/**
 * 在覆盖目标前备份旧文件或目录。
 *
 * @param target 将被覆盖的目标路径。
 * @param backupTarget 备份目标路径。
 * @param timestamp 本次安装时间戳。
 * @returns 完成备份时返回备份路径，目标不存在时返回 null。
 */
async function backupPath(target: string, backupTarget: string, timestamp: string): Promise<string | null> {
  if (!await pathExists(target))
    return null

  const timestampedBackupTarget = createTimestampedBackupPath(backupTarget, timestamp)

  await mkdir(dirname(timestampedBackupTarget), { recursive: true })
  const { cp } = await import('node:fs/promises')
  await cp(target, timestampedBackupTarget, { recursive: true, force: true, preserveTimestamps: true })

  return timestampedBackupTarget
}

/**
 * 安装 GitHub 文件。
 *
 * @param file GitHub contents file 对象。
 * @param repositoryPathPrefix 仓库内需要剥离的路径前缀。
 * @param targetRoot 目标根目录。
 */
async function installGithubFile(file: GithubContentFile, repositoryPathPrefix: string, targetRoot: string): Promise<void> {
  const relativePath = file.path.slice(repositoryPathPrefix.length).replace(/^\/+/, '')
  const target = join(targetRoot, relativePath)
  const content = await downloadGithubFile(file)

  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content)
}

/**
 * 安装 GitHub 路径。
 *
 * @param options 安装路径选项。
 * @param options.repository GitHub 仓库。
 * @param options.ref Git ref，例如 main、tag 或 commit sha。
 * @param options.repositoryPath 仓库内待安装路径。
 * @param options.repositoryPathPrefix 生成本地相对路径时需要剥离的仓库路径前缀。
 * @param options.targetRoot 本地安装目标根目录。
 * @returns 已安装文件数量。
 */
async function installGithubPath(options: GithubPathInstallOptions): Promise<number> {
  const files = await listGithubFiles(options.repository, options.ref, options.repositoryPath)

  for (const file of files)
    await installGithubFile(file, options.repositoryPathPrefix, options.targetRoot)

  return files.length
}

/**
 * 检测当前安装选择会覆盖的本地路径。
 *
 * @param options 安装选项。
 * @returns 已存在的目标路径列表。
 */
export async function collectExistingTargets(options: InstallOptions): Promise<string[]> {
  const targets: string[] = []

  if (options.installAgents) {
    const agentsPath = join(options.codexHome, 'agents')
    if (await pathExists(agentsPath))
      targets.push(agentsPath)
  }

  if (options.installSkills) {
    const skillsPath = join(options.codexHome, 'skills')
    if (await pathExists(skillsPath))
      targets.push(skillsPath)
  }

  if (options.installAgentsMd) {
    const agentsMdPath = join(options.codexHome, 'AGENTS.md')
    if (await pathExists(agentsMdPath))
      targets.push(agentsMdPath)
  }

  return targets
}

/**
 * 根据安装选择备份已有的顶层目标。
 *
 * @param options 安装选项。
 * @param backupRoot 备份根目录。
 * @param timestamp 本次安装时间戳。
 * @returns 已完成的备份记录。
 */
export async function backupExistingTargets(options: InstallOptions, backupRoot: string, timestamp: string): Promise<BackupResult[]> {
  const backups: { name: string, path: string | null }[] = []

  if (options.installAgents) {
    backups.push({
      name: 'agents',
      path: await backupPath(join(options.codexHome, 'agents'), join(backupRoot, 'agents'), timestamp),
    })
  }

  if (options.installSkills) {
    backups.push({
      name: 'skills',
      path: await backupPath(join(options.codexHome, 'skills'), join(backupRoot, 'skills'), timestamp),
    })
  }

  if (options.installAgentsMd) {
    backups.push({
      name: 'AGENTS.md',
      path: await backupPath(join(options.codexHome, 'AGENTS.md'), join(backupRoot, 'AGENTS.md'), timestamp),
    })
  }

  return backups.filter((backup): backup is BackupResult => Boolean(backup.path))
}

/**
 * 创建需要执行的安装任务。
 *
 * @param options 安装选项。
 * @returns 安装任务列表。
 */
export function createInstallTasks(options: InstallOptions): InstallTask[] {
  const tasks: InstallTask[] = []

  if (options.installAgents) {
    tasks.push({
      label: 'agents',
      run: () => installGithubPath({
        repository: options.repository,
        ref: options.ref,
        repositoryPath: 'agents',
        repositoryPathPrefix: 'agents',
        targetRoot: join(options.codexHome, 'agents'),
      }),
    })
  }

  if (options.installSkills) {
    tasks.push({
      label: 'skills',
      run: () => installGithubPath({
        repository: options.repository,
        ref: options.ref,
        repositoryPath: 'skills',
        repositoryPathPrefix: 'skills',
        targetRoot: join(options.codexHome, 'skills'),
      }),
    })
  }

  if (options.installAgentsMd) {
    tasks.push({
      label: 'AGENTS.md',
      run: () => installGithubPath({
        repository: options.repository,
        ref: options.ref,
        repositoryPath: 'AGENTS.md',
        repositoryPathPrefix: '',
        targetRoot: options.codexHome,
      }),
    })
  }

  return tasks
}
