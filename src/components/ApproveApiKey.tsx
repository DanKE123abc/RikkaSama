import { useEffect } from 'react';
import { saveGlobalConfig } from '../utils/config.js';
type Props = {
  customApiKeyTruncated: string;
  onDone(approved: boolean): void;
};
export function ApproveApiKey(t0) {
  const {
    customApiKeyTruncated,
    onDone
  } = t0;
  useEffect(() => {
    saveGlobalConfig(current => ({
      ...current,
      customApiKeyResponses: {
        ...current.customApiKeyResponses,
        approved: [...(current.customApiKeyResponses?.approved ?? []), customApiKeyTruncated]
      }
    }));
    onDone(true);
  }, [customApiKeyTruncated, onDone]);
  return null;
}
