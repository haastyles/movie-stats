// TMDB API Service
const READ_ACCESS_TOKEN = process.env.REACT_APP_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;

// Debug: Log environment variables (remove after testing)
console.log('TMDB Config Check:');
console.log('Base URL:', BASE_URL);
console.log('Token exists:', !!READ_ACCESS_TOKEN);
console.log('Token length:', READ_ACCESS_TOKEN?.length);

/**
 * Fetches data from TMDB API
 * @param {string} endpoint - API endpoint (e.g., '/movie/popular')
 * @param {Object} params - Query parameters
 * @returns {Promise} - Response data
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add additional parameters
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  const headers = {
    'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  console.log('Fetching:', url.toString());

  try {
    const response = await fetch(url, { headers });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
};

// API Methods
const tmdbApi = {
  // Get popular movies
  getPopularMovies: (page = 1) => 
    fetchFromTMDB('/movie/popular', { page }),

  // Get movie credits (cast & crew)
  getMovieCredits: (movieId) => 
    fetchFromTMDB(`/movie/${movieId}/credits`),

  // Get actor movie credits
  getActorMovieCredits: (actorId) => 
    fetchFromTMDB(`/person/${actorId}/movie_credits`),

  // Get the actor's id
  getActorIdentity: (actorName) => 
    fetchFromTMDB('/search/person', { query: actorName }),

  // Get the movie's id
  getMovieIdentity: (movieTitle) => 
    fetchFromTMDB('/search/movie', { query: movieTitle }),
};

export default tmdbApi;
