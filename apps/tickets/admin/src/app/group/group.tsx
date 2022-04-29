import styles from './group.module.scss';

/* eslint-disable-next-line */
export interface GroupProps {}

export function Group(props: GroupProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Group!</h1>
    </div>
  );
}

export default Group;
