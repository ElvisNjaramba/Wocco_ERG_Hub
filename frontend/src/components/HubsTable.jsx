import { useEffect, useState } from "react";
import api from "../api/axios";

export function HubsTable() {
  const [hubs, setHubs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchHubs = async (url = "/hubs/", query = "") => {
    try {
      setLoading(true);
      const res = await api.get(url, {
        params: url === "/hubs/" ? { search: query, limit: 10 } : {},
      });

      const data = res.data;
      setHubs(Array.isArray(data) ? data : data.results ?? []);
      setNext(data.next ?? null);
      setPrevious(data.previous ?? null);
    } catch (err) {
      console.error("Failed to load hubs:", err);
      setHubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchHubs("/hubs/", search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <section className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Hubs</h2>

        <input
          type="text"
          placeholder="Search hubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {["Name", "Admin", "Members"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Loading hubs…
                </td>
              </tr>
            ) : hubs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No hubs found
                </td>
              </tr>
            ) : (
              hubs.map((hub) => (
                <tr
                  key={hub.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {hub.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{hub.admin}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {hub.members_count ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          disabled={!previous}
          onClick={() => previous && fetchHubs(previous)}
          className="px-4 py-2 text-sm font-medium border rounded-lg
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          disabled={!next}
          onClick={() => next && fetchHubs(next)}
          className="px-4 py-2 text-sm font-medium border rounded-lg
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </section>
  );
}
