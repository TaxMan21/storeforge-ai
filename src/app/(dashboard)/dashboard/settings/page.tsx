"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { apiGet, apiPatch } from "@/lib/api-client";
import { User, Shield, Bell, Key } from "lucide-react";

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input value={user?.email || ""} disabled className="mt-1" />
          </div>
          <Button onClick={handleProfileSave} disabled={loading}>
            {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
          <CardDescription>Manage your password and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            variant="outline"
            onClick={handlePasswordChange}
            disabled={loading || !currentPassword || !newPassword}
          >
            {loading ? "Changing..." : pwSaved ? "Password Changed!" : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> API Keys</CardTitle>
          <CardDescription>Manage your API keys for external integrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">API key management coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
          <CardDescription>Configure your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Notification settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
