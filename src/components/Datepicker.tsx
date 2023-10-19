import Datepicker from "tailwind-datepicker-react";
import { useState } from 'react';

const DatePickerComponent = ({ onChange, large, defaultValue }: { onChange: ((date: Date) => void) | undefined, large?: boolean, defaultValue?: Date }) => {

    const [show, setShow] = useState<boolean>(false);

    return (
        <Datepicker classNames='relative' options={
            {
                clearBtn: false,
                autoHide: true,
                defaultDate: defaultValue || new Date(),
                theme: {
                    background: "bg-neutral",
                    todayBtn: "bg-primary hover:bg-primary text-primary-content",
                    clearBtn: "",
                    icons: "",
                    text: "text-primary hover:bg-primary hover:text-primary-content",
                    disabledText: "",
                    input: `input input-bordered ${large && 'input-lg'} bg-base-100 text-base-100-content border-gray-600`,
                    inputIcon: "",
                    selected: "bg-primary hover:bg-primary",
                },
            }
        } show={show} setShow={setShow} onChange={onChange} />
    )
}

export default DatePickerComponent;