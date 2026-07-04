import * as React from 'react'
import { Text } from '../ink.js'
import {
  EFFORT_HIGH,
  EFFORT_LOW,
  EFFORT_MAX,
  EFFORT_MEDIUM,
} from '../constants/figures.js'
import {
  type EffortLevel,
  type EffortValue,
  getDisplayedEffortLevel,
  modelSupportsEffort,
} from '../utils/effort.js'
import { useAppState } from '../state/AppState.js'
import { useMainLoopModel } from '../hooks/useMainLoopModel.js'

/**
 * Build the text for the effort-changed notification, e.g. "◐ medium · /effort".
 * Returns undefined if the model doesn't support effort.
 */
export function getEffortNotificationText(
  effortValue: EffortValue | undefined,
  model: string,
): string | undefined {
  if (!modelSupportsEffort(model)) return undefined
  const level = getDisplayedEffortLevel(model, effortValue)
  return `${effortLevelToSymbol(level)} ${model}|${level}`
}

export function effortLevelToSymbol(level: EffortLevel): string {
  switch (level) {
    case 'low':
      return EFFORT_LOW
    case 'medium':
      return EFFORT_MEDIUM
    case 'high':
      return EFFORT_HIGH
    case 'max':
      return EFFORT_MAX
    default:
      // Defensive: level can originate from remote config. If an unknown
      // value slips through, render the high symbol rather than undefined.
      return EFFORT_HIGH
  }
}

const BAR_WIDTH = 10
const FILLED = '\u2588'
const EMPTY = '\u2591'

function buildHealthBar(percent: number): string {
  const filled = Math.round((percent / 100) * BAR_WIDTH)
  return (
    FILLED.repeat(filled) + EMPTY.repeat(BAR_WIDTH - filled) + `${percent}%`
  )
}

type EffortIndicatorProps = {
  contextHealth?: number | null
  tokenSpeed?: number | null
}

export function EffortIndicator({
  contextHealth,
  tokenSpeed,
}: EffortIndicatorProps): React.ReactNode {
  const effortValue = useAppState((s) => s.effortValue)
  const mainLoopModel = useMainLoopModel()
  const effortText = getEffortNotificationText(effortValue, mainLoopModel)

  // Build speed prefix
  const speedPrefix = tokenSpeed && tokenSpeed > 0 ? `${tokenSpeed}t/s ` : ''

  // If effort is supported, use the existing format with effort text
  if (effortText) {
    if (contextHealth != null) {
      const bar = buildHealthBar(contextHealth)
      return <Text wrap="truncate">{speedPrefix}{effortText}|{bar}</Text>
    }
    return <Text wrap="truncate">{speedPrefix}{effortText}</Text>
  }

  // For models without effort support: show model name + context health + token speed
  // when there's session data (contextHealth or tokenSpeed available)
  if (contextHealth != null || (tokenSpeed && tokenSpeed > 0)) {
    const parts: string[] = [speedPrefix, mainLoopModel]
    if (contextHealth != null) {
      parts.push(buildHealthBar(contextHealth))
    }
    return <Text wrap="truncate">{parts.join('|')}</Text>
  }

  return null
}
