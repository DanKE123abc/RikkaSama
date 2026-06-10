import React from 'react';
import { MessageResponse } from '../../components/MessageResponse.js';
import { CtrlOToExpand } from '../../components/CtrlOToExpand.js';
import { TOOL_SUMMARY_MAX_LENGTH } from '../../constants/toolLimits.js';
import { Box, Text } from '../../ink.js';
import type { ProgressMessage } from '../../types/message.js';
import { truncate } from '../../utils/format.js';
import type { Output, WebSearchV2Progress } from './WebSearchToolV2.js';

export function renderToolUseMessage(
  { query }: Partial<{ query: string }>,
  { verbose: _verbose }: { verbose: boolean },
): React.ReactNode {
  if (!query) {
    return null
  }
  return `"${query}"`
}

export function renderToolUseProgressMessage(
  progressMessages: ProgressMessage<WebSearchV2Progress>[],
): React.ReactNode {
  if (progressMessages.length === 0) {
    return null
  }
  const lastProgress = progressMessages[progressMessages.length - 1]
  if (!lastProgress?.data) {
    return null
  }
  const data = lastProgress.data
  switch (data.type) {
    case 'searching':
      return (
        <MessageResponse>
          <Text dimColor>Searching: {data.query}</Text>
        </MessageResponse>
      )
    case 'results_received':
      return (
        <MessageResponse>
          <Text dimColor>
            Found {data.resultCount} results for &quot;{data.query}&quot;
          </Text>
        </MessageResponse>
      )
    default:
      return null
  }
}

export function renderToolResultMessage(
  output: Output,
  _progressMessagesForMessage: ProgressMessage<WebSearchV2Progress>[],
  { verbose }: { verbose: boolean },
): React.ReactNode {
  const resultCount = output.results?.length ?? 0
  const timeDisplay =
    output.durationSeconds >= 1
      ? `${Math.round(output.durationSeconds)}s`
      : `${Math.round(output.durationSeconds * 1000)}ms`

  if (verbose) {
    return (
      <Box flexDirection="column">
        <MessageResponse height={1}>
          <Text>
            Found {resultCount} result{resultCount !== 1 ? 's' : ''} in {timeDisplay}
          </Text>
        </MessageResponse>
        {resultCount > 0 ? (
          <Box flexDirection="column" marginLeft={2} gap={1}>
            {output.results.map((result, i) => (
              <Box key={i} flexDirection="column">
                <Text bold>
                  {i + 1}. {result.title}
                </Text>
                <Text dimColor>{result.href}</Text>
                <Text>{result.body}</Text>
              </Box>
            ))}
          </Box>
        ) : (
          <Box marginLeft={2}>
            <Text dimColor>No results found.</Text>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box justifyContent="space-between" width="100%">
      <MessageResponse height={1}>
        <Text>
          Found {resultCount} result{resultCount !== 1 ? 's' : ''} in {timeDisplay}
        </Text>
      </MessageResponse>
      <CtrlOToExpand />
    </Box>
  )
}

export function getToolUseSummary(
  input: Partial<{ query: string }> | undefined,
): string | null {
  if (!input?.query) {
    return null
  }
  return truncate(input.query, TOOL_SUMMARY_MAX_LENGTH)
}
