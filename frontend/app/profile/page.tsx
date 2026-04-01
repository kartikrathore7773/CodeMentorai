"use client";
import React from "react";
import Protected from "../../components/Protected";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../lib/useAuth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div>Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-white">Profile</h1>
                <p className="text-zinc-400 text-sm">
                  Manage your account information
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bg-zinc-900/50 border-zinc-800 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Account Details
                </h2>

                {/* Profile Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        Full Name
                      </label>
                      <div className="text-white font-medium p-3 bg-zinc-800/50 rounded-md">
                        {user.name || "Not provided"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        Email
                      </label>
                      <div className="text-white font-medium p-3 bg-zinc-800/50 rounded-md">
                        {user.email || "Not provided"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        Email Verified
                      </label>
                      <div className="flex items-center">
                        <Badge
                          variant={
                            user.emailVerified ? "default" : "destructive"
                          }
                          className={
                            user.emailVerified
                              ? "bg-green-600/20 text-green-400"
                              : ""
                          }
                        >
                          {user.emailVerified ? "✓ Verified" : "✗ Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        Role
                      </label>
                      <Badge
                        variant="secondary"
                        className="bg-blue-600/20 text-blue-400"
                      >
                        {user.role || "user"}
                      </Badge>
                    </div>
                  </div>

                  {user.wallet && (
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        Wallet Balance
                      </label>
                      <div className="text-white font-medium p-3 bg-zinc-800/50 rounded-md">
                        {user.wallet}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button
                    className="bg-violet-600 hover:bg-violet-700"
                    size="sm"
                  >
                    Change Password
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Profile Picture
                  </Button>
                </div>
              </Card>

              {/* Additional Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Referral Program
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Earn rewards by referring friends and colleagues
                    </p>
                    <Badge variant="outline" className="text-zinc-500">
                      Coming Soon
                    </Badge>
                  </div>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Learning Progress
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Track your course completion and achievements
                    </p>
                    <Badge variant="outline" className="text-zinc-500">
                      Coming Soon
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>

            {/* Profile Avatar Sidebar */}
            <div>
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Profile Picture
                </h2>

                {/* Profile Avatar */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-linear-to-r from-violet-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {user.name || "User"}
                  </h3>
                  <p className="text-zinc-400 text-sm">{user.email || ""}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="text-center py-4 border-t border-zinc-800">
                    <div className="text-2xl font-bold text-violet-400">0</div>
                    <div className="text-zinc-400 text-sm">
                      Courses Enrolled
                    </div>
                  </div>

                  <div className="text-center py-4 border-t border-zinc-800">
                    <div className="text-2xl font-bold text-violet-400">0</div>
                    <div className="text-zinc-400 text-sm">
                      Certificates Earned
                    </div>
                  </div>

                  <div className="text-center py-4 border-t border-zinc-800">
                    <div className="text-2xl font-bold text-violet-400">0</div>
                    <div className="text-zinc-400 text-sm">Hours Learned</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
