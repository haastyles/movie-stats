import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

// Module-level cache persists across component mounts/unmounts
const cache = {};

export function useSearch({
    input,
    turn = 'movie',
    ttl = 86400000 // 1 day
}) {
    const [movieId, setMovieId] = useState(null);
    const [actorId, setActorId] = useState(null);
    const [movieTitle, setMovieTitle] = useState(null);
    const [actorName, setActorName] = useState(null);
    const [moviePoster, setMoviePoster] = useState(null);
    const [actorPhoto, setActorPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!input) {
            setMovieId(null);
            setActorId(null);
            setMovieTitle(null);
            setActorName(null);
            setMoviePoster(null);
            setActorPhoto(null);
            return;
        }
        
        const fetchName = async () => {
            setLoading(true);
            try {
                const cacheKey = `${turn}:${input}`;
                const cachedData = cache[cacheKey];
                if (cachedData && Date.now() - cachedData.timestamp < ttl) {
                    if (turn === 'movie') {
                        setMovieId(cachedData.id);
                        setMoviePoster(cachedData.photo);
                        setMovieTitle(cachedData.name);
                    } else if (turn === 'actor') {
                        setActorId(cachedData.id);
                        setActorPhoto(cachedData.photo);
                        setActorName(cachedData.name);
                    }
                } else {
                        // Strip "(...)" for the API query, but parse it to disambiguate
                        // (e.g. "The Fast and the Furious (2001)" vs "(1954)")
                        const cleanInput = input.replace(/\s*\([^)]*\)\s*$/, '').trim();
                        const parenMatch = input.match(/\(([^)]+)\)\s*$/);
                        const parenContent = parenMatch ? parenMatch[1].trim() : null;

                        if (turn === 'movie') {
                            const data = await tmdbApi.getMovieIdentity(cleanInput);
                            if (data.results?.length > 0) {
                                const year = /^\d{4}$/.test(parenContent) ? parenContent : null;
                                let chosen;
                                if (year) {
                                    chosen = data.results.find(m => m.release_date?.startsWith(year));
                                }
                                if (!chosen) {
                                    chosen = [...data.results].sort((a, b) => b.vote_count - a.vote_count)[0];
                                }
                                setMovieId(chosen.id);
                                setMoviePoster(chosen.poster_path);
                                setMovieTitle(chosen.title);
                                cache[cacheKey] = {
                                    id: chosen.id,
                                    photo: chosen.poster_path,
                                    name: chosen.title,
                                    timestamp: Date.now()
                                };
                            }
                        } else if (turn === 'actor') {
                            const data = await tmdbApi.getActorIdentity(cleanInput);
                            if (data.results?.length > 0) {
                                const chosen = [...data.results]
                                    .filter(a => a.known_for_department === 'Acting')
                                    .sort((a, b) => b.popularity - a.popularity)[0]
                                    || data.results[0];
                                setActorId(chosen.id);
                                setActorPhoto(chosen.profile_path);
                                setActorName(chosen.name);
                                cache[cacheKey] = {
                                    id: chosen.id,
                                    photo: chosen.profile_path,
                                    name: chosen.name,
                                    timestamp: Date.now()
                                };
                            }
                        }
                }
                setError(null);
            } catch (err) {
                setError(err.message);
                setMovieId(null);
                setActorId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchName();
    }, [input, turn, ttl]);

    return { movieId, moviePoster, movieTitle, actorId, actorPhoto, actorName, loading, error };
}