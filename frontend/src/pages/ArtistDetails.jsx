import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { musicService } from "../services/musicService";
import { libraryService } from "../services/libraryService";
import { followService } from "../services/followService";
import { useAuthContext } from "../context/AuthContext";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import { normalizeLibraryAlbum, normalizeLibraryPodcast, normalizeLibrarySong, normalizeYouTubeTrack } from "../utils/normalize";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import MusicCard from "../components/MusicCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

const ArtistDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthContext();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const [artistData, relatedData] = await Promise.all([
            musicService.getArtist(id),
            musicService.getRelatedArtists(id)
          ]);
          setArtist(artistData);
          setRelatedArtists(relatedData.artists?.slice(0, 6) || []);

          const searchResult = await musicService.search(artistData.name, "track", 10);
          setTopTracks(
            (searchResult.tracks?.items || []).map(normalizeYouTubeTrack).filter(Boolean)
          );
        } catch {
          const artistData = await libraryService.getArtist(decodeURIComponent(id));
          setArtist({
            id: artistData.id,
            name: artistData.name,
            images: artistData.image ? [{ url: artistData.image }] : [],
            followers: { total: 0 },
            genres: []
          });
          setTopTracks((artistData.songs || []).map(normalizeLibrarySong).filter(Boolean));
          setAlbums((artistData.albums || []).map(normalizeLibraryAlbum).filter(Boolean));
          setPodcasts((artistData.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean));
          setRelatedArtists([]);
        }

        // Check if following and get followers count
        if (isAuthenticated && artist) {
          const [following, count] = await Promise.all([
            followService.checkFollowing(artist.id),
            followService.getFollowersCount(artist.id)
          ]);
          setIsFollowing(following);
          setFollowersCount(count);
        }
      } catch (err) {
        toast.error(err.message || "Failed to load artist");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow artists");
      return;
    }
    try {
      if (isFollowing) {
        await followService.unfollow(artist.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success("Unfollowed");
      } else {
        await followService.follow(artist.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success("Following");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update follow status");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!artist) return <p className="text-center text-spotify-light">Artist not found</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
        <img
          src={artist.images?.[0]?.url || PLACEHOLDER_IMAGE}
          alt={artist.name}
          className="w-48 h-48 rounded-full shadow-2xl object-cover"
        />
        <div>
          <p className="text-spotify-light text-sm uppercase">Artist</p>
          <h1 className="text-5xl font-extrabold">{artist.name}</h1>
          <p className="text-spotify-light mt-2">
            {followersCount.toLocaleString()} followers
          </p>
          {artist.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {artist.genres.slice(0, 5).map((genre) => (
                <span key={genre} className="px-3 py-1 bg-white/10 rounded-full text-sm capitalize">
                  {genre}
                </span>
              ))}
            </div>
          )}
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleFollow}
              className={`flex items-center gap-2 mt-4 px-6 py-2 rounded-full font-medium ${
                isFollowing
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-spotify-green text-black hover:bg-green-400"
              }`}
            >
              {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
              {isFollowing ? "Following" : "Follow"}
            </motion.button>
          )}
        </div>
      </div>

      {topTracks.length > 0 && (
        <section>
          <h2 className="section-title">Popular Tracks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topTracks.map((track, i) => (
              <MusicCard key={track.id} track={track} index={i} queue={topTracks} />
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section>
          <h2 className="section-title">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section>
          <h2 className="section-title">Podcasts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {podcasts.map((podcast, i) => (
              <MusicCard key={podcast.id} track={podcast} index={i} queue={podcasts} />
            ))}
          </div>
        </section>
      )}

      {relatedArtists.length > 0 && (
        <section>
          <h2 className="section-title">Related Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedArtists.map((a, i) => (
              <ArtistCard key={a.id} artist={a} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default ArtistDetails;
