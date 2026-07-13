import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiMessageCircle } from "react-icons/fi";
import { useMusic } from "../hooks/useMusic";
import { normalizeYouTubeTrack } from "../utils/normalize";
import MusicCard from "../components/MusicCard";
import AlbumCard from "../components/AlbumCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner, { SkeletonGrid } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { musicService } from "../services/musicService";
import { libraryService } from "../services/libraryService";

const Home = () => {
  const {
    newReleases,
    recommendations,
    recentlyPlayed,
    homeLoading,
    homeWarning,
    loadHomeData
  } = useMusic();

  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres] = useState([
    "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Electronic", "Country",
    "Reggae", "Blues", "Metal", "Folk", "Soul", "Funk", "Disco", "Techno", "House",
    "Ambient", "Indie", "Alternative", "Punk", "Grunge", "Dubstep", "Trap", "Lo-Fi"
  ]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const didLoadHomeData = useRef(false);

  useEffect(() => {
    if (didLoadHomeData.current) return;
    didLoadHomeData.current = true;
    loadHomeData();
    loadBrowseData();
  }, [loadHomeData]);

  const loadBrowseData = async () => {
    setBrowseLoading(true);
    try {
      const [albumsData, artistsData] = await Promise.all([
        libraryService.getAlbums({ limit: 8 }),
        libraryService.getArtists()
      ]);
      setAlbums(albumsData.albums || []);
      setArtists(artistsData);
    } catch (err) {
      // Browse data is non-critical; keep the home page usable if it fails.
    } finally {
      setBrowseLoading(false);
    }
  };

  const releaseTracks = newReleases.map(normalizeYouTubeTrack).filter(Boolean);
  const recommendedTracks = recommendations.map(normalizeYouTubeTrack).filter(Boolean);
  const recentQueue = recentlyPlayed;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden glass p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/20 via-transparent to-purple-900/20" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            Discover Music with <span className="text-spotify-green">AI</span>
          </h1>
          <p className="text-spotify-light text-lg mb-6 max-w-xl">
            Stream, explore, and get personalized recommendations powered by YouTube and Gemini AI.
          </p>
          <div className="max-w-md mb-8">
            <SearchBar placeholder="What do you want to listen to?" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/ai-chat" className="btn-primary flex items-center gap-2">
              <FiMessageCircle /> AI Chat
            </Link>
            <Link to="/smart-search" className="btn-secondary flex items-center gap-2">
              <FiZap /> Smart Search
            </Link>
            <Link to="/generate-playlist" className="btn-secondary flex items-center gap-2">
              <FiZap /> Generate Playlist
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="section-title">Recently Played</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyPlayed.slice(0, 6).map((track, i) => (
              <MusicCard key={track.youtubeId} track={track} index={i} queue={recentQueue} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section>
        <h2 className="section-title">Recommended For You</h2>
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : recommendedTracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recommendedTracks.map((track, i) => (
              <MusicCard key={track.id} track={track} index={i} queue={recommendedTracks} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiZap}
            title="No recommendations available"
            description={homeWarning || "YouTube recommendations are temporarily unavailable and no matching local songs were found."}
          />
        )}
      </section>

      {/* New Releases */}
      <section>
        <h2 className="section-title">New Releases</h2>
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : releaseTracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {releaseTracks.map((track, i) => (
              <MusicCard key={track.id} track={track} index={i} queue={releaseTracks} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Trending</h2>
          <Link to="/trending" className="text-spotify-green hover:underline text-sm font-medium">
            See all
          </Link>
        </div>
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : releaseTracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {releaseTracks.slice(0, 6).map((track, i) => (
              <MusicCard key={`trending-${track.id}`} track={track} index={i} queue={releaseTracks} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Albums */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Popular Albums</h2>
          <Link to="/albums" className="text-spotify-green hover:underline text-sm font-medium">
            See all
          </Link>
        </div>
        {browseLoading ? (
          <SkeletonGrid count={6} />
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.map((album, i) => (
              <AlbumCard key={album._id || album.id} album={album} index={i} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Artists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Popular Artists</h2>
          <Link to="/artists" className="text-spotify-green hover:underline text-sm font-medium">
            See all
          </Link>
        </div>
        {browseLoading ? (
          <SkeletonGrid count={6} />
        ) : artists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artists.map((artist, i) => (
              <div
                key={artist.id}
                className="group cursor-pointer"
                onClick={() => window.location.href = `/artist/${artist.id}`}
              >
                <div className="relative aspect-square rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={artist.image || "https://via.placeholder.com/200"}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-sm truncate">{artist.name}</h3>
                <p className="text-xs text-spotify-light">Artist</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Genres */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Browse by Genre</h2>
          <Link to="/genres" className="text-spotify-green hover:underline text-sm font-medium">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {genres.slice(0, 12).map((genre) => (
            <Link
              key={genre}
              to={`/search?q=${genre}&type=track`}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 transition-all duration-300"
            >
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="text-white font-bold text-sm text-center">{genre}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
