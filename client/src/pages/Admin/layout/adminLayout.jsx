import {
    AppSidebar,
    AppFooter,
    AppHeader,
} from "../components/index";

const AdminLayout = ({ children }) => {
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppHeader />
                <div className="body flex-grow-1">
                    {children}
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

export default AdminLayout;