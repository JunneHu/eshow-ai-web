import React from 'react';
import { Button, Spin, Typography } from 'antd';

const { Paragraph, Text } = Typography;

type PageStateProps = {
  loading?: boolean;
  error?: any;
  empty?: boolean;
  emptyText?: React.ReactNode;
  errorText?: React.ReactNode;
  height?: number;
  onRetry?: () => void;
};

const PageState: React.FC<PageStateProps> = (props) => {
  const { loading, error, empty, emptyText, errorText, height = 220, onRetry } = props;

  if (loading) {
    return (
      <div className="ai-tools-loading" style={{ height }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-tools-empty" style={{ height }}>
        <div>
          <Paragraph style={{ marginBottom: 8 }}>{errorText || '加载失败，请稍后重试。'}</Paragraph>
          {onRetry ? (
            <Button type="link" onClick={onRetry} style={{ padding: 0 }}>
              重试
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="ai-tools-empty" style={{ height }}>
        <Text type="secondary">{emptyText || '暂无数据。'}</Text>
      </div>
    );
  }

  return null;
};

export default PageState;
