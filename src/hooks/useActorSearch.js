import { useState, useEffect } from 'react';
import tmdbApi from '../services/tmdbApi';

export function useActorSearch(actorInput) {
    const [actorId, setActorId] = useState(null);
    const [actorPhoto, setActorPhoto] = useState(null);
    const [actorName, setActorName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!actorInput) {
            setActorId(null);
            setActorPhoto(null);
            setActorName(null);
            return;
        }
        
        const fetchActorName = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getActorIdentity(actorInput);
                if (data.results?.length > 0) {
                    setActorId(data.results[0].id);
                    setActorPhoto(data.results[0].profile_path);
                    setActorName(data.results[0].name);
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
    }, [actorInput]);

    return { actorId, actorPhoto, actorName, loading, error };
}