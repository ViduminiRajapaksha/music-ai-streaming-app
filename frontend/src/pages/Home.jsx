import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiCompass, FiMessageCircle, FiPlay, FiRadio, FiTrendingUp, FiZap } from "react-icons/fi";
import { useMusic } from "../hooks/useMusic";
import { normalizeYouTubeTrack } from "../utils/normalize";
import MusicCard from "../components/MusicCard";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import SearchBar from "../components/SearchBar";
import { SkeletonGrid } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { libraryService } from "../services/libraryService";
import homeMusicHero from "../assets/images/home-music-hero.png";

const SectionHeader = ({ title, subtitle, actionTo, actionLabel = "See all" }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {actionTo && (
      <Link to={actionTo} className="shrink-0 text-sm font-semibold text-spotify-green hover:underline">
        {actionLabel}
      </Link>
    )}
  </div>
);

const HorizontalShelf = ({ children }) => (
  <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
    {children}
  </div>
);

const ShelfItem = ({ children, wide = false }) => (
  <div className={`${wide ? "w-[220px]" : "w-[170px]"} shrink-0 sm:w-[190px]`}>
    {children}
  </div>
);

const QuickTile = ({ to, icon: Icon, label, tone }) => (
  <Link
    to={to}
    className={`group flex min-h-20 items-center gap-3 rounded-lg border border-white/10 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/20 ${tone}`}
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/30 text-white">
      <Icon className="h-5 w-5" />
    </span>
    <span className="font-semibold text-white">{label}</span>
  </Link>
);

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
    } catch {
      // Browse data is non-critical; keep the home page usable if it fails.
    } finally {
      setBrowseLoading(false);
    }
  };

  const releaseTracks = newReleases.map(normalizeYouTubeTrack).filter(Boolean);
  const recommendedTracks = recommendations.map(normalizeYouTubeTrack).filter(Boolean);
  const recentQueue = recentlyPlayed;

  return (
    <div className="space-y-9">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[330px] overflow-hidden rounded-lg p-6 shadow-2xl shadow-black/20 md:p-10"
      >
        <img
          src={homeMusicHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/68 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="relative z-10 flex min-h-[282px] max-w-2xl flex-col justify-center">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-spotify-green">
            <FiRadio /> AI powered listening
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Your music, tuned for the moment.
          </h1>
          <p className="mb-6 max-w-xl text-base leading-7 text-gray-200 md:text-lg">
            Play your library, rediscover recent favorites, and build playlists from songs, moods, artists, and lyrics.
          </p>
          <div className="mb-7 max-w-lg">
            <SearchBar placeholder="Search songs, artists, albums..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/ai-chat" className="btn-primary flex items-center gap-2">
              <FiMessageCircle /> Ask AI
            </Link>
            <Link to="/smart-search" className="btn-secondary flex items-center gap-2">
              <FiCompass /> Smart Search
            </Link>
            <Link to="/generate-playlist" className="btn-secondary hidden items-center gap-2 sm:flex">
              <FiPlay /> Generate Mix
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickTile to="/recommendations" icon={FiZap} label="Made For You" tone="bg-gradient-to-br from-spotify-green/30 to-emerald-900/50" />
        <QuickTile to="/trending" icon={FiTrendingUp} label="Trending Now" tone="bg-gradient-to-br from-cyan-500/25 to-slate-900/60" />
        <QuickTile to="/history" icon={FiClock} label="Listening History" tone="bg-gradient-to-br from-amber-500/25 to-neutral-900/60" />
        <QuickTile to="/generate-playlist" icon={FiRadio} label="Create A Mix" tone="bg-gradient-to-br from-rose-500/25 to-zinc-900/60" />
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <SectionHeader title="Recently Played" subtitle="Jump back into what you were listening to." actionTo="/history" />
          <HorizontalShelf>
            {recentlyPlayed.slice(0, 6).map((track, i) => (
              <ShelfItem key={track.youtubeId || track.id}>
                <MusicCard track={track} index={i} queue={recentQueue} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* Recommendations */}
      <section>
        <SectionHeader title="Recommended For You" subtitle="A personal shelf based on your taste and activity." actionTo="/recommendations" />
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : recommendedTracks.length > 0 ? (
          <HorizontalShelf>
            {recommendedTracks.map((track, i) => (
              <ShelfItem key={track.id}>
                <MusicCard track={track} index={i} queue={recommendedTracks} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
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
        <SectionHeader title="New Releases" subtitle="Fresh tracks and albums to explore." />
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : releaseTracks.length > 0 ? (
          <HorizontalShelf>
            {releaseTracks.map((track, i) => (
              <ShelfItem key={track.id}>
                <MusicCard track={track} index={i} queue={releaseTracks} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
        ) : null}
      </section>

      {/* Trending */}
      <section>
        <SectionHeader title="Trending" subtitle="What people are playing right now." actionTo="/trending" />
        {homeLoading ? (
          <SkeletonGrid count={6} />
        ) : releaseTracks.length > 0 ? (
          <HorizontalShelf>
            {releaseTracks.slice(0, 6).map((track, i) => (
              <ShelfItem key={`trending-${track.id}`}>
                <MusicCard track={track} index={i} queue={releaseTracks} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
        ) : null}
      </section>

      {/* Albums */}
      <section>
        <SectionHeader title="Popular Albums" subtitle="Browse full releases from your catalog." actionTo="/albums" />
        {browseLoading ? (
          <SkeletonGrid count={6} />
        ) : albums.length > 0 ? (
          <HorizontalShelf>
            {albums.map((album, i) => (
              <ShelfItem key={album._id || album.id}>
                <AlbumCard album={album} index={i} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
        ) : null}
      </section>

      {/* Artists */}
      <section>
        <SectionHeader title="Popular Artists" subtitle="Follow artists and explore their uploads." actionTo="/artists" />
        {browseLoading ? (
          <SkeletonGrid count={6} />
        ) : artists.length > 0 ? (
          <HorizontalShelf>
            {artists.map((artist, i) => (
              <ShelfItem key={artist.id}>
                <ArtistCard artist={artist} index={i} />
              </ShelfItem>
            ))}
          </HorizontalShelf>
        ) : null}
      </section>

      {/* Genres */}
      <section>
        <SectionHeader title="Browse by Genre" subtitle="Start with a sound and let MelodyMind branch out." actionTo="/genres" />
        <div className="flex flex-wrap gap-3">
          {genres.slice(0, 12).map((genre) => (
            <Link
              key={genre}
              to={`/search?q=${genre}&type=track`}
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-gray-800 transition-all hover:border-spotify-green/50 hover:bg-spotify-green hover:text-black dark:text-white"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
