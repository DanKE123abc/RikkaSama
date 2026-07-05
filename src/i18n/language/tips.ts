import { getShortcutDisplay } from '../../keybindings/shortcutFormat.js'

export const newUserWarmupZh = `开始时选择小功能或bug修复，让智能体制定计划，并验证其建议的修改`

export const newUserWarmupEn = `Start with small features or bug fixes, tell Agent to propose a plan, and verify its suggested edits`


export const planModeForComplexTasksZh = `使用计划模式在进行更改之前为复杂请求做好准备。按${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')}两次启用。`

export const planModeForComplexTasksEn = `Use Plan Mode to prepare for a complex request before making changes. Press ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} twice to enable.`


export const defaultPermissionModeZh = `使用 /config 命令更改您的默认权限模式（包括计划模式）`

export const defaultPermissionModeEn = `Use /config to change your default permission mode (including Plan Mode)`


export const gitWorktreesZh = `使用 git worktrees 在并行运行多个 Agent 会话`

export const gitWorktreesEn = 'Use git worktrees to run multiple Agent sessions in parallel.'


export const colorWhenMultiClaudingZh = `同时运行多个 Agent 会话？使用 /color 和 /rename 命令让它们一目了然。`

export const colorWhenMultiClaudingEn = 'Running multiple Agent sessions? Use /color and /rename to tell them apart at a glance.'

export const terminalSetupZh = `运行 /terminal-setup 以启用便捷的终端集成，例如 Shift + Enter 进行新行输入等`

export const terminalSetupEn = `Run /terminal-setup to enable convenient terminal integration like Shift + Enter for new line and more`

export const terminalSetupAppleZh = `在 Apple 终端中运行 /terminal-setup 以启用便捷的终端集成，例如 Option + Enter 进行新行输入`

export const terminalSetupAppleEn = `Run /terminal-setup to enable convenient terminal integration like Option+Enter for new line and more`

export const shiftEnterZh = `按 Shift + Enter 发送多行消息`

export const shiftEnterEn = `Press Shift+Enter to send a multi-line message`

export const shiftEnterAppleZh = `按 Option+Enter 发送多行消息`

export const shiftEnterAppleEn = `Press Option+Enter to send a multi-line message`

export const shiftEnterSetupZh = `运行 /terminal-setup 以启用 Shift + Enter 进行新行输入`

export const shiftEnterSetupEn = `Run /terminal-setup to enable Shift+Enter for new lines`

export const shiftEnterSetupAppleZh = `运行 /terminal-setup 以启用 Option+Enter 进行新行输入`

export const shiftEnterSetupAppleEn = `Run /terminal-setup to enable Option+Enter for new lines`

export const memoryCommandZh = `使用 /memory 查看并管理 Claude 的记忆`

export const memoryCommandEn = `Use /memory to view and manage Claude memory`

export const themeCommandZh = `使用 /theme 更改配色主题`

export const themeCommandEn = `Use /theme to change the color theme`

export const colortermTruecolorZh = `尝试设置环境变量 COLORTERM=truecolor 以获得更丰富的颜色`

export const colortermTruecolorEn = `Try setting environment variable COLORTERM=truecolor for richer colors`

export const powershellToolEnvZh = `设置 CLAUDE_CODE_USE_POWERSHELL_TOOL=1 以启用 PowerShell 工具（预览）`

export const powershellToolEnvEn = `Set CLAUDE_CODE_USE_POWERSHELL_TOOL=1 to enable the PowerShell tool (preview)`

export const statusLineZh = `使用 /statusline 设置自定义状态行，该状态行将显示在输入框下方`

export const statusLineEn = `Use /statusline to set up a custom status line that will display beneath the input box`

export const promptQueueZh = `按 Enter 在 Claude 工作时排队发送附加消息。`

export const promptQueueEn = `Hit Enter to queue up additional messages while Claude is working.`

export const enterToSteerInRelatimeZh = `在 Claude 工作时发送消息以实时引导 Claude`

export const enterToSteerInRelatimeEn = `Send messages to Claude while it works to steer Claude in real-time`

export const todoListZh = `在处理复杂任务时让 Claude 创建待办列表，用于跟踪进度并保持专注`

export const todoListEn = `Ask Claude to create a todo list when working on complex tasks to track progress and remain on track`

export const vscodeCommandInstallZh = `打开命令面板并运行“Shell Command: Install '{command}' 命令到 PATH”，以启用 IDE 集成`

