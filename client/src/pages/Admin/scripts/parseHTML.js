import moment from "moment";

export async function parseHTML(htmlContent, computerIdentifier) {
    try {
        const startTime = performance.now();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        if (!doc || !doc.querySelector) {
          throw new Error('Ошибка парсинга документа');
        }

        const Identifier = computerIdentifier;

        function getNextSiblingTextContent(element, text) {
            const tdElements = doc.querySelectorAll(element);
            if (tdElements.length === 0 || !tdElements) {
              throw new Error("Не было найдено элементов");
            }
            for (let i = 0; i < tdElements.length; i++) {
                if (tdElements[i].textContent.includes(text)) {
                    return tdElements[i].nextElementSibling.textContent.trim();
                }
            }
            return "";
        }

        const reportNumber = getNextSiblingTextContent("td.key", "№ отчета");
        let reportDate = getNextSiblingTextContent("td.key", "Формирование отчета");

        reportDate = moment(reportDate, "DD.MM.YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

        const vulnerabilities = [];
        const vulnerabilityFiles = {};
        const uniqueFiles = new Set();
        let vulnerabilityCounter = 1; // Счетчик для уязвимостей

        // Парсинг первой таблицы с уязвимостями
        const vulnerabilitiesTable = doc.querySelector(".vulnerabilitiesTbl");
        const vulnerabilityRows = vulnerabilitiesTable.querySelectorAll("tr");

        let currentVulnerabilityId = null;
        let currentVulnerabilityCounter = null;

        vulnerabilityRows.forEach((row) => {
            const idElem = row.querySelector("td.bdu");
            if (idElem) {
                currentVulnerabilityId = idElem.innerHTML.replace(/<br\s*\/?>/gi, "; ").trim();
                currentVulnerabilityCounter = vulnerabilityCounter++;
                vulnerabilityFiles[currentVulnerabilityCounter] = {
                    vulnerabilityID: currentVulnerabilityId,
                    cpe: [],
                    files: [],
                };
            }

            const fileCPE = row.querySelector('td[class*="prods"]');
            if (fileCPE && currentVulnerabilityCounter) {
                const cpeContent = fileCPE.innerHTML.trim();
                const cpeInfo = cpeContent ? cpeContent.split(/<br\s*\/?>/gi).map((cpe) => cpe.trim() || "Неизвестно") : ["Неизвестно"];

                vulnerabilityFiles[currentVulnerabilityCounter].cpe.push(...cpeInfo);
            }

            const filesElem = row.querySelector("td.desc.fileslist");
            if (filesElem && currentVulnerabilityCounter) {
                const fileContent = filesElem.innerHTML.trim();
                const fileInfo = fileContent
                    ? fileContent.split(/<br\s*\/?>/gi).map((file) => file.trim() || "Ссылка не найдена")
                    : ["Ссылка не найдена"];
                vulnerabilityFiles[currentVulnerabilityCounter].files.push(...fileInfo);
                fileInfo.forEach((file) => uniqueFiles.add(file));
                // const fileInfo = filesElem.innerHTML.trim().split(/<br\s*\/?>/gi).map(file => file.trim());
                // vulnerabilityFiles[currentVulnerabilityCounter].files.push(...fileInfo);
                // fileInfo.forEach(file => uniqueFiles.add(file));
            }
        });

        // Парсинг второй таблицы с деталями уязвимостей
        const tables = doc.querySelectorAll(".vulnerabilitiesListTbl");
        vulnerabilityCounter = 1; // Сбрасываем счетчик для второй таблицы

        tables.forEach((table) => {
            const rows = table.querySelectorAll("tr");
            let error_level = "";
            rows.forEach((row) => {
                const errorLevelElem = row.querySelector("td.valueMargin");
                if (errorLevelElem && errorLevelElem.textContent.includes("Уровень опасности:")) {
                    error_level = errorLevelElem.textContent.replace("Уровень опасности:", "").trim();
                }
                const idElem = row.querySelector("td.font10pt.title.key");
                if (idElem) {
                    const id = idElem.innerHTML.replace(/<br\s*\/?>/gi, "; ").trim();
                    const titleElem = row.querySelector("td.font10pt.bold.value.valueMargin");
                    const title = titleElem ? titleElem.textContent.trim() : "";
                    const descriptionElem = row.nextElementSibling?.nextElementSibling?.querySelector("td");
                    const description = descriptionElem ? descriptionElem.textContent.trim() : "";
                    const measuresElem = row.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.querySelector("td");
                    const measuresHtml = measuresElem ? measuresElem.innerHTML.trim() : "";
                    const measures = measuresHtml
                        .replace(/<br\s*\/?>/gi, "\n")
                        .replace(/&nbsp;/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                    const references = [];
                    const refElems =
                        row.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.querySelectorAll(
                            ".ref_ref a"
                        );
                    refElems?.forEach((refElem) => {
                        const href = refElem.getAttribute("href");
                        if (href) {
                            references.push(href);
                        } else {
                            const refIdElem = refElem.parentElement.previousElementSibling;
                            if (refIdElem && refIdElem.classList.contains("ref_id") && refIdElem.textContent.startsWith("ALRT.")) {
                                const alrtId = refIdElem.textContent.trim().replace("ALRT.", "").replace(/\s.*$/, "");
                                references.push(`https://safe-surf.ru/upload/ALRT/ALRT-${alrtId}.pdf`);
                            }
                        }
                    });

                    // Получаем файлы по текущему счетчику
                    const files = vulnerabilityFiles[vulnerabilityCounter]?.files || [];
                    const cpe = vulnerabilityFiles[vulnerabilityCounter]?.cpe || [];
                    vulnerabilityCounter++;

                    vulnerabilities.push({
                        id: id,
                        error_level: error_level,
                        title: title,
                        description: description,
                        measures: measures,
                        references: references,
                        fileCPE: cpe,
                        files: files,
                    });
                }
            });
        });

        // Парсинг таблицы статистики
        const statTable = doc.querySelector(".statTable");
        const statRows = statTable.querySelectorAll("tr");
        let totalCritical = 0;
        let totalHigh = 0;
        let totalMedium = 0;
        let totalLow = 0;

        statRows.forEach((row) => {
            const keyElem = row.querySelector("td.key");
            if (keyElem) {
                const keyText = keyElem.textContent.trim();
                const valueElem = row.querySelector("td:nth-child(2)");
                const value = valueElem ? parseInt(valueElem.textContent.trim(), 10) : 0;

                if (keyText.includes("Критический")) {
                    totalCritical = value;
                } else if (keyText.includes("Высокий")) {
                    totalHigh = value;
                } else if (keyText.includes("Средний")) {
                    totalMedium = value;
                } else if (keyText.includes("Низкий")) {
                    totalLow = value;
                }
            }
        });

        const parsedData = {
            computerIdentifier: Identifier,
            reportNumber: reportNumber,
            reportDate: reportDate,
            vulnerabilities: vulnerabilities,
            totalCritical: totalCritical,
            totalHigh: totalHigh,
            totalMedium: totalMedium,
            totalLow: totalLow,
        };

        const uniqueFilesData = {
            uniqueFiles: Array.from(uniqueFiles),
        };

        const endTime = performance.now();
        const parseDuration = endTime - startTime;

        return { parsedData, uniqueFilesData, parseDuration };
    } catch (err) {
        // здесь мы можем залогировать ошибку, если нужно:
        // console.error("parseHTML error:", err);
        // и пробросить её дальше
        throw new Error(`Ошибка при разборе отчёта: ${err.message}`);
    }
}
