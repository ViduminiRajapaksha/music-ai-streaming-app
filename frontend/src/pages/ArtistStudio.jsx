import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDisc, FiMic, FiMusic, FiUploadCloud } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import { useAuth } from "../hooks/useAuth";
import { GENRES } from "../utils/constants";
import toast from "react-hot-toast";

const MOODS = ["", "Happy", "Sad", "Energetic", "Calm", "Romantic", "Focus", "Party", "Chill"];

const initialSong = {
  title: "",
  artist: "",
  album: "",
  genre: "Pop",
  mood: "",
  lyrics: "",
  duration: "",
  isPremium: false,
  audio: null,
  cover: null
};

const initialAlbum = {
  title: "",
  artist: "",
  genre: "Pop",
  description: "",
  releaseDate: "",
  cover: null,
  songIds: []
};

const initialPodcast = {
  title: "",
  artist: "",
  episode: "",
  genre: "English",
  mood: "",
  description: "",
  duration: "",
  audio: null,
  cover: null
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm text-spotify-light">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const ArtistStudio = () => {
  const { user } = useAuth();
  const [songForm, setSongForm] = useState(initialSong);
  const [albumForm, setAlbumForm] = useState(initialAlbum);
  const [podcastForm, setPodcastForm] = useState(initialPodcast);
  const [songs, setSongs] = useState([]);
  const [submitting, setSubmitting] = useState("");

  const canUpload = ["artist", "admin"].includes(user?.role);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const data = await libraryService.getSongs({ limit: 100 });
        setSongs(data.songs || []);
      } catch {
        setSongs([]);
      }
    };
    loadSongs();
  }, []);

  const updateSong = (key, value) => setSongForm((prev) => ({ ...prev, [key]: value }));
  const updateAlbum = (key, value) => setAlbumForm((prev) => ({ ...prev, [key]: value }));
  const updatePodcast = (key, value) => setPodcastForm((prev) => ({ ...prev, [key]: value }));

  const submitSong = async (e) => {
    e.preventDefault();
    if (!songForm.audio) {
      toast.error("Choose an audio file");
      return;
    }
    setSubmitting("song");
    try {
      const song = await libraryService.uploadSong(songForm);
      const withCover = songForm.cover ? await libraryService.uploadSongCover(song._id, songForm.cover) : song;
      setSongs((prev) => [withCover, ...prev]);
      setSongForm({ ...initialSong, artist: songForm.artist });
      toast.success("Song uploaded");
    } catch (err) {
      toast.error(err.message || "Failed to upload song");
    } finally {
      setSubmitting("");
    }
  };

  const submitAlbum = async (e) => {
    e.preventDefault();
    setSubmitting("album");
    try {
      const album = await libraryService.createAlbum(albumForm);
      if (albumForm.cover) await libraryService.uploadAlbumCover(album._id, albumForm.cover);
      await Promise.all(albumForm.songIds.map((songId) => libraryService.addSongToAlbum(album._id, songId)));
      setAlbumForm({ ...initialAlbum, artist: albumForm.artist });
      toast.success("Album created");
    } catch (err) {
      toast.error(err.message || "Failed to create album");
    } finally {
      setSubmitting("");
    }
  };

  const submitPodcast = async (e) => {
    e.preventDefault();
    if (!podcastForm.audio) {
      toast.error("Choose a podcast audio file");
      return;
    }
    setSubmitting("podcast");
    try {
      const podcast = await libraryService.uploadPodcast(podcastForm);
      if (podcastForm.cover) await libraryService.uploadPodcastCover(podcast._id, podcastForm.cover);
      setPodcastForm({ ...initialPodcast, artist: podcastForm.artist });
      toast.success("Podcast uploaded");
    } catch (err) {
      toast.error(err.message || "Failed to upload podcast");
    } finally {
      setSubmitting("");
    }
  };

  const toggleAlbumSong = (songId) => {
    setAlbumForm((prev) => ({
      ...prev,
      songIds: prev.songIds.includes(songId)
        ? prev.songIds.filter((id) => id !== songId)
        : [...prev.songIds, songId]
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Artist Studio</h1>
        <p className="text-spotify-light mt-1">Upload songs, albums, podcasts, covers, and lyrics.</p>
      </div>

      {!canUpload && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-yellow-100">
          Your account is currently a listener account. Artist or admin access is required for uploads.
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        <form onSubmit={submitSong} className="bg-spotify-dark/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <FiMusic className="text-spotify-green" />
            <h2 className="text-xl font-bold">Upload Song</h2>
          </div>
          <Field label="Song name"><input className="input-field" value={songForm.title} onChange={(e) => updateSong("title", e.target.value)} required /></Field>
          <Field label="Artist"><input className="input-field" value={songForm.artist} onChange={(e) => updateSong("artist", e.target.value)} required /></Field>
          <Field label="Album"><input className="input-field" value={songForm.album} onChange={(e) => updateSong("album", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Genre"><select className="input-field" value={songForm.genre} onChange={(e) => updateSong("genre", e.target.value)}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></Field>
            <Field label="Mood"><select className="input-field" value={songForm.mood} onChange={(e) => updateSong("mood", e.target.value)}>{MOODS.map((mood) => <option key={mood} value={mood}>{mood || "None"}</option>)}</select></Field>
          </div>
          <Field label="Duration seconds"><input className="input-field" type="number" min="0" value={songForm.duration} onChange={(e) => updateSong("duration", e.target.value)} /></Field>
          <Field label="Lyrics"><textarea className="input-field min-h-28" value={songForm.lyrics} onChange={(e) => updateSong("lyrics", e.target.value)} /></Field>
          <Field label="Audio file"><input className="input-field" type="file" accept="audio/*" onChange={(e) => updateSong("audio", e.target.files?.[0])} required /></Field>
          <Field label="Cover image"><input className="input-field" type="file" accept="image/*" onChange={(e) => updateSong("cover", e.target.files?.[0])} /></Field>
          <label className="flex items-center gap-2 text-sm text-spotify-light">
            <input type="checkbox" checked={songForm.isPremium} onChange={(e) => updateSong("isPremium", e.target.checked)} />
            Premium download
          </label>
          <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={!canUpload || submitting === "song"}>
            <FiUploadCloud /> {submitting === "song" ? "Uploading..." : "Upload Song"}
          </button>
        </form>

        <form onSubmit={submitAlbum} className="bg-spotify-dark/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <FiDisc className="text-spotify-green" />
            <h2 className="text-xl font-bold">Create Album</h2>
          </div>
          <Field label="Album title"><input className="input-field" value={albumForm.title} onChange={(e) => updateAlbum("title", e.target.value)} required /></Field>
          <Field label="Artist"><input className="input-field" value={albumForm.artist} onChange={(e) => updateAlbum("artist", e.target.value)} required /></Field>
          <Field label="Genre"><select className="input-field" value={albumForm.genre} onChange={(e) => updateAlbum("genre", e.target.value)}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></Field>
          <Field label="Release date"><input className="input-field" type="date" value={albumForm.releaseDate} onChange={(e) => updateAlbum("releaseDate", e.target.value)} /></Field>
          <Field label="Description"><textarea className="input-field min-h-24" value={albumForm.description} onChange={(e) => updateAlbum("description", e.target.value)} /></Field>
          <Field label="Album cover"><input className="input-field" type="file" accept="image/*" onChange={(e) => updateAlbum("cover", e.target.files?.[0])} /></Field>
          <div>
            <p className="text-sm text-spotify-light mb-2">Songs</p>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {songs.length ? songs.map((song) => (
                <label key={song._id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={albumForm.songIds.includes(song._id)} onChange={() => toggleAlbumSong(song._id)} />
                  <span className="truncate">{song.title} - {song.artist}</span>
                </label>
              )) : <p className="text-sm text-spotify-light">Upload songs first to attach them.</p>}
            </div>
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={!canUpload || submitting === "album"}>
            <FiUploadCloud /> {submitting === "album" ? "Creating..." : "Create Album"}
          </button>
        </form>

        <form onSubmit={submitPodcast} className="bg-spotify-dark/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <FiMic className="text-spotify-green" />
            <h2 className="text-xl font-bold">Upload Podcast</h2>
          </div>
          <Field label="Podcast title"><input className="input-field" value={podcastForm.title} onChange={(e) => updatePodcast("title", e.target.value)} required /></Field>
          <Field label="Artist"><input className="input-field" value={podcastForm.artist} onChange={(e) => updatePodcast("artist", e.target.value)} required /></Field>
          <Field label="Episode"><input className="input-field" value={podcastForm.episode} onChange={(e) => updatePodcast("episode", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Genre"><select className="input-field" value={podcastForm.genre} onChange={(e) => updatePodcast("genre", e.target.value)}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></Field>
            <Field label="Mood"><select className="input-field" value={podcastForm.mood} onChange={(e) => updatePodcast("mood", e.target.value)}>{MOODS.map((mood) => <option key={mood} value={mood}>{mood || "None"}</option>)}</select></Field>
          </div>
          <Field label="Duration seconds"><input className="input-field" type="number" min="0" value={podcastForm.duration} onChange={(e) => updatePodcast("duration", e.target.value)} /></Field>
          <Field label="Description"><textarea className="input-field min-h-28" value={podcastForm.description} onChange={(e) => updatePodcast("description", e.target.value)} /></Field>
          <Field label="Audio file"><input className="input-field" type="file" accept="audio/*" onChange={(e) => updatePodcast("audio", e.target.files?.[0])} required /></Field>
          <Field label="Cover image"><input className="input-field" type="file" accept="image/*" onChange={(e) => updatePodcast("cover", e.target.files?.[0])} /></Field>
          <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={!canUpload || submitting === "podcast"}>
            <FiUploadCloud /> {submitting === "podcast" ? "Uploading..." : "Upload Podcast"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ArtistStudio;
