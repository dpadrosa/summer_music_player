import React from 'react';
import classNames from 'classnames';
import styles from './styles.scss';
export type ButtonProps = {
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'default';
  className?: string;
  borderless?: boolean;
  circular?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  icon,
  children,
  color = 'default',
  className,
  borderless,
  circular,
  size = 'medium',
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        styles.button,
        styles[color],
        styles[size],
        {
          [styles.borderless]: borderless,
          [styles.circular]: circular,
        },
        className
      )}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
