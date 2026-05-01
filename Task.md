# RikkaSama 项目国际化 (i18n) 实施计划

## 📋 项目概述

为 RikkaSama (Claude Code Haha) 项目添加完整的国际化支持,实现中英文界面切换,并为未来扩展更多语言奠定基础。

### 当前状态
- ✅ **桌面端**: 已有 i18n 实现 (`desktop/src/i18n/`)
- ❌ **CLI 端 (Ink UI)**: 所有文本都是硬编码的英文
- ❌ **错误消息、工具输出、命令描述**: 全部硬编码

### 目标
1. 为 CLI 端添加完整的 i18n 支持
2. 统一 CLI 和桌面端的翻译 API
3. 实现中英文无缝切换
4. 建立可扩展的多语言架构

---

## 🏗️ 技术架构

### 技术选型
**方案**: 轻量级自定义 i18n 系统

**理由**:
- ✅ 零依赖,与 Bun + TypeScript + React (Ink) 架构一致
- ✅ 参考桌面端已有成熟实现
- ✅ CLI 应用不需要复杂的插值功能
- ✅ 易于维护和扩展
- ✅ 保持项目轻量

### 目录结构
```
src/
├── i18n/                    # 新增: i18n 核心模块
│   ├── index.ts            # 主入口,导出 useTranslation, t()
│   ├── types.ts            # 类型定义
│   ├── utils.ts            # 工具函数
│   └── locales/            # 翻译文件目录
│       ├── en.ts           # 英文(默认)
│       ├── zh.ts           # 中文
│       └── ja.ts           # 日文(可选,后续扩展)
```

---

## 📅 实施阶段

### 阶段 1: 核心基础设施 (预计 1-2 天)

#### 1.1 创建类型定义系统
**文件**: `src/i18n/types.ts`

**任务**:
- [ ] 定义 `Locale` 类型: `'en' | 'zh' | 'ja'`
- [ ] 定义 `TranslationKey` 联合类型
- [ ] 按模块组织键名空间:
  - `common.*` - 通用文本
  - `commands.*` - 命令相关
  - `permissions.*` - 权限对话框
  - `tools.*` - 工具输出
  - `errors.*` - 错误消息
  - `settings.*` - 设置界面

**示例**:
```typescript
export type Locale = 'en' | 'zh' | 'ja'

export type TranslationKey = 
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  
  // Commands
  | 'commands.help.title'
  | 'commands.help.description'
  | 'commands.config.title'
  
  // Permissions
  | 'permission.dialog.title'
  | 'permission.dialog.allow'
  | 'permission.dialog.deny'
  
  // Tools
  | 'tool.bash.executing'
  | 'tool.read.reading'
  | 'tool.write.writing'
  
  // Errors
  | 'error.network.failed'
  | 'error.file.notFound'
  | 'error.permission.denied'
```

#### 1.2 创建翻译文件模板
**文件**: `src/i18n/locales/en.ts`, `src/i18n/locales/zh.ts`

**任务**:
- [ ] 创建英文翻译文件 (作为默认语言)
- [ ] 创建中文翻译文件
- [ ] 使用 `as const` 确保类型安全
- [ ] 保持键名完全一致

**英文模板示例**:
```typescript
// src/i18n/locales/en.ts
export const en = {
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  
  // Commands
  'commands.help.title': 'Help',
  'commands.help.description': 'Show help information',
  'commands.config.title': 'Configuration',
  
  // Permissions
  'permission.dialog.title': 'Permission Request',
  'permission.dialog.allow': 'Allow',
  'permission.dialog.deny': 'Deny',
  'permission.dialog.remember': 'Remember this decision',
  
  // Tools
  'tool.bash.executing': 'Executing command...',
  'tool.bash.completed': 'Command completed',
  'tool.read.reading': 'Reading file...',
  'tool.write.writing': 'Writing file...',
  
  // Errors
  'error.network.failed': 'Network request failed',
  'error.file.notFound': 'File not found: {path}',
  'error.permission.denied': 'Permission denied for {action}',
} as const
```

