import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

export function useMovieSearch(movieTitle, movies) {
    const [movieId, setMovieId] = useState(null);
    const [moviePoster, setMoviePoster] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!movieTitle) {
            setMovieId(null);
            setMoviePoster(null);
            return;
        }
        
        const fetchMovieIdentity = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getMovieIdentity(movieTitle);
                if (data.results?.length > 0) {
                    setMovieId(data.results[0].id);
                    setMoviePoster(data.results[0].poster_path);
                }
                setError(null);
            } catch (err) {
                setError(err.message);
                setMovieId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieIdentity();
    }, [movieTitle]);

    return { movieId, moviePoster, loading, error };
}