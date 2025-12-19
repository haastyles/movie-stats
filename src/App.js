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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(20);
  
  // fetch TMDB movie id by its title
  useEffect(() => {
    if (!movieTitle) return;
    
    const fetchMovieIdentity = async () => {
      try {
        setLoading(true);
        const data = await tmdbApi.getMovieIdentity(movieTitle);
        // Search API returns an array in data.results
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
  }, [movieTitle]);

    // fetch TMDB actor id by their name
  useEffect(() => {
    if (!actorName) return;
    
    const fetchActorIdentity = async () => {
      try {
        setLoading(true);
        const data = await tmdbApi.getActorIdentity(actorName);
        // Search API returns an array in data.results
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

    fetchActorIdentity();
  }, [actorName]);

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
    setTime(20); // Reset timer on each submission
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
          submitSearch={submitSearch}>
        </SearchPage>

      </header>
    </div>
  );
}

export default App;
