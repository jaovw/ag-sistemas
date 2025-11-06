export default function Button({ children, variant = 'primary', ...props }: any) {
  const cls = variant === 'ghost' ? 'btn ghost' : 'btn';
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
