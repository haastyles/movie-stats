import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

export function useMovieSearch(movieInput, movies) {
    const [movieId, setMovieId] = useState(null);
    const [moviePoster, setMoviePoster] = useState(null);
    const [movieTitle, setMovieTitle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!movieInput) {
            setMovieId(null);
            setMoviePoster(null);
            setMovieTitle(null);
            return;
        }
        
        const fetchMovieIdentity = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getMovieIdentity(movieInput);
                if (data.results?.length > 0) {
                    setMovieId(data.results[0].id);
                    setMoviePoster(data.results[0].poster_path);
                    setMovieTitle(data.results[0].title);
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
    }, [movieInput]);

    return { movieId, moviePoster, movieTitle, loading, error };
}