import { useState } from "react";
import api from "../api/axios";


export default function UploadUsersExcel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      alert("Select an Excel file first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/users/upload/", formData);
      console.log(res.data);

      if (res.data.errors?.length) {
        console.warn("Upload errors:", res.data.errors);
          }

      alert(`Uploaded ${res.data.created_count} users`);

      // alert(`Uploaded ${res.data.length} users`);
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload Users (Excel)</h3>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button style={{ marginTop: "1rem" }} onClick={upload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

