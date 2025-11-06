export default function Field({
  label,
  name,
  type = 'text',
  placeholder,
  rows,
  as = 'input',
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  rows?: number;
  as?: 'input' | 'textarea';
}) {
  if (as === 'textarea') {
    return (
      <div>
        <label className="label" htmlFor={name}>{label}</label>
        <textarea name={name} id={name} rows={rows ?? 4} className="textarea" placeholder={placeholder} />
      </div>
    );
  }
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="input" placeholder={placeholder} />
    </div>
  );
}
