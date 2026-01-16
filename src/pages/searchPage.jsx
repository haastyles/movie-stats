import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';
import SearchBar from '.././components/searchBar';
import SearchResults from '.././components/searchResults';
import { useDebounce } from '../hooks/useDebounce';
import { useTimer } from '../hooks/useTimer';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { useActorSearch } from '../hooks/useActorSearch';
import { useGameState } from '../hooks/useGameState';

function SearchPage() {
    const {
        turn,
        setTurn,
        count,
        setCount,
        movies,
        setMovies,
        actors,
        setActors,
        resetGame: resetGameState
    } = useGameState();

    const [movieTitle, setMovieTitle] = useState(null);
    const [actorName, setActorName] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedValue = useDebounce(inputValue, 2000);
    const [time, setTime] = useTimer(20);

    const { 
        movieId,
        moviePoster,
        loading: movieLoading,
        error: movieError
    } = useMovieSearch(movieTitle, movies);

    const {
        actorId,
        actorPhoto,
        loading: actorLoading,
        error: actorError
    } = useActorSearch(actorName);

    // Increment count when movieId is fetched successfully
    useEffect(() => {
        if (!movieId) return;
        
        setCount(prevCount => {
            if (prevCount > 0 && movies.some(movie => movie.id === movieId)) {
                return prevCount + 1;
            } else if (prevCount === 0) {
                // First movie always counts
                return 1;
            }
            return prevCount;
        });
    }, [movieId]);

    // Increment count when actorId is fetched successfully
    useEffect(() => {
        if (!actorId) return;
        
        setCount(prevCount => {
            if (actors.some(actor => actor.id === actorId)) {
                return prevCount + 1;
            }
            return prevCount;
        });
    }, [actorId]);

    // call tmdbAPI when debouncedValue changes
    useEffect(() => {
        if (debouncedValue) {
            setLoading(true);
            fetchSearchResults(debouncedValue);
        } else {
            setSearchResults([]);
        }
    }, [debouncedValue]);

    // calling tmdbApi to fetch search results depending on turn
    const fetchSearchResults = async (inputValue) => {
        try {
            console.log('Fetching search results for:', inputValue, 'as', turn);
            if (turn === 'movie') {
                const data = await tmdbApi.getMovieIdentity(inputValue);
                if (data.results.length > 0) {
                    data.results.sort((a, b) => b.vote_count - a.vote_count);
                    const results = data.results.slice(0, 5).map(movie => 
                        movie.title + ' (' + (movie.release_date?.substring(0, 4) || 'N/A') + ')'
                    );
                    setSearchResults(results);
                }
            } else if (turn === 'actor') {
                const data = await tmdbApi.getActorIdentity(inputValue);
                if (data.results.length > 0) {
                    data.results.sort((a, b) => b.popularity - a.popularity);
                    const results = data.results.slice(0, 5).map(actor => 
                        actor.name + ' (' + actor.known_for_department + ')'
                    );
                    setSearchResults(results);
                }
            }
            setLoading(false);
            console.log('search results: ', searchResults);
        } catch (error) {
            console.error("Error fetching data:", error);
            setSearchResults([]);
            setLoading(false);
        }
    }

    // Fetch actors when movieId changes
    useEffect(() => {
        if (!movieId) return;
        
        const fetchActors = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getMovieCredits(movieId);
                setActors(data.cast);
                setError(null);
            } catch (err) {
                setError(err.message);
                setCount(0);
                setTime(1);
            } finally {
                setLoading(false);
            }
        };

        fetchActors();
    }, [movieId]);

    // Fetch movies when actorId changes
    useEffect(() => {
        if (!actorId) return;
        
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getActorMovieCredits(actorId);
                setMovies(data.cast);
                setError(null);
            } catch (err) {
                setError(err.message);
                setCount(0);
                setTime(1);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [actorId]);

    // Handle form submission - just update state, let useEffect handle API calls
    const submitSearch = (values, actions) => {
        if (turn === 'movie') {
            setMovieTitle(values.searchMovie);
            setTurn('actor');
        } else if (turn === 'actor') {
            setActorName(values.searchActor);
            setTurn('movie');
        }
        actions.resetForm();
        setInputValue(''); // Clear autocomplete input
        setSearchResults([]); // Clear search results
        setTime(20); // Reset timer on each submission
    }

    return (
        <div className="search-page">
            <h1>🎬 Lights! Camera! Action! 🎬</h1>
            <div className="game-rules intro">
                <h2>How to play:</h2>
                <ol className="game-rules">
                    <li>Give me a movie title.</li>
                    <li>Give me an actor from the movie.</li>
                    <li>Give me another movie the actor was in.</li>
                    <li>Repeat steps 1-3 as long as you can!</li>
                </ol>
            </div>
            <p>You have 20 seconds each turn. I will be keeping score.</p>
            <p>Current turn: {count}</p>
            <SearchResults
                turn={turn}
                count={count}
                castList={actors.map(actor => actor.id)}
                actingCredits={movies.map(movie => movie.id)}
                loading={loading}
                error={error}
                movieId={movieId}
                actorId={actorId}
                movieTitle={movieTitle}
                actorName={actorName}
                moviePoster={moviePoster}
                actorPhoto={actorPhoto}
                time={time}
                resetGame={() => {
                    resetGameState();
                    setMovieTitle(null);
                    setActorName(null);
                    setError(null);
                    setSearchResults([]);
                    setTime(20);
                }}
            />
            <SearchBar
                turn={turn}
                count={count}
                castList={actors.map(actor => actor.id)}
                actingCredits={movies.map(movie => movie.id)}
                loading={loading}
                error={error}
                movieId={movieId}
                actorId={actorId}
                time={time}
                searchResults={searchResults}
                inputValue={inputValue}
                onChange={(event, value) => {
                    if (value) {
                        // Strip out the parenthetical info (year/department) from the selection
                        const cleanValue = value.replace(/\s*\([^)]*\)\s*$/, '').trim();
                        
                        if (turn === 'movie') {
                            setMovieTitle(cleanValue);
                            setTurn('actor');
                        } else if (turn === 'actor') {
                            setActorName(cleanValue);
                            setTurn('movie');
                        }
                        setInputValue(''); // Clear autocomplete input
                        setSearchResults([]); // Clear search results
                        setTime(20); // Reset timer
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                submitSearch={submitSearch}
            />
        </div>
    )
}

export default SearchPage;