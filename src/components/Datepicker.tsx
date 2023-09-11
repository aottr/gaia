import Datepicker from "tailwind-datepicker-react";
import { useState } from 'react';

const DatePickerComponent = ({ onChange }: { onChange: ((date: Date) => void) | undefined }) => {

    const [show, setShow] = useState<boolean>(false);

    return (
        <Datepicker options={
            {
                clearBtn: false,
                autoHide: true,
                theme: {
                    background: "bg-neutral",
                    todayBtn: "bg-primary hover:bg-primary text-primary-content",
                    clearBtn: "",
                    icons: "",
                    text: "text-primary hover:bg-primary hover:text-primary-content",
                    disabledText: "",
                    input: "input input-bordered input-lg bg-base-100 text-base-100-content border-gray-600",
                    inputIcon: "",
                    selected: "bg-primary hover:bg-primary",
                },
            }
        } show={show} setShow={setShow} onChange={onChange} />
    )
}

export default DatePickerComponent;