export const vscodeCommandInstallEn = `Open the Command Palette (Cmd+Shift+P) and run "Shell Command: Install '{command}' command in PATH" to enable IDE integration`

export const ideUpsellExternalTerminalZh = `将 Claude 连接到你的 IDE · /ide`

export const ideUpsellExternalTerminalEn = `Connect Claude to your IDE · /ide`

export const installGithubAppZh = `运行 /install-github-app 以便直接从 Github issues 和 PR 标记 @claude`

export const installGithubAppEn = `Run /install-github-app to tag @claude right from your Github issues and PRs`

export const installSlackAppZh = `运行 /install-slack-app 以在 Slack 中使用 Claude`

export const installSlackAppEn = `Run /install-slack-app to use Claude in Slack`

export const permissionsZh = `使用 /permissions 预先批准和拒绝 bash、编辑和 MCP 工具`

export const permissionsEn = `Use /permissions to pre-approve and pre-deny bash, edit, and MCP tools`

export const dragAndDropImagesZh = `你知道可以将图像文件拖放到终端中吗？`

export const dragAndDropImagesEn = `Did you know you can drag and drop image files into your terminal?`

export const pasteImagesMacZh = `使用 control+v（不是 cmd+v）将图像粘贴到 Claude Code 中`

export const pasteImagesMacEn = `Paste images into Claude Code using control+v (not cmd+v!)`

export const doubleEscZh = `双击 esc 将对话回退到以前的时间点`

export const doubleEscEn = `Double-tap esc to rewind the conversation to a previous point in time`

export const doubleEscCodeRestoreZh = `双击 esc 将代码和/或对话回退到以前的时间点`

export const doubleEscCodeRestoreEn = `Double-tap esc to rewind the code and/or conversation to a previous point in time`

export const continueZh = `运行 claude --continue 或 claude --resume 以恢复对话`

export const continueEn = `Run claude --continue or claude --resume to resume a conversation`

export const renameConversationZh = `使用 /rename 给对话命名，以便以后在 /resume 中查找`

export const renameConversationEn = `Name your conversations with /rename to find them easily in /resume later`

export const customCommandsZh = `通过将 .md 文件添加到 .claude/skills/ 来创建技能，或添加到 ~/.claude/skills/ 以便在任何项目中使用`

export const customCommandsEn = `Create skills by adding .md files to .claude/skills/ in your project or ~/.claude/skills/ for skills that work in any project`

export const shiftTabZh = `按 ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} 在默认模式、自动模式、自动接受编辑模式和计划模式之间循环`

export const shiftTabEn = `Hit ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} to cycle between default mode, auto-accept edit mode, and plan mode`

export const shiftTabAntZh = `按 ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} 在默认模式和自动模式之间循环`

export const shiftTabAntEn = `Hit ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} to cycle between default mode and auto mode`

export const imagePasteZh = `使用 ${getShortcutDisplay('chat:imagePaste', 'Chat', 'ctrl+v')} 从剪贴板粘贴图像`

export const imagePasteEn = `Use ${getShortcutDisplay('chat:imagePaste', 'Chat', 'ctrl+v')} to paste images from your clipboard`

export const customAgentsZh = `使用 /agents 优化具体任务，例如软件架构师、代码编写器、代码审阅者`

export const customAgentsEn = `Use /agents to optimize specific tasks. Eg. Software Architect, Code Writer, Code Reviewer`

export const agentFlagZh = `使用 --agent <agent_name> 直接启动与子代理的对话`

export const agentFlagEn = `Use --agent <agent_name> to directly start a conversation with a subagent`

export const desktopAppZh = `本地或远程运行 Claude Code，使用 Claude 桌面应用：clau.de/desktop`

export const desktopAppEn = `Run Claude Code locally or remotely using the Claude desktop app: clau.de/desktop`

export const desktopShortcutZh = `继续在 Claude Code 桌面应用中进行会话，使用 {desktop}`

export const desktopShortcutEn = `Continue your session in Claude Code Desktop with {desktop}`

export const webAppZh = `在云端运行任务，同时本地继续编码 · clau.de/web`

export const webAppEn = `Run tasks in the cloud while you keep coding locally · clau.de/web`

export const opusplanModeReminderZh = `你的默认模型设置是 Opus 计划模式。按 ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} 两次激活计划模式，并使用 Claude Opus 进行规划。`

