import { useState, useEffect } from 'react';
import './App.css';
import tmdbApi from './services/tmdbApi';
import SearchPage from './components/searchPage';
import SearchResults from './components/searchResults';

function App() {
  const [turn, setTurn] = useState('movie');
  const [count, setCount] = useState(0);
  const [movies, setMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [movieTitle, setMovieTitle] = useState(null);
  const [movieId, setMovieId] = useState(null);
  const [moviePoster, setMoviePoster] = useState(null);
  const [actorName, setActorName] = useState(null);
  const [actorId, setActorId] = useState(null);
  const [actorPhoto, setActorPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(20);
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Memoized ID lists to avoid recalculation
  const castList = actors.map(actor => actor.id);
  const actingCredits = movies.map(movie => movie.id);

  useEffect(() => {
      // Debounce input every 2 seconds
      const timer = setTimeout(() => {
          setDebouncedValue(inputValue);
      }, 2000);

      // Cleanup with each keystroke on input changes
      return () => {
          clearTimeout(timer);
      };
  }, [inputValue]);

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
          if (turn === 'movie') {
              const data = await tmdbApi.getMovieIdentity(inputValue);
              if (data.results.length > 0) {
                  const results = data.results.slice(0, 5).map(movie => 
                      movie.title + ' (' + (movie.release_date?.substring(0, 4) || 'N/A') + ')'
                  );
                  setSearchResults(results);
              }
          } else if (turn === 'actor') {
              const data = await tmdbApi.getActorIdentity(inputValue);
              if (data.results.length > 0) {
                  const results = data.results.slice(0, 5).map(actor => 
                      actor.name + ' (' + actor.known_for_department + ')'
                  );
                  setSearchResults(results);
              }
          }
          setLoading(false);
      } catch (error) {
          console.error("Error fetching data:", error);
          setSearchResults([]);
          setLoading(false);
      }
  }

  // fetch TMDB movie id by its title
  useEffect(() => {
    if (!movieTitle) return;
    
    const fetchMovieIdentity = async () => {
      try {
        setLoading(true);
        const data = await tmdbApi.getMovieIdentity(movieTitle);
        if (data.results && data.results.length > 0) {
            const newMovieId = data.results[0].id;
            setMovieId(newMovieId);
            setMoviePoster(data.results[0].poster_path);

            // Only increment count if this is not the first movie and the movie is in the valid movies list
            setCount(prevCount => {
              if (prevCount > 0 && movies.some(movie => movie.id === newMovieId)) {
                return prevCount + 1;
              } else if (prevCount === 0) {
                // First movie always counts
                return 1;
              }
              return prevCount;
            });
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
  }, [movieTitle, movies]);

  // fetch TMDB actor id by their name
  useEffect(() => {
    if (!actorName) return;
    
    const fetchActorName = async () => {
      try {
        setLoading(true);
        const data = await tmdbApi.getActorIdentity(actorName);
        if (data.results && data.results.length > 0) {
          const newActorId = data.results[0].id;
          setActorId(newActorId);
          setActorPhoto(data.results[0].profile_path);

          // Only increment count if the actor is in the valid actors list
          setCount(prevCount => {
            if (actors.some(actor => actor.id === newActorId)) {
              return prevCount + 1;
            }
            return prevCount;
          });
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        setActorId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActorName();
  }, [actorName, actors]);

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

  // Decrement timer every second
  useEffect(() => {
    if (time === 0) return;
    const timerId = setInterval(() => {
      setTime(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [time]);

  // Handle turn progression and reset for next input
  const handleTurnChange = (value) => {
    const cleanValue = value.replace(/\s*\([^)]*\)\s*$/, '').trim();
    
    if (turn === 'movie') {
      setMovieTitle(cleanValue);
      setTurn('actor');
    } else if (turn === 'actor') {
      setActorName(cleanValue);
      setTurn('movie');
    }
    
    setInputValue('');
    setSearchResults([]);
    setTime(20);
  }

  // Handle form submission - just update state, let useEffect handle API calls
  const submitSearch = (values, actions) => {
    const value = turn === 'movie' ? values.searchMovie : values.searchActor;
    if (value.trim() === '') return;
    
    handleTurnChange(value);
    actions.resetForm();
  }

  return (
    <div className="App">
      <header className="App-header">
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
            setTurn('movie');
            setCount(0);
            setMovieTitle(null);
            setMovieId(null);
            setActorName(null);
            setActorId(null);
            setActors([]);
            setMovies([]);
            setError(null);
            setSearchResults([]);
            setInputValue(null);
            setTime(20);
          }}
        ></SearchResults>
        <SearchPage
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
          submitSearch={submitSearch}>
        </SearchPage>

      </header>
    </div>
  );
}

export default App;
