import type { PermissionResult } from 'src/utils/permissions/PermissionResult.js'
import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'
import { lazySchema } from '../../utils/lazySchema.js'
import { getWebSearchV2Prompt, WEB_SEARCH_V2_TOOL_NAME } from './prompt.js'
import {
  getToolUseSummary,
  renderToolResultMessage,
  renderToolUseMessage,
  renderToolUseProgressMessage,
} from './UI.js'

const inputSchema = lazySchema(() =>
  z.strictObject({
    query: z.string().min(2).describe('The search query to use'),
    max_results: z
      .number()
      .optional()
      .default(10)
      .describe('Maximum number of search results to return'),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

type Input = z.infer<InputSchema>

const searchResultSchema = z.object({
  title: z.string().describe('The title of the search result'),
  href: z.string().describe('The URL of the search result'),
  body: z.string().describe('The content/snippet of the search result'),
})

export type SearchResultV2 = z.infer<typeof searchResultSchema>

const outputSchema = lazySchema(() =>
  z.object({
    query: z.string().describe('The search query that was executed'),
    results: z
      .array(searchResultSchema)
      .describe('Search results from the API'),
    durationSeconds: z
      .number()
      .describe('Time taken to complete the search operation'),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>

export type Output = z.infer<OutputSchema>

export type WebSearchV2Progress = {
  type: 'searching' | 'results_received'
  query: string
  resultCount?: number
}

const API_BASE = 'https://searchapi.danke666.top/search'

export const WebSearchToolV2 = buildTool({
  name: WEB_SEARCH_V2_TOOL_NAME,
  searchHint: 'search the web for current information',
  maxResultSizeChars: 100_000,
  shouldDefer: true,
  async description(input) {
    return `Claude wants to search the web for: ${input.query}`
  },
  userFacingName() {
    return 'Web Search V2'
  },
  getToolUseSummary,
  getActivityDescription(input) {
    const summary = getToolUseSummary(input)
    return summary ? `Searching for ${summary}` : 'Searching the web'
  },
  isEnabled() {
    return true
  },
  get inputSchema(): InputSchema {
    return inputSchema()
  },
  get outputSchema(): OutputSchema {
    return outputSchema()
  },
  isConcurrencySafe() {
    return true
  },
  isReadOnly() {
    return true
  },
  toAutoClassifierInput(input) {
    return input.query
  },
  async checkPermissions(_input): Promise<PermissionResult> {
    return {
      behavior: 'passthrough',
      message: 'WebSearchToolV2 requires permission.',
      suggestions: [
        {
          type: 'addRules',
          rules: [{ toolName: WEB_SEARCH_V2_TOOL_NAME }],
          behavior: 'allow',
          destination: 'localSettings',
        },
      ],
    }
  },
  async prompt() {
    return getWebSearchV2Prompt()
  },
  renderToolUseMessage,
  renderToolUseProgressMessage,
  renderToolResultMessage,
  extractSearchText() {
    return ''
  },
  async validateInput(input) {
    const { query } = input
    if (!query.length) {
      return {
        result: false,
        message: 'Error: Missing query',
        errorCode: 1,
      }
    }
    return { result: true }
  },
  async call(input, context, _canUseTool, _parentMessage, onProgress) {
    const startTime = performance.now()
    const { query, max_results = 10 } = input

    onProgress?.({
      toolUseID: 'search-start',
      data: { type: 'searching', query },
    })

    try {
      const url = new URL(API_BASE)
      url.searchParams.set('q', query)
      url.searchParams.set('max_results', String(max_results))

      const response = await fetch(url.toString(), {
        signal: context.abortController.signal,
      })

      if (!response.ok) {
        throw new Error(
          `Search API returned status ${response.status}: ${response.statusText}`,
        )
      }

      const json = (await response.json()) as {
        results?: Array<{
          title?: string
          href?: string
          body?: string
        }>
      }

      const results: SearchResultV2[] = (json.results ?? []).map(r => ({
        title: r.title ?? '',
        href: r.href ?? '',
        body: r.body ?? '',
      }))

      onProgress?.({
        toolUseID: 'search-results',
        data: {
          type: 'results_received',
          query,
          resultCount: results.length,
        },
      })

      const endTime = performance.now()
      const durationSeconds = (endTime - startTime) / 1000

      return {
        data: {
          query,
          results,
          durationSeconds,
        },
      }
    } catch (error) {
      const endTime = performance.now()
      const durationSeconds = (endTime - startTime) / 1000
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      return {
        data: {
          query,
          results: [],
          durationSeconds,
        },
        newMessages: [
          {
            type: 'user' as const,
            content: `Web search failed: ${errorMessage}. Try again or use a different query.`,
          },
        ],
      }
    }
  },
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    const { query, results } = output

    let formattedOutput = `Web search results for query: "${query}"\n\n`

    if (results.length === 0) {
      formattedOutput += 'No results found.\n\n'
    } else {
      for (const [index, result] of results.entries()) {
        formattedOutput += `[${index + 1}] ${result.title}\n`
        formattedOutput += `    URL: ${result.href}\n`
        formattedOutput += `    ${result.body}\n\n`
      }
    }

    formattedOutput +=
      '\nREMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.'

    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: formattedOutput.trim(),
    }
  },
} satisfies ToolDef<InputSchema, Output, WebSearchV2Progress>)
