'use client';

import React, { useState } from 'react';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    marketing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#dfbe6c] mb-2">
          Settings
        </h1>
        <p className="text-[#ffffff] text-opacity-70">
          Customize your OurRoots Africa experience
        </p>
      </div>

      {/* Notifications Settings */}
      <Card title="Notifications" subtitle="Manage how you receive updates" className="mb-6">
        <div className="space-y-4">
          {[
            {
              id: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive email updates about your activity',
            },
            {
              id: 'pushNotifications',
              label: 'Push Notifications',
              description: 'Get instant notifications on your device',
            },
            {
              id: 'marketing',
              label: 'Marketing Emails',
              description: 'Receive information about new features and updates',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#0e2218] rounded-lg border border-[#dfbe6c] border-opacity-20"
            >
              <div>
                <p className="text-[#ffffff] font-semibold">{item.label}</p>
                <p className="text-[#ffffff] text-opacity-50 text-sm">
                  {item.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    settings[item.id as keyof typeof settings]
                  }
                  onChange={() =>
                    toggleSetting(item.id as keyof typeof settings)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#dfbe6c] peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#dfbe6c]"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card title="Privacy & Data" subtitle="Control your privacy settings" className="mb-6">
        <div className="space-y-4">
          <div className="p-4 bg-[#0e2218] rounded-lg border border-[#dfbe6c] border-opacity-20">
            <p className="text-[#ffffff] font-semibold mb-2">Profile Visibility</p>
            <select className="w-full bg-[#0a1810] border border-[#dfbe6c] border-opacity-30 text-[#ffffff] rounded-lg px-4 py-2 focus:outline-none focus:border-opacity-100">
              <option>Public</option>
              <option>Private</option>
              <option>Friends Only</option>
            </select>
          </div>

          <Button variant="outline" fullWidth>
            Download Your Data
          </Button>
          <Button variant="outline" fullWidth>
            Request Account Deletion
          </Button>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card title="Appearance" subtitle="Customize how OurRoots looks" className="mb-6">
        <div className="space-y-4">
          <div className="p-4 bg-[#0e2218] rounded-lg border border-[#dfbe6c] border-opacity-20">
            <p className="text-[#ffffff] font-semibold mb-2">Theme</p>
            <div className="flex gap-4">
              <button className="flex-1 p-3 bg-[#0a1810] border-2 border-[#dfbe6c] text-[#dfbe6c] rounded-lg font-semibold">
                Dark
              </button>
              <button className="flex-1 p-3 bg-[#0a1810] border border-[#dfbe6c] border-opacity-30 text-[#ffffff] rounded-lg font-semibold hover:border-opacity-60 transition-all">
                Light
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Changes */}
      <div className="flex gap-4">
        <Button variant="primary" size="lg">
          Save All Settings
        </Button>
        <Button variant="outline" size="lg">
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
