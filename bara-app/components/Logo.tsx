// src/components/Logo.tsx
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function Logo() {
  
  const router = useRouter();
   const handleClick = () => {
     router.push("/");
   };
  return (
    <div className="flex items-center cursor-pointer" onClick={handleClick}>
      <Image
        src="/logo.png"
        alt="Bara App Logo"
        width={79}
        height={79}
        priority
      />
    </div>
  );
}
