export default function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="text-sm text-gray-600 mb-4">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && ' > '}
          <span className={i === items.length - 1 ? 'font-bold' : ''}>{item}</span>
        </span>
      ))}
    </nav>
  )
}
