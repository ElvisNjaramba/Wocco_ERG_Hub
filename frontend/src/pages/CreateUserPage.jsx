import CreateUserForm from "@/auth/CreateUserForm";
import UsersTable from "@/components/UsersTable";

export default function CreateUserPage() {
    return (
        <>
            <div>
                {/* <h1 className="text-xl font-semibold mb-4">Create User</h1> */}
                <CreateUserForm />
            </div>

            <div>
                <UsersTable />
            </div>
        </>
    );
}
