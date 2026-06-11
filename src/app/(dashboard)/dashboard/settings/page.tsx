"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { apiPatch } from "@/lib/api-client";
import { User, Shield, Bell, Key, Check } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  async function handleProfileSave() {
    setLoading(true);
    setError("");
    try {
      const data = await apiPatch("/api/user/profile", { name });
      if (data.user) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e: any) {
      setError(e.message || "Failed to save");
    }
    setLoading(false);
  }

  async function handlePasswordChange() {
    setLoading(true);
    setError("");
    try {
      await apiPatch("/api/user/profile", { currentPassword, newPassword });
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPwSaved(false), 2000);
    } catch (e: any) {
      setError(e.message || "Failed to change password");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-3">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            Profile
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <Input value={user?.email || ""} disabled className="mt-1.5 h-12 rounded-xl bg-gray-50" />
          </div>
          <Button onClick={handleProfileSave} disabled={loading} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 btn-shine">
            {loading ? "Saving..." : saved ? (
              <><Check className="h-4 w-4 mr-2" /> Saved!</>
            ) : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Current Password</label>
            <Input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">New Password</label>
            <Input type="password" placeholder="Enter new password (min 8 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5 h-12 rounded-xl" />
          </div>
          <Button variant="outline" onClick={handlePasswordChange} disabled={loading || !currentPassword || !newPassword} className="rounded-xl">
            {loading ? "Changing..." : pwSaved ? (
              <><Check className="h-4 w-4 mr-2" /> Password Changed!</>
            ) : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Key className="h-4 w-4 text-white" />
            </div>
            API Keys
          </CardTitle>
          <CardDescription>Manage your API keys for external integrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">API key management coming soon.</p>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </div>
            Notifications
          </CardTitle>
          <CardDescription>Configure your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Notification settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
