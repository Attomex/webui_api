import React from 'react';
import Form from 'react-bootstrap/Form';
import c from '../../pages/pagesModules/ViewReports.module.css';
import '../../pages/pagesModules/ViewReports.css';

const SelectField = ({ label, option, id, value, onChange, options, required, disabled, filterOptions }) => (
    <tr>
        <td>
            <label className={c.label__field}>
                {label}:
            </label>
        </td>
        <td>
            <Form.Select
                className={c.select__field}
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
            >
                <option value="">
                    Выберите {option}
                </option>
                {filterOptions ? filterOptions(options).map((option, index) => (
                    <option
                        key={index}
                        value={option.identifier || option}
                    >
                        {option.identifier || option}
                    </option>
                )) : options.map((option, index) => (
                    <option
                        key={index}
                        value={option.identifier || option}
                    >
                        {option.identifier || option}
                    </option>
                ))}
            </Form.Select>
        </td>
    </tr>
);

export default SelectField;