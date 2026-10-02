import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

export type SqlEditorThemeMode = 'dark' | 'light';

export const SQL_EDITOR_THEME_STORAGE_KEY = 'sql_editor_theme';

export const sqlEditorTokens = {
  light: {
    background: '#FFFFFF',
    text: '#1A1612',
    keyword: '#8B1A1A',
    string: '#2A4B2A',
    number: '#6E4D0B',
    comment: '#5C4E3C',
    function: '#1F4E79',
    operator: '#4A3E30',
    punctuation: '#4A3E30',
    gutterBg: '#F3EBD9',
    gutterText: '#5C4E3C',
    gutterBorder: '#C4B6A0',
    activeLine: '#FAF3E0',
    activeLineGutterBg: '#EFE3CC',
    cursor: '#1A1612',
    selection: '#CFE3F5',
    bracketOutline: '#1F4E79',
    bracketBg: '#DCEBF8',
    tooltipBg: '#FAF6EC',
    tooltipBorder: '#C4B6A0',
    tooltipText: '#1A1612',
    tooltipSelectedBg: '#E5D9BC',
    tooltipSelectedText: '#1A1612',
  },
  dark: {
    background: '#141815',
    text: '#E2E8E4',
    keyword: '#E8BA4F',
    string: '#4ADE80',
    number: '#DFAB3A',
    comment: '#9CAAA0',
    function: '#38BDF8',
    operator: '#E2E8E4',
    punctuation: '#E2E8E4',
    gutterBg: '#141815',
    gutterText: '#9CAAA0',
    gutterBorder: '#232A25',
    activeLine: 'rgba(255, 255, 255, 0.05)',
    activeLineGutterBg: '#1C231E',
    cursor: '#4ADE80',
    selection: 'rgba(74, 222, 128, 0.22)',
    bracketOutline: '#4ADE80',
    bracketBg: 'rgba(74, 222, 128, 0.2)',
    tooltipBg: '#1F2621',
    tooltipBorder: '#37483B',
    tooltipText: '#E2E8E4',
    tooltipSelectedBg: '#2A382E',
    tooltipSelectedText: '#4ADE80',
  },
} as const;

// Light Syntax Highlight Style
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: sqlEditorTokens.light.keyword, fontWeight: '700' },
  { tag: [t.string, t.special(t.string)], color: sqlEditorTokens.light.string },
  { tag: [t.number, t.bool, t.null], color: sqlEditorTokens.light.number },
  { tag: [t.comment, t.lineComment, t.blockComment], color: sqlEditorTokens.light.comment, fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.typeName, t.standard(t.name)], color: sqlEditorTokens.light.function, fontWeight: '600' },
  { tag: [t.operator, t.punctuation], color: sqlEditorTokens.light.operator },
  { tag: t.variableName, color: sqlEditorTokens.light.text },
]);

// Dark Syntax Highlight Style
const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: sqlEditorTokens.dark.keyword, fontWeight: '700' },
  { tag: [t.string, t.special(t.string)], color: sqlEditorTokens.dark.string },
  { tag: [t.number, t.bool, t.null], color: sqlEditorTokens.dark.number },
  { tag: [t.comment, t.lineComment, t.blockComment], color: sqlEditorTokens.dark.comment, fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.typeName, t.standard(t.name)], color: sqlEditorTokens.dark.function, fontWeight: '600' },
  { tag: [t.operator, t.punctuation], color: sqlEditorTokens.dark.operator },
  { tag: t.variableName, color: sqlEditorTokens.dark.text },
]);

