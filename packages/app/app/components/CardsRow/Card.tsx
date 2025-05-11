import React from 'react';
import classNames from 'classnames';
import styles from './styles.scss';

export type CardProps = {
  id?: string;
  image: string;
  header: string;
  onClick?: () => void;
  className?: string;
};

const Card: React.FC<CardProps> = ({ id, image, header, onClick, className }) => {
  return (
    <div
      className={classNames(styles.card, className)}
      onClick={onClick}
      data-id={id}
    >
      <img src={image} alt={header} className={styles.image} />
      <div className={styles.text}>{header}</div>
    </div>
  );
};

export default Card;
