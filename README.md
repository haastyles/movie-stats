# 🎬 Lights! Camera! Action! 

A React movie trivia game that challenges you to connect movies and actors using The Movie Database (TMDB) API.

## 🎮 How to Play

1. Start by entering a movie title
2. Name an actor from that movie
3. Name another movie that actor was in
4. Keep the chain going as long as you can!
5. Race against the clock - you have limited time per turn

## 🚀 Local Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A TMDB API account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-stats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your TMDB API credentials**
   
   a. Create a TMDB account at [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
   
   b. Request an API key:
      - Go to your account settings: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
      - Click "Request an API Key"
      - Choose "Developer" option
      - Fill out the form with your application details
   
   c. Get your Read Access Token (Bearer Token):
      - After approval, scroll down to the "API Read Access Token" section
      - Copy the token (it's more secure than the API Key)
   
   d. Create a `.env` file in the project root directory:
      ```bash
      # Create .env file (Windows)
      type nul > .env
      
      # Create .env file (Mac/Linux)
      touch .env
      ```
   
   e. Add your configuration to the `.env` file:
      ```
      REACT_APP_TMDB_READ_ACCESS_TOKEN=your_actual_read_access_token_here
      REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
      ```
      
      **Important:** Replace `your_actual_read_access_token_here` with your actual token from TMDB.

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open in your browser at [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

This project requires the following environment variables:

- `REACT_APP_TMDB_READ_ACCESS_TOKEN` - Your TMDB API Read Access Token (Bearer Token)
- `REACT_APP_TMDB_BASE_URL` - The TMDB API base URL (default: https://api.themoviedb.org/3)

**Security Note:** Never commit your `.env` file to GitHub. The `.env` file is included in `.gitignore` to prevent accidental exposure of your API credentials.

## 🛠️ Technologies Used

- React (Create React App)
- Formik (Form management)
- TMDB API
- CSS3

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000). The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. The build is optimized and minified.

## 🎯 Features

- Real-time movie and actor data from TMDB
- Timed gameplay with score tracking
- Input validation to ensure correct answers
- Dynamic image loading for movies and actors
- Responsive design

## 📝 Project Structure

```
movie-stats/
├── public/
├── src/
│   ├── components/
│   │   ├── test/
│   │   │   ├── imageArray.test.jsx
│   │   │   ├── searchBar.test.jsx
│   │   │   └── searchResults.test.jsx
│   │   ├── imageArray.jsx
│   │   ├── searchBar.jsx
│   │   └── searchResults.jsx
│   ├── hooks/
│   │   ├── test/
│   │   │   ├── useActorSearch.test.js
│   │   │   ├── useDebounce.test.js
│   │   │   ├── useGameState.test.js
│   │   │   ├── useMovieSearch.test.js
│   │   │   └── useTimer.test.js
│   │   ├── useActorSearch.js
│   │   ├── useDebounce.js
│   │   ├── useGameState.js
│   │   ├── useMovieSearch.js
│   │   └── useTimer.js
│   ├── pages/
│   │   └── searchPage.jsx
│   ├── services/
│   │   ├── test/
│   │   │   └── tmdbApi.test.js
│   │   └── tmdbApi.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .env (create this file - not in repo)
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

This project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once (CI mode)
npm test -- --watchAll=false

# Run tests in a specific folder
npm test -- --testPathPattern="hooks/test"
npm test -- --testPathPattern="components/test"
npm test -- --testPathPattern="services/test"

# Run a specific test file
npm test -- --testPathPattern="useTimer.test"
```

### Test Structure

Tests are organized in `test/` folders alongside the code they test:

| Folder | Description |
|--------|-------------|
| `components/test/` | UI component tests (rendering, user interactions) |
| `hooks/test/` | Custom hook tests (state management, side effects) |
| `services/test/` | API service tests (mocked fetch calls) |

## 🐛 Troubleshooting

### API Connection Errors

If you see "Error connecting to TMDB API":
1. Verify your `.env` file exists in the project root
2. Check that your token is correctly formatted (no extra spaces)
3. Ensure you're using the Read Access Token, not the API Key
4. Restart the development server after adding/changing the `.env` file

### Application Won't Start

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Make sure you're using a compatible Node.js version

## 📄 License

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!


This ReadME was written by Copilot.
