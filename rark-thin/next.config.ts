/** @type {import('next').NextConfig} */
const nextConfig = {
  // การใช้ Rewrites เป็นวิธีมาตรฐานในการทำ Proxy ใน Next.js
  images: { unoptimized: true }, // ปิด optimizer เมื่อ export static
  async rewrites() {
    return [
      {
        // Path ที่ Client-side จะเรียกใช้ (Same-Origin)
        source: '/users/login',
        // Destination คือ URL ของ API ภายนอกจริง (Server-side จะจัดการการเรียกนี้)
        destination: 'http://localhost:8000//users/login',
      },
      {
        source: '/products',
        destination: 'http://localhost:8000/products',
      },
      {
        source: '/categories',
        destination: 'http://localhost:8000/categories',
      },
      {
        source: '/provinces',
        destination: 'http://localhost:8000/provinces',
      },
      {
        source: '/regions',
        destination: 'http://localhost:8000/regions',
      },
      {
        source: '/registers',
        destination: 'http://localhost:8000/registers',
      }
    ]
  },
};

module.exports = nextConfig;
