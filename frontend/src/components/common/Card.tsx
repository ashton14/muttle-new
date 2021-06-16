import React, {ReactNode} from 'react';
import {Card as BSCard, Container} from 'react-bootstrap';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

const Card = ({title, subtitle, children}: CardProps) => (
  <BSCard className="col-md-3 col-sm-9 h-100 m-5">
    <Container className="my-2">
      <BSCard.Body>
        {title && <BSCard.Title>{title}</BSCard.Title>}
        {subtitle && (
          <BSCard.Subtitle className="mb-2 text-muted">
            {subtitle}
          </BSCard.Subtitle>
        )}
        {children}
      </BSCard.Body>
    </Container>
  </BSCard>
);

export default React.memo(Card);
