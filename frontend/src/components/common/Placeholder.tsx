import React from 'react';
import {Card as BSCard} from 'react-bootstrap';
import Card from './Card';

interface PlaceholderProps {
  title?: string;
  purpose?: string;
  status?: string;
}

const defaults: PlaceholderProps = {
  title: '[Placeholder]',
  purpose: 'This component is very important',
  status: 'This component is still in development',
};

const Placeholder = ({
  title = defaults.title,
  purpose = defaults.purpose,
  status = defaults.status,
}: PlaceholderProps) => (
  <Card title={title} subtitle={purpose}>
    <BSCard.Text>{status}</BSCard.Text>
  </Card>
);

export default React.memo(Placeholder);
