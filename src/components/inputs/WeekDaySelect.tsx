import { useState, useEffect } from 'react';
import { Weekday } from '@/helpers/reminder';

const WEEK_DAYS: Weekday[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface WeekDaySelectProps {
    label: string;
    onSelectedDaysChange: (selectedDays: Weekday[]) => void;
    initialSelectedDays?: Weekday[];
}

const WeekDaySelect: React.FC<WeekDaySelectProps> = ({ label, onSelectedDaysChange, initialSelectedDays }) => {

    const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);

    useEffect(() => {
        if (initialSelectedDays) setSelectedDays(initialSelectedDays);
    }, [initialSelectedDays]);

    const handleButtonClick = (day: Weekday) => {
        const newSelectedDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];

        setSelectedDays(newSelectedDays);
        onSelectedDaysChange(newSelectedDays);
    };

    return (
        <div className="form-control w-full p-2">
            <label className="label">
                <span className="label-text" aria-label={label}>{label}</span>
            </label>
            <div className='join'>
                {WEEK_DAYS.map(day => (
                    <span
                        key={day}
                        className={`btn ${selectedDays.includes(day) ? 'btn-primary' : 'btn-neutral'} join-item`}
                        onClick={() => handleButtonClick(day)}
                    >
                        {day}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default WeekDaySelect;

