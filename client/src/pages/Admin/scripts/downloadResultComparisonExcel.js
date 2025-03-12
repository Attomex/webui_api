import ExcelJS from 'exceljs';

function getCurrentDate(separator = ".") {
    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    return `${date}${separator}${
        month < 10 ? `0${month}` : `${month}`
    }${separator}${year}`;
}

function formatDate(dateString, separator = ".") {
    const [year, month, day] = dateString.split("-");
    return `${day}${separator}${month}${separator}${year}`;
}

const downloadResultComparisonExcel = (
    selectedComputer,
    selectedNewDate,
    selectedOldDate,
    selectedNewReportNumber,
    selectedOldReportNumber,
    data
) => {
    let Date_now = getCurrentDate(".");
    const formattedNewDate = formatDate(selectedNewDate);
    const formattedOldDate = formatDate(selectedOldDate);

    // Ширина столбцов
    const columnWidths = {
        "Идентификатор уязвимости": 18,
        "Уровень ошибки": 16,
        "Название уязвимости": 30,
        "Описание": 80,
        "Рекомендации": 50,
        "Ссылки на источники": 90,
        "Ссылки на файлы": 120,
    };

    // Создаем новую книгу
    const workbook = new ExcelJS.Workbook();

    // 1. Лист "Информация"
    const infoSheet = workbook.addWorksheet("Информация");
    // Устанавливаем ширину столбцов для листа "Информация"
    infoSheet.columns = [
        { header: "Параметр", key: "param", width: 30 },
        { header: "Значение", key: "value", width: 40 },
    ];
    infoSheet.addRow(["Идентификатор компьютера", selectedComputer]);
    infoSheet.addRow(["Дата нового отчёта", formattedNewDate]);
    infoSheet.addRow(["Дата старого отчёта", formattedOldDate]);
    infoSheet.addRow(["Номер нового отчёта", selectedNewReportNumber]);
    infoSheet.addRow(["Номер старого отчёта", selectedOldReportNumber]);
    infoSheet.addRow(["Дата загрузки результатов", Date_now]);

    // 2. Лист "Появившиеся уязвимости"
    const appearedSheet = workbook.addWorksheet("Появившиеся уязвимости");
    addVulnerabilitiesSheet(appearedSheet, data.appeared_vulnerabilities, columnWidths);

    // 3. Лист "Оставшиеся уязвимости"
    const remainingSheet = workbook.addWorksheet("Оставшиеся уязвимости");
    addVulnerabilitiesSheet(remainingSheet, data.remaining_vulnerabilities, columnWidths);

    // 4. Лист "Исправленные уязвимости"
    const fixedSheet = workbook.addWorksheet("Исправленные уязвимости");
    addVulnerabilitiesSheet(fixedSheet, data.fixed_vulnerabilities, columnWidths);

    // Генерируем файл и запускаем скачивание
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedComputer}_${selectedNewReportNumber}_${Date_now}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
};

// Вспомогательная функция для добавления данных на лист с уязвимостями
const addVulnerabilitiesSheet = (sheet, vulnerabilities, columnWidths) => {
    // Заголовки столбцов
    const headers = [
        "Идентификатор уязвимости",
        "Уровень ошибки",
        "Название уязвимости",
        "Описание",
        "Рекомендации",
        "Ссылки на источники",
        "Ссылки на файлы",
    ];

    // Добавляем заголовки
    sheet.addRow(headers);

    // Устанавливаем ширину столбцов
    headers.forEach((header, index) => {
        sheet.getColumn(index + 1).width = columnWidths[header] || 30;
    });

    // Добавляем данные
    vulnerabilities.forEach((vulnerability) => {
        const rowData = [
            vulnerability.identifiers.join(", "), // Идентификаторы через запятую
            vulnerability.error_level, // Уровень ошибки
            vulnerability.name, // Название уязвимости
            vulnerability.description, // Описание
            vulnerability.remediation_measures, // Рекомендации
            vulnerability.source_links.join("\n"), // Ссылки на источники
            vulnerability.files.join("\n"), // Ссылки на файлы
        ];
        const row = sheet.addRow(rowData);

        // Устанавливаем автоперенос текста для каждой ячейки
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = { wrapText: true };
        });
    });
};

export default downloadResultComparisonExcel;