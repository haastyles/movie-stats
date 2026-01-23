import { renderHook, waitFor } from '@testing-library/react';
import { useMovieSearch } from '../useMovieSearch';
import tmdbApi from '../../services/tmdbApi';

// Mock the tmdbApi module
jest.mock('../../services/tmdbApi');

describe('useMovieSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state when no input provided', () => {
        const { result } = renderHook(() => useMovieSearch(null, []));

        expect(result.current.movieId).toBeNull();
        expect(result.current.moviePoster).toBeNull();
        expect(result.current.movieTitle).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should fetch movie data when input is provided', async () => {
        const mockMovieData = {
            results: [{
                id: 456,
                poster_path: '/path/to/poster.jpg',
                title: 'The Matrix'
            }]
        };
        tmdbApi.getMovieIdentity.mockResolvedValue(mockMovieData);

        const { result } = renderHook(() => useMovieSearch('The Matrix', []));

        // Should be loading initially
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.movieId).toBe(456);
        expect(result.current.moviePoster).toBe('/path/to/poster.jpg');
        expect(result.current.movieTitle).toBe('The Matrix');
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
        tmdbApi.getMovieIdentity.mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => useMovieSearch('Unknown Movie', []));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('API Error');
        expect(result.current.movieId).toBeNull();
    });

    it('should reset state when input changes to null', async () => {
        const mockMovieData = {
            results: [{
                id: 456,
                poster_path: '/path/to/poster.jpg',
                title: 'The Matrix'
            }]
        };
        tmdbApi.getMovieIdentity.mockResolvedValue(mockMovieData);

        const { result, rerender } = renderHook(
            ({ input, movies }) => useMovieSearch(input, movies),
            { initialProps: { input: 'The Matrix', movies: [] } }
        );

        await waitFor(() => {
            expect(result.current.movieId).toBe(456);
        });

        // Change input to null
        rerender({ input: null, movies: [] });

        expect(result.current.movieId).toBeNull();
        expect(result.current.moviePoster).toBeNull();
        expect(result.current.movieTitle).toBeNull();
    });

    it('should handle empty results', async () => {
        tmdbApi.getMovieIdentity.mockResolvedValue({ results: [] });

        const { result } = renderHook(() => useMovieSearch('Nonexistent Movie', []));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.movieId).toBeNull();
    });

    it('should refetch when input changes', async () => {
        const mockMovieData1 = {
            results: [{ id: 1, poster_path: '/poster1.jpg', title: 'Movie 1' }]
        };
        const mockMovieData2 = {
            results: [{ id: 2, poster_path: '/poster2.jpg', title: 'Movie 2' }]
        };

        tmdbApi.getMovieIdentity
            .mockResolvedValueOnce(mockMovieData1)
            .mockResolvedValueOnce(mockMovieData2);

        const { result, rerender } = renderHook(
            ({ input, movies }) => useMovieSearch(input, movies),
            { initialProps: { input: 'Movie 1', movies: [] } }
        );

        await waitFor(() => {
            expect(result.current.movieTitle).toBe('Movie 1');
        });

        rerender({ input: 'Movie 2', movies: [] });

        await waitFor(() => {
            expect(result.current.movieTitle).toBe('Movie 2');
        });
    });
});
