import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * JSON 配置文件接口
 * 包含所有原本通过环境变量配置的参数
 */
export interface JsonConfig {
  // API 认证相关
  ANTHROPIC_API_KEY?: string
  ANTHROPIC_AUTH_TOKEN?: string
  CLAUDE_CODE_OAUTH_TOKEN?: string
  CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR?: string

  // API 端点配置
  ANTHROPIC_BASE_URL?: string
  ANTHROPIC_CUSTOM_HEADERS?: string

  // 模型配置
  ANTHROPIC_MODEL?: string
  ANTHROPIC_SMALL_FAST_MODEL?: string

  // 自定义模型列表（覆盖内置模型）
  model_list?: string[]

  // 每个模型的最大上下文窗口覆盖（token 数）
  // key 是模型名称子串（如 "deepseek-v4" 匹配 "deepseek-v4-pro" 和 "deepseek-v4-flash"），
  // value 是最大上下文窗口 token 数。按 Object.entries() 遍历顺序匹配，首个匹配生效。
  modelContextWindows?: Record<string, number>

  // 云服务提供商配置
  CLAUDE_CODE_USE_BEDROCK?: boolean
  CLAUDE_CODE_USE_VERTEX?: boolean
  CLAUDE_CODE_USE_FOUNDRY?: boolean
  AWS_BEARER_TOKEN_BEDROCK?: string
  AWS_REGION?: string
  AWS_DEFAULT_REGION?: string
  ANTHROPIC_VERTEX_PROJECT_ID?: string
  CLOUD_ML_REGION?: string
  GOOGLE_APPLICATION_CREDENTIALS?: string
  ANTHROPIC_FOUNDRY_API_KEY?: string

  // 功能开关
  CLAUDE_CODE_SIMPLE?: boolean
  CLAUDE_CODE_REMOTE?: boolean
  CLAUDE_CODE_CONTAINER_ID?: string
  CLAUDE_CODE_REMOTE_SESSION_ID?: string
  CLAUDE_AGENT_SDK_CLIENT_APP?: string
  USER_TYPE?: string
  NODE_ENV?: string

  // 会话和桥接配置
  CLAUDE_BRIDGE_OAUTH_TOKEN?: string
  CLAUDE_BRIDGE_BASE_URL?: string
  CLAUDE_BRIDGE_USE_CCR_V2?: boolean
  CLAUDE_CODE_SESSION_ACCESS_TOKEN?: string
  CLAUDE_CODE_ORGANIZATION_UUID?: string

  // 国际化
  CLAUDE_LOCALE?: string

  // 其他配置
  API_TIMEOUT_MS?: string
  MAX_STRUCTURED_OUTPUT_RETRIES?: string
  CLAUDE_CODE_EAGER_FLUSH?: boolean
  CLAUDE_CODE_IS_COWORK?: boolean
  CLAUDE_CODE_FORCE_FULL_LOGO?: boolean
  CLAUDE_CODE_EXPERIMENTAL_BUILD?: boolean
  CLAUDE_CODE_VERIFY_PLAN?: boolean
  CCR_FORCE_BUNDLE?: boolean

  // 代理配置
  HTTPS_PROXY?: string
  https_proxy?: string
  HTTP_PROXY?: string
  http_proxy?: string
  NO_PROXY?: string
  no_proxy?: string
  SSL_CERT_FILE?: string
  NODE_EXTRA_CA_CERTS?: string
  REQUESTS_CA_BUNDLE?: string
  CURL_CA_BUNDLE?: string

  // GitHub Actions 相关（子进程环境变量清理用）
  GITHUB_TOKEN?: string
  GH_TOKEN?: string
  ACTIONS_ID_TOKEN_REQUEST_TOKEN?: string
  ACTIONS_ID_TOKEN_REQUEST_URL?: string
  ACTIONS_RUNTIME_TOKEN?: string
  ACTIONS_RUNTIME_URL?: string

  // Azure Foundry 配置
  AZURE_CLIENT_SECRET?: string
  AZURE_CLIENT_CERTIFICATE_PATH?: string

  // OpenTelemetry 配置
  OTEL_EXPORTER_OTLP_HEADERS?: string
  OTEL_EXPORTER_OTLP_LOGS_HEADERS?: string
  OTEL_EXPORTER_OTLP_METRICS_HEADERS?: string
  OTEL_EXPORTER_OTLP_TRACES_HEADERS?: string

