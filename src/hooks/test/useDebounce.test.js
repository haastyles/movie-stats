import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        expect(result.current).toBe('initial');

        // Change the value
        rerender({ value: 'updated', delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Now the value should be updated
        expect(result.current).toBe('updated');
    });

    it('should use default delay of 2000ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        // Value should not change before 2000ms
        act(() => {
            jest.advanceTimersByTime(1999);
        });
        expect(result.current).toBe('initial');

        // Value should change after 2000ms
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'first', delay: 500 } }
        );

        // Rapid changes
        rerender({ value: 'second', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'third', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'fourth', delay: 500 });

        // Only the initial value should be present
        expect(result.current).toBe('first');

        // After full delay, should have the latest value
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('fourth');
    });

    it('should handle different delay values', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 1000 } }
        );

        rerender({ value: 'updated', delay: 1000 });

        act(() => {
            jest.advanceTimersByTime(999);
        });
        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });
});
