import { getInitialSettings } from '../utils/settings/settings.js'
import { spinnerVerbs_zh , spinnerVerbs_en } from './language/spinnerVerbs'
import { turnCompletionVerbs_zh , turnCompletionVerbs_en } from './language/turnCompletionVerbs'

export type LanguageCode = 'en' | 'zh' ;

export const supportedLanguages: Record<LanguageCode, string> = {
  en: 'English',
  zh: '简体中文',

};

export const defaultLanguage: LanguageCode = 'zh';

export function isSupportedLanguage(code: string): code is LanguageCode {
  return Object.prototype.hasOwnProperty.call(supportedLanguages, code);
}



export function getSpinnerVerbs(): string[] {
  const settings = getInitialSettings()
  const config = settings.spinnerVerbs
  const baseVerbs = defaultLanguage === 'zh' ? spinnerVerbs_zh : spinnerVerbs_en

  if (!config) {
    return baseVerbs
  }

  if (config.mode === 'replace') {
    return config.verbs.length > 0 ? config.verbs : baseVerbs
  }

  return [...baseVerbs, ...config.verbs]
}

export function getTurnCompletionVerbs(): string[] {
  return defaultLanguage === 'zh' ? turnCompletionVerbs_zh : turnCompletionVerbs_en
}

