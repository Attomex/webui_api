// deleteReport.js
import axios from "axios";
import { showErrorNotification } from "../shared/Notification/Notification";

export const handleDeleteReport = async (
    selectedReportNumber,
    selectedDate,
    handleCloseModal
) => {
    try {
        const response = await axios.delete(`/admin/view/`, {
            data: {
                report_number: selectedReportNumber,
                report_date: selectedDate,
            },
        });
        handleCloseModal();
        alert(response.data.message);
        window.location.reload(true);
    } catch (error) {
        showErrorNotification(
            error.response?.data?.error || "An error occurred"
        );
    }
};
