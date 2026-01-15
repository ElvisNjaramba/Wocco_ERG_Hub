import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchUsers = async (query = "", url = null) => {
    setLoading(true);
    const res = await api.get(url || "/users/all-users/", {
      params: url ? {} : { search: query, limit: 10, offset: 0 },
    });

    setUsers(res.data.results);
    setNext(res.data.next);
    setPrevious(res.data.previous);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Users</h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-72"
          />
          <button
            type="button"
            onClick={() => setSearch("")}
            className="border px-3 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Username</th>
                <th className="text-left py-2">Password</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}

              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.username}</td>
                  <td className="py-2 font-mono">{u.generated_password}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => previous && fetchUsers(search, previous)}
              disabled={!previous}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => next && fetchUsers(search, next)}
              disabled={!next}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