export const opusplanModeReminderEn = `Your default model setting is Opus Plan Mode. Press ${getShortcutDisplay('chat:cycleMode', 'Chat', 'shift+tab')} twice to activate Plan Mode and plan with Claude Opus.`

export const frontendDesignPluginZh = `正在处理 HTML/CSS？安装 frontend-design 插件：\n{pluginInstallCommand}`

export const frontendDesignPluginEn = `Working with HTML/CSS? Install the frontend-design plugin:\n{pluginInstallCommand}`

export const vercelPluginZh = `正在使用 Vercel？安装 vercel 插件：\n{pluginInstallCommand}`

export const vercelPluginEn = `Working with Vercel? Install the vercel plugin:\n{pluginInstallCommand}`

export const effortHighNudgeZh = `正在处理棘手问题？使用 {cmd} 可获得更好的首轮回答`

export const effortHighNudgeEn = `Working on something tricky? {cmd} gives better first answers`

export const effortHighNudgeAltZh = `使用 {cmd} 可获得更好的 one-shot 回答。Claude 会先进行思考。`

export const effortHighNudgeAltEn = `Use /effort high for better one-shot answers. Claude thinks it through first.`

export const subagentFanoutNudgeZh = `说 {subagentCommand}，Claude 会派出一支团队。每个成员深入挖掘，绝不遗漏。`

export const subagentFanoutNudgeEn = `Say {subagentCommand} and Claude sends a team. Each one digs deep so nothing gets missed.`

export const subagentFanoutNudgeAltZh = `对于大型任务，告诉 Claude 使用 {subagentCommand}。它们会并行工作并保持主线程清爽。`

export const subagentFanoutNudgeAltEn = `For big tasks, tell Claude to use subagents. They work in parallel and keep your main thread clean.`

export const loopCommandNudgeZh = `使用 /loop 运行任何提示以设置定时任务。设定后即可忘记它。`

export const loopCommandNudgeEn = `Use /loop 5m check the deploy to run any prompt on a schedule. Set it and forget it.`

export const loopCommandNudgeAltZh = `/loop 运行任何提示的定时任务。非常适合监控部署、照看 PR 或轮询状态。`

export const loopCommandNudgeAltEn = `/loop runs any prompt on a recurring schedule. Great for monitoring deploys, babysitting PRs, or polling status.`

export const guestPassesZh = `你有免费的访客通行证可以分享 · {passes}`

export const guestPassesEn = `You have free guest passes to share · {passes}`

export const guestPassesWithRewardZh = `分享 Claude Code 并赚取 {reward} 的额外使用额度 · {passes}`

export const guestPassesWithRewardEn = `Share Claude Code and earn {reward} of extra usage · {passes}`

export const overageCreditZh = `{amount} 的额外使用额度，赠送给你 · 第三方应用 · {path}`

export const overageCreditEn = `{amount} in extra usage, on us · third-party apps · {path}`

export const importantClaudemdZh = `[ANT-ONLY] 对于必须遵循的 CLAUDE.md 规则，请使用 “IMPORTANT:” 前缀`

export const importantClaudemdEn = `[ANT-ONLY] Use "IMPORTANT:" prefix for must-follow CLAUDE.md rules`

export const skillifyZh = `[ANT-ONLY] 在工作流末尾使用 /skillify 将其转换为可重用技能`

export const skillifyEn = `[ANT-ONLY] Use /skillify at the end of a workflow to turn it into a reusable skill`


