import { useState } from 'react';

export function useGameState() {
    const [turn, setTurn] = useState('movie');
    const [count, setCount] = useState(0);
    const [movies, setMovies] = useState([]);
    const [actors, setActors] = useState([]);

    const resetGame = () => {
        setTurn('movie');
        setCount(0);
        setMovies([]);
        setActors([]);
    };

    return {
        turn,
        setTurn,
        count,
        setCount,
        movies,
        setMovies,
        actors,
        setActors,
        resetGame
    };
}