import { useEffect, useState } from "react";
import api from "../api/axios";

export function EventsTable() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchEvents = async (query = "", url = null) => {
    try {
      setLoading(true);
      const res = await api.get(url || "/events/", {
        params: url
          ? {}
          : {
              search: query,
              start_date: startDate || undefined,
              end_date: endDate || undefined,
              limit: 10,
            },
      });

      const data = res.data;
      setEvents(data?.results ?? []);
      setNext(data?.next ?? null);
      setPrevious(data?.previous ?? null);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchEvents(search), 300);
    return () => clearTimeout(t);
  }, [search, startDate, endDate]);

  return (
    <section className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Events</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <div>
          <label className="block text-xs text-gray-500 mb-1">Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => fetchEvents(search)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm
                     hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {["Title", "Hub", "Created By", "Start", "End"].map((h) => (
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading events…
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {e.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.hub_name ?? e.hub}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.created_by_username ?? e.created_by}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(e.start_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.end_time
                      ? new Date(e.end_time).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <button
          disabled={!previous}
          onClick={() => fetchEvents(search, previous)}
          className="px-4 py-2 text-sm font-medium border rounded-lg
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          disabled={!next}
          onClick={() => fetchEvents(search, next)}
          className="px-4 py-2 text-sm font-medium border rounded-lg
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </section>
  );
}
