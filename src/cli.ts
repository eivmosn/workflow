#!/usr/bin/env node
import type { BackupResult, InstallMode, InstallOptions, OverwriteMode, Repository } from './types.js'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { cancel, intro, isCancel, note, outro, select, spinner } from '@clack/prompts'
import {
  ansis,
  createInstallModeOptions,
  createOverwriteModeOptions,
  formatBackupResults,
  formatQuestion,
  formatTitle,
} from './install-ui.js'
import {
  backupExistingTargets,
  collectExistingTargets,
  createBackupRoot,
  createInstallTasks,
  createTimestamp,
} from './installer.js'

const defaultCodexHome = process.env.CODEX_HOME || join(homedir(), '.codex')
const defaultRef = 'main'
const repository: Repository = { owner: 'eivmosn', repo: 'workflow' }

/**
 * 执行用户选择的安装任务。
 *
 * @param options 安装选项。
 */
async function installWorkflow(options: InstallOptions): Promise<void> {
  const timestamp = createTimestamp()
  const backupRoot = createBackupRoot(options.codexHome, timestamp)
  const tasks = createInstallTasks(options)
  const progress = spinner()
  let backups: BackupResult[] = []

  try {
    if (options.overwriteMode === 'backup') {
      progress.start(ansis.yellow('正在备份已有配置'))
      backups = await backupExistingTargets(options, backupRoot, timestamp)
      progress.stop(ansis.green('已有配置已备份'))
    }

    for (const task of tasks) {
      progress.start(`正在从 GitHub 拉取并安装 ${ansis.cyan(task.label)}`)
      const count = await task.run()
      progress.stop(`${ansis.green('已安装')} ${ansis.cyan(task.label)}${ansis.dim(`（${count} 个文件）`)}`)
    }

    if (backups.length > 0)
      note(formatBackupResults(backups), formatTitle('备份结果'))
  }
  catch (error) {
    progress.stop(ansis.red('安装失败'))
    throw error
  }
}

/**
 * 根据用户选择创建安装选项。
 *
 * @param mode 安装内容选择。
 * @returns 安装选项。
 */
function createInstallOptions(mode: InstallMode): InstallOptions {
  return {
    codexHome: resolve(defaultCodexHome),
    repository,
    ref: defaultRef,
    installAgents: mode === 'all' || mode === 'agents',
    installSkills: mode === 'all' || mode === 'skills',
    installAgentsMd: mode === 'all' || mode === 'agents-md',
    overwriteMode: 'overwrite',
  }
}

/**
 * 读取用户选择的安装内容。
 *
 * @returns 安装内容选择，取消时退出进程。
 */
async function selectInstallMode(): Promise<InstallMode> {
  const mode = await select({
    message: formatQuestion('请选择要安装的内容'),
    options: createInstallModeOptions(),
  })

  if (isCancel(mode)) {
    cancel(ansis.yellow('已取消安装'))
    process.exit(0)
  }

  return mode as InstallMode
}

/**
 * 在发现已有配置时读取覆盖方式。
 *
 * @returns 覆盖方式，取消时退出进程。
 */
async function selectOverwriteMode(): Promise<OverwriteMode> {
  const overwriteMode = await select({
    message: formatQuestion('检测到目标路径已存在，请选择覆盖方式'),
    options: createOverwriteModeOptions(),
  })

  if (isCancel(overwriteMode)) {
    cancel(ansis.yellow('已取消安装'))
    process.exit(0)
  }

  return overwriteMode as OverwriteMode
}

/**
 * 运行交互式安装器。
 */
async function main(): Promise<void> {
  intro(formatTitle('Codex Workflow Installer'))

  note(
    `安装器将从 GitHub 仓库 ${ansis.cyan('eivmosn/workflow')} 拉取配置文件。`,
    formatTitle('Hi there'),
  )

  const mode = await selectInstallMode()
  const installOptions = createInstallOptions(mode)
  const existingTargets = await collectExistingTargets(installOptions)

  if (existingTargets.length > 0) {
    note(existingTargets.map(target => ansis.dim(target)).join('\n'), formatTitle('检测到已有配置'))
    installOptions.overwriteMode = await selectOverwriteMode()
  }

  await installWorkflow(installOptions)
  outro(ansis.green('Enjoy vibe coding !!!'))
}

try {
  await main()
}
catch (error) {
  cancel(ansis.red(error instanceof Error ? error.message : '安装失败'))
  process.exit(1)
}
