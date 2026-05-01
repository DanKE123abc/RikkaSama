# JSON 配置指南

本项目采用全 JSON 配置方案，所有配置项存储在可执行文件同目录下的 `data/config.json` 文件中。

## 📁 配置文件位置

```
你的安装目录/
├── cli (或 cli.exe)          # 可执行文件
├── data/
│   ├── config.json           # 你的配置文件
│   └── config.example.json   # 示例配置模板
└── ...
```

## 🚀 快速开始

### 1. 首次使用

复制示例配置文件：

**Windows (PowerShell):**
```powershell
Copy-Item "data\config.example.json" "data\config.json"
```

**macOS/Linux:**
```bash
cp data/config.example.json data/config.json
```

### 2. 编辑配置

用文本编辑器打开 `data/config.json`，填写必要的配置项：

```json
{
  "ANTHROPIC_API_KEY": "sk-ant-你的API密钥",
  "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
  "ANTHROPIC_MODEL": "claude-3-7-sonnet-20250219",
  "CLAUDE_LOCALE": "zh"
}
```

### 3. 运行程序

直接运行即可，配置会自动加载：

**Windows:**
```powershell
.\cli.exe
```

**macOS/Linux:**
```bash
./cli
```

## 🔧 配置管理命令

项目提供了便捷的 CLI 命令来管理配置：

### 查看所有配置
```bash
./cli config list
```

### 获取单个配置值
```bash
./cli config get ANTHROPIC_API_KEY
```

### 设置配置值
```bash
# 设置字符串
./cli config set ANTHROPIC_API_KEY "sk-ant-xxx"

# 设置数字
./cli config set API_TIMEOUT_MS 600000 --type number

# 设置布尔值
./cli config set CLAUDE_CODE_SIMPLE true --type boolean

# 设置 JSON 对象
./cli config set CUSTOM_SETTING '{"key": "value"}' --type json
```

### 删除配置值
```bash
./cli config delete ANTHROPIC_API_KEY
```

### 从 .env 文件导入
如果你有现有的 `.env` 文件，可以一键导入：

```bash
./cli config import-env --file .env
```

### 从当前环境变量导入
```bash
# 导入所有 ANTHROPIC_ 和 CLAUDE_ 开头的环境变量
./cli config import-current-env

# 自定义匹配模式
./cli config import-current-env --pattern "API_|MODEL_"
```

### 查看配置文件路径
```bash
./cli config path
```

### 重置所有配置
```bash
./cli config reset
# 或使用 --force 跳过确认
./cli config reset --force
```

## 📝 常用配置项

### API 认证（必需）

```json
{
  "ANTHROPIC_API_KEY": "你的API密钥"
}
```

### 第三方 API 服务

**MiniMax:**
```json
{
  "ANTHROPIC_BASE_URL": "https://api.minimax.chat/v1",
  "ANTHROPIC_API_KEY": "你的MiniMax密钥",
  "ANTHROPIC_MODEL": "abab6.5-chat"
}
```

**OpenRouter:**
```json
{
  "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
  "ANTHROPIC_API_KEY": "你的OpenRouter密钥",
  "ANTHROPIC_MODEL": "anthropic/claude-3-sonnet"
}
```

**SiliconFlow:**
```json
{
  "ANTHROPIC_BASE_URL": "https://api.siliconflow.cn/v1",
  "ANTHROPIC_API_KEY": "你的SiliconFlow密钥",
  "ANTHROPIC_MODEL": "Pro/deepseek-ai/DeepSeek-V3"
}
```

### 语言设置

```json
{
  "CLAUDE_LOCALE": "zh"  // zh: 中文, en: 英文
}
```

### AWS Bedrock

```json
{
  "CLAUDE_CODE_USE_BEDROCK": true,
  "AWS_REGION": "us-east-1",
  "AWS_BEARER_TOKEN_BEDROCK": "你的Bedrock令牌"
}
```

### Google Vertex AI

```json
{
  "CLAUDE_CODE_USE_VERTEX": true,
  "ANTHROPIC_VERTEX_PROJECT_ID": "你的GCP项目ID",
  "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/credentials.json"
}
```

### Azure Foundry

```json
{
  "CLAUDE_CODE_USE_FOUNDRY": true,
  "ANTHROPIC_FOUNDRY_API_KEY": "你的Foundry密钥"
}
```

### 代理配置

```json
{
  "HTTPS_PROXY": "http://proxy.example.com:8080",
  "HTTP_PROXY": "http://proxy.example.com:8080",
  "NO_PROXY": "localhost,127.0.0.1"
}
```

## 🔒 安全性说明

### 敏感信息保护

- 配置文件中的敏感信息（如 API Key、Token）在 `config list` 命令中会被隐藏显示为 `*** (hidden)`
- 建议将 `data/config.json` 添加到 `.gitignore` 中，避免泄露到版本控制系统

### 文件权限

**Linux/macOS:** 建议设置文件权限为仅所有者可读：
```bash
chmod 600 data/config.json
```

**Windows:** 右键文件 → 属性 → 安全 → 编辑权限，确保只有你的用户账户有读取权限。

## 🔄 从 .env 迁移

如果你之前使用 `.env` 文件，可以轻松迁移：

### 方法 1：使用导入命令（推荐）

```bash
./cli config import-env --file .env
```

### 方法 2：手动迁移

1. 打开 `.env` 文件
2. 将所有 `KEY=VALUE` 对转换为 JSON 格式
3. 粘贴到 `data/config.json` 中

例如：

**.env:**
```env
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-3-sonnet
CLAUDE_LOCALE=zh
```

**config.json:**
```json
{
  "ANTHROPIC_API_KEY": "sk-ant-xxx",
  "ANTHROPIC_MODEL": "claude-3-sonnet",
  "CLAUDE_LOCALE": "zh"
}
```

## ❓ 常见问题

### Q: 配置文件在哪里？
A: 在可执行文件同目录下的 `data/config.json`。运行 `./cli config path` 可查看完整路径。

### Q: 修改配置后需要重启吗？
A: 不需要。配置会在每次启动时自动重新加载。某些运行时配置更改会立即生效。

### Q: 可以同时使用 .env 和 config.json 吗？
A: 可以。JSON 配置的优先级更高。如果两者都存在，JSON 配置会覆盖环境变量。

### Q: 如何备份配置？
A: 直接复制 `data/config.json` 文件即可：
```bash
cp data/config.json data/config.backup.json
```

### Q: 配置文件的格式错误怎么办？
A: 如果 JSON 格式错误，程序会使用默认配置并显示错误信息。你可以：
1. 使用 `./cli config list` 检查当前配置
2. 使用 JSON 验证工具检查语法
3. 从示例文件重新开始：`cp data/config.example.json data/config.json`

### Q: 支持哪些数据类型？
A: 支持所有 JSON 数据类型：
- 字符串: `"value"`
- 数字: `123`, `45.67`
- 布尔值: `true`, `false`
- 数组: `["item1", "item2"]`
- 对象: `{"key": "value"}`
- null: `null`

## 📚 完整配置参考

查看所有可用的配置项，请参考 `data/config.example.json` 文件，其中包含了详细的注释说明。

## 🆘 获取帮助

如果遇到问题：
1. 检查配置文件语法是否正确
2. 运行 `./cli config list` 查看当前配置
3. 查看控制台输出的错误信息
4. 参考示例配置文件 `data/config.example.json`

---

**提示**: 定期备份你的配置文件，特别是包含敏感信息的配置！
