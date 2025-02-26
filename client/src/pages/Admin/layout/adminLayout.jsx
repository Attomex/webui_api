import {
    AppSidebar,
    AppFooter,
    AppHeader,
} from "../components/index";
import Notification from "../shared/Notification/Notification";

const AdminLayout = ({ children }) => {    
    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppHeader />
                <div className="body flex-grow-1" style={{ paddingRight: "20px" }}>
                    {children}
                    <Notification />
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

// export default withAuth(AdminLayout);
export default AdminLayout;