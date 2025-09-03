import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/register", values);
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      alert("Lỗi khi đăng ký!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Đăng ký</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input placeholder="Tên" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Nhập email" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password placeholder="Mật khẩu" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng ký
        </Button>
      </Form>
      <div style={{ marginTop: 10 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
