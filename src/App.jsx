import React, { useState, useEffect } from "react";

const MovieApp = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);

  const API_KEY = "8118e05b58d706b38c045d3dcf1df26a";

  // ✅ Fetch movies
  async function fetchMovies(type, searchQuery = "") {
    let url = "";

    if (searchQuery) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}`;
    } else {
      switch (type) {
        case "trending":
          url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`;
          break;
        case "popular":
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
          break;
        case "recent":
          url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`;
          break;
        default:
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
      }
    }

    const response = await fetch(url);
    const data = await response.json();
    setMovies(data.results || []);
  }

  // ✅ Fetch single movie + trailer
  async function fetchMovieDetails(id) {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=videos`
    );
    const data = await response.json();
    setSelectedMovie(data);

    const trailerVideo = data.videos.results.find((vid) => vid.type === "Trailer");
    setTrailer(trailerVideo ? trailerVideo.key : null);
  }

  // Auto load movies
  useEffect(() => {
    fetchMovies(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (query.trim() !== "") {
      fetchMovies("", query);
    } else {
      fetchMovies(activeTab);
    }
  }, [query]);

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="py-6 px-6 border-b border-gray-800 flex flex-col md:flex-row items-center gap-4">
        <h1
          className="text-2xl font-bold text-yellow-400 cursor-pointer md:mr-auto"
          onClick={() => setSelectedMovie(null)}
        >
          🎬 Movie Explorer
        </h1>

        {!selectedMovie && (
          <div className="w-full md:flex-1 flex justify-center">
            <input
              type="text"
              placeholder="🔍 Search for a movie..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-6 py-3 rounded-full text-gray-300 w-full max-w-2xl border border-gray-700 focus:outline-none focus:ring-2"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {selectedMovie ? (
        // ✅ Movie Details
        <div>
          <div className="relative flex justify-center items-center bg-black md:h-[400px] h-[220px]">
            {trailer ? (
              <div className="w-full flex justify-center mt-10">
                <iframe
                  className="w-[80%] md:w-[50%] aspect-video rounded-lg shadow-lg"
                  src={`https://www.youtube.com/embed/${trailer}`}
                  title="Trailer"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <img
                src={`https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`}
                alt={selectedMovie.title}
                className="w-full h-full object-cover rounded-lg"
              />
            )}

            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-3 left-3 md:top-4 md:left-4 bg-yellow-400 text-black px-3 py-1 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base"
            >
              ← Back
            </button>
          </div>

          <div className="py-5 max-w-5xl mx-auto px-3 md:px-4 text-center md:text-left mt-10">
            <h1 className="text-2xl md:text-1xl font-bold mb-3">{selectedMovie.title}</h1>
            <p className="text-gray-400 mb-2 text-sm md:text-base">
              Release Date: {selectedMovie.release_date || "N/A"}
            </p>
            <p className="text-yellow-400 font-bold mb-2 text-sm md:text-10">
              ⭐ Rating: {selectedMovie.vote_average}/10
            </p>
            <p className="text-base md:text-lg">{selectedMovie.overview}</p>
          </div>
        </div>
      ) : (
        // ✅ Movie List
        <>
          {/* Tabs */}
          <div className="flex gap-6 px-6 py-4 border-b border-gray-800">
            {["trending", "popular", "recent"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 ${
                  activeTab === tab
                    ? "border-b-2 border-yellow-400 text-yellow-400"
                    : "text-gray-400 hover:text-yellow-300"
                }`}
              >
                {tab === "trending"
                  ? "Trending"
                  : tab === "popular"
                  ? "Most Popular"
                  : "Recently Added"}
              </button>
            ))}
          </div>

          {/* Movies Grid */}
          <div className="p-6">
            {movies.length === 0 ? (
              <p className="text-gray-400">No movies found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-900 rounded-lg shadow-lg overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => fetchMovieDetails(movie.id)}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-72 object-cover"
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="p-3">
                      <h3 className="text-md font-bold truncate">{movie.title}</h3>
                      <p className="text-sm text-gray-400">
                        {movie.release_date
                          ? new Date(movie.release_date).toDateString()
                          : "No release date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MovieApp;
