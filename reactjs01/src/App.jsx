import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages
const HomePage = lazy(() => import("./components/pages/HomePage"));
const LoginPage = lazy(() => import("./components/pages/LoginPage"));
const RegisterPage = lazy(() => import("./components/pages/RegisterPage"));

function App() {
  return (
    <Suspense fallback={<div>Đang tải trang…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </Suspense>
  );
}

export default App;
