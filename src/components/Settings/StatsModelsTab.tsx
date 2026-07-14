import { plot as asciichart } from 'asciichart';
import chalk from 'chalk';
import figures from 'figures';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { useKeybinding } from '../../keybindings/useKeybinding.js';
import { Ansi, Box, Text, useInput } from '../../ink.js';
import { applyColor } from '../../ink/colorize.js';
import type { Color } from '../../ink/styles.js';
import { getGlobalConfig } from '../../utils/config.js';
import { formatNumber } from '../../utils/format.js';
import { renderModelName } from '../../utils/model/model.js';
import { aggregateClaudeCodeStatsForRange, type ClaudeCodeStats, type DailyModelTokens, type StatsDateRange } from '../../utils/stats.js';
import { resolveThemeSetting } from '../../utils/systemTheme.js';
import { getTheme, themeColorToAnsi } from '../../utils/theme.js';
import { ConfigurableShortcutHint } from '../ConfigurableShortcutHint.js';
import { Byline } from '../design-system/Byline.js';
import { Spinner } from '../Spinner.js';

const DATE_RANGE_LABELS: Record<StatsDateRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  all: 'All time',
};
const DATE_RANGE_ORDER: StatsDateRange[] = ['all', '7d', '30d'];

function getNextDateRange(current: StatsDateRange): StatsDateRange {
  const currentIndex = DATE_RANGE_ORDER.indexOf(current);
  return DATE_RANGE_ORDER[(currentIndex + 1) % DATE_RANGE_ORDER.length]!;
}

function DateRangeSelector({
  dateRange,
  isLoading,
}: {
  dateRange: StatsDateRange;
  isLoading: boolean;
}) {
  return (
    <Box marginBottom={1} gap={1}>
      <Box>
        {DATE_RANGE_ORDER.map((range, i) => (
          <Text key={range}>
            {i > 0 && <Text dimColor> · </Text>}
            {range === dateRange ? (
              <Text bold color="claude">
                {DATE_RANGE_LABELS[range]}
              </Text>
            ) : (
              <Text dimColor>{DATE_RANGE_LABELS[range]}</Text>
            )}
          </Text>
        ))}
      </Box>
      {isLoading && <Spinner />}
    </Box>
  );
}

type ChartLegend = {
  model: string;
  coloredBullet: string;
};

type ChartOutput = {
  chart: string;
  legend: ChartLegend[];
  xAxisLabels: string;
};

function generateTokenChart(
  dailyTokens: DailyModelTokens[],
  models: string[],
  terminalWidth: number,
): ChartOutput | null {
  if (dailyTokens.length < 2 || models.length === 0) {
    return null;
  }

  const yAxisWidth = 7;
  const availableWidth = terminalWidth - yAxisWidth;
  const chartWidth = Math.min(52, Math.max(20, availableWidth));

  let recentData: DailyModelTokens[];
  if (dailyTokens.length >= chartWidth) {
    recentData = dailyTokens.slice(-chartWidth);
  } else {
    const repeatCount = Math.floor(chartWidth / dailyTokens.length);
    recentData = [];
    for (const day of dailyTokens) {
      for (let i = 0; i < repeatCount; i++) {
        recentData.push(day);
      }
    }
  }

  const theme = getTheme(resolveThemeSetting(getGlobalConfig().theme));
  const colors = [
    themeColorToAnsi(theme.suggestion),
    themeColorToAnsi(theme.success),
    themeColorToAnsi(theme.warning),
  ];

  const series: number[][] = [];
  const legend: ChartLegend[] = [];
  const topModels = models.slice(0, 3);

  for (let i = 0; i < topModels.length; i++) {
    const model = topModels[i]!;
    const data = recentData.map(day => day.tokensByModel[model] || 0);
    if (data.some(v => v > 0)) {
      series.push(data);
      const bulletColors = [theme.suggestion, theme.success, theme.warning];
      legend.push({
        model: renderModelName(model),
        coloredBullet: applyColor(
          figures.bullet,
          bulletColors[i % bulletColors.length] as Color,
        ),
      });
    }
  }

  if (series.length === 0) {
    return null;
  }

  const chart = asciichart(series, {
    height: 8,
    colors: colors.slice(0, series.length),
    format: (x: number) => {
      let label: string;
      if (x >= 1_000_000) {
        label = (x / 1_000_000).toFixed(1) + 'M';
      } else if (x >= 1_000) {
        label = (x / 1_000).toFixed(0) + 'k';
      } else {
        label = x.toFixed(0);
      }
      return label.padStart(6);
    },
  });

  const xAxisLabels = generateXAxisLabels(recentData, recentData.length, yAxisWidth);
  return { chart, legend, xAxisLabels };
}

function generateXAxisLabels(
  data: DailyModelTokens[],
  _chartWidth: number,
  yAxisOffset: number,
): string {
  if (data.length === 0) return '';
  const numLabels = Math.min(4, Math.max(2, Math.floor(data.length / 8)));
  const usableLength = data.length - 6;
  const step = Math.floor(usableLength / (numLabels - 1)) || 1;
  const labelPositions: { pos: number; label: string }[] = [];
  for (let i = 0; i < numLabels; i++) {
    const idx = Math.min(i * step, data.length - 1);
    const date = new Date(data[idx]!.date);
    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    labelPositions.push({ pos: idx, label });
  }

  let result = ' '.repeat(yAxisOffset);
  let currentPos = 0;
  for (const { pos, label } of labelPositions) {
    const spaces = Math.max(1, pos - currentPos);
    result += ' '.repeat(spaces) + label;
    currentPos = pos + label.length;
  }
  return result;
}

