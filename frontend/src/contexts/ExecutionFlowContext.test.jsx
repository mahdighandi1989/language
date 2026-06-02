// Unit tests for the execution-flow context that App.jsx wraps the tree in.
// This logic (flow nodes/categories + the provider's node/history state machine)
// was extracted from the former monolithic App.jsx. Firebase is mocked so the
// tests exercise the pure state logic without any network/SDK dependency.
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  FLOW_NODES,
  FLOW_CATEGORIES,
  ExecutionFlowProvider,
  useExecutionFlow,
} from './ExecutionFlowContext.jsx';

// Firebase Firestore is only used for optional cross-device sync; mock it so the
// provider runs with no real Firebase.
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  setDoc: vi.fn(() => Promise.resolve()),
}));

describe('FLOW_NODES / FLOW_CATEGORIES', () => {
  it('every flow node references a defined category', () => {
    for (const [id, node] of Object.entries(FLOW_NODES)) {
      expect(node.id).toBe(id);
      expect(FLOW_CATEGORIES[node.category], `category for ${id}`).toBeDefined();
    }
  });

  it('covers the four pipelines plus common nodes', () => {
    for (const id of ['idle', 'userInput', 'wsConnecting', 'fileUploading', 'generatingQuiz', 'error', 'complete']) {
      expect(FLOW_NODES[id]).toBeDefined();
    }
  });
});

describe('useExecutionFlow outside a provider', () => {
  it('returns safe dummy functions instead of throwing', () => {
    const { result } = renderHook(() => useExecutionFlow());
    expect(result.current.currentNode).toBe('idle');
    expect(typeof result.current.setCurrentNode).toBe('function');
    // Calling the dummies must not throw.
    expect(() => result.current.setCurrentNode('userInput')).not.toThrow();
    expect(() => result.current.clearHistory()).not.toThrow();
  });
});

describe('ExecutionFlowProvider state machine', () => {
  const wrapper = ({ children }) => (
    <ExecutionFlowProvider firebaseServices={null} userId={null}>
      {children}
    </ExecutionFlowProvider>
  );

  it('starts idle and records node changes in history', () => {
    const { result } = renderHook(() => useExecutionFlow(), { wrapper });
    expect(result.current.currentNode).toBe('idle');
    expect(result.current.flowHistory).toEqual([]);

    act(() => result.current.setCurrentNode('userInput', 'chat'));

    expect(result.current.currentNode).toBe('userInput');
    expect(result.current.activeFlow).toBe('chat');
    expect(result.current.flowHistory).toHaveLength(1);
    expect(result.current.flowHistory[0]).toMatchObject({ nodeId: 'userInput', flowType: 'chat' });
  });

  it('clears the active flow when returning to idle with no flow type', () => {
    const { result } = renderHook(() => useExecutionFlow(), { wrapper });
    act(() => result.current.setCurrentNode('userInput', 'chat'));
    expect(result.current.activeFlow).toBe('chat');

    act(() => result.current.setCurrentNode('idle'));
    expect(result.current.activeFlow).toBeNull();
  });

  it('caps history at 50 entries', () => {
    const { result } = renderHook(() => useExecutionFlow(), { wrapper });
    act(() => {
      for (let i = 0; i < 60; i += 1) {
        result.current.addToHistory('userInput', 'chat');
      }
    });
    expect(result.current.flowHistory).toHaveLength(50);
  });

  it('clearHistory resets node and history', () => {
    const { result } = renderHook(() => useExecutionFlow(), { wrapper });
    act(() => result.current.setCurrentNode('userInput', 'chat'));
    act(() => result.current.clearHistory());
    expect(result.current.currentNode).toBe('idle');
    expect(result.current.flowHistory).toEqual([]);
    expect(result.current.activeFlow).toBeNull();
  });
});
