import tmdbApi from '../tmdbApi';

// Mock global fetch
global.fetch = jest.fn();

describe('tmdbApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset environment variables for tests
        process.env.REACT_APP_TMDB_READ_ACCESS_TOKEN = 'test-token';
        process.env.REACT_APP_TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('fetchFromTMDB (internal)', () => {
        it('should include authorization header in requests', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ results: [] })
            });

            // Call any API method to test headers
            await tmdbApi.getMovieIdentity('test');

            expect(fetch).toHaveBeenCalledWith(
                expect.any(URL),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': expect.stringContaining('Bearer'),
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should handle API errors gracefully', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ status_message: 'Invalid API key' })
            });

            await expect(tmdbApi.getMovieIdentity('test')).rejects.toThrow('TMDB API Error');
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(tmdbApi.getMovieIdentity('test')).rejects.toThrow('Network error');
        });
    });

    describe('getPopularMovies', () => {
        it('should fetch popular movies', async () => {
            const mockResponse = {
                results: [
                    { id: 1, title: 'The Matrix' },
                    { id: 2, title: 'Matrix Reloaded' }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await tmdbApi.getPopularMovies();

            expect(fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: expect.stringContaining('movie/popular')
                }),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });

        it('should accept page parameter', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ results: [] })
            });

            await tmdbApi.getPopularMovies(2);

            expect(fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: expect.stringContaining('page=2')
                }),
                expect.any(Object)
            );
        });
    });

    describe('getMovieIdentity', () => {
        it('should fetch movie identity by title', async () => {
            const mockResponse = {
                results: [{ id: 550, title: 'Fight Club', poster_path: '/poster.jpg' }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await tmdbApi.getMovieIdentity('Fight Club');

            expect(result).toEqual(mockResponse);
        });
    });

    describe('getActorIdentity', () => {
        it('should fetch actor identity by name', async () => {
            const mockResponse = {
                results: [{ id: 287, name: 'Brad Pitt', profile_path: '/profile.jpg' }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await tmdbApi.getActorIdentity('Brad Pitt');

            expect(result).toEqual(mockResponse);
        });
    });

    describe('getMovieCredits', () => {
        it('should fetch movie credits by movie ID', async () => {
            const mockResponse = {
                cast: [
                    { id: 287, name: 'Brad Pitt', character: 'Tyler Durden' }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await tmdbApi.getMovieCredits(550);

            expect(fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: expect.stringContaining('movie/550/credits')
                }),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getActorMovieCredits', () => {
        it('should fetch actor movie credits by actor ID', async () => {
            const mockResponse = {
                cast: [
                    { id: 550, title: 'Fight Club' },
                    { id: 807, title: 'Se7en' }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await tmdbApi.getActorMovieCredits(287);

            expect(fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    href: expect.stringContaining('person/287/movie_credits')
                }),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
