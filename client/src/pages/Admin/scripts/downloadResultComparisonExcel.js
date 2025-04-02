import ExcelJS from 'exceljs';

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

const downloadResultComparisonExcel = (
    user,
    selectedComputer,
    selectedNewDate,
    selectedOldDate,
    selectedNewReportNumber,
    selectedOldReportNumber,
    errorLevelsNew,
    errorLevelsOld,
    data
) => {
    let Date_now = getCurrentDate();
    const formattedNewDate = formatDate(selectedNewDate);
    const formattedOldDate = formatDate(selectedOldDate);

    // Ширина столбцов
    const columnWidths = {
        "Идентификатор уязвимости": 18,
        "Уровень ошибки": 16,
        "CPE": 25,
        "Название уязвимости": 30,
        "Описание": 80,
        "Рекомендации": 50,
        "Ссылки на источники": 90,
        "Ссылки на файлы": 120,
    };

    const totalErrorLevelsNew = errorLevelsNew.critical + errorLevelsNew.high + errorLevelsNew.medium + errorLevelsNew.low;
    const totalErrorLevelsOld = errorLevelsOld.critical + errorLevelsOld.high + errorLevelsOld.medium + errorLevelsOld.low;

    const changesErrorLevels = [
        errorLevelsNew.critical - errorLevelsOld.critical,
        errorLevelsNew.high - errorLevelsOld.high,
        errorLevelsNew.medium - errorLevelsOld.medium,
        errorLevelsNew.low - errorLevelsOld.low,
    ];

    const dataErrorLevels = [
        [
          "Уязвимостей в новом отчёте",
          errorLevelsNew.critical,
          errorLevelsNew.high,
          errorLevelsNew.medium,
          errorLevelsNew.low,
          totalErrorLevelsNew,
        ],
        [
          "Уязвимостей в старом отчёте",
          errorLevelsOld.critical,
          errorLevelsOld.high,
          errorLevelsOld.medium,
          errorLevelsOld.low,
          totalErrorLevelsOld,
        ],
        ["Изменения", ...changesErrorLevels],
      ];

    // Создаем новую книгу
    const workbook = new ExcelJS.Workbook();

    // 1. Лист "Информация"
    const infoSheet = workbook.addWorksheet("Информация");
    // Устанавливаем ширину столбцов для листа "Информация"
    infoSheet.columns = [
        { key: 'A', width: 30 },
        { key: 'B', width: 40 },
    ];
    infoSheet.addRow(["Параметр", "Значение"]);
    infoSheet.addRow(["Почта администратора", user.email]);
    infoSheet.addRow(["Имя администратора", user.name]);
    infoSheet.addRow([]);
    infoSheet.addRow(["Идентификатор компьютера", selectedComputer]);
    infoSheet.addRow([]);
    infoSheet.addRow(["Дата нового отчёта", formattedNewDate]);
    infoSheet.addRow(["Дата старого отчёта", formattedOldDate]);
    infoSheet.addRow([]);
    infoSheet.addRow(["Номер нового отчёта", selectedNewReportNumber]);
    infoSheet.addRow(["Номер старого отчёта", selectedOldReportNumber]);
    infoSheet.addRow([]);
    infoSheet.addRow(["Дата загрузки результатов", Date_now]);
    infoSheet.addRow([]);
    // infoSheet.addRow(["", "Критических", "Высоких", "Средних", "Низких", "Всего"]);
    // infoSheet.addRow([
    //     "Уязвимостей в новом отчёте",
    //     errorLevelsNew.critical,
    //     errorLevelsNew.high,
    //     errorLevelsNew.medium,
    //     errorLevelsNew.low,
    //     totalErrorLevelsNew,
    // ]);
    // infoSheet.addRow([
    //     "Уязвимостей в старом отчёте",
    //     errorLevelsOld.critical,
    //     errorLevelsOld.high,
    //     errorLevelsOld.medium,
    //     errorLevelsOld.low,
    //     totalErrorLevelsOld,
    // ]);
    // infoSheet.addRow(["Изменения", ...changesErrorLevels]);

    infoSheet.addTable({
        name: 'InfoErrorLevels', // Имя таблицы (опционально)
        ref: 'D1', 
        headerRow: true, // Показывать заголовок
        totalsRow: false, // Итоговая строка (не нужна)
        style: {
          theme: 'TableStyleMedium9', // Встроенный стиль Excel (можно кастомный)
          showRowStripes: true, // Чередование строк (true/false)
        },
        columns: [
          { name: 'Описание' },
          { name: 'Критические' },
          { name: 'Высокие' },
          { name: 'Средние' },
          { name: 'Низкие' },
          { name: 'Всего' },
        ],
        rows: dataErrorLevels,
    });

    infoSheet.getColumn('D').width = 30;
    ['E', 'F', 'G', 'H'].forEach((col) => infoSheet.getColumn(col).width = 13);
    infoSheet.getColumn('I').width = 10;


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
        "CPE",
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
            vulnerability.cpe, // CPE
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