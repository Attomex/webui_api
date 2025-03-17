import ExcelJS from "exceljs";

function getCurrentDate(separator = ".") {
    const newDate = new Date();
    // Получаем дату и время по московскому времени (UTC+3)
    const options = {
        timeZone: "Europe/Moscow", // Указываем временную зону (Москва)
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    // Форматируем дату и время
    const formattedDate = newDate.toLocaleString("ru-RU", options);
    // Разделяем дату и время
    const [datePart, timePart] = formattedDate.split(", ");
    // Возвращаем дату и время в нужном формате
    return `${datePart.replace(/\./g, separator)} ${timePart}`;
}

function formatDate(dateString, separator = ".") {
    const [year, month, day] = dateString.split("-");
    return `${day}${separator}${month}${separator}${year}`;
}

const errorLevelToPlural = {
    Критический: "Критические",
    Высокий: "Высокие",
    Средний: "Средние",
    Низкий: "Низкие",
};

const downloadExcel = (
    selectedErrorLevels,
    selectedColumns,
    selectedComputer,
    selectedReportNumber,
    selectedDate,
    errorLevels,
    vulnerabilities
) => {
    let Date_now = getCurrentDate(".");

    const formattedSelectedDate = formatDate(selectedDate);

    // Ширина столбцов
    const columnWidths = {
        "Уровень ошибки": 16,
        "Идентификатор уязвимости": 26,
        "Название уязвимости": 30,
        Описание: 40,
        "Возможные меры по устранению": 50,
        "Ссылки на источники": 60,
        "Ссылки на файлы": 60,
    };

    // Создаем новую книгу
    const workbook = new ExcelJS.Workbook();

    // Добавляем информацию о компьютере на отдельный лист
    const infoSheet = workbook.addWorksheet("Информация");
    infoSheet.columns = [
        { header: "Параметр", key: "param", width: 30 },
        { header: "Значение", key: "value", width: 40 },
    ];
    infoSheet.addRow(["Идентификатор компьютера", selectedComputer]);
    infoSheet.addRow(["Номер отчёта", selectedReportNumber]);
    infoSheet.addRow(["Дата формирования отчёта", formattedSelectedDate]);
    infoSheet.addRow(["Дата загрузки отчёта с сервера", Date_now]);
    infoSheet.addRow([]);
    infoSheet.addRow(["Критических уязвимостей", errorLevels.critical]);
    infoSheet.addRow(["Высоких уязвимостей", errorLevels.high]);
    infoSheet.addRow(["Средних уязвимостей", errorLevels.medium]);
    infoSheet.addRow(["Низких уязвимостей", errorLevels.low]);

    // Создаем стили для каждого уровня ошибок
    // const styles = {
    //     "Критический": { type: 'pattern', pattern: 'solid', fgColor: { argb: '80FF0000' } }, // Красный
    //     "Высокий": { type: 'pattern', pattern: 'solid', fgColor: { argb: '80FFA500' } }, // Оранжевый
    //     "Средний": { type: 'pattern', pattern: 'solid', fgColor: { argb: '80FFFF00' } }, // Желтый
    //     "Низкий": { type: 'pattern', pattern: 'solid', fgColor: { argb: '80008000' } }, // Зеленый
    // };

    // Создаем листы для каждого уровня ошибок
    selectedErrorLevels.forEach((errorLevel) => {
        const pluralErrorLevel = errorLevelToPlural[errorLevel] || errorLevel; // Если уровень не найден, оставляем исходный
        const sheetName = `${pluralErrorLevel} ошибки`; // Формируем название листа
        const sheet = workbook.addWorksheet(sheetName);

        // Добавляем заголовки
        const headerRow = sheet.addRow(
            selectedColumns.map((column) => {
                if (column === "Ссылки на источники")
                    return "Ссылки на источники";
                if (column === "Ссылки на файлы") return "Ссылки на файлы";
                return column;
            })
        );

        // Устанавливаем ширину столбцов
        selectedColumns.forEach((column, index) => {
            const width = columnWidths[column] || 30; // Используем ширину по умолчанию, если она не указана
            sheet.getColumn(index + 1).width = width;
        });

        // Фильтруем уязвимости по уровню ошибки
        const filteredVulnerabilities = vulnerabilities.filter(
            (vulnerability) => vulnerability.error_level === errorLevel
        );

        // Добавляем данные
        filteredVulnerabilities.forEach((vulnerability) => {
            const rowData = selectedColumns.map((column) => {
                if (column === "Уровень ошибки")
                    return vulnerability.error_level;
                if (column === "Идентификатор уязвимости")
                    return vulnerability.identifiers.join(", "); // Идентификаторы через запятую
                if (column === "Название уязвимости") return vulnerability.name;
                if (column === "Описание") return vulnerability.description;
                if (column === "Возможные меры по устранению")
                    return vulnerability.remediation_measures;
                if (column === "Ссылки на источники")
                    return vulnerability.source_links.join("\n");
                if (column === "Ссылки на файлы")
                    return vulnerability.files.join("\n");
                return "";
            });
            const row = sheet.addRow(rowData);

            // Устанавливаем автоперенос текста для каждой ячейки
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { wrapText: true };
                // cell.fill = styles[errorLevel];
            });
        });
    });

    // Генерируем файл и запускаем скачивание
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedComputer}_${selectedReportNumber}_${Date_now}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
};

export default downloadExcel;
