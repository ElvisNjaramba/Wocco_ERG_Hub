import { useState } from "react";
import api from "../api/axios";

export default function UploadUsersExcel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const upload = async () => {
    if (!file) {
      alert("Please select an Excel file first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/users/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data);
      alert(`Uploaded ${res.data.length} users successfully`);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Upload Users via Excel</h3>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />

      <br />

      <button onClick={upload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
