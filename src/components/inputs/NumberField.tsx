const NumberField = ({ label, defaultValue, value, placeholder, disabled, onChange, min, max, className }: { label: string, defaultValue?: number, value?: number, placeholder?: string, disabled?: boolean, onChange: (value: number) => void, min?: number, max?: number, className?: string }) => <div className="form-control w-full p-2">
    <label className="label">
        <span className="label-text" aria-label={label}>{label}</span>
    </label>
    <input type="number" placeholder={placeholder} className={`input input-bordered w-full ${className}`} value={value} defaultValue={defaultValue} disabled={disabled} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />
</div>

export default NumberField;
