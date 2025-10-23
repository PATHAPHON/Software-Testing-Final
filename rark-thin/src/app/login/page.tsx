"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<"user" | "entrepreneur", string> = {
  user: "/product",
  entrepreneur: "/product",
};

// ✅ รองรับหลายฟิลด์ role
function getRoleFromResponse(data: any): "entrepreneur" | "user" {
  const role =
    data?.usertype ??
    data?.role ??
    data?.user?.usertype ??
    data?.user?.role ??
    "";
  const r = String(role).trim().toLowerCase();
  return r === "entrepreneur" ? "entrepreneur" : "user";
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ ถ้าเคยล็อกอินไว้แล้ว ให้เด้งไปทันที (ทำใน useEffect เท่านั้น)
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const role =
        (localStorage.getItem("role") as "entrepreneur" | "user" | null) ??
        "user";
      if (token) router.replace(ROUTES[role]);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    if (!username.trim() || !password.trim()) {
      setMsg("กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // เผื่อ backend ใช้คุกกี้ session
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // อ่านเป็น text ก่อน เผื่อ backend ส่งข้อความสั้น ๆ
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      const role = getRoleFromResponse(data);

      // ✅ รองรับหลายฟิลด์ token; ถ้าไม่มี ให้ใช้ "cookie" เป็น marker แทน
      let token: string | null =
        data?.token ?? data?.access_token ?? data?.jwt ?? null;
      if (!token || token === "null" || token === "undefined") token = "cookie";

      // ✅ แตะ localStorage เฉพาะใน event/เอฟเฟกต์เท่านั้น (ไม่แตะระหว่าง render)
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
        else localStorage.removeItem("user");
        // แจ้ง component อื่น ๆ ถ้ามี
        window.dispatchEvent(new Event("auth:changed"));
      } catch {
        /* ignore */
      }

      router.push(ROUTES[role]);
    } catch (err: any) {
      setMsg(err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => router.push("/register");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFEFEF]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white shadow border border-[#EBCB8B] p-6 space-y-4"
      >
        {/* หัวข้อ */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#7B4F2B] tracking-wide">
            เข้าสู่ระบบ
          </h1>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#E5B40C]" />
        </div>

        <label className="block">
          <span className="text-sm text-[#7B4F2B]">ชื่อผู้ใช้</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none border-[#EBCB8B] bg-white placeholder-[#7B4F2B]/50 focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="เช่น pathaphon.s"
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="text-sm text-[#7B4F2B]">รหัสผ่าน</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none border-[#EBCB8B] bg-white placeholder-[#7B4F2B]/50 focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {msg && (
          <div className="text-sm rounded-md px-3 py-2 bg-[#EBCB8B]/30 border border-[#EBCB8B] text-[#7B4F2B]">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2 font-medium bg-[#E5B40C] text-[#7B4F2B] hover:brightness-95 disabled:opacity-60 shadow transition"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <button
          type="button"
          onClick={handleGoToRegister}
          className="w-full rounded-lg py-2 font-medium border border-[#7B4F2B] text-[#7B4F2B] hover:bg-[#EBCB8B]/30 transition"
        >
          สมัครสมาชิก
        </button>
      </form>
    </div>
  );
}
