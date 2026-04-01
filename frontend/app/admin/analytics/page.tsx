"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BarChart,
  DollarSign,
  Eye,
  BookOpen,
  FileText,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignUps: 0,
    premiumUsers: 0,
    pageViews: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/analytics/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users />}
          title="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<Users />}
          title="New Sign-ups (30d)"
          value={stats.newSignUps}
        />
        <StatCard
          icon={<DollarSign />}
          title="Active Premium"
          value={stats.premiumUsers}
        />
        <StatCard icon={<Eye />} title="Page Views" value={stats.pageViews} />
        <StatCard
          icon={<BookOpen />}
          title="Total Courses"
          value={stats.totalCourses}
        />
        <StatCard
          icon={<FileText />}
          title="Total Blogs"
          value={stats.totalBlogs}
        />
        <StatCard
          icon={<TrendingUp />}
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const StatCard = ({ icon, title, value }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default AnalyticsPage;
