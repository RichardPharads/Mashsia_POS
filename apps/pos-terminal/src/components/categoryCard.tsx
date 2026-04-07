type CategoryCardProps = {
    title: string;
    count: number;
    icon: React.ReactNode;
    color?: string;
    onClick?: () => void;
  };
  
  export default function CategoryCard({
    title,
    count,
    icon,
    color = "#BFFFD5",
    onClick,
  }: CategoryCardProps) {
    return (
      <div
        onClick={onClick}
        className={`bg-[#BFFFD5] rounded-2xl p-4 cursor-pointer hover:scale-105 transition w-[164.16px] h-[158.59px] flex flex-col justify-between`}
      >
        <div className=" w-[50px]">{icon}</div>
        <div>
            <div className="font-bold text-[20px]">{title}</div>
            <div className=" opacity-70 text-[13px] font-normal" >{count} items</div>
        </div>
       
      </div>
    );
  }