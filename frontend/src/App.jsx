import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { MusicProvider } from "./context/MusicContext";
import { PlayerProvider } from "./context/PlayerContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import Albums from "./pages/Albums";
import Artists from "./pages/Artists";
import Genres from "./pages/Genres";
import Library from "./pages/Library";
import ArtistStudio from "./pages/ArtistStudio";
import NowPlaying from "./pages/NowPlaying";
import Lyrics from "./pages/Lyrics";
import Queue from "./pages/Queue";
import History from "./pages/History";
import Downloads from "./pages/Downloads";
import SongDetails from "./pages/SongDetails";
import ArtistDetails from "./pages/ArtistDetails";
import AlbumDetails from "./pages/AlbumDetails";
import Favorites from "./pages/Favorites";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import AIRecommendations from "./pages/AIRecommendations";
import RecommendationHistory from "./pages/RecommendationHistory";
import SmartSearch from "./pages/SmartSearch";
import GeneratedPlaylist from "./pages/GeneratedPlaylist";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminSongs from "./pages/admin/AdminSongs";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <MusicProvider>
              <PlayerProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "#282828",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    success: { iconTheme: { primary: "#1DB954", secondary: "#fff" } }
                  }}
                />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="search" element={<Search />} />
                  <Route path="trending" element={<Trending />} />
                  <Route path="albums" element={<Albums />} />
                  <Route path="artists" element={<Artists />} />
                  <Route path="genres" element={<Genres />} />
                  <Route path="library" element={<Library />} />
                  <Route path="artist-studio" element={<ArtistStudio />} />
                  <Route path="now-playing" element={<NowPlaying />} />
                  <Route path="lyrics" element={<Lyrics />} />
                  <Route path="queue" element={<Queue />} />
                  <Route path="history" element={<History />} />
                  <Route path="downloads" element={<Downloads />} />
                  <Route path="track/:id" element={<SongDetails />} />
                  <Route path="song/:id" element={<SongDetails />} />
                  <Route path="artist/:id" element={<ArtistDetails />} />
                  <Route path="album/:id" element={<AlbumDetails />} />
                  <Route path="favorites" element={<Favorites />} />
                  <Route path="playlists" element={<Playlists />} />
                  <Route path="playlists/:id" element={<PlaylistDetails />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="ai-chat" element={<AIChat />} />
                  <Route path="recommendations" element={<AIRecommendations />} />
                  <Route path="recommendation-history" element={<RecommendationHistory />} />
                  <Route path="smart-search" element={<SmartSearch />} />
                  <Route path="generate-playlist" element={<GeneratedPlaylist />} />
                  <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="admin/artists" element={<AdminRoute><AdminArtists /></AdminRoute>} />
                  <Route path="admin/songs" element={<AdminRoute><AdminSongs /></AdminRoute>} />
                  <Route path="admin/albums" element={<AdminRoute><AdminAlbums /></AdminRoute>} />
                  <Route path="admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                  <Route path="admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                  <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PlayerProvider>
          </MusicProvider>
        </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
