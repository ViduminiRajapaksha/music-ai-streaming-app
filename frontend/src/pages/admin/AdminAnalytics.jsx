import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBarChart2 } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const ListBlock = ({ title, items, render }) => (
  <section className="bg-spotify-dark/50 rounded-xl p-5">
    <h2 className="font-bold mb-4">{title}</h2>
    <div className="space-y-3">
      {items?.length ? items.map(render) : <p className="text-sm text-spotify-light">No data yet.</p>}
    </div>
  </section>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await adminService.getAnalytics());
      } catch (err) {
        toast.error(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  const listeningHours = Math.round(((data?.listeningTime?.totalMs || 0) / 1000 / 60 / 60) * 10) / 10;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><FiBarChart2 className="text-spotify-green" /> Analytics</h1>
        <p className="text-spotify-light mt-1">Top songs, artists, revenue, downloads, listening time, AI usage, moods, and genres.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">Listening Time</p>
          <p className="text-3xl font-bold mt-2">{listeningHours}h</p>
        </div>
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">Premium Revenue</p>
          <p className="text-3xl font-bold mt-2">${data?.revenue?.monthlyRecurringRevenue || 0}</p>
        </div>
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">Listening Events</p>
          <p className="text-3xl font-bold mt-2">{data?.listeningTime?.events || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ListBlock
          title="Top Songs"
          items={data?.topSongs}
          render={(song) => (
            <p key={song._id} className="flex justify-between gap-3 text-sm"><span className="truncate">{song.title}</span><span>{song.plays} plays</span></p>
          )}
        />
        <ListBlock
          title="Top Artists"
          items={data?.topArtists}
          render={(artist) => (
            <p key={artist._id} className="flex justify-between gap-3 text-sm"><span>{artist._id}</span><span>{artist.plays} plays</span></p>
          )}
        />
        <ListBlock
          title="Popular Mood"
          items={data?.popularMoods}
          render={(mood) => (
            <p key={mood._id} className="flex justify-between gap-3 text-sm"><span>{mood._id}</span><span>{mood.count} requests</span></p>
          )}
        />
        <ListBlock
          title="AI Usage"
          items={data?.aiUsage}
          render={(usage) => (
            <p key={usage._id} className="flex justify-between gap-3 text-sm"><span>{usage._id}</span><span>{usage.count}</span></p>
          )}
        />
        <ListBlock
          title="Trending Genres"
          items={data?.trendingGenres}
          render={(genre) => (
            <p key={genre._id} className="flex justify-between gap-3 text-sm"><span>{genre._id}</span><span>{genre.plays} plays</span></p>
          )}
        />
        <ListBlock
          title="Most Requested Songs"
          items={data?.mostRequestedSongs}
          render={(request) => (
            <p key={request._id} className="flex justify-between gap-3 text-sm"><span className="truncate">{request._id}</span><span>{request.count}</span></p>
          )}
        />
      </div>
    </motion.div>
  );
};

export default AdminAnalytics;