  // SSH 隧道相关
  ANTHROPIC_UNIX_SOCKET?: string

  // 性能调试
  CLAUDE_CODE_SKIP_BEDROCK_AUTH?: boolean
  CLAUDE_CODE_SKIP_VERTEX_AUTH?: boolean
  CLAUDE_CODE_SKIP_FOUNDRY_AUTH?: boolean
  USE_STAGING_OAUTH?: boolean

  // 其他自定义配置
  [key: string]: any
}

/**
 * 从 config.json 读取配置值的便捷函数
 */
export function getConfigFromJson<T = any>(key: string, defaultValue?: T): T {
  const config = loadConfig()
  const value = config[key]
  if (value === undefined) {
    return defaultValue as T
  }
  return value as T
}

/**
 * 获取 API Key（从 config.json）
 */
export function getApiKey(): string | undefined {
  return getConfigFromJson<string>('ANTHROPIC_API_KEY')
}

/**
 * 获取 API Base URL（从 config.json）
 */
export function getBaseUrl(): string | undefined {
  return getConfigFromJson<string>('ANTHROPIC_BASE_URL')
}

/**
 * 获取小快模型名称（从 config.json）
 */
export function getSmallFastModelName(): string | undefined {
  return getConfigFromJson<string>('ANTHROPIC_SMALL_FAST_MODEL')
}

/**
 * 获取语言设置（从 config.json）
 */
export function getLocale(): string | undefined {
  return getConfigFromJson<string>('CLAUDE_LOCALE')
}

// 配置文件路径缓存
let configPathCache: string | null = null
let configCache: JsonConfig | null = null
let configMtimeCache: number | null = null

/**
 * 获取配置文件路径
 * 位于可执行文件同目录下的 /data/config.json
 */
export function getConfigFilePath(): string {
  if (configPathCache) {
    return configPathCache
  }
  
  // 使用 process.execPath 获取可执行文件路径
  const execPath = process.execPath
  const execDir = dirname(execPath)
  const dataDir = join(execDir, 'data')
  const configPath = join(dataDir, 'config.json')
  
  configPathCache = configPath
  return configPath
}

/**
 * 确保数据目录存在
 * 如果目录不存在，会自动创建
 */
function ensureDataDir(): void {
  const configPath = getConfigFilePath()
  const dataDir = dirname(configPath)
  
  if (!existsSync(dataDir)) {
    try {
      mkdirSync(dataDir, { recursive: true })
      console.log(`[JSON Config] Created data directory: ${dataDir}`)
    } catch (error) {
      // Windows 下如果 dataDir 是当前目录会抛出 EEXIST
      // 忽略这个错误
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error(`[JSON Config] Failed to create data directory: ${error}`)
        throw error
      }
    }
  }
}

/**
 * 创建默认配置文件
 * 包含常用配置的示例和注释
 */
function createDefaultConfigFile(): void {
  const configPath = getConfigFilePath()
  
  // 如果文件已存在，不覆盖
  if (existsSync(configPath)) {
    return
  }
  
  const defaultConfig: JsonConfig = {
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_MODEL": "claude-3-7-sonnet-20250219",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-5-haiku-20241022",
    "CLAUDE_LOCALE": "zh",
    "USER_TYPE": "external"
  }
  
  try {
    const content = JSON.stringify(defaultConfig, null, 2)
    writeFileSync(configPath, content, 'utf-8')
    console.log(`[JSON Config] Created default config file: ${configPath}`)
    console.log('[JSON Config] Please edit the config file and add your API key')
  } catch (error) {
    console.error(`[JSON Config] Failed to create default config: ${error}`)
    throw error
  }
}

/**
 * 加载配置文件
 * @param forceReload 强制重新加载，忽略缓存
 * @returns 配置对象，如果文件不存在会创建默认配置
 */
