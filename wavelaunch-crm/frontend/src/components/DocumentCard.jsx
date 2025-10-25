import React from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  EyeIcon,
  PaperAirplaneIcon,
  PencilIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Document Card Component
 *
 * Displays a single document with its status and actions
 */
const DocumentCard = ({ monthNumber, docNumber, documentName, status, document, onView }) => {
  // Status configurations
  const statusConfig = {
    'not-generated': {
      label: 'Not Generated',
      icon: XCircleIcon,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
    },
    generated: {
      label: 'Generated',
      icon: DocumentTextIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
    },
    sent: {
      label: 'Sent',
      icon: PaperAirplaneIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
    },
    viewed: {
      label: 'Viewed',
      icon: EyeIcon,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800',
    },
    'revision-requested': {
      label: 'Revision Requested',
      icon: PencilIcon,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
    },
  };

  const config = statusConfig[status] || statusConfig['not-generated'];
  const StatusIcon = config.icon;

  const canView = status !== 'not-generated';

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${config.borderColor} ${config.bgColor} ${
        canView ? 'hover:shadow-md cursor-pointer' : ''
      }`}
      onClick={canView ? onView : undefined}
    >
      <div className="flex items-center space-x-3 flex-1">
        <StatusIcon className={`h-6 w-6 ${config.color}`} />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{documentName}</p>
          {document && document.generatedAt && (
            <p className="text-xs text-gray-500">
              Generated {new Date(document.generatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>

        {/* View Button */}
        {canView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
