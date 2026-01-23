import { renderHook, waitFor } from '@testing-library/react';
import { useActorSearch } from '../useActorSearch';
import tmdbApi from '../../services/tmdbApi';

// Mock the tmdbApi module
jest.mock('../../services/tmdbApi');

describe('useActorSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state when no input provided', () => {
        const { result } = renderHook(() => useActorSearch(null));

        expect(result.current.actorId).toBeNull();
        expect(result.current.actorPhoto).toBeNull();
        expect(result.current.actorName).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should fetch actor data when input is provided', async () => {
        const mockActorData = {
            results: [{
                id: 123,
                profile_path: '/path/to/photo.jpg',
                name: 'Tom Hanks'
            }]
        };
        tmdbApi.getActorIdentity.mockResolvedValue(mockActorData);

        const { result } = renderHook(() => useActorSearch('Tom Hanks'));

        // Should be loading initially
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.actorId).toBe(123);
        expect(result.current.actorPhoto).toBe('/path/to/photo.jpg');
        expect(result.current.actorName).toBe('Tom Hanks');
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
        tmdbApi.getActorIdentity.mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => useActorSearch('Unknown Actor'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('API Error');
        expect(result.current.actorId).toBeNull();
    });

    it('should reset state when input changes to null', async () => {
        const mockActorData = {
            results: [{
                id: 123,
                profile_path: '/path/to/photo.jpg',
                name: 'Tom Hanks'
            }]
        };
        tmdbApi.getActorIdentity.mockResolvedValue(mockActorData);

        const { result, rerender } = renderHook(
            ({ input }) => useActorSearch(input),
            { initialProps: { input: 'Tom Hanks' } }
        );

        await waitFor(() => {
            expect(result.current.actorId).toBe(123);
        });

        // Change input to null
        rerender({ input: null });

        expect(result.current.actorId).toBeNull();
        expect(result.current.actorPhoto).toBeNull();
        expect(result.current.actorName).toBeNull();
    });

    it('should handle empty results', async () => {
        tmdbApi.getActorIdentity.mockResolvedValue({ results: [] });

        const { result } = renderHook(() => useActorSearch('Nonexistent Actor'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.actorId).toBeNull();
    });
});
