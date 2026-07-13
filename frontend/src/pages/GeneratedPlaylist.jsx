import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiPlay } from "react-icons/fi";
import { aiService } from "../services/aiService";
import { normalizeLibrarySong, normalizeYouTubeTrack, trackToPlaylistPayload } from "../utils/normalize";
import { playlistService } from "../services/playlistService";
import { usePlayer } from "../hooks/usePlayer";
import RecommendationCard from "../components/RecommendationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

const EXAMPLE_PROMPTS = [
  "I want relaxing piano music for studying",
  "Upbeat songs for a morning workout",
  "Chill lo-fi beats for late night coding",
  "Romantic dinner jazz playlist",
  "90s hip hop throwback vibes"
];

const GeneratedPlaylist = () => {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.mood ? `Music for feeling ${location.state.mood}` : "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const { playQueue } = usePlayer();

  const handleGenerate = async (text) => {
    const query = text || prompt;
    if (!query.trim()) {
      toast.error("Please enter a description");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await aiService.generatePlaylist({ prompt: query });
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Could not generate playlist. Check Gemini/YouTube API availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlaylist = async () => {
    if (!result?.playlist) return;
    setSaving(true);
    try {
      const playlist = await playlistService.create({
        name: result.playlist.name,
        description: result.playlist.description
      });

      const localTracks = result.playlist.localSongs || [];
      const tracks = result.playlist.tracks || [];
      let updated = playlist;
      for (const track of localTracks) {
        updated = await playlistService.addSong(playlist._id, { songId: track._id });
      }
      for (const track of tracks) {
        const normalized = normalizeYouTubeTrack(track);
        if (normalized) {
          updated = await playlistService.addSong(playlist._id, trackToPlaylistPayload(normalized));
        }
      }

      toast.success(`Playlist "${updated.name}" saved!`);
    } catch (err) {
      toast.error(err.message || "Failed to save playlist");
    } finally {
      setSaving(false);
    }
  };

  const localTracks = (result?.playlist?.localSongs || []).map(normalizeLibrarySong).filter(Boolean);
  const externalTracks = (result?.playlist?.tracks || []).map(normalizeYouTubeTrack).filter(Boolean);
  const trackItems = [
    ...localTracks.map((track) => ({
      track,
      reason: track.reason,
      sourceLabel: "Local library",
      sourceType: "local"
    })),
    ...externalTracks.map((track, index) => ({
      track,
      reason: result?.playlist?.aiSuggestions?.[index]?.reason || result?.playlist?.description,
      sourceLabel: "YouTube API",
      sourceType: "youtube"
    }))
  ];
  const tracks = trackItems.map((item) => item.track);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FiZap className="text-spotify-green" /> AI Playlist Generator
        </h1>
        <p className="text-spotify-light">Describe the playlist you want in natural language</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "I want relaxing piano music for a rainy afternoon"'
          rows={3}
          className="input-field resize-none"
        />
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGenerate()}
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? "Generating..." : "Generate Playlist"}
        </motion.button>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => {
                setPrompt(example);
                handleGenerate(example);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-spotify-light
                         hover:bg-white/20 hover:text-white transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="AI is crafting your playlist..." />}

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-8 bg-gradient-to-br from-spotify-green/10 to-purple-900/10">
            <p className="text-spotify-light text-sm uppercase mb-1">AI Generated</p>
            <h2 className="text-3xl font-extrabold mb-2">{result.playlist.name}</h2>
            <p className="text-spotify-light mb-4">{result.playlist.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm ${
                result.sources?.playlistConcept === "gemini"
                  ? "bg-purple-500/20 text-purple-200"
                  : "bg-yellow-500/20 text-yellow-200"
              }`}>
                {result.sources?.playlistConcept === "gemini" ? "Gemini mood analysis" : "Fallback playlist profile"}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                result.sources?.recommendations === "youtube"
                  ? "bg-blue-500/20 text-blue-200"
                  : "bg-red-500/20 text-red-200"
              }`}>
                {result.sources?.recommendations === "youtube" ? "Tracks from YouTube API" : "YouTube temporarily unavailable"}
              </span>
              {result.playlist.genres?.map((g) => (
                <span key={g} className="px-3 py-1 bg-spotify-green/20 text-spotify-green rounded-full text-sm capitalize">
                  {g}
                </span>
              ))}
            </div>
            {result.warnings?.length > 0 && (
              <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100 space-y-1">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              {tracks.length > 0 && (
                <button onClick={() => playQueue(tracks, 0)} className="btn-primary flex items-center gap-2">
                  <FiPlay /> Play All
                </button>
              )}
              <button onClick={handleSavePlaylist} disabled={saving} className="btn-secondary">
                {saving ? "Saving..." : "Save to My Playlists"}
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold">{tracks.length} Tracks</h3>
          {trackItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackItems.map(({ track, reason, sourceLabel, sourceType }, i) => (
                <RecommendationCard
                  key={track.id}
                  track={track}
                  reason={reason}
                  sourceLabel={sourceLabel}
                  sourceType={sourceType}
                  index={i}
                  queue={tracks}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No playlist tracks available"
              description="YouTube recommendations are temporarily unavailable and no matching local songs were found. Try again later or upload local songs."
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GeneratedPlaylist;
