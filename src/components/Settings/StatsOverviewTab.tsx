import { feature } from 'bun:bundle';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { useKeybinding } from '../../keybindings/useKeybinding.js';
import { Ansi, Box, Text, useInput } from '../../ink.js';
import { aggregateClaudeCodeStatsForRange, type ClaudeCodeStats, type StatsDateRange } from '../../utils/stats.js';
import { formatDuration, formatNumber } from '../../utils/format.js';
import { renderModelName } from '../../utils/model/model.js';
import { generateHeatmap } from '../../utils/heatmap.js';
import { logError } from '../../utils/log.js';
import { ConfigurableShortcutHint } from '../ConfigurableShortcutHint.js';
import { Byline } from '../design-system/Byline.js';
import { Spinner } from '../Spinner.js';

function formatPeakDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

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

const BOOK_COMPARISONS = [
  { name: 'The Little Prince', tokens: 22000 },
  { name: 'The Old Man and the Sea', tokens: 35000 },
  { name: 'A Christmas Carol', tokens: 37000 },
  { name: 'Animal Farm', tokens: 39000 },
  { name: 'Fahrenheit 451', tokens: 60000 },
  { name: 'The Great Gatsby', tokens: 62000 },
  { name: 'Slaughterhouse-Five', tokens: 64000 },
  { name: 'Brave New World', tokens: 83000 },
  { name: 'The Catcher in the Rye', tokens: 95000 },
  { name: "Harry Potter and the Philosopher's Stone", tokens: 103000 },
  { name: 'The Hobbit', tokens: 123000 },
  { name: '1984', tokens: 123000 },
  { name: 'To Kill a Mockingbird', tokens: 130000 },
  { name: 'Pride and Prejudice', tokens: 156000 },
  { name: 'Dune', tokens: 244000 },
  { name: 'Moby-Dick', tokens: 268000 },
  { name: 'Crime and Punishment', tokens: 274000 },
  { name: 'A Game of Thrones', tokens: 381000 },
  { name: 'Anna Karenina', tokens: 468000 },
  { name: 'Don Quixote', tokens: 520000 },
  { name: 'The Lord of the Rings', tokens: 576000 },
  { name: 'The Count of Monte Cristo', tokens: 603000 },
  { name: 'Les Misérables', tokens: 689000 },
  { name: 'War and Peace', tokens: 730000 },
];

const TIME_COMPARISONS = [
  { name: 'a TED talk', minutes: 18 },
  { name: 'an episode of The Office', minutes: 22 },
  { name: 'listening to Abbey Road', minutes: 47 },
  { name: 'a yoga class', minutes: 60 },
  { name: 'a World Cup soccer match', minutes: 90 },
  { name: 'a half marathon (average time)', minutes: 120 },
  { name: 'the movie Inception', minutes: 148 },
  { name: 'watching Titanic', minutes: 195 },
  { name: 'a transatlantic flight', minutes: 420 },
  { name: 'a full night of sleep', minutes: 480 },
];

function generateFunFactoid(
  stats: ClaudeCodeStats,
  totalTokens: number,
): string {
  const factoids: string[] = [];
  if (totalTokens > 0) {
    const matchingBooks = BOOK_COMPARISONS.filter(
      book => totalTokens >= book.tokens,
    );
    for (const book of matchingBooks) {
      const times = totalTokens / book.tokens;
      if (times >= 2) {
        factoids.push(
          `You've used ~${Math.floor(times)}x more tokens than ${book.name}`,
        );
      } else {
        factoids.push(
          `You've used the same number of tokens as ${book.name}`,
        );
      }
    }
  }
  if (stats.longestSession) {
    const sessionMinutes = stats.longestSession.duration / (1000 * 60);
    for (const comparison of TIME_COMPARISONS) {
      const ratio = sessionMinutes / comparison.minutes;
      if (ratio >= 2) {
        factoids.push(
          `Your longest session is ~${Math.floor(ratio)}x longer than ${comparison.name}`,
        );
      }
    }
  }
  if (factoids.length === 0) {
    return '';
  }
  const randomIndex = Math.floor(Math.random() * factoids.length);
  return factoids[randomIndex]!;
}

