import { render, screen, fireEvent } from '@testing-library/react';
import SearchResults from '../searchResults';

// Default props for SearchResults
const defaultProps = {
    turn: 'movie',
    castList: [],
    actingCredits: [],
    loading: false,
    error: null,
    movieId: null,
    actorId: null,
    movieTitle: null,
    actorName: null,
    moviePoster: null,
    actorPhoto: null,
    resetGame: jest.fn(),
    count: 0,
    time: 20
};

describe('SearchResults', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render without crashing', () => {
            render(<SearchResults {...defaultProps} />);
        });
    });

    describe('time expired state', () => {
        it('should display "time is up" message when time is 0', () => {
            render(<SearchResults {...defaultProps} time={0} />);
            expect(screen.getByText(/time is up/i)).toBeInTheDocument();
        });

        it('should show Try Again button when time expires', () => {
            render(<SearchResults {...defaultProps} time={0} />);
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        });

        it('should call resetGame when Try Again is clicked', () => {
            const resetGame = jest.fn();
            render(<SearchResults {...defaultProps} time={0} resetGame={resetGame} />);
            fireEvent.click(screen.getByRole('button', { name: /try again/i }));
            expect(resetGame).toHaveBeenCalledTimes(1);
        });
    });

    describe('incorrect answer state', () => {
        it('should display incorrect message for wrong actor guess', () => {
            render(
                <SearchResults 
                    {...defaultProps} 
                    turn="actor" 
                    count={2} 
                    actingCredits={[1, 2, 3]}
                    movieId={999}  // movieId not in actingCredits
                />
            );
            expect(screen.getByText(/not correct/i)).toBeInTheDocument();
        });

        it('should display incorrect message for wrong movie guess', () => {
            render(
                <SearchResults 
                    {...defaultProps} 
                    turn="movie" 
                    count={1} 
                    castList={[1, 2, 3]}
                    actorId={999}  // actorId not in castList
                />
            );
            expect(screen.getByText(/not correct/i)).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should display loading indicator when loading', () => {
            render(<SearchResults {...defaultProps} loading={true} />);
            // Add assertion for loading state display
        });
    });

    describe('success state', () => {
        it('should display movie poster when available', () => {
            render(
                <SearchResults 
                    {...defaultProps} 
                    moviePoster="/path/to/poster.jpg"
                    movieTitle="Test Movie"
                />
            );
            // Add assertion for movie poster display
        });

        it('should display actor photo when available', () => {
            render(
                <SearchResults 
                    {...defaultProps} 
                    actorPhoto="/path/to/photo.jpg"
                    actorName="Test Actor"
                />
            );
            // Add assertion for actor photo display
        });
    });
});
