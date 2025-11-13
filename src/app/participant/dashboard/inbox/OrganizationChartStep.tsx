import React from 'react';
import { InboxActivityData, OrganizationChartItem } from './types';

interface OrganizationChartNode extends OrganizationChartItem {
  children: OrganizationChartNode[];
}

interface OrganizationChartStepProps {
  activityData?: InboxActivityData;
}

const OrganizationChartStep: React.FC<OrganizationChartStepProps> = ({ activityData }) => {
  const organizationCharts = activityData?.activityDetail?.organizationCharts || [];

  if (!activityData?.activityDetail || organizationCharts.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Organization Chart</h2>
        <div className="bg-white p-6 rounded-lg border text-black">
          <p>No organization chart available for this activity.</p>
        </div>
      </div>
    );
  }

  // Build hierarchy from flat organization chart data
  const buildHierarchy = (items: OrganizationChartItem[]): OrganizationChartNode[] => {
    const itemMap = new Map<string, OrganizationChartNode>();
    const roots: OrganizationChartNode[] = [];

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build hierarchy
    items.forEach(item => {
      const node = itemMap.get(item.id);
      if (node && item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else if (node) {
        roots.push(node);
      }
    });

    return roots;
  };

  const hierarchy = buildHierarchy(organizationCharts);

  const renderNode = (node: OrganizationChartNode, level = 0): React.ReactElement => (
    <div key={node.id} className={`ml-${level * 6}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 max-w-xs">
        <div className="font-semibold text-black">{node.name}</div>
        <div className="text-sm text-black">{node.designation}</div>
        <div className="text-xs text-black">{node.email}</div>
      </div>
      {node.children.map((child: OrganizationChartNode) => renderNode(child, level + 1))}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Organization Chart</h2>
      <div className="bg-white p-6 rounded-lg border text-black">
        <div className="space-y-4">
          {hierarchy.map(root => renderNode(root))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationChartStep;