import { stat } from 'node:fs/promises'

/**
 * 判断文件或目录是否存在。
 *
 * @param path 待检查的文件系统路径。
 * @returns 存在时返回 true，否则返回 false。
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
      return false

    throw error
  }
}
