import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import HealthBadge from '../components/common/HealthBadge';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Clients Page
 *
 * Displays all onboarded clients with filtering and health status.
 */
const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    healthStatus: '',
    journeyStage: '',
    search: '',
  });

  useEffect(() => {
    loadClients();
  }, [filters]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll(filters);
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJourneyStageBadge = (stage) => {
    return <span className="badge badge-blue">{stage}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input"
            value={filters.healthStatus}
            onChange={(e) => setFilters({ ...filters, healthStatus: e.target.value })}
          >
            <option value="">All Health Status</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
            <option value="Red">Red</option>
          </select>
          <select
            className="input"
            value={filters.journeyStage}
            onChange={(e) => setFilters({ ...filters, journeyStage: e.target.value })}
          >
            <option value="">All Journey Stages</option>
            <option value="Foundation">Foundation</option>
            <option value="Prep">Prep</option>
            <option value="Launch">Launch</option>
            <option value="Growth & Expansion">Growth & Expansion</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No clients found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
                <HealthBadge status={client.healthStatus} score={client.healthScore} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Journey Stage:</span>
                  {getJourneyStageBadge(client.journeyStage)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{client.journeyProgress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-medium">{client.projectStatus}</span>
                </div>
              </div>

              <div className="flex items-center text-primary-600 text-sm font-medium">
                View Details
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
