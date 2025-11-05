import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRecipes } from './useRecipes';

// Mock api client
jest.mock('../api/client.js', () => ({
  searchRecipes: jest.fn(),
}));

import { searchRecipes } from '../api/client.js';

describe('useRecipes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('initial load triggers loading state and success sets recipes', async () => {
    const mockData = [{ id: '1', title: 'Pasta' }];
    searchRecipes.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRecipes(''));
    // First effect triggers performSearch
    expect(result.current.loading).toBe(true);

    // Allow microtasks to resolve
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.recipes).toEqual(mockData);
    expect(result.current.error).toBe('');
  });

  test('search method updates loading and sets recipes on success', async () => {
    searchRecipes.mockResolvedValueOnce([{ id: '2', title: 'Soup' }]);

    const { result } = renderHook(() => useRecipes(''));
    // Wait initial effect to settle (mock resolved)
    await act(async () => {});

    await act(async () => {
      await result.current.search('soup');
    });

    expect(result.current.recipes).toEqual([{ id: '2', title: 'Soup' }]);
    expect(result.current.error).toBe('');
    expect(searchRecipes).toHaveBeenLastCalledWith('soup');
  });

  test('error path sets error string while keeping UI responsive', async () => {
    // Simulate throwing from searchRecipes (even though client normally returns mock on error)
    const err = new Error('Network down');
    searchRecipes.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useRecipes('pizza'));

    // Wait for effect
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.recipes).toEqual([]); // recipes unchanged on error in hook
    expect(result.current.error).toMatch(/Unable to load recipes|Network down/i);
  });

  test('mock fallback scenario returns data without surfacing error', async () => {
    // Simulate client returning mock results despite internal failure
    const mockData = [{ id: 'mock-1', title: 'Garlic Butter Shrimp Pasta' }];
    searchRecipes.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRecipes('pasta'));
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.recipes).toEqual(mockData);
    expect(result.current.error).toBe('');
  });
});
