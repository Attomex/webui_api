// deleteReport.js
import api from "../../../utils/api";
import { showErrorNotification } from "../shared/Notification/Notification";

export const handleDeleteReport = async (
    selectedComputer,
    selectedReportNumber,
    selectedDate,
    handleCloseModal
) => {
    try {
        const response = await api().delete(`api/admin/view/`, {
            data: {
                computer_identifier: selectedComputer,
                report_number: selectedReportNumber,
                report_date: selectedDate,
            },
        });
        handleCloseModal();
        showErrorNotification(response.data.message);
    } catch (error) {
        showErrorNotification(
            error.response?.data?.error || "Неизвестная ошибка"
        );
    }
};
