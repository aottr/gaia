const TextField = ({ label, defaultValue, value, placeholder, disabled, onChange }: { label: string, defaultValue?: string, value?: string, placeholder?: string, disabled?: boolean, onChange?: (value: string) => void }) => <div className="form-control w-full p-2">
    <label className="label">
        <span className="label-text" aria-label={label}>{label}</span>
    </label>
    <input type="text" placeholder={placeholder} className="input input-bordered w-full" value={value} defaultValue={defaultValue} disabled={disabled} onChange={(e) => onChange && onChange(e.target.value)} />
</div>

export default TextField;
