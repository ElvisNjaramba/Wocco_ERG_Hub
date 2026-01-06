import CreateUserForm from "../auth/CreateUserForm";
import UploadUsersExcel from "../auth/UploadUsersExcel";

export default function SuperUserDashboard() {
  return (
    <div>
      <h1>Superuser Dashboard</h1>
      <CreateUserForm />
      <UploadUsersExcel />
    </div>
  );
}
