'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/app/components/Card';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name,
        email: parsedUser.email,
      });
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-[#dfbe6c] border-t-transparent rounded-full mb-4"></div>
          <p className="text-[#dfbe6c]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#dfbe6c] mb-2">
          Your Profile
        </h1>
        <p className="text-[#ffffff] text-opacity-70">
          Manage your account information and preferences
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-900 bg-opacity-30 border border-green-500 border-opacity-50 rounded-lg">
          <p className="text-green-300 text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Profile Card */}
      <Card className="mb-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#dfbe6c] border-opacity-20">
          <div className="w-20 h-20 bg-[#dfbe6c] rounded-full flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#dfbe6c]">{user?.name}</h2>
            <p className="text-[#ffffff] text-opacity-70">{user?.email}</p>
          </div>
        </div>

        <form className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            icon={<span>👤</span>}
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            icon={<span>✉️</span>}
          />

          <div className="flex gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Security */}
      <Card title="Security" subtitle="Manage your account security settings">
        <div className="space-y-4">
          <Button variant="secondary" fullWidth className="justify-start">
            🔐 Change Password
          </Button>
          <Button variant="secondary" fullWidth className="justify-start">
            📱 Two-Factor Authentication
          </Button>
          <Button variant="secondary" fullWidth className="justify-start">
            🔑 Active Sessions
          </Button>
        </div>
      </Card>
    </div>
  );
}
