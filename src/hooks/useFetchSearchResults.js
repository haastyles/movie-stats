import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

// Module-level cache persists across component mounts/unmounts
const cache = {};

export function useFetchSearchResults({
    input,
    turn = 'movie',
    ttl = 86400000 // 1 day in milliseconds
}) {

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!input) {
            setSearchResults([]);
            return;
        }
        const fetchResults = async () => {
            try {
                setLoading(true);
                if (input) {
                    setLoading(true);
                    const cacheKey = `${turn}:${input}`;
                    const cachedData = cache[cacheKey];
                    if (cachedData && Date.now() - cachedData.timestamp < ttl) {
                        setSearchResults(cachedData.results);
                        console.log('Using cached search results for (useFetchSearchResults):', input, cachedData.results);
                    } else {
                        console.log('Fetching search results for:', input, 'as', turn);
                        if (turn === 'movie') {
                            const data = await tmdbApi.getMovieIdentity(input);
                            if (data.results.length > 0) {
                                const filteredResults = data.results.filter(movie => movie.vote_count >= 0);
                                filteredResults.sort((a, b) => b.vote_count - a.vote_count);
                                const results = filteredResults.slice(0, 5).map(movie =>
                                    movie.title + ' (' + (movie.release_date?.substring(0, 4) || 'N/A') + ')'
                                );
                                setSearchResults(results);
                                cache[cacheKey] = { results: results, timestamp: Date.now() };
                                console.log('Cache updated (useFetchSearchResults - movie): ', cache);
                            }
                        } else if (turn === 'actor') {
                            const data = await tmdbApi.getActorIdentity(input);
                            if (data.results.length > 0) {
                                const filteredResults = data.results.filter(actor => actor.popularity >= 1 && actor.known_for_department === 'Acting');
                                filteredResults.sort((a, b) => b.popularity - a.popularity);
                                const results = filteredResults.slice(0, 5).map(actor =>
                                    actor.name + ' (' + actor.known_for_department + ')'
                                );
                                setSearchResults(results);
                                cache[cacheKey] = { results: results, timestamp: Date.now() };
                                console.log('Cache updated (useFetchSearchResults - actor): ', cache);
                            }
                        }
                        setLoading(false);

                        console.log('New cache value (useFetchSearchResults):', cache);
                    }
                    setLoading(false);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                setError(error);
                console.error("Error fetching data:", error);
                setSearchResults([]);
                setLoading(false);
            }
        };
        fetchResults();
    }, [input, turn, ttl]);

    return { searchResults, loading, error };
}
