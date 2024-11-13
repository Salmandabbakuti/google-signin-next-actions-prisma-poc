"use client";
import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Avatar, Space } from "antd";
import { updateMyProfile, getMyProfile, logout } from "@/lib/actions";

const ProfileForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    handleGetProfile();
  }, [form]);

  console.log("form value", form.getFieldValue("picture"));

  const handleGetProfile = async () => {
    setDataLoading(true);
    try {
      const data = await getMyProfile();
      console.log("Profile data:", data);
      form.setFieldsValue(data);
    } catch (error) {
      message.error("Failed to fetch profile data. Please try again.");
      console.error("Profile fetch error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const onFinish = (values) => {
    // Send updated data to backend (replace with actual API endpoint)
    console.log("Form values:", values);
    const { name, bio, picture, country, phone } = values;
    setLoading(true);
    updateMyProfile({ name, bio, picture, country, phone })
      .then((data) => {
        message.success("Profile updated successfully");
      })
      .catch((error) => {
        message.error("Profile update failed. Please try again.");
        console.error("Profile update error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLogout = () => {
    // Logout user and redirect to login page
    console.log("Logout user");
    logout()
      .then(() => {
        message.success("Logout successful. Redirecting to login...");
      })
      .catch((error) => {
        message.error("Logout failed. Please try again.");
        console.error("Logout error:", error);
      });
  };

  return (
    <div>
      <Card
        bordered
        title="Profile"
        loading={dataLoading}
        style={{
          maxWidth: 600,
          minWidth: 300,
          margin: "30px auto",
          border: "2px solid #ddd"
        }}
        extra={
          <Button type="default" shape="round" onClick={handleLogout}>
            Logout
          </Button>
        }
      >
        <Avatar
          size={100}
          src={form.getFieldValue("picture")}
          style={{ marginBottom: "1rem" }}
        />
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Editable Fields */}
          <Form.Item label="Name" name="name">
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item label="Bio" name="bio">
            <Input.TextArea rows={3} placeholder="Enter a short bio" />
          </Form.Item>
          <Form.Item label="Country" name="country">
            <Input placeholder="Enter your country" />
          </Form.Item>

          {/* Read-only Fields */}
          <Form.Item label="Email" name="email">
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item label="Last Active At" name="lastActiveAt">
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Created At" name="createdAt">
            <Input readOnly />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              shape="round"
              loading={loading}
              htmlType="submit"
            >
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileForm;
