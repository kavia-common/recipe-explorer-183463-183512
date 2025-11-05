import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRecipeDetail } from '../useRecipeDetail';

// Mock client
jest.mock('../api/client.js', () => ({
  getRecipeDetail: jest.fn(),
}));

import { getRecipeDetail } from '../api/client.js';

describe('useRecipeDetail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('does not run when id is falsy', async () => {
    const { result } = renderHook(() => useRecipeDetail(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.recipe).toBeNull();
    expect(result.current.error).toBe('');
    expect(getRecipeDetail).not.toHaveBeenCalled();
  });

  test('loads recipe and sets loading/success states', async () => {
    const detail = {
      id: 'mock-1',
      title: 'Garlic Butter Shrimp Pasta',
      image: '',
      readyInMinutes: 25,
      servings: 2,
      ingredients: ['x'],
      instructions: ['y'],
    };
    getRecipeDetail.mockResolvedValueOnce(detail);
    const { result, rerender } = renderHook(({ id }) => useRecipeDetail(id), {
      initialProps: { id: 'mock-1' },
    });

    // initial state
    expect(result.current.loading).toBe(true);
    expect(getRecipeDetail).toHaveBeenCalledWith('mock-1');

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.recipe).toEqual(detail);
    expect(result.current.error).toBe('');

    // change id
    const detail2 = { ...detail, id: 'mock-2', title: 'Avocado Chicken Salad' };
    getRecipeDetail.mockResolvedValueOnce(detail2);
    rerender({ id: 'mock-2' });

    await act(async () => {});

    expect(result.current.recipe).toEqual(detail2);
  });

  test('unexpected failure surfaces error string', async () => {
    const err = new Error('boom');
    getRecipeDetail.mockRejectedValueOnce(err);
    const { result } = renderHook(() => useRecipeDetail('id-123'));

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toMatch(/Unable to load recipe|boom/i);
  });
});
