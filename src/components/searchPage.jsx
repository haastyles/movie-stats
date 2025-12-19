import { Formik, Form, Field } from 'formik';

function SearchPage({
    turn,
    submitSearch,
    actingCredits,
    castList,
    movieId,
    actorId,
    error,
    count,
    time
}) {
    return (
        <>
            <Formik 
                initialValues={{ searchMovie: '', searchActor: '' }}
                onSubmit={(values, actions) => {
                    // Only submit if there's actual input
                    if (turn === 'movie' && values.searchMovie.trim() === '') return;
                    if (turn === 'actor' && values.searchActor.trim() === '') return;
                    submitSearch(values, actions);
                }}
            >
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
                        <div>
                            <Field 
                                type="text" 
                                name="searchMovie" 
                                placeholder="Search for a movie..."
                                className="search-input"
                            />
                        </div>
                    ) : (
                        <div>
                            <Field 
                                type="text" 
                                name="searchActor" 
                                placeholder="Search for an actor..."
                                className="search-input"
                            />
                        </div>
                    )}
                    <button type="submit" className="search-button">Search</button>
                </Form>
            </Formik>
        </>
    )
}

export default SearchPage;