"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <div className="relative min-h-screen w-full text-white">
      {/* HERO BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        
        {/* Overlay ปรับโทน + เบลอเล็กน้อย เพื่อให้อ่านง่าย */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* NAVBAR */}
      <header
        className="
          mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5
          bg-[#7B4F2B]/20 backdrop-blur supports-[backdrop-filter]:bg-[#7B4F2B]/15
          border-b border-[#EBCB8B]/50 rounded-b-2xl
        "
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <p className="text-xl font-semibold leading-5 text-[#E5B40C] drop-shadow">
              รากถิ่น
            </p>
            <p className="text-xs text-[#EFEFEF] opacity-90">
              ของดีชุมชนสู่บ้าน รวมพลังคนไทย
            </p>
          </div>
        </div>

        {/* Right: Menu */}
        <nav className="flex items-center gap-6">
          <ul className="hidden items-center gap-2 md:flex">
            <li
              className="
                cursor-pointer rounded-lg px-4 py-2
                text-[#EFEFEF]
                hover:bg-[#EBCB8B]/20 hover:text-white
                ring-1 ring-transparent hover:ring-[#EBCB8B]/60
                transition
              "
              onClick={() => router.push("/product")}
            >
              สินค้าotop
            </li>
          </ul>
        </nav>
      </header>

      {/* HERO CONTENT */}
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-10 sm:pt-16 md:pt-24">
        <h1
          className="
            text-center text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl
            bg-gradient-to-b from-[#E5B40C] to-[#EBCB8B]
            bg-clip-text text-transparent drop-shadow
          "
        >
          เชื่อมไทยด้วยหัวใจเดียวกัน
        </h1>
        <p className="mt-6 max-w-3xl text-center text-lg/8 text-[#EFEFEF] opacity-95">
          สนับสนุนสินค้าชุมชน สร้างรายได้ให้ท้องถิ่น
        </p>
        <p className="mt-1 max-w-3xl text-center text-lg/8 text-[#EFEFEF] opacity-95">
          ซื้อของดีไทย ได้จากทุกที่ทั่วประเทศ
        </p>
      </main>
    </div>
  );
}
