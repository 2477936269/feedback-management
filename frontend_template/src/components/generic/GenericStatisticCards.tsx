import React from 'react';
import { Statistic, Card, Row, Col } from 'antd';
import { StatisticCardConfig } from './index';

interface GenericStatisticCardsProps {
  configs: StatisticCardConfig[];
}

const GenericStatisticCards: React.FC<GenericStatisticCardsProps> = ({ configs }) => {
  return (
    <Row gutter={16}>
      {configs.map((config, index) => (
        <Col span={6} key={index}>
          <Card>
            <Statistic
              title={config.title}
              value={config.value}
              prefix={config.prefix}
              suffix={config.suffix}
              precision={config.precision}
              valueStyle={config.valueStyle}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GenericStatisticCards;
