import { useState, useEffect } from 'react';
import imageArray from "./imageArray";

function SearchResults({
    turn,
    castList,
    actingCredits,
    loading,
    error,
    movieId,
    actorId,
    movieTitle,
    actorName,
    moviePoster,
    actorPhoto,
    resetGame,
    count,
    time
}) {
    function getRandomElement(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    const [failImage, setFailImage] = useState(() => getRandomElement(imageArray()));

    useEffect(() => {
        const interval = setInterval(() => {
            setFailImage(getRandomElement(imageArray()));
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    const results = () => {
        if (time === 0) {
            return (
                <div className="result-container">
                    <p>Sorry, time is up!</p>
                    <img src={failImage} alt="Time's up!" />
                    <button onClick={resetGame}>Try Again</button>
                </div>
            )
        } else if (((turn === 'actor' && count > 1 && !actingCredits.includes(movieId)) ||
            (turn === 'movie' && count > 0 && !castList.includes(actorId)))) {
            return (
                <div className="result-container">
                    <p>Sorry, that's not correct</p>
                    <img src={failImage} alt="Incorrect answer" />
                    <button onClick={resetGame}>Try Again</button>
                </div>
            )
        } else if (error) {
            return (
                <div style={{ color: '#ff6b6b', padding: '20px' }}>
                    <h3>Error connecting to TMDB API</h3>
                    <p>{error}</p>
                    <p style={{ fontSize: '14px' }}>
                        Check that your REACT_APP_TMDB_READ_ACCESS_TOKEN is set correctly in .env
                    </p>
                    <button className="try-again-button" onClick={resetGame}>Try Again</button>
                </div>
            )
        } else if (!error && count === 1 && movieId !== null && actorId === null) {
            return (
                <div>
                    <p>Name an actor in {movieTitle}.</p>
                    <img src={`https://image.tmdb.org/t/p/w200${moviePoster}`} alt={movieTitle} />
                </div>
            )
        } else if (!loading && !error && count > 0 && turn === 'actor' && actingCredits.includes(movieId)) {
            return (
                <div>
                    <p>Yes, {actorName} was in {movieTitle}.</p>
                    <img src={`https://image.tmdb.org/t/p/w200${moviePoster}`} alt={movieTitle} />
                </div>
            )
        } else if (!loading && !error && count > 0 && turn === 'movie' && castList.includes(actorId)) {
            return (
                <div>
                    <p>Yes, {movieTitle} featured {actorName}.</p>
                    <img src={`https://image.tmdb.org/t/p/w200${actorPhoto}`} alt={actorName} />
                </div>
            )
        } else {
            return null;             
        }
    }

    return (
        <>
            <p style={{ display: time === 0 ? 'none' : 'block' }}>Time left: {time} seconds</p>
            {results()}
        </>
    )
}

export default SearchResults;