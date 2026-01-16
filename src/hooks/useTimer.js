import { useState, useEffect } from 'react';

export function useTimer(initialTime = 20) {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        if (time === 0) return;
        const timerId = setInterval(() => {
            setTime(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [time]);

    return [time, setTime];
}