import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../searchBar';

// Default props for SearchBar
const defaultProps = {
    turn: 'movie',
    submitSearch: jest.fn(),
    actingCredits: [],
    castList: [],
    movieId: null,
    actorId: null,
    error: null,
    count: 0,
    time: 20,
    searchResults: [],
    onChange: jest.fn(),
    onInputChange: jest.fn(),
    loading: false,
    inputValue: ''
};

describe('SearchBar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render without crashing', () => {
            render(<SearchBar {...defaultProps} />);
        });

        it('should render movie search when turn is "movie"', () => {
            render(<SearchBar {...defaultProps} turn="movie" />);
            expect(screen.getByPlaceholderText(/search for a movie/i)).toBeInTheDocument();
        });

        it('should render actor search when turn is "actor"', () => {
            render(<SearchBar {...defaultProps} turn="actor" />);
            expect(screen.getByPlaceholderText(/search for an actor/i)).toBeInTheDocument();
        });
    });

    describe('visibility', () => {
        it('should hide form when there is an error', () => {
            render(<SearchBar {...defaultProps} error="Some error" />);
            expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
        });

        it('should hide form when time is 0', () => {
            render(<SearchBar {...defaultProps} time={0} />);
            expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
        });
    });

    describe('form submission', () => {
        it('should not submit when movie input is empty', async () => {
            const submitSearch = jest.fn();
            render(<SearchBar {...defaultProps} submitSearch={submitSearch} />);
            fireEvent.click(screen.getByRole('button', { name: /search/i }));
            expect(submitSearch).not.toHaveBeenCalled();
        });

        it('should render submit button', () => {
            render(<SearchBar {...defaultProps} />);
            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
        });

        it('should have form with submit button', () => {
            render(<SearchBar {...defaultProps} />);
            const submitButton = screen.getByRole('button', { name: /search/i });
            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });

    describe('autocomplete', () => {
        it('should display search results in autocomplete', async () => {
            const searchResults = ['Movie 1', 'Movie 2', 'Movie 3'];
            render(<SearchBar {...defaultProps} searchResults={searchResults} />);
            
            // Open the autocomplete dropdown by clicking the input
            const input = screen.getByRole('combobox');
            fireEvent.focus(input);
            fireEvent.mouseDown(input);
            
            // Now the options should be visible in the dropdown
            expect(await screen.findByText('Movie 1')).toBeInTheDocument();
            expect(screen.getByText('Movie 2')).toBeInTheDocument();
            expect(screen.getByText('Movie 3')).toBeInTheDocument();
        });

        it('should show loading state', async () => {
            render(<SearchBar {...defaultProps} loading={true} />);
            
            // Open the dropdown to see the loading indicator
            const input = screen.getByRole('combobox');
            fireEvent.focus(input);
            fireEvent.mouseDown(input);
            
            // MUI Autocomplete shows "Loading…" text when loading
            expect(await screen.findByText(/loading/i)).toBeInTheDocument();
        });
    });
});
