import UploadUsersExcel from "@/auth/UploadUsersExcel";
import UsersTable from "@/components/UsersTable";

export default function UploadUsersPage() {
    return (
        <>
            <div>
                {/* <h1 className="text-xl font-semibold mb-4">Upload Users</h1> */}
                <UploadUsersExcel />
            </div>
            <div>
                <UsersTable />
            </div>
        </>
    );
}
