import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';
import SearchBar from '.././components/searchBar';
import SearchResults from '.././components/searchResults';
import { useDebounce } from '../hooks/useDebounce';
import { useTimer } from '../hooks/useTimer';
import { useSearch } from '../hooks/useSearch';
import { useFetchSearchResults } from '../hooks/useFetchSearchResults'; 
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
        resetGame
    } = useGameState();

    const [movieInput, setMovieInput] = useState(null);
    const [actorInput, setActorInput] = useState(null);
    const [searchType, setSearchType] = useState('movie');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedValue = useDebounce(inputValue, 2000);
    const [time, setTime] = useTimer(20);

    const {
        movieId,
        moviePoster,
        movieTitle,
        actorId,
        actorPhoto,
        actorName,
        loading: searchLoading
    } = useSearch({
        input: searchType === 'movie' ? movieInput : actorInput,
        turn: searchType,
        ttl: 86400000 // 1 day
    });

    // Gate user input on both fetches: useSearch's identity lookup AND
    // SearchPage's fetchList for cast/filmography. Without this, a fast
    // click on the next turn races the previous fetchList and the count
    // check sees stale movies/actors.
    const isLoading = loading || searchLoading;

    const {
        searchResults
    } = useFetchSearchResults({
        input: debouncedValue,
        turn: turn,
        ttl: 86400000 // 1 day
    });

    useEffect(() => {
        // Increment count when id is fetched successfully
        if (!movieId && !actorId) return;
        setCount(prevCount => {
            if (
                prevCount > 0 &&
                searchType === 'movie' &&
                movies.some(movie => movie.id === movieId)) {
                return prevCount + 1;
            } else if (
                prevCount > 0 &&
                searchType === 'actor' &&
                actors.some(actor => actor.id === actorId)
            ) {
                return prevCount + 1;
            } else if (prevCount === 0) {
                // First movie always counts
                return 1;
            }
            return prevCount;
        });
        // Fetch lists when id changes
        const fetchList = async () => {
            try {
                setLoading(true);
                if (searchType === 'movie') {
                    if (!movieId) {return;};
                    const data = await tmdbApi.getMovieCredits(movieId);
                    setActors(data.cast);
                } else if (searchType === 'actor') {
                    if (!actorId) {return;};
                    const data = await tmdbApi.getActorMovieCredits(actorId);
                    setMovies(data.cast);
                }
                setError(null);
            } catch (err) {
                setError(err.message);
                setCount(0);
                setTime(1);
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [movieId, actorId]);

    const handleReset = () => {
        resetGame();
        setMovieInput(null);
        setActorInput(null);
        setSearchType('movie');
        setError(null);
        setTime(20);
    };

    // Handle form submission - just update state, let useEffect handle API calls
    const submitSearch = (values) => {
        if (isLoading) return;
        if (turn === 'movie') {
            setSearchType('movie');
            setMovieInput(values.searchMovie);
            setTurn('actor');
        } else if (turn === 'actor') {
            setSearchType('actor');
            setActorInput(values.searchActor);
            setTurn('movie');
        }
        setInputValue('');
        setTime(20);
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
                    <li>Repeat steps 2-3 as long as you can!</li>
                </ol>
            </div>
            <p>You have 20 seconds each turn. I will be keeping score.</p>
            <p>Current turn: {count}</p>
            <SearchResults
                className="search-results"
                turn={turn}
                count={count}
                castList={actors.map(actor => actor.id)}
                actingCredits={movies.map(movie => movie.id)}
                loading={isLoading}
                error={error}
                movieId={movieId}
                actorId={actorId}
                movieTitle={movieTitle}
                actorName={actorName}
                moviePoster={moviePoster}
                actorPhoto={actorPhoto}
                time={time}
                resetGame={handleReset}
            />
            <SearchBar
                className="search-bar"
                turn={turn}
                count={count}
                castList={actors.map(actor => actor.id)}
                actingCredits={movies.map(movie => movie.id)}
                loading={isLoading}
                error={error}
                movieId={movieId}
                actorId={actorId}
                time={time}
                searchResults={searchResults}
                inputValue={inputValue}
                resetGame={handleReset}
                onChange={(event, value) => {
                    if (isLoading) return;
                    if (value) {
                        if (turn === 'movie') {
                            setSearchType('movie');
                            setMovieInput(value);
                            setTurn('actor');
                        } else if (turn === 'actor') {
                            setSearchType('actor');
                            setActorInput(value);
                            setTurn('movie');
                        }
                        setInputValue('');
                        setTime(20);
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