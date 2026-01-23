import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with default time of 20', () => {
        const { result } = renderHook(() => useTimer());
        expect(result.current[0]).toBe(20);
    });

    it('should initialize with custom time', () => {
        const { result } = renderHook(() => useTimer(60));
        expect(result.current[0]).toBe(60);
    });

    it('should countdown every second', () => {
        const { result } = renderHook(() => useTimer(10));

        expect(result.current[0]).toBe(10);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(9);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(8);
    });

    it('should stop at 0', () => {
        const { result } = renderHook(() => useTimer(2));

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(1);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(0);

        // Should not go below 0
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(0);
    });

    it('should allow manual time setting via setTime', () => {
        const { result } = renderHook(() => useTimer(20));
        const [, setTime] = result.current;

        act(() => {
            setTime(100);
        });

        expect(result.current[0]).toBe(100);
    });

    it('should continue countdown after manual reset', () => {
        const { result } = renderHook(() => useTimer(5));

        // Count down a bit
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(result.current[0]).toBe(3);

        // Reset timer
        act(() => {
            result.current[1](10);
        });
        expect(result.current[0]).toBe(10);

        // Should continue counting down
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current[0]).toBe(9);
    });

    it('should clean up interval on unmount', () => {
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        const { unmount } = renderHook(() => useTimer(20));

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
        clearIntervalSpy.mockRestore();
    });

    it('should count down from 20 to 0 correctly', () => {
        const { result } = renderHook(() => useTimer(20));

        for (let i = 20; i > 0; i--) {
            expect(result.current[0]).toBe(i);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        expect(result.current[0]).toBe(0);
    });
});