export const tips_zh = {
  newUserWarmup: newUserWarmupZh,
  planModeForComplexTasks: planModeForComplexTasksZh,
  defaultPermissionMode: defaultPermissionModeZh,
  gitWorktrees: gitWorktreesZh,
  colorWhenMultiClauding: colorWhenMultiClaudingZh,
  terminalSetup: terminalSetupZh,
  terminalSetupApple: terminalSetupAppleZh,
  shiftEnter: shiftEnterZh,
  shiftEnterApple: shiftEnterAppleZh,
  shiftEnterSetup: shiftEnterSetupZh,
  shiftEnterSetupApple: shiftEnterSetupAppleZh,
  memoryCommand: memoryCommandZh,
  themeCommand: themeCommandZh,
  colortermTruecolor: colortermTruecolorZh,
  powershellToolEnv: powershellToolEnvZh,
  statusLine: statusLineZh,
  promptQueue: promptQueueZh,
  enterToSteerInRelatime: enterToSteerInRelatimeZh,
  todoList: todoListZh,
  vscodeCommandInstall: vscodeCommandInstallZh,
  ideUpsellExternalTerminal: ideUpsellExternalTerminalZh,
  installGithubApp: installGithubAppZh,
  shiftTabAnt: shiftTabAntZh,
  installSlackApp: installSlackAppZh,
  permissions: permissionsZh,
  dragAndDropImages: dragAndDropImagesZh,
  pasteImagesMac: pasteImagesMacZh,
  doubleEsc: doubleEscZh,
  doubleEscCodeRestore: doubleEscCodeRestoreZh,
  continue: continueZh,
  renameConversation: renameConversationZh,
  customCommands: customCommandsZh,
  shiftTab: shiftTabZh,
  imagePaste: imagePasteZh,
  customAgents: customAgentsZh,
  agentFlag: agentFlagZh,
  desktopApp: desktopAppZh,
  desktopShortcut: desktopShortcutZh,
  webApp: webAppZh,
  opusplanModeReminder: opusplanModeReminderZh,
  frontendDesignPlugin: frontendDesignPluginZh,
  vercelPlugin: vercelPluginZh,
  effortHighNudge: effortHighNudgeZh,
  effortHighNudgeAlt: effortHighNudgeAltZh,
  subagentFanoutNudge: subagentFanoutNudgeZh,
  subagentFanoutNudgeAlt: subagentFanoutNudgeAltZh,
  loopCommandNudge: loopCommandNudgeZh,
  loopCommandNudgeAlt: loopCommandNudgeAltZh,
  guestPasses: guestPassesZh,
  guestPassesWithReward: guestPassesWithRewardZh,
  overageCredit: overageCreditZh,
  importantClaudemd: importantClaudemdZh,
  skillify: skillifyZh,
}

export const tips_en = {
  newUserWarmup: newUserWarmupEn,
  planModeForComplexTasks: planModeForComplexTasksEn,
  defaultPermissionMode: defaultPermissionModeEn,
  gitWorktrees: gitWorktreesEn,
  colorWhenMultiClauding: colorWhenMultiClaudingEn,
  terminalSetup: terminalSetupEn,
  terminalSetupApple: terminalSetupAppleEn,
  shiftEnter: shiftEnterEn,
  shiftEnterApple: shiftEnterAppleEn,
  shiftEnterSetup: shiftEnterSetupEn,
  shiftEnterSetupApple: shiftEnterSetupAppleEn,
  memoryCommand: memoryCommandEn,
  themeCommand: themeCommandEn,
  colortermTruecolor: colortermTruecolorEn,
  powershellToolEnv: powershellToolEnvEn,
  statusLine: statusLineEn,
  promptQueue: promptQueueEn,
  enterToSteerInRelatime: enterToSteerInRelatimeEn,
  todoList: todoListEn,
  vscodeCommandInstall: vscodeCommandInstallEn,
  ideUpsellExternalTerminal: ideUpsellExternalTerminalEn,
  installGithubApp: installGithubAppEn,
  installSlackApp: installSlackAppEn,
  permissions: permissionsEn,
  dragAndDropImages: dragAndDropImagesEn,
  pasteImagesMac: pasteImagesMacEn,
  doubleEsc: doubleEscEn,
  doubleEscCodeRestore: doubleEscCodeRestoreEn,
  continue: continueEn,
  renameConversation: renameConversationEn,
  customCommands: customCommandsEn,
  shiftTab: shiftTabEn,
  imagePaste: imagePasteEn,
  customAgents: customAgentsEn,
  agentFlag: agentFlagEn,
  desktopApp: desktopAppEn,
  desktopShortcut: desktopShortcutEn,
  webApp: webAppEn,
  opusplanModeReminder: opusplanModeReminderEn,
  frontendDesignPlugin: frontendDesignPluginEn,
  vercelPlugin: vercelPluginEn,
  effortHighNudge: effortHighNudgeEn,
  effortHighNudgeAlt: effortHighNudgeAltEn,
  subagentFanoutNudge: subagentFanoutNudgeEn,
  subagentFanoutNudgeAlt: subagentFanoutNudgeAltEn,
  loopCommandNudge: loopCommandNudgeEn,
  loopCommandNudgeAlt: loopCommandNudgeAltEn,
  guestPasses: guestPassesEn,
  guestPassesWithReward: guestPassesWithRewardEn,
  overageCredit: overageCreditEn,
  importantClaudemd: importantClaudemdEn,
  skillify: skillifyEn,
}

export type TipTranslationKey = keyof typeof tips_zh
