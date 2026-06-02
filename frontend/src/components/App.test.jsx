// Unit tests for logic and components defined directly in App.jsx:
//   - getPrompt(): the prompt-resolution helper (custom override -> default -> '')
//   - MarkdownRenderer: the inline markdown-to-JSX component used across the app
// Firebase SDK modules are mocked so importing the (large) App module does not
// touch any real Firebase wiring.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  signInWithCustomToken: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(() => () => {}),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  setLogLevel: vi.fn(),
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  setDoc: vi.fn(() => Promise.resolve()),
}));

import { getPrompt, MarkdownRenderer } from './App.jsx';

describe('getPrompt', () => {
  it('prefers a custom prompt when present', () => {
    expect(getPrompt({ chatBase: 'custom' }, 'chatBase')).toBe('custom');
  });

  it('falls back to the default prompt when no custom override exists', () => {
    // chatBase has a non-empty default prompt shipped in App.jsx.
    expect(getPrompt({}, 'chatBase')).not.toBe('');
    expect(getPrompt(undefined, 'chatBase')).not.toBe('');
  });

  it('returns an empty string for an unknown key', () => {
    expect(getPrompt({}, 'does_not_exist')).toBe('');
    expect(getPrompt(null, 'does_not_exist')).toBe('');
  });
});

describe('MarkdownRenderer', () => {
  it('renders headings, bold text and list items', () => {
    render(
      <MarkdownRenderer text={'# Title\n## Sub\nplain line\n* item one\n**bold**'} />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sub');
    expect(screen.getByText('plain line')).toBeInTheDocument();
    expect(screen.getByText('item one')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('splits content into sections on the --- separator', () => {
    const { container } = render(
      <MarkdownRenderer text={'first section\n---\nsecond section'} />,
    );
    expect(screen.getByText('first section')).toBeInTheDocument();
    expect(screen.getByText('second section')).toBeInTheDocument();
    // Two top-level section wrappers (one per --- chunk).
    expect(container.querySelectorAll('.prose > div').length).toBe(2);
  });
});
