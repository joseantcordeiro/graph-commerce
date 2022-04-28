import styles from './react-popups.module.scss';

/* eslint-disable-next-line */
export interface ReactPopupsProps {}

export function ReactPopups(props: ReactPopupsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ReactPopups!</h1>
    </div>
  );
}

export default ReactPopups;
