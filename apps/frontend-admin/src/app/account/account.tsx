import styles from './account.module.scss';

/* eslint-disable-next-line */
export interface AccountProps {}

export function Account(props: AccountProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Account!</h1>
    </div>
  );
}

export default Account;