**中文模板示例**:
```typescript
// src/i18n/locales/zh.ts
export const zh = {
  // Common
  'common.loading': '加载中...',
  'common.error': '错误',
  'common.success': '成功',
  'common.cancel': '取消',
  'common.confirm': '确认',
  
  // Commands
  'commands.help.title': '帮助',
  'commands.help.description': '显示帮助信息',
  'commands.config.title': '配置',
  
  // Permissions
  'permission.dialog.title': '权限请求',
  'permission.dialog.allow': '允许',
  'permission.dialog.deny': '拒绝',
  'permission.dialog.remember': '记住此决定',
  
  // Tools
  'tool.bash.executing': '执行命令中...',
  'tool.bash.completed': '命令执行完成',
  'tool.read.reading': '读取文件中...',
  'tool.write.writing': '写入文件中...',
  
  // Errors
  'error.network.failed': '网络请求失败',
  'error.file.notFound': '文件未找到: {path}',
  'error.permission.denied': '权限被拒绝: {action}',
} as const
```

#### 1.3 实现 i18n 核心模块
**文件**: `src/i18n/index.ts`

**任务**:
- [ ] 实现 `translate()` 函数 (支持参数插值)
- [ ] 实现 `useTranslation()` Hook (用于 React 组件)
- [ ] 实现 `t()` 函数 (用于非 React 上下文)
- [ ] 添加翻译缓存机制
- [ ] 实现降级策略 (缺失翻译时回退到英文)

**核心代码**:
```typescript
// src/i18n/index.ts
import { useCallback } from 'react'
import { getLocale } from '../bootstrap/state.js'
import type { Locale, TranslationKey } from './types.js'
import { en } from './locales/en.js'
import { zh } from './locales/zh.js'

const translations: Record<Locale, Record<string, string>> = { en, zh }

/**
 * Translate a key with optional interpolation params.
 * Falls back to the key itself if no translation is found.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text = translations[locale]?.[key] ?? translations.en[key] ?? key
  
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  
  return text
}

/**
 * React hook that returns a `t()` function bound to the current locale.
 * Re-renders when the locale changes.
 */
export function useTranslation() {
  const locale = getLocale()
  return useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  )
}

/**
 * Get a translation outside of React (e.g. in commands, tools).
 * Reads the current locale from state directly.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = getLocale()
  return translate(locale, key, params)
}
```

#### 1.4 在 bootstrap/state.ts 中添加 locale 管理
**文件**: `src/bootstrap/state.ts`

**任务**:
- [ ] 添加 `currentLocale` 状态变量
- [ ] 实现 `setLocale()` 函数
- [ ] 实现 `getLocale()` 函数
- [ ] 从配置文件或环境变量读取初始语言
- [ ] 添加语言变更通知机制

**代码示例**:
```typescript
// src/bootstrap/state.ts

let currentLocale: Locale = 'en'

export function setLocale(locale: Locale): void {
  currentLocale = locale
  // TODO: 持久化到配置文件
  // TODO: 触发重新渲染
}

export function getLocale(): Locale {
  return currentLocale
}

// 初始化时从配置读取
export function initializeLocale(): void {
  const configLocale = getConfig().language
  if (configLocale && ['en', 'zh'].includes(configLocale)) {
    currentLocale = configLocale as Locale
  }
}
```

#### 1.5 添加工具函数
**文件**: `src/i18n/utils.ts`

**任务**:
- [ ] 实现语言检测函数
- [ ] 实现翻译键验证工具
- [ ] 添加调试辅助函数

---

### 阶段 2: UI 组件迁移 (预计 3-5 天)

#### 2.1 识别需要国际化的组件

**高优先级组件**:
- [ ] `src/components/permissions/PermissionDialog.tsx`
- [ ] `src/components/hooks/PromptDialog.tsx`
- [ ] `src/components/HelpV2/HelpV2.tsx`
- [ ] `src/components/Messages.tsx`
- [ ] `src/components/messageActions.tsx`

**消息组件**:
- [ ] `src/components/messages/UserPromptMessage.tsx`
- [ ] `src/components/messages/AssistantThinkingMessage.tsx`
- [ ] `src/components/messages/ToolCallBlock.tsx`
- [ ] `src/components/messages/ToolResultBlock.tsx`

**其他组件**:
- [ ] `src/components/TextInput.tsx`
- [ ] `src/components/CustomSelect/select.tsx`
- [ ] `src/components/wizard/*.tsx`
- [ ] `src/components/scheduled-tasks/**/*.tsx`

#### 2.2 迁移策略