export const sqlEditorLightTheme: Extension = [
  EditorView.theme({
    '&': {
      backgroundColor: sqlEditorTokens.light.background,
      color: sqlEditorTokens.light.text,
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontSize: '14px',
    },
    '.cm-scroller': {
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontSize: '14px',
      lineHeight: '1.65',
      minHeight: '200px',
    },
    '.cm-content': {
      caretColor: sqlEditorTokens.light.cursor,
      minHeight: '200px',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: sqlEditorTokens.light.cursor,
      borderLeftWidth: '2px',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: sqlEditorTokens.light.selection,
    },
    '.cm-activeLine': {
      backgroundColor: sqlEditorTokens.light.activeLine,
    },
    '.cm-gutters': {
      backgroundColor: sqlEditorTokens.light.gutterBg,
      color: sqlEditorTokens.light.gutterText,
      borderRight: `1px solid ${sqlEditorTokens.light.gutterBorder}`,
    },
    '.cm-activeLineGutter': {
      backgroundColor: sqlEditorTokens.light.activeLineGutterBg,
      color: sqlEditorTokens.light.text,
      fontWeight: '700',
    },
    '&.cm-focused .cm-matchingBracket': {
      outline: `1px solid ${sqlEditorTokens.light.bracketOutline}`,
      backgroundColor: sqlEditorTokens.light.bracketBg,
    },
    '&.cm-focused .cm-nonmatchingBracket': {
      outline: '1px solid #DC2626',
      backgroundColor: 'rgba(220, 38, 38, 0.15)',
    },
    '.cm-tooltip': {
      backgroundColor: sqlEditorTokens.light.tooltipBg,
      color: sqlEditorTokens.light.tooltipText,
      border: `1px solid ${sqlEditorTokens.light.tooltipBorder}`,
      borderRadius: '3px',
      boxShadow: '0 4px 14px rgba(35, 20, 10, 0.2)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: '3px 8px',
        fontFamily: '"IBM Plex Mono", Consolas, monospace',
        fontSize: '13px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: sqlEditorTokens.light.tooltipSelectedBg,
        color: sqlEditorTokens.light.tooltipSelectedText,
        fontWeight: '600',
      },
    },
  }),
  syntaxHighlighting(lightHighlightStyle),
];

export const sqlEditorDarkTheme: Extension = [
  EditorView.theme({
    '&': {
      backgroundColor: sqlEditorTokens.dark.background,
      color: sqlEditorTokens.dark.text,
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontSize: '14px',
    },
    '.cm-scroller': {
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontSize: '14px',
      lineHeight: '1.65',
      minHeight: '200px',
    },
    '.cm-content': {
      caretColor: sqlEditorTokens.dark.cursor,
      minHeight: '200px',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: sqlEditorTokens.dark.cursor,
      borderLeftWidth: '2px',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: sqlEditorTokens.dark.selection,
    },
    '.cm-activeLine': {
      backgroundColor: sqlEditorTokens.dark.activeLine,
    },
    '.cm-gutters': {
      backgroundColor: sqlEditorTokens.dark.gutterBg,
      color: sqlEditorTokens.dark.gutterText,
      borderRight: `1px solid ${sqlEditorTokens.dark.gutterBorder}`,
    },
    '.cm-activeLineGutter': {
      backgroundColor: sqlEditorTokens.dark.activeLineGutterBg,
      color: sqlEditorTokens.dark.text,
      fontWeight: '700',
    },
    '&.cm-focused .cm-matchingBracket': {
      outline: `1px solid ${sqlEditorTokens.dark.bracketOutline}`,
      backgroundColor: sqlEditorTokens.dark.bracketBg,
    },
    '&.cm-focused .cm-nonmatchingBracket': {
      outline: '1px solid #F87171',
      backgroundColor: 'rgba(248, 113, 113, 0.2)',
    },
    '.cm-tooltip': {
      backgroundColor: sqlEditorTokens.dark.tooltipBg,
      color: sqlEditorTokens.dark.tooltipText,
      border: `1px solid ${sqlEditorTokens.dark.tooltipBorder}`,
      borderRadius: '3px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: '3px 8px',
        fontFamily: '"IBM Plex Mono", Consolas, monospace',
        fontSize: '13px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: sqlEditorTokens.dark.tooltipSelectedBg,
        color: sqlEditorTokens.dark.tooltipSelectedText,
        fontWeight: '600',
      },
    },
  }),
  syntaxHighlighting(darkHighlightStyle),
];

export function getPersistedEditorTheme(): SqlEditorThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(SQL_EDITOR_THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage may be disabled or restricted
  }
  return 'dark';
}

export function persistEditorTheme(theme: SqlEditorThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SQL_EDITOR_THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
