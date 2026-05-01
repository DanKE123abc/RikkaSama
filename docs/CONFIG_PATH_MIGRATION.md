# 配置路径迁移指南

## 概述

项目现在支持将 `.claude.json` 配置文件从用户主目录迁移到可执行文件同目录下的 `data/` 文件夹中。

## 配置路径优先级

系统按以下优先级查找配置文件：

### 1. **优先使用 data/.claude.json**（推荐）
```
安装目录/
├── cli (或 cli.exe)
└── data/
    └── .claude.json    # 优先读取此文件
```

### 2. **兼容旧版 ~/.config.json**
如果 `data/.claude.json` 不存在，会检查 `~/.claude/.config.json`

### 3. **默认 ~/.claude.json**
如果以上都不存在，使用默认的 `~/.claude.json`

## 迁移步骤

### 方式 1: 手动迁移

```bash
# Windows PowerShell
Copy-Item "$HOME\.claude.json" "data\.claude.json"

# macOS/Linux
cp ~/.claude.json data/.claude.json
```

### 方式 2: 自动创建

首次运行应用时，如果检测到 `data/` 目录中有 `config.json`，系统会自动在该目录下查找 `.claude.json`。

## 环境变量覆盖

你仍然可以通过 `CLAUDE_CONFIG_DIR` 环境变量自定义配置目录：

```bash
# 指定自定义配置目录
export CLAUDE_CONFIG_DIR="/path/to/custom/config"

# 运行应用
./cli
```

## 优势

✅ **便携性**: 配置文件随应用一起移动，无需重新配置  
✅ **隔离性**: 不同版本的配置互不影响  
✅ **备份方便**: 只需备份整个应用目录  
✅ **多实例**: 可以在不同位置运行多个独立配置的实例  

## 注意事项

⚠️ 如果同时存在 `data/.claude.json` 和 `~/.claude.json`，系统会优先使用 `data/.claude.json`  
⚠️ 确保 `data/` 目录有写入权限  
⚠️ 不要将包含敏感信息的配置文件提交到版本控制系统  

## 相关文件

- [`src/utils/env.ts`](file://c:\Users\15860\Desktop\RikkaSama\src\utils\env.ts) - 全局配置文件路径定义
- [`src/utils/envUtils.ts`](file://c:\Users\15860\Desktop\RikkaSama\src\utils\envUtils.ts) - 配置目录路径工具函数
- [`src/utils/jsonConfig.ts`](file://c:\Users\15860\Desktop\RikkaSama\src\utils\jsonConfig.ts) - JSON 配置管理系统

---

**就这么简单！** 🎉