**步骤**:
1. **试点迁移**: 先改造 1-2 个小组件,验证方案可行性
2. **批量替换**: 使用脚本找出所有硬编码字符串
3. **逐个文件**: 按功能模块分组,逐个文件替换
4. **测试验证**: 每次替换后运行测试,确保无回归

**示例改造**:

**Before**:
```typescript
// src/components/permissions/PermissionDialog.tsx
import * as React from 'react'
import { Box, Text } from '../../ink.js'

export function PermissionDialog({ title, children }) {
  return (
    <Box borderStyle="round">
      <Text bold>{title}</Text>
      <Text>Allow this action?</Text>
      {children}
    </Box>
  )
}
```

**After**:
```typescript
// src/components/permissions/PermissionDialog.tsx
import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { useTranslation } from '../../i18n/index.js'

export function PermissionDialog({ title, children }) {
  const t = useTranslation()
  
  return (
    <Box borderStyle="round">
      <Text bold>{title}</Text>
      <Text>{t('permission.dialog.allowAction')}</Text>
      {children}
    </Box>
  )
}
```

#### 2.3 自动化辅助工具

**创建查找脚本**:
```bash
# 找出所有硬编码的中文字符串
grep -r "[\u4e00-\u9fff]" src/components/ --include="*.tsx"

# 找出常见的英文提示文本
grep -r "Loading\|Error\|Success\|Cancel\|Confirm" src/components/ --include="*.tsx"
```

---

### 阶段 3: 命令和工具迁移 (预计 2-3 天)

#### 3.1 命令描述国际化

**需要迁移的命令**:
- [ ] `/help` - 帮助信息
- [ ] `/config` - 配置管理
- [ ] `/model` - 模型选择
- [ ] `/permissions` - 权限管理
- [ ] `/skills` - Skills 管理
- [ ] `/mcp` - MCP 服务器
- [ ] `/session` - 会话管理
- [ ] 所有其他命令...

**示例**:
```typescript
// src/commands/help/index.ts
import { t } from '../../i18n/index.js'

export const command: Command = {
  name: 'help',
  description: t('commands.help.description'),
  handler: async (context) => {
    console.log(t('commands.help.title'))
    // ...
  }
}
```

#### 3.2 工具输出国际化

**需要迁移的工具**:
- [ ] `BashTool` - 命令执行
- [ ] `ReadTool` - 文件读取
- [ ] `WriteTool` - 文件写入
- [ ] `EditTool` - 文件编辑
- [ ] `GrepTool` - 内容搜索
- [ ] `GlobTool` - 文件匹配
- [ ] `AgentTool` - Agent 调用
- [ ] 所有其他工具...

**示例**:
```typescript
// src/tools/BashTool/index.ts
import { t } from '../../utils/i18n.js'

function renderExecutingMessage(command: string) {
  return t('tool.bash.executing', { command })
}

function renderCompletedMessage(output: string) {
  return t('tool.bash.completed')
}
```

#### 3.3 错误消息国际化

**错误类型分类**:
- [ ] 网络错误 (API 超时、连接失败)
- [ ] 文件错误 (不存在、权限不足)
- [ ] 权限错误 (拒绝访问)
- [ ] 配置错误 (无效配置)
- [ ] 工具执行错误
- [ ] 会话错误

**示例**:
```typescript
// src/utils/errors.ts
import { t } from '../i18n/index.js'

export function formatError(error: Error): string {
  if (error.code === 'RATE_LIMIT') {
    return t('error.api.rateLimit')
  }
  
  if (error.code === 'FILE_NOT_FOUND') {
    return t('error.file.notFound', { path: error.path })
  }
  
  if (error.code === 'PERMISSION_DENIED') {
    return t('error.permission.denied', { action: error.action })
  }
  
  return error.message
}
```

---

### 阶段 4: 语言切换功能 (预计 1 天)

#### 4.1 添加 /locale 命令

**文件**: `src/commands/locale/index.ts`

**功能**:
- [ ] 查看当前语言: `/locale`
- [ ] 切换语言: `/locale zh` 或 `/locale en`
- [ ] 列出支持的语言: `/locale list`

