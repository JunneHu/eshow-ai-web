import React from 'react';
import { Breadcrumb, Typography } from 'antd';

const { Title } = Typography;

export interface PageHeaderProps {
  breadcrumb?: { title: string; path?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumb = [] }) => {
  const last = breadcrumb[breadcrumb.length - 1];

  return (
    <div style={{ padding: '16px 24px 0' }}>
      {breadcrumb.length > 0 && (
        <Breadcrumb style={{ marginBottom: 8 }}>
          {breadcrumb.map((item) => (
            <Breadcrumb.Item key={item.title}>{item.title}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      {last && <Title level={4} style={{ margin: 0 }}>{last.title}</Title>}
    </div>
  );
};

export default PageHeader;

