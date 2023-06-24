interface InputProps<K extends string, V extends string> {
  label: string;
  labelClassName?: string;
  name: K;
  value?: V;
  placeholder: string;
  inputStyle?: React.CSSProperties;
  onChange: (name: K, value: V) => void;
}

export const InlineInput = <K extends string>({
  label,
  labelClassName,
  name,
  value = "",
  placeholder,
  inputStyle = {},
  onChange,
}: InputProps<K, string>) => {
  return (
    <label
      className={`flex gap-2 text-base font-medium text-gray-700 ${labelClassName}`}
    >
      <span className="w-28">{label}</span>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-[5rem] border-b border-gray-300 text-center font-semibold leading-3 outline-none"
        style={inputStyle}
      />
    </label>
  );
};
