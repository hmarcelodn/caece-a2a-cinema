import Image from "next/image";

type LumusMascotProps = {
  className?: string;
  size?: number;
};

export default function LumusMascot({
  className = "",
  size = 80,
}: LumusMascotProps) {
  return (
    <Image
      src="/lumus-mascot.png"
      alt="Lumus Mascota"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      priority
    />
  );
}
