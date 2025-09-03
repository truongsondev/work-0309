import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/login", values);
      console.log(res);
      localStorage.setItem("token", res.data.token);
      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      alert("Sai email hoặc mật khẩu!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Đăng nhập</h2>
      <Form onFinish={onFinish}>
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
          Đăng nhập
        </Button>
      </Form>
      <div style={{ marginTop: 10 }}>
        <Link to="/register">Đăng ký</Link> |{" "}
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>
    </div>
  );
}

export default LoginPage;