**实现**:
```typescript
// src/commands/locale/index.ts
import { t, translate } from '../../i18n/index.js'
import { setLocale, getLocale } from '../../bootstrap/state.js'
import type { Command } from '../../commands.js'

export const command: Command = {
  name: 'locale',
  description: t('commands.locale.description'),
  handler: async (context, args) => {
    const action = args[0]
    
    if (!action || action === 'list') {
      // 列出支持的语言
      console.log(t('commands.locale.supportedLanguages'))
      console.log('  en - English')
      console.log('  zh - 中文')
      return
    }
    
    const locale = action as Locale
    if (!['en', 'zh'].includes(locale)) {
      console.error(t('commands.locale.invalidLanguage', { locale }))
      return
    }
    
    setLocale(locale)
    console.log(t('commands.locale.changed', { locale }))
  }
}
```

#### 4.2 在配置中集成

**文件**: `src/commands/config/index.ts`

**任务**:
- [ ] 添加 `language` 配置项
- [ ] 支持从配置文件读取
- [ ] 支持命令行参数 `--language zh`

**配置示例**:
```json
{
  "language": "zh",
  "model": "claude-3-opus",
  // ...
}
```

#### 4.3 启动时语言检测

**任务**:
- [ ] 从配置文件读取语言设置
- [ ] 从环境变量读取 (优先级更高)
- [ ] 从命令行参数读取 (最高优先级)
- [ ] 默认使用英文

---

### 阶段 5: 测试和优化 (预计 2-3 天)

#### 5.1 单元测试

**文件**: `src/i18n/__tests__/index.test.ts`

**测试用例**:
- [ ] 基本翻译功能
- [ ] 参数插值
- [ ] 降级策略 (缺失翻译回退到英文)
- [ ] 无效键名处理
- [ ] 空参数处理

**示例**:
```typescript
import { describe, test, expect } from 'bun:test'
import { translate } from '../index.js'

describe('i18n translate', () => {
  test('basic translation', () => {
    expect(translate('en', 'common.loading')).toBe('Loading...')
    expect(translate('zh', 'common.loading')).toBe('加载中...')
  })
  
  test('translation with params', () => {
    expect(translate('en', 'error.file.notFound', { path: '/test' }))
      .toBe('File not found: /test')
  })
  
  test('fallback to English', () => {
    expect(translate('ja', 'common.loading')).toBe('Loading...')
  })
  
  test('missing key returns key', () => {
    expect(translate('en', 'non.existent.key')).toBe('non.existent.key')
  })
})
```

#### 5.2 集成测试

**测试场景**:
- [ ] 所有 UI 组件在中英文下的显示
- [ ] 命令输出的正确性
- [ ] 错误消息的显示
- [ ] 语言切换后的即时生效
- [ ] 重启后语言设置保持

#### 5.3 性能优化

**优化措施**:
- [ ] 添加翻译结果缓存 (WeakMap)
- [ ] 避免在循环中重复调用 `t()`
- [ ] 预加载常用语言包
- [ ] 懒加载不常用语言
- [ ] 确保不影响启动速度 (< 100ms)

**性能监控**:
```typescript
// 测量翻译性能
const start = performance.now()
translate('zh', 'some.key')
const elapsed = performance.now() - start
if (elapsed > 1) {
  console.warn(`Slow translation: ${elapsed}ms`)
}
```

#### 5.4 边界情况处理

**测试用例**:
- [ ] 空字符串翻译
- [ ] 特殊字符处理 (emoji, CJK)
- [ ] 超长文本换行
- [ ] RTL 语言支持 (预留接口)
- [ ] 复数形式处理 (可选)

---

## 📊 工作量估算

| 阶段 | 任务 | 预计时间 | 负责人 |
|------|------|----------|--------|
| 阶段 1 | 核心基础设施 | 1-2 天 | AI Assistant |
| 阶段 2 | UI 组件迁移 | 3-5 天 | AI Assistant |
| 阶段 3 | 命令和工具迁移 | 2-3 天 | AI Assistant |
| 阶段 4 | 语言切换功能 | 1 天 | AI Assistant |
| 阶段 5 | 测试和优化 | 2-3 天 | AI Assistant |
| **总计** | | **10-16 天** | |

---

## ⚠️ 注意事项和最佳实践

### 命名规范

**✅ 推荐**:
```typescript
'permission.dialog.title'
'commands.help.description'
'tool.bash.executing'
'error.file.notFound'
```

