import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

describe('useGameState', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useGameState());

        expect(result.current.turn).toBe('movie');
        expect(result.current.count).toBe(0);
        expect(result.current.movies).toEqual([]);
        expect(result.current.actors).toEqual([]);
    });

    it('should update turn state', () => {
        const { result } = renderHook(() => useGameState());

        act(() => {
            result.current.setTurn('actor');
        });

        expect(result.current.turn).toBe('actor');
    });

    it('should update count state', () => {
        const { result } = renderHook(() => useGameState());

        act(() => {
            result.current.setCount(5);
        });

        expect(result.current.count).toBe(5);
    });

    it('should update movies array', () => {
        const { result } = renderHook(() => useGameState());
        const newMovies = [{ id: 1, title: 'Movie 1' }, { id: 2, title: 'Movie 2' }];

        act(() => {
            result.current.setMovies(newMovies);
        });

        expect(result.current.movies).toEqual(newMovies);
    });

    it('should update actors array', () => {
        const { result } = renderHook(() => useGameState());
        const newActors = [{ id: 1, name: 'Actor 1' }, { id: 2, name: 'Actor 2' }];

        act(() => {
            result.current.setActors(newActors);
        });

        expect(result.current.actors).toEqual(newActors);
    });

    it('should reset all state to initial values', () => {
        const { result } = renderHook(() => useGameState());

        // Modify all state
        act(() => {
            result.current.setTurn('actor');
            result.current.setCount(10);
            result.current.setMovies([{ id: 1 }]);
            result.current.setActors([{ id: 1 }]);
        });

        // Verify state was changed
        expect(result.current.turn).toBe('actor');
        expect(result.current.count).toBe(10);

        // Reset game
        act(() => {
            result.current.resetGame();
        });

        // Verify all state is reset
        expect(result.current.turn).toBe('movie');
        expect(result.current.count).toBe(0);
        expect(result.current.movies).toEqual([]);
        expect(result.current.actors).toEqual([]);
    });

    it('should allow functional updates to count', () => {
        const { result } = renderHook(() => useGameState());

        act(() => {
            result.current.setCount(prev => prev + 1);
        });
        expect(result.current.count).toBe(1);

        act(() => {
            result.current.setCount(prev => prev + 1);
        });
        expect(result.current.count).toBe(2);
    });

    it('should allow functional updates to movies', () => {
        const { result } = renderHook(() => useGameState());

        act(() => {
            result.current.setMovies(prev => [...prev, { id: 1 }]);
        });
        expect(result.current.movies).toHaveLength(1);

        act(() => {
            result.current.setMovies(prev => [...prev, { id: 2 }]);
        });
        expect(result.current.movies).toHaveLength(2);
    });
});
