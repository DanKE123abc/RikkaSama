import * as React from 'react';
import { Box, Text } from '../../ink.js';

const LINES = [
    ' ▐▛███▜▌  ',
    '▝▜█████▛▘',
    '  ▘▘ ▝▝  '
];

export type ClawdPose = 'default';

type Props = { pose?: ClawdPose };

export function Clawd( pose?: Props) {
  return (
    <Box flexDirection="column">
      {LINES.map((line, i) => (
        <Text key={i} color="clawd_body">{line}</Text>
      ))}
    </Box>
  );
}