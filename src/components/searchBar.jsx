import { Formik, Form } from 'formik';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete'; 

function SearchBar({
    turn,
    submitSearch,
    actingCredits,
    castList,
    movieId,
    actorId,
    error,
    count,
    time,
    searchResults,
    onChange,
    onInputChange,
    loading,
    inputValue,
    resetGame
}) {

    return (
        <>
            <Formik 
                initialValues={{ searchMovie: '', searchActor: '' }}
                onSubmit={(values) => {
                    // Only submit if there's actual input
                    if (turn === 'movie' && values.searchMovie.trim() === '') return;
                    if (turn === 'actor' && values.searchActor.trim() === '') return;
                    submitSearch(values);
                }}
            >
                {({ setFieldValue }) => (
                <Form
                    style={
                        (error || 
                        time === 0 ||
                        (turn === 'actor' && count > 1 && !actingCredits.includes(movieId)) ||
                        (turn === 'movie' && count > 0 && !castList.includes(actorId)))
                            ? { display: 'none' }
                            : { display: 'block' }
                    }
                >
                    {turn === "movie" ? (
                        <Autocomplete
                            key="movie-autocomplete"
                            freeSolo
                            disabled={loading}
                            options={searchResults}
                            loading={loading}
                            value={''}
                            inputValue={inputValue}
                            onChange={(event, value) => {
                                setFieldValue('searchMovie', value || '');
                                onChange(event, value);
                            }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('searchMovie', newInputValue);
                                onInputChange(event, newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search for a movie..."
                                    className="search-input"
                                    autoFocus
                                />
                            )}
                        />
                    ) : (
                        <Autocomplete
                            key="actor-autocomplete"
                            freeSolo
                            disabled={loading}
                            options={searchResults}
                            loading={loading}
                            value={''}
                            inputValue={inputValue}
                            onChange={(event, value) => {
                                setFieldValue('searchActor', value || '');
                                onChange(event, value);
                            }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('searchActor', newInputValue);
                                onInputChange(event, newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search for an actor..."
                                    className="search-input"
                                    autoFocus
                                />
                            )}
                        />
                    )}
                    <button type="submit" className="search-button" disabled={loading}>Search</button>
                    <button type="button" onClick={resetGame}>Reset Game</button>
                </Form>
                )}
            </Formik>
        </>
    )
}

export default SearchBar;