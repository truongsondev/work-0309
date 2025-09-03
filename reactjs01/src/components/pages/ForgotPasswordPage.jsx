import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/forgot-password", values);
      alert("Vui lòng kiểm tra email để đặt lại mật khẩu!");
    } catch (err) {
      alert("Email không tồn tại!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Quên mật khẩu</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Nhập email" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Gửi yêu cầu
        </Button>
      </Form>
      <div style={{ marginTop: 10 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
