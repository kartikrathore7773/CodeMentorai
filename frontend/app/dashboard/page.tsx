"use client";
import React from "react";
import Protected from "../../components/Protected";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function DashboardPage() {
  // User data - in a real app, this would come from an API/context
  const user = {
    name: "kartik singh",
    email: "kartikrathore770@gmail.com",
    emailVerified: true,
    role: "user",
    wallet: "₹0",
  };

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 text-sm">
                  Welcome back, {user.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Dashboard Content */}
            <div className="lg:col-span-2">
              {/* Coming Soon Dashboard */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🚧</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Your Dashboard is Coming Soon
                  </h2>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    We are working hard to build your personalized dashboard.
                    Stay tuned!
                  </p>
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant="secondary"
                    className="bg-violet-600/20 text-violet-400 px-4 py-2"
                  >
                    KS - kartik singh
                  </Badge>
                </div>
              </Card>

              {/* Coming Soon Features */}
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
                    <div className="text-4xl mb-3">🔔</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Notifications
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Stay updated with course updates and announcements
                    </p>
                    <Badge variant="outline" className="text-zinc-500">
                      Coming Soon
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>

            {/* User Profile Sidebar */}
            <div>
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Profile Information
                </h2>

                {/* Profile Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {user.name}
                  </h3>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm">Full Name</span>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm">Email</span>
                    <span className="text-white font-medium">{user.email}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm">
                      Email Verified
                    </span>
                    <Badge
                      variant={user.emailVerified ? "default" : "destructive"}
                      className={
                        user.emailVerified
                          ? "bg-green-600/20 text-green-400"
                          : ""
                      }
                    >
                      {user.emailVerified ? "✓ Verified" : "✗ Not Verified"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm">Role</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-600/20 text-blue-400"
                    >
                      {user.role}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm">Wallet</span>
                    <span className="text-white font-medium">
                      {user.wallet}
                    </span>
                  </div>
                </div>

                {/* Change Password Button */}
                <Button
                  className="w-full mt-6 bg-violet-600 hover:bg-violet-700"
                  size="sm"
                >
                  Change Password
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
