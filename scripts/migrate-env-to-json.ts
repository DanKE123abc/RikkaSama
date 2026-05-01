#!/usr/bin/env node

/**
 * Migration Script: .env to JSON Config
 * 
 * This script helps migrate from traditional .env files to the new JSON configuration system.
 * 
 * Usage:
 *   bun run scripts/migrate-env-to-json.ts [options]
 * 
 * Options:
 *   --input <file>    Input .env file (default: .env)
 *   --output <file>   Output JSON config file (default: data/config.json)
 *   --dry-run         Show what would be migrated without actually doing it
 *   --help            Show this help message
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

interface MigrationOptions {
  inputFile: string
  outputFile: string
  dryRun: boolean
}

function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2)
  const options: MigrationOptions = {
    inputFile: '.env',
    outputFile: 'data/config.json',
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.inputFile = args[++i] || '.env'
        break
      case '--output':
        options.outputFile = args[++i] || 'data/config.json'
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
        showHelp()
        process.exit(0)
        break
      default:
        console.error(`Unknown option: ${args[i]}`)
        showHelp()
        process.exit(1)
    }
  }

  return options
}

function showHelp(): void {
  console.log(`
Migration Script: .env to JSON Config

Usage:
  bun run scripts/migrate-env-to-json.ts [options]

Options:
  --input <file>    Input .env file (default: .env)
  --output <file>   Output JSON config file (default: data/config.json)
  --dry-run         Show what would be migrated without actually doing it
  --help            Show this help message

Examples:
  # Migrate default .env file
  bun run scripts/migrate-env-to-json.ts

  # Migrate custom .env file
  bun run scripts/migrate-env-to-json.ts --input .env.production

  # Dry run to see what will be migrated
  bun run scripts/migrate-env-to-json.ts --dry-run

  # Specify custom output path
  bun run scripts/migrate-env-to-json.ts --output /path/to/config.json
`.trim())
}

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      result[key] = value
    }
  }

  return result
}

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

function maskSensitiveValue(value: string): string {
  if (value.length <= 4) {
    return '****'
  }
  return value.substring(0, 2) + '...' + value.substring(value.length - 2)
}

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('🔄 Migration Script: .env to JSON Config')
  console.log('═'.repeat(60))
  console.log(`Input:  ${options.inputFile}`)
  console.log(`Output: ${options.outputFile}`)
  console.log(`Mode:   ${options.dryRun ? 'Dry Run (no changes)' : 'Live Migration'}`)
  console.log('═'.repeat(60))
  console.log()

  // Check if input file exists
  if (!existsSync(options.inputFile)) {
    console.error(`❌ Error: Input file not found: ${options.inputFile}`)
    process.exit(1)
  }

  // Parse .env file
  console.log('📖 Reading .env file...')
  const envContent = readFileSync(options.inputFile, 'utf-8')
  const envVars = parseEnvFile(envContent)

  console.log(`✓ Found ${Object.keys(envVars).length} environment variables`)
  console.log()

  // Display what will be migrated
  console.log('📋 Variables to migrate:')
  console.log('─'.repeat(60))

  const keys = Object.keys(envVars).sort()
  for (const key of keys) {
    const value = envVars[key]
    const displayValue = isSensitiveKey(key) 
      ? maskSensitiveValue(value)
      : value
    
    console.log(`  ${key.padEnd(45)} = ${displayValue}`)
  }

  console.log('─'.repeat(60))
  console.log()

  if (options.dryRun) {
    console.log('⚠️  Dry run mode - no files were modified')
    console.log()
    console.log('To perform the actual migration, run without --dry-run:')
    console.log(`  bun run scripts/migrate-env-to-json.ts --input ${options.inputFile} --output ${options.outputFile}`)
    return
  }

  // Perform migration
  console.log('🚀 Performing migration...')

  // Ensure output directory exists
  const outputDir = dirname(options.outputFile)
  if (!existsSync(outputDir)) {
    try {
      mkdirSync(outputDir, { recursive: true })
    } catch (error) {
      // Windows compatibility: ignore EEXIST for current directory
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error
      }
    }
  }

  // Read existing config if it exists
  let existingConfig: Record<string, any> = {}
  if (existsSync(options.outputFile)) {
    try {
      const existingContent = readFileSync(options.outputFile, 'utf-8')
      existingConfig = JSON.parse(existingContent)
      console.log('✓ Loaded existing configuration')
    } catch (error) {
      console.warn('⚠️  Could not parse existing config, starting fresh')
    }
  }

  // Merge configurations (env vars take precedence)
  const mergedConfig = { ...existingConfig, ...envVars }

  // Write to file
  try {
    const jsonContent = JSON.stringify(mergedConfig, null, 2)
    writeFileSync(options.outputFile, jsonContent, 'utf-8')
    console.log(`✓ Configuration saved to ${options.outputFile}`)
  } catch (error) {
    console.error('❌ Error writing configuration file:', error)
    process.exit(1)
  }

  console.log()
  console.log('✅ Migration completed successfully!')
  console.log()
  console.log('Next steps:')
  console.log('  1. Review the configuration file:')
  console.log(`     cat ${options.outputFile}`)
  console.log('  2. Remove or backup your .env file (optional):')
  console.log(`     mv ${options.inputFile} ${options.inputFile}.backup`)
  console.log('  3. Start using the application - configuration will be loaded automatically')
  console.log()
  console.log('For more information, see: docs/JSON_CONFIG_GUIDE.md')
}

main().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
