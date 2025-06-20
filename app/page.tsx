'use client';

import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  BriefcaseIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from './modules/auth/AuthContext';
import Layout from './components/Layout';
import Link from 'next/link';

// Simple chart component for demo
const SimpleBarChart = () => (
  <div className="h-40 flex items-end space-x-2 pb-2">
    {[30, 70, 40, 50, 60, 30, 90].map((height, i) => (
      <div key={i} className="flex-1 flex flex-col items-center">
        <div 
          className="w-full bg-blue-500 rounded-t" 
          style={{ height: `${height}%` }}
        ></div>
        <span className="text-xs mt-1">{String.fromCharCode(65 + i)}</span>
      </div>
    ))}
  </div>
);

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  bgColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  trend, 
  bgColor = 'bg-white' 
}) => (
  <div className={`${bgColor} p-6 rounded-lg shadow-sm border border-gray-200`}>
    <div className="flex justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 transform rotate-180" />}
            <span className={`text-xs font-medium ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className="p-2 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

// Project card component
interface ProjectCardProps {
  name: string;
  status: 'active' | 'completed' | 'delayed' | 'planning';
  progress: number;
  deadline: string;
  team: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  name, 
  status, 
  progress, 
  deadline, 
  team 
}) => {
  const getStatusColor = () => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 flex items-center">
        <ClockIcon className="h-3 w-3 mr-1" />
        <span>Deadline: {deadline}</span>
      </div>
      <div className="mt-3 flex">
        {team.map((member, i) => (
          <div 
            key={i} 
            className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium -ml-1 first:ml-0 border border-white"
            title={member}
          >
            {member.charAt(0)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity item component
interface ActivityItemProps {
  avatar: string;
  name: string;
  action: string;
  target: string;
  time: string;
  icon?: React.ReactNode;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  avatar, 
  name, 
  action, 
  target, 
  time, 
  icon 
}) => (
  <div className="flex items-start space-x-3 py-3">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900">
        <span className="font-medium">{name}</span> {action} <span className="font-medium">{target}</span>
      </p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
    {icon && (
      <div className="flex-shrink-0">
        {icon}
      </div>
    )}
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState<string>('');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Sample data for the dashboard
  const stats = [
    { 
      title: 'Total Employees',
      value: 128,
      icon: <UsersIcon className="h-6 w-6 text-blue-500" />,
      change: '12% increase',
      trend: 'up' as const
    },
    { 
      title: 'Active Projects',
      value: 23,
      icon: <BriefcaseIcon className="h-6 w-6 text-blue-500" />,
      change: '3 new this month',
      trend: 'up' as const
    },
    { 
      title: 'Documents',
      value: 517,
      icon: <DocumentTextIcon className="h-6 w-6 text-blue-500" />,
      change: '18 updated recently',
      trend: 'neutral' as const
    },
    { 
      title: 'Q2 Budget Spent',
      value: '$324,521',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />,
      change: '8% under target',
      trend: 'down' as const
    }
  ];

  const projects = [
    {
      name: 'SEAVIBE',
      status: 'active' as const,
      progress: 75,
      deadline: 'Aug 15, 2025',
      team: ['John D', 'Maria L', 'Alex K']
    },
    {
      name: 'ECOGRIND',
      status: 'planning' as const,
      progress: 20,
      deadline: 'Oct 30, 2025',
      team: ['Sarah M', 'Tom B']
    },
    {
      name: 'QUANTUM',
      status: 'delayed' as const,
      progress: 45,
      deadline: 'Jul 10, 2025',
      team: ['Lisa R', 'Mike T', 'Chris G', 'Ella P']
    },
    {
      name: 'HORIZON',
      status: 'completed' as const,
      progress: 100,
      deadline: 'Jun 5, 2025',
      team: ['James W', 'Nina Z']
    }
  ];

  const activities = [
    {
      avatar: 'JD',
      name: 'John Doe',
      action: 'completed milestone',
      target: 'SEAVIBE Beta Launch',
      time: '2 hours ago',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />
    },
    {
      avatar: 'ML',
      name: 'Maria Lopez',
      action: 'requested approval for',
      target: 'Design Assets',
      time: '3 hours ago'
    },
    {
      avatar: 'AK',
      name: 'Alex Kim',
      action: 'commented on',
      target: 'ECOGRIND Project Plan',
      time: '5 hours ago'
    },
    {
      avatar: 'SM',
      name: 'Sarah Miller',
      action: 'raised issue',
      target: 'API Integration Delay',
      time: 'Yesterday',
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
    },
    {
      avatar: 'TB',
      name: 'Tom Brown',
      action: 'scheduled meeting',
      target: 'Q3 Planning',
      time: 'Yesterday'
    }
  ];

  const teamPerformance = [
    { team: 'Development', score: 92, trend: 'up' as const, change: '+5%' },
    { team: 'Design', score: 88, trend: 'up' as const, change: '+2%' },
    { team: 'Marketing', score: 76, trend: 'down' as const, change: '-3%' },
    { team: 'Operations', score: 84, trend: 'neutral' as const, change: '0%' }
  ];

  return (
    <Layout>
      <div className="pb-10">
        {/* Welcome section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Project Status</h2>
              <Link 
                href="/projects" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <ProjectCard key={i} {...project} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Activity</h2>
              <Link 
                href="/activity" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.map((activity, i) => (
                <ActivityItem key={i} {...activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Team Performance & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Team Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">Team Performance</h2>
            <div className="space-y-4">
              {teamPerformance.map((team, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-1/3">
                    <p className="text-sm font-medium">{team.team}</p>
                  </div>
                  <div className="w-1/3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${team.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-1/3 flex justify-end">
                    <div className={`flex items-center ${
                      team.trend === 'up' ? 'text-green-500' : 
                      team.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      <span className="text-sm font-medium">{team.score}%</span>
                      <span className="text-xs ml-2">{team.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-medium mb-4">Weekly Project Progress</h2>
            <SimpleBarChart />
            <div className="flex justify-center text-xs text-gray-500 mt-2">
              <span>Last 7 Days</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

