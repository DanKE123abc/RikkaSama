import { Command } from '@commander-js/extra-typings'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { 
  loadConfig, 
  saveConfig, 
  importFromEnv, 
  getAllConfig,
  setConfig,
  deleteConfig,
  getConfigFilePath
} from '../utils/jsonConfig.js'

export function registerConfigCommand(program: Command) {
  const config = program.command('config')
    .description('Manage JSON configuration')

  // 列出所有配置
  config.command('list')
    .description('List all configuration values')
    .action(() => {
      const allConfig = getAllConfig()
      const keys = Object.keys(allConfig).sort()
      
      if (keys.length === 0) {
        console.log('No configuration found.')
        return
      }
      
      console.log('Current configuration:')
      console.log('─'.repeat(60))
      
      for (const key of keys) {
        const value = allConfig[key]
        // 隐藏敏感信息
        const displayValue = isSensitiveKey(key) 
          ? '*** (hidden)' 
          : typeof value === 'object' 
            ? JSON.stringify(value) 
            : String(value)
        
        console.log(`${key.padEnd(45)} = ${displayValue}`)
      }
      
      console.log('─'.repeat(60))
      console.log(`Total: ${keys.length} settings`)
      console.log(`\nConfig file: ${getConfigFilePath()}`)
    })

  // 获取单个配置
  config.command('get')
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key')
    .action((key) => {
      const value = loadConfig()[key]
      
      if (value === undefined) {
        console.log(`Key "${key}" not found.`)
        process.exit(1)
      }
      
      // 检查是否是敏感信息
      if (isSensitiveKey(key)) {
        console.log('*** (sensitive value hidden)')
      } else {
        console.log(typeof value === 'object' ? JSON.stringify(value, null, 2) : value)
      }
    })

  // 设置配置
  config.command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key')
    .argument('<value>', 'Configuration value')
    .option('--type <type>', 'Value type: string, number, boolean, json', 'string')
    .action((key, value, options) => {
      let parsedValue: any
      
      switch (options.type) {
        case 'number':
          parsedValue = Number(value)
          if (isNaN(parsedValue)) {
            console.error(`Error: "${value}" is not a valid number`)
            process.exit(1)
          }
          break
        case 'boolean':
          parsedValue = value.toLowerCase() === 'true' || value === '1'
          break
        case 'json':
          try {
            parsedValue = JSON.parse(value)
          } catch {
            console.error(`Error: "${value}" is not valid JSON`)
            process.exit(1)
          }
          break
        default:
          parsedValue = value
      }
      
      setConfig(key, parsedValue)
      console.log(`✓ Set ${key} = ${typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : parsedValue}`)
    })

  // 删除配置
  config.command('delete')
    .description('Delete a configuration value')
    .argument('<key>', 'Configuration key')
    .action((key) => {
      const config = loadConfig()
      
      if (!(key in config)) {
        console.log(`Key "${key}" not found.`)
        process.exit(1)
      }
      
      deleteConfig(key)
      console.log(`✓ Deleted ${key}`)
    })

  // 从 .env 文件导入
  config.command('import-env')
    .description('Import configuration from .env file')
    .option('--file <path>', 'Path to .env file', '.env')
    .action((options) => {
      const envFile = options.file
      
      if (!existsSync(envFile)) {
        console.error(`Error: .env file not found at ${envFile}`)
        process.exit(1)
      }
      
      try {
        const content = readFileSync(envFile, 'utf-8')
        const lines = content.split('\n')
        const envVars: Record<string, string> = {}
        
        for (const line of lines) {
          const trimmed = line.trim()
          
          // 跳过空行和注释
          if (!trimmed || trimmed.startsWith('#')) {
            continue
          }
          
          // 解析 KEY=VALUE
          const match = trimmed.match(/^([^=]+)=(.*)$/)
          if (match) {
            const key = match[1].trim()
            let value = match[2].trim()
            
            // 移除引号
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1)
            }
            
            envVars[key] = value
          }
        }
        
        // 导入到配置
        const currentConfig = loadConfig()
        for (const [key, value] of Object.entries(envVars)) {
          currentConfig[key] = value
        }
        saveConfig(currentConfig)
        
        console.log(`✓ Imported ${Object.keys(envVars).length} variables from ${envFile}`)
        console.log(`Config file: ${getConfigFilePath()}`)
      } catch (error) {
        console.error('Error importing .env file:', error)
        process.exit(1)
      }
    })

  // 从环境变量导入
  config.command('import-current-env')
    .description('Import current environment variables to config')
    .option('--pattern <pattern>', 'Only import vars matching this pattern', 'ANTHROPIC_|CLAUDE_')
    .action((options) => {
      const pattern = new RegExp(options.pattern)
      const matchingVars = Object.keys(process.env).filter(key => pattern.test(key))
      
      importFromEnv(matchingVars)
      
      console.log(`✓ Imported ${matchingVars.length} environment variables`)
      console.log('Imported keys:', matchingVars.join(', '))
      console.log(`\nConfig file: ${getConfigFilePath()}`)
    })

  // 显示配置文件路径
  config.command('path')
    .description('Show configuration file path')
    .action(() => {
      console.log(getConfigFilePath())
    })

  // 重置配置
  config.command('reset')
    .description('Reset all configuration to defaults')
    .option('--force', 'Skip confirmation', false)
    .action((options) => {
      if (!options.force) {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        readline.question('⚠️  This will delete all configuration. Continue? (y/N) ', (answer: string) => {
          readline.close()
          
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            saveConfig({})
            console.log('✓ Configuration reset successfully')
          } else {
            console.log('Cancelled.')
          }
        })
      } else {
        saveConfig({})
        console.log('✓ Configuration reset successfully')
      }
    })
}

/**
 * 判断是否是敏感的配置键
 */
function isSensitiveKey(key: string): boolean {
  const sensitivePatterns = [
    /API_KEY/i,
    /AUTH_TOKEN/i,
    /OAUTH_TOKEN/i,
    /SECRET/i,
    /PASSWORD/i,
    /CREDENTIAL/i,
    /TOKEN/i,
  ]
  
  return sensitivePatterns.some(pattern => pattern.test(key))
}