**❌ 避免**:
```typescript
'permTitle'
'helpDesc'
'bashExec'
'errNotFound'
```

### 常见陷阱

1. **不要直接拼接字符串**
   ```typescript
   // ❌ 错误
   t('file.notFound.prefix') + filePath
   
   // ✅ 正确
   t('file.notFound', { path: filePath })
   ```

2. **保持键名一致性**
   - 使用点分命名空间
   - 同模块使用相同前缀
   - 避免缩写

3. **不要翻译变量名和代码**
   - 只翻译用户可见文本
   - 保留技术术语 (API, CLI, MCP)
   - 文件名、路径不翻译

4. **考虑文本长度差异**
   - 中文通常比英文短 30-50%
   - 留出足够的 UI 空间
   - 测试不同语言下的布局

### 性能考虑

1. **预加载常用语言**: en, zh
2. **缓存翻译结果**: 使用 WeakMap
3. **避免在渲染循环中调用 t()**: 提前计算
4. **懒加载不常用语言**: 按需加载

---

## 🚀 快速启动指南

### 立即开始的步骤

```bash
# 1. 创建基础目录结构
mkdir -p src/i18n/locales

# 2. 创建核心文件
touch src/i18n/{index.ts,types.ts,utils.ts}
touch src/i18n/locales/{en.ts,zh.ts}

# 3. 复制上面的模板代码到对应文件

# 4. 在 bootstrap/state.ts 中添加 locale 管理

# 5. 选择一个小组件进行试点迁移
# 例如: src/components/permissions/PermissionDialog.tsx

# 6. 测试通过后,逐步扩展到其他组件
```

### 验证清单

- [ ] 类型检查通过 (`bun run build`)
- [ ] 无编译错误
- [ ] 英文界面正常显示
- [ ] 切换到中文后正常显示
- [ ] 参数插值工作正常
- [ ] 降级策略生效
- [ ] 性能无明显下降

---

## 📝 后续扩展计划

### 短期 (1-2 个月)
- [ ] 添加日文支持 (ja)
- [ ] 完善错误消息覆盖
- [ ] 优化工具输出翻译
- [ ] 添加翻译贡献指南

### 中期 (3-6 个月)
- [ ] 添加韩文 (ko)、西班牙文 (es)、法文 (fr)
- [ ] 集成翻译管理平台 (Crowdin/Lokalise)
- [ ] 社区翻译贡献流程
- [ ] 自动化翻译质量检测

### 长期 (6+ 个月)
- [ ] RTL 语言支持 (阿拉伯语、希伯来语)
- [ ] 动态语言加载
- [ ] A/B 测试不同语言的 UX
- [ ] 语音助手多语言支持

---

## 🎯 成功标准

### 功能性标准
- ✅ 所有 UI 文本可切换中英文
- ✅ 命令描述和帮助信息已翻译
- ✅ 错误消息完整翻译
- ✅ 工具输出友好提示
- ✅ 语言切换即时生效
- ✅ 配置持久化保存

### 质量标准
- ✅ 无翻译遗漏
- ✅ 无语境错误
- ✅ 文本自然流畅
- ✅ 专业术语准确
- ✅ 格式一致

### 性能标准
- ✅ 启动时间增加 < 100ms
- ✅ 翻译查询 < 1ms
- ✅ 内存占用增加 < 5MB
- ✅ 无卡顿或延迟

### 用户体验标准
- ✅ 界面布局不因语言改变而错乱
- ✅ 文本长度适配合理
- ✅ 快捷键提示清晰
- ✅ 帮助文档易理解

---

## 🔗 相关资源

### 参考实现
- 桌面端 i18n: `desktop/src/i18n/`
- React i18next: https://react.i18next.com/
- Ink 官方文档: https://inkjs.org/

### 翻译资源
- Google Translate API (用于初稿)
- DeepL (更准确的翻译)
- 母语者校对 (最终质量保障)

### 工具推荐
- VS Code i18n Ally 插件
- JSON Schema 验证
- 翻译记忆库管理

---

## 📞 联系和支持

如有问题或建议,请:
1. 查阅本文档的相关章节
2. 查看已有的翻译文件作为参考
3. 保持键名命名的一致性
4. 提交 PR 前运行测试

---

**最后更新**: 2026-05-01  
**版本**: 1.0  
**状态**: 计划阶段
