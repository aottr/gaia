import React from 'react';
import Select from 'react-select';
import classNames from 'classnames';

type SelectProps = {
    options?: SelectValue[];
    isClearable?: boolean;
    isDisabled?: boolean;
};
export type SelectValue = {
    label: string;
    value: string;
}

const SelectField: React.FC<SelectProps & { label: string, value?: SelectValue, defaultValue?: SelectValue, onChange: (value: SelectValue | undefined) => void }> = ({ options, label, value, defaultValue, onChange, ...rest }) => {


    return <div className="form-control w-full p-2">
        <label className="label">
            <span className="label-text" aria-label={label}>{label}</span>
        </label>
        <Select
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: '#4e4f56',
                    background: '#23252f',
                    color: '#9aa1ad',
                    borderRadius: '7px',
                    padding: '5px',
                    '&:hover': {
                        borderColor: '#4e4f56',
                    },
                    boxShadow: 'none',
                }),
                input: (baseStyles) => ({
                    ...baseStyles,
                    color: '#9aa1ad',
                }),
                placeholder: (baseStyles) => ({
                    ...baseStyles,
                    color: '#9aa1ad',
                }),
                singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: '#9aa1ad',
                }),
                dropdownIndicator: (baseStyles) => ({
                    ...baseStyles,
                    color: '#9aa1ad',
                }),
                menu: (baseStyles) => ({
                    ...baseStyles,
                    background: '#23252f',
                    borderRadius: '7px',
                }),
                menuList: (baseStyles) => ({
                    ...baseStyles,
                    background: '#14151a',
                    borderRadius: '7px',
                }),
                option: (baseStyles, state) => ({
                    ...baseStyles,
                    color: '#9aa1ad',
                    backgroundColor: state.isSelected ? '#23252f' : '#14151a',
                    "&:hover": {
                        background: "#23252f",
                    },
                }),
            }}
            value={value}
            onChange={(value) => onChange(value || undefined)}
            options={options} {...rest} defaultValue={defaultValue} isSearchable />
    </div>;
};

export default SelectField;