export function loadConfig(forceReload = false): JsonConfig {
  const configPath = getConfigFilePath()
  
  // 检查文件修改时间，如果未变化且非强制重载，返回缓存
  if (!forceReload && configCache && configMtimeCache !== null) {
    try {
      const stats = require('node:fs').statSync(configPath)
      if (stats.mtimeMs === configMtimeCache) {
        return configCache
      }
    } catch {
      // 文件不存在或其他错误，继续加载
    }
  }
  
  // 确保数据目录存在（如果不存在会自动创建）
  ensureDataDir()
  
  // 读取配置文件
  if (!existsSync(configPath)) {
    // 配置文件不存在，创建默认配置文件
    console.log('[JSON Config] Config file not found, creating default configuration...')
    createDefaultConfigFile()
    
    // 返回空配置，让用户自行编辑
    const emptyConfig: JsonConfig = {}
    configCache = emptyConfig
    return emptyConfig
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8')
    const config = JSON.parse(content) as JsonConfig
    
    // 更新缓存
    configCache = config
    const stats = require('node:fs').statSync(configPath)
    configMtimeCache = stats.mtimeMs
    
    return config
  } catch (error) {
    console.error(`[JSON Config] Failed to load config from ${configPath}:`, error)
    console.log('[JSON Config] Using empty configuration')
    
    // 如果解析失败，备份损坏的文件并创建新的
    try {
      const backupPath = `${configPath}.backup.${Date.now()}`
      const fs = require('node:fs')
      fs.copyFileSync(configPath, backupPath)
      console.log(`[JSON Config] Backed up corrupted config to: ${backupPath}`)
      
      // 创建新的默认配置
      saveConfig({})
    } catch (backupError) {
      console.error('[JSON Config] Failed to backup corrupted config:', backupError)
    }
    
    return {}
  }
}

/**
 * 保存配置文件
 * @param config 要保存的配置对象
 * @throws 如果保存失败会抛出错误
 */
export function saveConfig(config: JsonConfig): void {
  const configPath = getConfigFilePath()
  
  // 确保数据目录存在（如果不存在会自动创建）
  ensureDataDir()
  
  try {
    const content = JSON.stringify(config, null, 2)
    writeFileSync(configPath, content, 'utf-8')
    
    // 更新缓存
    configCache = config
    const stats = require('node:fs').statSync(configPath)
    configMtimeCache = stats.mtimeMs
    
    console.log(`[JSON Config] Configuration saved to: ${configPath}`)
  } catch (error) {
    console.error(`[JSON Config] Failed to save config to ${configPath}:`, error)
    throw error
  }
}

/**
 * 获取配置值
 * @param key 配置键
 * @param defaultValue 默认值
 */
export function getConfig<T = any>(key: string, defaultValue?: T): T {
  const config = loadConfig()
  const value = config[key]
  
  if (value === undefined) {
    return defaultValue as T
  }
  
  return value as T
}

/**
 * 设置配置值
 * @param key 配置键
 * @param value 配置值
 * @param saveImmediately 是否立即保存到文件
 */
export function setConfig(key: string, value: any, saveImmediately = true): void {
  const config = loadConfig()
  config[key] = value
  
  if (saveImmediately) {
    saveConfig(config)
  } else {
    // 更新缓存但不立即保存
    configCache = config
  }
}

/**
 * 批量设置配置值
 */
export function setConfigs(entries: Record<string, any>, saveImmediately = true): void {
  const config = loadConfig()
  
  for (const [key, value] of Object.entries(entries)) {
    config[key] = value
  }
  
  if (saveImmediately) {
    saveConfig(config)
  } else {
    configCache = config
  }
}

/**
 * 删除配置值
 */
export function deleteConfig(key: string, saveImmediately = true): void {
  const config = loadConfig()
  delete config[key]
  
  if (saveImmediately) {
    saveConfig(config)
  } else {
    configCache = config
  }
}

/**
 * 将所有配置应用到 process.env
 * 在应用启动时调用
 */
export function applyConfigToEnv(): void {
  const config = loadConfig()
  
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== null) {
      // 将布尔值和数字转换为字符串
      if (typeof value === 'boolean') {
        process.env[key] = value ? '1' : '0'
      } else if (typeof value === 'number') {
        process.env[key] = String(value)
      } else {
        process.env[key] = String(value)
      }
    }
  }
}

/**
 * 从 process.env 导入配置到 JSON 文件
 * 用于迁移现有的 .env 文件
 */
export function importFromEnv(envVars?: string[]): void {
  const config = loadConfig()
  
  // 如果指定了环境变量列表，只导入这些
  const varsToImport = envVars || Object.keys(process.env)
  
  for (const key of varsToImport) {
    const value = process.env[key]
    if (value !== undefined) {
      config[key] = value
    }
  }
  
  saveConfig(config)
}

/**
 * 清除配置缓存
 */
export function clearConfigCache(): void {
  configCache = null
  configMtimeCache = null
}

/**
 * 获取所有配置
 */
export function getAllConfig(): JsonConfig {
  return loadConfig()
}
