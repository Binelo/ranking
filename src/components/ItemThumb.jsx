export default function ItemThumb({ item, className = 'item-thumb', size }) {
  const style = size
    ? { width: size, height: size, aspectRatio: 'auto', margin: 0, fontSize: size / 2.5, borderRadius: 8, flexShrink: 0, objectFit: 'cover' }
    : undefined;
  if (item?.image) return <img src={item.image} alt={item.name} className={className} style={style} loading="lazy" />;
  return (
    <div className="item-thumb-placeholder" style={style}>
      {(item?.name || '?')[0].toUpperCase()}
    </div>
  );
}