export function StatsOverviewTab({
  onClose,
}: {
  onClose: () => void;
}): React.ReactNode {
  const { columns: terminalWidth } = useTerminalSize();
  const [allTimeStats, setAllTimeStats] = useState<ClaudeCodeStats | null>(
    null,
  );
  const [statsCache, setStatsCache] = useState<
    Record<string, ClaudeCodeStats>
  >({});
  const [dateRange, setDateRange] = useState<StatsDateRange>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(
    (range: StatsDateRange) => aggregateClaudeCodeStatsForRange(range),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    loadStats('all')
      .then(data => {
        if (!cancelled) {
          setAllTimeStats(data);
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
  }, [loadStats]);

  useEffect(() => {
    if (dateRange === 'all' || statsCache[dateRange] || allTimeStats === null)
      return;
    let cancelled = false;
    setIsLoading(true);
    loadStats(dateRange)
      .then(data => {
        if (!cancelled) {
          setStatsCache(prev => ({ ...prev, [dateRange]: data }));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange, statsCache, allTimeStats, loadStats]);

  const displayStats =
    dateRange === 'all'
      ? allTimeStats
      : statsCache[dateRange] ?? allTimeStats;

  useKeybinding('confirm:no', onClose, { context: 'Settings' });

  useInput(
    (input, key) => {
      if (input === 'r' && !key.ctrl && !key.meta) {
        setDateRange(prev => getNextDateRange(prev));
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
            <ConfigurableShortcutHint
              action="confirm:no"
              context="Settings"
              fallback="Esc"
              description="cancel"
            />
          </Byline>
        </Text>
      </Box>
    );
  }

  if (!allTimeStats) {
    return (
      <Box marginTop={1}>
        <Spinner />
        <Text> Loading your Claude Code stats…</Text>
      </Box>
    );
  }

  if (allTimeStats.totalSessions === 0) {
    return (
      <Box marginTop={1}>
        <Text color="warning">
          No stats available yet. Start using Claude Code!
        </Text>
      </Box>
    );
  }

  if (!displayStats) {
    return (
      <Box marginTop={1}>
        <Spinner />
        <Text> Loading stats…</Text>
      </Box>
    );
  }

  const modelEntries = useMemo(
    () =>
      Object.entries(displayStats.modelUsage).sort(
        ([, a], [, b]) =>
          b.inputTokens + b.outputTokens - (a.inputTokens + a.outputTokens),
      ),
    [displayStats.modelUsage],
  );
  const favoriteModel = modelEntries[0];
  const totalTokens = useMemo(
    () =>
      modelEntries.reduce(
        (sum, [, usage]) => sum + usage.inputTokens + usage.outputTokens,
        0,
      ),
    [modelEntries],
  );

  const factoid = useMemo(
    () => generateFunFactoid(displayStats, totalTokens),
    [displayStats, totalTokens],
  );
  const rangeDays =
    dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : displayStats.totalDays;

  // Shot stats (ant-only)
  const shotStatsData: {
    avgShots: string;
    buckets: { label: string; count: number; pct: number }[];
  } | null = useMemo(() => {
    if (!feature('SHOT_STATS') || !displayStats.shotDistribution) return null;
    const dist = displayStats.shotDistribution;
    const total = Object.values(dist).reduce((s, n) => s + n, 0);
    if (total === 0) return null;
    const totalShots = Object.entries(dist).reduce(
      (s, [count, sessions]) => s + parseInt(count, 10) * sessions,
      0,
    );
    const bucket = (min: number, max?: number) =>
      Object.entries(dist)
        .filter(([k]) => {
          const n = parseInt(k, 10);
          return n >= min && (max === undefined || n <= max);
        })
        .reduce((s, [, v]) => s + v, 0);
    const pct = (n: number) => Math.round((n / total) * 100);
    return {
      avgShots: (totalShots / total).toFixed(1),
      buckets: [
        { label: '1-shot', count: bucket(1, 1), pct: pct(bucket(1, 1)) },
        { label: '2–5 shot', count: bucket(2, 5), pct: pct(bucket(2, 5)) },
        { label: '6–10 shot', count: bucket(6, 10), pct: pct(bucket(6, 10)) },
        { label: '11+ shot', count: bucket(11), pct: pct(bucket(11)) },
      ],
    };
  }, [displayStats]);

  return (
    <Box flexDirection="column" marginTop={1}>
      {allTimeStats.dailyActivity.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Ansi>
            {generateHeatmap(allTimeStats.dailyActivity, { terminalWidth })}
          </Ansi>
        </Box>
      )}

      <DateRangeSelector dateRange={dateRange} isLoading={isLoading} />

      <Box flexDirection="row" gap={4} marginBottom={1}>
        <Box flexDirection="column" width={28}>
          {favoriteModel && (
            <Text wrap="truncate">
              Favorite model:{' '}
              <Text color="claude" bold>
                {renderModelName(favoriteModel[0])}
              </Text>
            </Text>
          )}
        </Box>
        <Box flexDirection="column" width={28}>
          <Text wrap="truncate">
            Total tokens: <Text color="claude">{formatNumber(totalTokens)}</Text>
          </Text>
        </Box>
      </Box>

      <Box flexDirection="row" gap={4}>
        <Box flexDirection="column" width={28}>
          <Text wrap="truncate">
            Sessions: <Text color="claude">{formatNumber(displayStats.totalSessions)}</Text>
          </Text>
        </Box>
        <Box flexDirection="column" width={28}>
          {displayStats.longestSession && (
            <Text wrap="truncate">
              Longest session:{' '}
              <Text color="claude">
                {formatDuration(displayStats.longestSession.duration)}
              </Text>
            </Text>
          )}
        </Box>
      </Box>

      <Box flexDirection="row" gap={4}>
        <Box flexDirection="column" width={28}>
          <Text wrap="truncate">
            Active days: <Text color="claude">{displayStats.activeDays}</Text>
            <Text color="subtle">/{rangeDays}</Text>
          </Text>
        </Box>
        <Box flexDirection="column" width={28}>
          <Text wrap="truncate">
            Longest streak:{' '}
            <Text color="claude" bold>
              {displayStats.streaks.longestStreak}
            </Text>{' '}
            {displayStats.streaks.longestStreak === 1 ? 'day' : 'days'}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="row" gap={4}>
        <Box flexDirection="column" width={28}>
          {displayStats.peakActivityDay && (
            <Text wrap="truncate">
              Most active day:{' '}
              <Text color="claude">
                {formatPeakDay(displayStats.peakActivityDay)}
              </Text>
            </Text>
          )}
        </Box>
        <Box flexDirection="column" width={28}>
          <Text wrap="truncate">
            Current streak:{' '}
            <Text color="claude" bold>
              {allTimeStats.streaks.currentStreak}
            </Text>{' '}
            {allTimeStats.streaks.currentStreak === 1 ? 'day' : 'days'}
          </Text>
        </Box>
      </Box>

      {'external' === 'ant' && displayStats.totalSpeculationTimeSavedMs > 0 && (
        <Box flexDirection="row" gap={4}>
          <Box flexDirection="column" width={28}>
            <Text wrap="truncate">
              Speculation saved:{' '}
              <Text color="claude">
                {formatDuration(displayStats.totalSpeculationTimeSavedMs)}
              </Text>
            </Text>
          </Box>
        </Box>
      )}

      {/* Shot stats (ant-only) */}
      {shotStatsData && (
        <>
          <Box marginTop={1}>
            <Text>Shot distribution</Text>
          </Box>
          <Box flexDirection="row" gap={4}>
            <Box flexDirection="column" width={28}>
              <Text wrap="truncate">
                {shotStatsData.buckets[0]!.label}:{' '}
                <Text color="claude">{shotStatsData.buckets[0]!.count}</Text>
                <Text color="subtle">
                  {' '}
                  ({shotStatsData.buckets[0]!.pct}%)
                </Text>
              </Text>
            </Box>
            <Box flexDirection="column" width={28}>
              <Text wrap="truncate">
                {shotStatsData.buckets[1]!.label}:{' '}
                <Text color="claude">{shotStatsData.buckets[1]!.count}</Text>
                <Text color="subtle">
                  {' '}
                  ({shotStatsData.buckets[1]!.pct}%)
                </Text>
              </Text>
            </Box>
          </Box>
          <Box flexDirection="row" gap={4}>
            <Box flexDirection="column" width={28}>
              <Text wrap="truncate">
                {shotStatsData.buckets[2]!.label}:{' '}
                <Text color="claude">{shotStatsData.buckets[2]!.count}</Text>
                <Text color="subtle">
                  {' '}
                  ({shotStatsData.buckets[2]!.pct}%)
                </Text>
              </Text>
            </Box>
            <Box flexDirection="column" width={28}>
              <Text wrap="truncate">
                {shotStatsData.buckets[3]!.label}:{' '}
                <Text color="claude">{shotStatsData.buckets[3]!.count}</Text>
                <Text color="subtle">
                  {' '}
                  ({shotStatsData.buckets[3]!.pct}%)
                </Text>
              </Text>
            </Box>
          </Box>
          <Box flexDirection="row" gap={4}>
            <Box flexDirection="column" width={28}>
              <Text wrap="truncate">
                Avg/session:{' '}
                <Text color="claude">{shotStatsData.avgShots}</Text>
              </Text>
            </Box>
          </Box>
        </>
      )}

      {factoid && (
        <Box marginTop={1}>
          <Text color="suggestion">{factoid}</Text>
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