type ProductCardProps = {
  name: string;
  price: number;
  image?: string;
  onClick?: () => void;
};

export default function ProductCard({
  name,
  price,
  image,
  onClick,
}: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-800 rounded-2xl p-4 cursor-pointer hover:bg-zinc-700 transition  w-[164.16px] h-[158.59px]"
    >
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-28 object-contain mb-2"
        />
      )}

      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-400">₱{price.toFixed(2)}</div>
    </div>
  );
}