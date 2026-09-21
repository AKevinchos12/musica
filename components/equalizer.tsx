export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span
      className={`flex items-end gap-0.5 ${className}`}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-0.5 origin-bottom rounded-full bg-current"
          style={{
            height: '14px',
            animation: `equalize 0.9s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
