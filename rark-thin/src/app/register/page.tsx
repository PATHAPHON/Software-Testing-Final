"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterResponse =
  | { message: string; user?: any }
  | { error: string };

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"user" | "entrepreneur">("user");
  const [loading, setLoading] = useState(false);

  // ✅ ใช้ state สำหรับข้อความ ไม่ใช้ alert() (ช่วยให้ Cypress เสถียร)
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMsg(null);
    setMsgType(null);

    if (password !== confirmPassword) {
      setMsg("รหัสผ่านไม่ตรงกัน");
      setMsgType("error");
      return;
    }
    if (!username.trim() || !email.trim() || !password.trim()) {
      setMsg("กรอกข้อมูลให้ครบถ้วน");
      setMsgType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = { username, email, password, role: userType };

      const res = await fetch("/registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // เปิดถ้า backend ใช้คุกกี้
        body: JSON.stringify(payload),
      });

      let data: RegisterResponse | null = null;
      try { data = (await res.json()) as RegisterResponse; } catch {}

      if (!res.ok) {
        const msg =
          (data && "error" in data && data.error) ||
          (data && "message" in data && (data as any).message) ||
          `HTTP ${res.status}`;
        setMsg(`สมัครสมาชิกไม่สำเร็จ: ${msg}`);
        setMsgType("error");
        return;
      }

      setMsg((data && "message" in data && data.message) || "สมัครสมาชิกสำเร็จ!");
      setMsgType("success");

      // ✅ รอเสี้ยววินาทีเพื่อให้ผู้ใช้เห็นข้อความ แล้วค่อยไปหน้า login
      setTimeout(() => {
        router.push("/login");
      }, 600);
    } catch (err: any) {
      setMsg(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err?.message ?? "Unknown error"}`);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 min-h-screen flex items-start sm:items-center justify-center ">
      <div className="w-full rounded-2xl bg-white shadow border border-[#EBCB8B] p-6">
        <h1 className="mb-5 text-2xl font-semibold text-center text-[#7B4F2B]">
          Register Page
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-[#7B4F2B]">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#EBCB8B] bg-white p-2 text-[#7B4F2B] placeholder-[#7B4F2B]/50 focus:outline-none focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
              placeholder="yourname"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#7B4F2B]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#EBCB8B] bg-white p-2 text-[#7B4F2B] placeholder-[#7B4F2B]/50 focus:outline-none focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#7B4F2B]">Password</span>
            <input
              type="password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#EBCB8B] bg-white p-2 text-[#7B4F2B] placeholder-[#7B4F2B]/50 focus:outline-none focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
              placeholder="password"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#7B4F2B]">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              minLength={6}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#EBCB8B] bg-white p-2 text-[#7B4F2B] placeholder-[#7B4F2B]/50 focus:outline-none focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
              placeholder="ยืนยันรหัสผ่าน"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#7B4F2B]">User Type</span>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as "user" | "entrepreneur")}
              className="w-full rounded-lg border border-[#EBCB8B] bg-white p-2 text-[#7B4F2B] focus:outline-none focus:ring-4 focus:ring-[#E5B40C]/30 focus:border-[#E5B40C] transition"
            >
              <option value="user">User</option>
              <option value="entrepreneur">Entrepreneur</option>
            </select>
          </label>

          {/* ✅ แสดงข้อความสถานะ (success/error) แทน alert() */}
          {msg && (
            <div
              className={[
                "text-sm rounded-md px-3 py-2 border transition",
                msgType === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-[#EBCB8B]/30 border-[#EBCB8B] text-[#7B4F2B]",
              ].join(" ")}
            >
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#E5B40C] p-2 font-semibold text-[#7B4F2B] hover:brightness-95 disabled:opacity-60 transition"
          >
            {loading ? "กำลังสมัคร..." : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
