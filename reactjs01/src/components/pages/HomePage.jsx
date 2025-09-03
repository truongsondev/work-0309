import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        setMessage("cgt");
      } catch (err) {
        setMessage("Chưa đăng nhập!");
      }
    };
    fetchHome();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Trang chủ</h1>
      <p>{message}</p>
      <Button type="primary" onClick={logout}>
        Đăng xuất
      </Button>
    </div>
  );
}

export default HomePage;