function ModelEntry({
  model,
  usage,
  totalTokens,
}: {
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  totalTokens: number;
}) {
  const modelTokens = usage.inputTokens + usage.outputTokens;
  const percentage = ((modelTokens / totalTokens) * 100).toFixed(1);

  return (
    <Box flexDirection="column">
      <Text>
        {figures.bullet}{' '}
        <Text bold>{renderModelName(model)}</Text>{' '}
        <Text color="subtle">({percentage}%)</Text>
      </Text>
      <Text color="subtle">
        {'  '}In: {formatNumber(usage.inputTokens)} · Out:{' '}
        {formatNumber(usage.outputTokens)}
      </Text>
    </Box>
  );
}

export function StatsModelsTab({
  onClose,
}: {
  onClose: () => void;
}): React.ReactNode {
  const { columns: terminalWidth } = useTerminalSize();
  const [stats, setStats] = useState<ClaudeCodeStats | null>(null);
  const [dateRange, setDateRange] = useState<StatsDateRange>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const loadStats = useCallback(async (range: StatsDateRange) => {
    const data = await aggregateClaudeCodeStatsForRange(range);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    loadStats(dateRange)
      .then(data => {
        if (!cancelled) {
          setStats(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load stats',
          );
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange, loadStats]);

  useKeybinding('confirm:no', onClose, { context: 'Settings' });

  const modelEntries = useMemo(
    () =>
      stats
        ? Object.entries(stats.modelUsage).sort(
            ([, a], [, b]) =>
              b.inputTokens + b.outputTokens -
              (a.inputTokens + a.outputTokens),
          )
        : [],
    [stats],
  );

  const totalTokens = useMemo(
    () =>
      modelEntries.reduce(
        (sum, [, usage]) => sum + usage.inputTokens + usage.outputTokens,
        0,
      ),
    [modelEntries],
  );

  const chartOutput = useMemo(
    () =>
      stats
        ? generateTokenChart(
            stats.dailyModelTokens,
            modelEntries.map(([model]) => model),
            terminalWidth,
          )
        : null,
    [stats, modelEntries, terminalWidth],
  );

  const visibleModels = modelEntries.slice(scrollOffset, scrollOffset + 4);
  const midpoint = Math.ceil(visibleModels.length / 2);
  const leftModels = visibleModels.slice(0, midpoint);
  const rightModels = visibleModels.slice(midpoint);
  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset < modelEntries.length - 4;
  const showScrollHint = modelEntries.length > 4;

  useInput(
    (input, key) => {
      if (key.downArrow && scrollOffset < modelEntries.length - 4) {
        setScrollOffset(prev => Math.min(prev + 2, modelEntries.length - 4));
      }
      if (key.upArrow) {
        if (scrollOffset > 0) {
          setScrollOffset(prev => Math.max(prev - 2, 0));
        }
      }
      if (input === 'r' && !key.ctrl && !key.meta) {
        setDateRange(prev => {
          setScrollOffset(0);
          return getNextDateRange(prev);
        });
      }
    },
    { isActive: true },
  );

  if (error) {
    return (
      <Box flexDirection="column" gap={1} marginTop={1}>
        <Text color="error">Failed to load stats: {error}</Text>
        <Text dimColor>
          <Byline>
            <ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel" />
          </Byline>
        </Text>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box marginTop={1}>
        <Spinner />
        <Text> Loading stats…</Text>
      </Box>
    );
  }

  if (modelEntries.length === 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Box marginTop={1}>
          <Text color="subtle">No model usage data available</Text>
        </Box>
        <Text dimColor>
          <Byline>
            <ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel" />
          </Byline>
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {chartOutput && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>Tokens per Day</Text>
          <Ansi>{chartOutput.chart}</Ansi>
          <Text color="subtle">{chartOutput.xAxisLabels}</Text>
          <Box>
            {chartOutput.legend.map((item, i) => (
              <Text key={item.model}>
                {i > 0 ? ' · ' : ''}
                <Ansi>{item.coloredBullet}</Ansi> {item.model}
              </Text>
            ))}
          </Box>
        </Box>
      )}

      <DateRangeSelector dateRange={dateRange} isLoading={isLoading} />

      <Box flexDirection="row" gap={4}>
        <Box flexDirection="column" width={36}>
          {leftModels.map(([model, usage]) => (
            <ModelEntry
              key={model}
              model={model}
              usage={usage}
              totalTokens={totalTokens}
            />
          ))}
        </Box>
        <Box flexDirection="column" width={36}>
          {rightModels.map(([model, usage]) => (
            <ModelEntry
              key={model}
              model={model}
              usage={usage}
              totalTokens={totalTokens}
            />
          ))}
        </Box>
      </Box>

      {showScrollHint && (
        <Box marginTop={1}>
          <Text color="subtle">
            {canScrollUp ? figures.arrowUp : ' '}{' '}
            {canScrollDown ? figures.arrowDown : ' '} {scrollOffset + 1}-
            {Math.min(scrollOffset + 4, modelEntries.length)} of{' '}
            {modelEntries.length} models (↑↓ to scroll)
          </Text>
        </Box>
      )}

      <Text dimColor>
        <Byline>
          <ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel" />
        </Byline>
      </Text>
    </Box>
  );
}