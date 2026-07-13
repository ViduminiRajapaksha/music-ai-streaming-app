import { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiType } from "react-icons/fi";
import { aiService } from "../services/aiService";
import { normalizeLibraryAlbum, normalizeLibraryPodcast, normalizeLibrarySong } from "../utils/normalize";
import AlbumCard from "../components/AlbumCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import MusicCard from "../components/MusicCard";
import toast from "react-hot-toast";

const EXAMPLES = [
  "Happy songs from 2024",
  "Sinhala calm songs for studying",
  "Rock songs for traveling",
  'song with "beautiful day"',
  "Meditation music when I feel stressed"
];

const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("smart");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async (text = query, selectedMode = mode) => {
    if (!text.trim()) {
      toast.error("Enter a search prompt");
      return;
    }
    setQuery(text);
    setMode(selectedMode);
    setLoading(true);
    setResult(null);
    try {
      const data = selectedMode === "lyrics"
        ? await aiService.lyricsSearch(text)
        : await aiService.smartSearch(text);
      setResult({ ...data, mode: selectedMode });
    } catch (err) {
      toast.error(err.message || "Smart search failed");
    } finally {
      setLoading(false);
    }
  };

  const songs = (result?.songs || []).map(normalizeLibrarySong).filter(Boolean);
  const albums = (result?.albums || []).map(normalizeLibraryAlbum).filter(Boolean);
  const podcasts = (result?.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiSearch className="text-spotify-green" /> Smart Search
        </h1>
        <p className="text-spotify-light mt-1">Search naturally by mood, year, genre, activity, artist, album, or remembered lyrics.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode("smart")}
            className={`px-4 py-2 rounded-full text-sm ${mode === "smart" ? "bg-spotify-green text-black" : "bg-white/10 text-spotify-light"}`}
          >
            Natural Language
          </button>
          <button
            onClick={() => setMode("lyrics")}
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${mode === "lyrics" ? "bg-spotify-green text-black" : "bg-white/10 text-spotify-light"}`}
          >
            <FiType /> Lyrics Assistant
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "lyrics" ? 'e.g. song with "beautiful day"' : "e.g. Happy songs from 2024"}
            className="input-field flex-1"
          />
          <button disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => runSearch(example, example.includes('"') ? "lyrics" : "smart")}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-spotify-light hover:bg-white/20 hover:text-white transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="Understanding your search..." />}

      {result && !loading && (
        <div className="space-y-8">
          <div className="glass rounded-xl p-5">
            <h2 className="font-bold mb-2">AI Understanding</h2>
            <p className="text-spotify-light">
              {result.mode === "lyrics"
                ? `Looking for lyrics containing "${result.lyricFragment}".`
                : result.explanation || result.parsed?.explanation}
            </p>
            {result.parsed && (
              <div className="flex flex-wrap gap-2 mt-3">
                {["genre", "mood", "year"].map((key) => result.parsed[key] ? (
                  <span key={key} className="px-3 py-1 rounded-full bg-spotify-green/20 text-spotify-green text-sm">
                    {key}: {result.parsed[key]}
                  </span>
                ) : null)}
              </div>
            )}
          </div>

          {songs.length ? (
            <section>
              <h2 className="section-title">Songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {songs.map((song, index) => (
                  <MusicCard key={song.id} track={song} index={index} queue={songs} />
                ))}
              </div>
            </section>
          ) : (
            <EmptyState icon={FiSearch} title="No matching songs" description="Try a broader mood, genre, artist, or lyric phrase." />
          )}

          {albums.length > 0 && (
            <section>
              <h2 className="section-title">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {albums.map((album, index) => (
                  <AlbumCard key={album.id} album={album} index={index} />
                ))}
              </div>
            </section>
          )}

          {podcasts.length > 0 && (
            <section>
              <h2 className="section-title">Podcasts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {podcasts.map((podcast, index) => (
                  <MusicCard key={podcast.id} track={podcast} index={index} queue={podcasts} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SmartSearch;
