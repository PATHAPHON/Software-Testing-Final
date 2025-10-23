"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------- Types ------------------------------- */
type ApiProduct = {
  product_id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  province: string;
  region: string;
  image: string; // /images/*.png
  created_at: string;
  updated_at: string;
};
type ApiResponse = {
  total: number;
  page: number;
  limit: number;
  sort: string;
  order: "ASC" | "DESC";
  items: ApiProduct[];
};
type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  province: string;
  region: string;
  image: string;
};

/* ------------------------------ MOCK DATA --------------------------- */
// วางไฟล์ p1.png..p5.png ที่ public/images/
const MOCK_PRODUCTS: ApiProduct[] = [
  {
    product_id: "P-001",
    name: "สับปะรดกวนโฮมเมด",
    description: "หวานหอม ทำใหม่ทุกสัปดาห์ จากไร่ท้องถิ่น",
    category: "อาหารและเครื่องดื่ม",
    price: "120",
    province: "ขอนแก่น",
    region: "ตะวันออกเฉียงเหนือ",
    image: "/images/p1.png",
    created_at: "2025-10-20T10:00:00.000Z",
    updated_at: "2025-10-20T10:00:00.000Z",
  },
  {
    product_id: "P-002",
    name: "ผ้าฝ้ายทอมือ",
    description: "ลายดั้งเดิม สวมใส่สบาย ระบายอากาศดี",
    category: "แฟชั่นและเครื่องแต่งกาย",
    price: "450",
    province: "เชียงใหม่",
    region: "เหนือ",
    image: "/images/p2.png",
    created_at: "2025-10-21T12:10:00.000Z",
    updated_at: "2025-10-21T12:10:00.000Z",
  },
  {
    product_id: "P-003",
    name: "กำไลเงินแท้",
    description: "เครื่องประดับฝีมือช่างพื้นบ้าน",
    category: "เครื่องประดับและของที่ระลึก",
    price: "990",
    province: "เชียงราย",
    region: "เหนือ",
    image: "/images/p3.png",
    created_at: "2025-10-21T12:30:00.000Z",
    updated_at: "2025-10-21T12:30:00.000Z",
  },
  {
    product_id: "P-004",
    name: "กระเป๋าสานจากเสื่อกก",
    description: "ใช้งานทนทาน น้ำหนักเบา ดีไซน์ร่วมสมัย",
    category: "งานฝีมือ",
    price: "350",
    province: "กาฬสินธุ์",
    region: "ตะวันออกเฉียงเหนือ",
    image: "/images/p4.png",
    created_at: "2025-10-22T08:00:00.000Z",
    updated_at: "2025-10-22T08:00:00.000Z",
  },
  {
    product_id: "P-005",
    name: "ไม้ประดับกระถาง",
    description: "ปลูกง่าย ฟอกอากาศได้ดี เหมาะกับคอนโด",
    category: "เฟอร์นิเจอร์และของตกแต่ง",
    price: "250",
    province: "กรุงเทพฯ",
    region: "กลาง",
    image: "/images/p5.png",
    created_at: "2025-10-22T09:00:00.000Z",
    updated_at: "2025-10-22T09:00:00.000Z",
  },
];

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
async function mockFetchProducts(): Promise<ApiResponse> {
  await delay();
  return {
    total: MOCK_PRODUCTS.length,
    page: 1,
    limit: MOCK_PRODUCTS.length,
    sort: "created_at",
    order: "DESC",
    items: MOCK_PRODUCTS,
  };
}

/* ------------------------------ UI Parts ---------------------------- */
function Breadcrumbs() {
  const router = useRouter();
  return (
    <div className="mx-auto mt-4 w-full max-w-7xl px-4 text-sm text-gray-500">
      <nav className="flex items-center gap-2">
        <button onClick={() => router.push("/")} className="hover:underline">หน้าหลัก</button>
        <span>›</span>
        <span className="text-gray-900">สินค้าotop</span>
      </nav>
    </div>
  );
}

function ProfileBar({ userRole, onLogout }: { userRole: string | null; onLogout: () => void }) {
  const router = useRouter();
  const isLoggedIn = !!userRole;
  return (
    <div className="w-full bg-gray-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">profile</h1>
        {isLoggedIn ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">บทบาท: {userRole}</span>
            {userRole === "entrepreneur" && (
              <button onClick={() => router.push("/manage")} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-100">
                ไปหน้าจัดการสินค้า
              </button>
            )}
            <button onClick={onLogout} className="rounded-lg bg-red-500 px-3 py-1.5 font-medium text-white hover:bg-red-600">
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push("/login")} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-100">
              เข้าสู่ระบบ
            </button>
            <button onClick={() => router.push("/register")} className="rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-black/80">
              สมัครสมาชิก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, userRole }: { product: Product; userRole: string | null }) {
  const router = useRouter();
  const addToCart = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !userRole) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      router.push("/login");
      return;
    }
    if (userRole !== "user") {
      alert("เฉพาะผู้ใช้งานทั่วไป (user) เท่านั้นที่สามารถสั่งซื้อสินค้าได้");
      return;
    }
    alert(`เพิ่มสินค้า "${product.name}" ลงตะกร้าแล้ว (จำลอง)`);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
      <div className="relative mb-3 aspect-square w-full">
        <Image
          src={product.image || "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <h4 className="line-clamp-1 text-sm font-medium text-gray-900">{product.name}</h4>
      <p className="mt-1 text-xs text-gray-500">
        {product.province} • {product.category}
      </p>
      <p className="mt-2 font-semibold text-yellow-600">{product.price.toLocaleString()} ฿</p>
      <div className="mt-3">
        <button
          onClick={addToCart}
          className="rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-yellow-300"
        >
          ใส่ตะกร้า
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Page ------------------------------- */
export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(typeof window !== "undefined" ? localStorage.getItem("role") : null);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setUserRole(null);
      router.replace("/login");
    } catch {
      alert("ไม่สามารถออกจากระบบได้");
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mockFetchProducts();
        const mapped: Product[] = (data.items || []).map((it) => ({
          id: it.product_id,
          name: it.name,
          description: it.description,
          category: it.category,
          price: Number(it.price ?? 0),
          province: it.province,
          region: it.region,
          image: it.image || "/placeholder.png",
        }));
        if (alive) setProducts(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message || "Load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ProfileBar userRole={userRole} onLogout={handleLogout} />
      <Breadcrumbs />

      <div className="mx-auto my-6 w-full max-w-7xl px-4">
        {/* ไม่มีตัวกรองใด ๆ แล้ว */}
        {loading ? (
          <div className="text-sm text-gray-500">กำลังโหลดสินค้า…</div>
        ) : error ? (
          <div className="text-sm text-red-600">เกิดข้อผิดพลาดในการโหลด: {error}</div>
        ) : products.length === 0 ? (
          <div className="text-sm text-gray-500">ไม่พบสินค้า</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} userRole={userRole} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
