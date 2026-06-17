import type { GithubContent, GithubContentFile, Repository } from './types.js'
import { Buffer } from 'node:buffer'
import process from 'node:process'

const githubApiBaseUrl = 'https://api.github.com'

/**
 * 创建 GitHub API 请求头。
 *
 * @returns GitHub API 请求头。
 */
function createGithubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'codex-workflow-installer',
  }

  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  return headers
}

/**
 * 请求 GitHub contents API。
 *
 * @param repository GitHub 仓库。
 * @param ref Git ref，例如 main、tag 或 commit sha。
 * @param path 仓库内路径。
 * @returns GitHub contents API 响应。
 */
async function fetchGithubContents(repository: Repository, ref: string, path: string): Promise<GithubContent | GithubContent[]> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const url = `${githubApiBaseUrl}/repos/${repository.owner}/${repository.repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`
  const response = await fetch(url, { headers: createGithubHeaders() })

  if (!response.ok)
    throw new Error(`无法读取 GitHub 路径 ${path}: ${response.status} ${response.statusText}`)

  return response.json() as Promise<GithubContent | GithubContent[]>
}

/**
 * 递归收集 GitHub 目录下的文件。
 *
 * @param repository GitHub 仓库。
 * @param ref Git ref。
 * @param path 仓库内目录。
 * @returns 可下载文件列表。
 */
export async function listGithubFiles(repository: Repository, ref: string, path: string): Promise<GithubContentFile[]> {
  const contents = await fetchGithubContents(repository, ref, path)

  if (!Array.isArray(contents))
    return contents.type === 'file' ? [contents as GithubContentFile] : []

  const files: GithubContentFile[] = []

  for (const item of contents) {
    if (item.name === '.DS_Store')
      continue

    if (item.type === 'file') {
      files.push(item as GithubContentFile)
      continue
    }

    if (item.type === 'dir')
      files.push(...await listGithubFiles(repository, ref, item.path))
  }

  return files
}

/**
 * 下载远程文件内容。
 *
 * @param file GitHub contents file 对象。
 * @returns 文件 Buffer。
 */
export async function downloadGithubFile(file: GithubContentFile): Promise<Buffer> {
  if (!file.download_url)
    throw new Error(`文件缺少 download_url: ${file.path}`)

  const response = await fetch(file.download_url, { headers: createGithubHeaders() })

  if (!response.ok)
    throw new Error(`无法下载 ${file.path}: ${response.status} ${response.statusText}`)

  return Buffer.from(await response.arrayBuffer())
}
