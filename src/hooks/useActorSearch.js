import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

export function useActorSearch(actorName) {
    const [actorId, setActorId] = useState(null);
    const [actorPhoto, setActorPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!actorName) {
            setActorId(null);
            setActorPhoto(null);
            return;
        }
        
        const fetchActorName = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getActorIdentity(actorName);
                if (data.results?.length > 0) {
                    setActorId(data.results[0].id);
                    setActorPhoto(data.results[0].profile_path);
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
    }, [actorName]);

    return { actorId, actorPhoto, loading, error };
}