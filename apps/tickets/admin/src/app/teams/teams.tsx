import styles from './teams.module.scss';

/* eslint-disable-next-line */
export interface TeamsProps {}

export function Teams(props: TeamsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Teams!</h1>
    </div>
  );
}

export default Teams;
