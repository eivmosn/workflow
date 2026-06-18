import ansis from 'ansis'

interface SelectOption {
  value: string
  label: string
  hint?: string
}

export { ansis }

/**
 * 渲染提示标题，统一安装器标题颜色。
 *
 * @param title 原始标题文案。
 * @returns 彩色标题文案。
 */
export function formatTitle(title: string): string {
  return ansis.bold.cyan(title)
}

/**
 * 渲染命令行问题，统一交互问题颜色。
 *
 * @param message 原始问题文案。
 * @returns 彩色问题文案。
 */
export function formatQuestion(message: string): string {
  return ansis.bold.green(message)
}

/**
 * 格式化备份结果，展示备份名称和地址。
 *
 * @param backups 已完成的备份记录。
 * @returns 可用于 note 输出的多行文本。
 */
export function formatBackupResults(backups: { name: string, path: string }[]): string {
  return backups
    .map(backup => `${ansis.cyan(backup.name)}\n${ansis.dim(backup.path)}`)
    .join('\n\n')
}

/**
 * 生成安装内容选项。
 *
 * @returns 安装内容选项。
 */
export function createInstallModeOptions(): SelectOption[] {
  return [
    { value: 'all', label: ansis.cyan('安装全部'), hint: ansis.dim('AGENTS.md + agents + skills') },
    { value: 'skills', label: ansis.cyan('仅安装 skills') },
    { value: 'agents', label: ansis.cyan('仅安装 agents') },
    { value: 'agents-md', label: ansis.cyan('仅安装 AGENTS.md') },
  ]
}

/**
 * 生成覆盖方式选项。
 *
 * @returns 覆盖方式选项。
 */
export function createOverwriteModeOptions(): SelectOption[] {
  return [
    { value: 'backup', label: ansis.green('备份后覆盖'), hint: ansis.dim('推荐：保留旧文件到 backups 目录') },
    { value: 'overwrite', label: ansis.yellow('直接覆盖'), hint: ansis.dim('不保留旧文件') },
  ]
}
