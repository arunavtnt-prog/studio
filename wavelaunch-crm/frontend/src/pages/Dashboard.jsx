import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI, clientsAPI } from '../services/api';
import {
  UserGroupIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Dashboard Page
 *
 * Overview of CRM metrics and recent activity.
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    leads: { total: 0, warm: 0, interested: 0 },
    clients: { total: 0, green: 0, yellow: 0, red: 0 },
    loading: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leadsRes, clientsRes] = await Promise.all([
        leadsAPI.getAll(),
        clientsAPI.getAll(),
      ]);

      const leads = leadsRes.data.data || [];
      const clients = clientsRes.data.data || [];

      setStats({
        leads: {
          total: leads.length,
          warm: leads.filter((l) => l.stage === 'Warm').length,
          interested: leads.filter((l) => l.stage === 'Interested').length,
        },
        clients: {
          total: clients.length,
          green: clients.filter((c) => c.healthStatus === 'Green').length,
          yellow: clients.filter((c) => c.healthStatus === 'Yellow').length,
          red: clients.filter((c) => c.healthStatus === 'Red').length,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-2 text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-8 w-8 text-${color}-600`} />
          </div>
        )}
      </div>
    </div>
  );

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={stats.leads.total}
          subtitle={`${stats.leads.interested} interested`}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Active Clients"
          value={stats.clients.total}
          subtitle="Onboarded creators"
          icon={UsersIcon}
          color="primary"
        />
        <StatCard
          title="Healthy Clients"
          value={stats.clients.green}
          subtitle="Green status"
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="At Risk"
          value={stats.clients.red}
          subtitle="Need attention"
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <p className="text-gray-600 mb-4">Manage incoming creator applications</p>
          <Link to="/leads" className="btn btn-primary">
            View All Leads →
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Client Overview</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Green Health:</span>
              <span className="font-semibold text-green-600">{stats.clients.green}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Yellow Health:</span>
              <span className="font-semibold text-yellow-600">{stats.clients.yellow}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Red Health:</span>
              <span className="font-semibold text-red-600">{stats.clients.red}</span>
            </div>
          </div>
          <Link to="/clients" className="btn btn-primary">
            View All Clients →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
