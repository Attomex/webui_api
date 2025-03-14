import React, { useState } from "react";
import api from "../../../utils/api";
import c from "./pagesModules/Search.module.css";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Конфигурация фильтров
  const filtersConfig = [
    { key: "computer_name",       label: "Название ПК",               maxCount: 1,    hint: "Добавить фильтр по названию ПК" },
    { key: "report_date",         label: "Дата отчёта",               maxCount: 1,    hint: "Добавить фильтр по дате отчёта" },
    { key: "vulnerability_id",    label: "Идентификатор уязвимости",  maxCount: 2,    hint: "Добавить фильтр по идентификатору уязвимости" },
    { key: "filename",            label: "Название файла",            maxCount: 1,    hint: "Добавить фильтр по названию файла" },
    { key: "report_number",       label: "Номер отчёта",              maxCount: 1,    hint: "Добавить фильтр по номеру отчёта" },
  ];

  // Обработчик изменения значения в input
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик добавления фильтра в input
  const handleAddFilter = (filterKey) => {
    const filter = filtersConfig.find((f) => f.key === filterKey);
    if (!filter) return;

    const currentCount = (searchQuery.match(new RegExp(`${filterKey}:`, "g")) || []).length;

    if (currentCount >= filter.maxCount) {
      alert(`Максимальное количество добавлений для "${filter.label}" — ${filter.maxCount}`);
      return;
    }

    const newQuery = searchQuery ? `${searchQuery}, ${filterKey}: ` : `${filterKey}: `;
    setSearchQuery(newQuery);
  };

  // Обработчик отправки запроса
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const filters = searchQuery.split(",").reduce((acc, item) => {
        const [key, value] = item.split(":").map((str) => str.trim());
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      let isValid = true;
      for (const filter of filtersConfig) {
        const currentCount = (searchQuery.match(new RegExp(`${filter.key}:`, "g")) || []).length;
        if (currentCount > filter.maxCount) {
          isValid = false;
          alert(`Превышено максимальное количество добавлений для "${filter.label}" — ${filter.maxCount}`);
          break;
        }
      }

      if (!isValid) {
        return;
      }

      const response = await api().get("/api/search", {
        params: filters,
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Ошибка при выполнении поиска:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={c.container}>
      <h2 className={c.title}>Поиск</h2>
      {/* Главная подсказка */}
      <div className={c.hint}>
        Введите запрос в формате: <code>computer_name: pc_34dddw, report_date: 28-12-2024</code>
      </div>
      {/* Форма поиска */}
      <form onSubmit={handleSearchSubmit} className={c.form}>
        <input
          type="text"
          placeholder="Введите запрос, например: computer_name: pc_34dddw, report_date: 28-12-2024"
          value={searchQuery}
          onChange={handleInputChange}
          className={c.input}
        />
        {/* Кнопки для добавления фильтров */}
        <div className={c.buttonsContainer}>
          {filtersConfig.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleAddFilter(filter.key)}
              title={filter.hint}
              className={c.filterButton}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {/* Кнопка поиска */}
        <button type="submit" disabled={isLoading} className={c.submitButton}>
          {isLoading ? "Поиск..." : "Найти"}
        </button>
      </form>
      {/* Результаты поиска */}
      {searchResults.length > 0 ? (
        <table className={c.resultsTable}>
          <thead>
            <tr>
              <th className={c.tableHeader}>Название ПК</th>
              <th className={c.tableHeader}>Дата отчёта</th>
              <th className={c.tableHeader}>Идентификатор уязвимости</th>
              <th className={c.tableHeader}>Название файла</th>
              <th className={c.tableHeader}>Номер отчёта</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((result, index) => (
              <tr key={index} className={c.tableRow}>
                <td className={c.tableCell}>{result.computer_name}</td>
                <td className={c.tableCell}>{result.report_date}</td>
                <td className={c.tableCell}>{result.vulnerability_id}</td>
                <td className={c.tableCell}>{result.filename}</td>
                <td className={c.tableCell}>{result.report_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={c.noResults}>Ничего не найдено.</p>
      )}
    </div>
  );
};

export default Search;