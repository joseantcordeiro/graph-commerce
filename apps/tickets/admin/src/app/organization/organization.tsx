import styles from './organization.module.scss';

/* eslint-disable-next-line */
export interface OrganizationProps {}

export function Organization(props: OrganizationProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Organization!</h1>
    </div>
  );
}

export default Organization;
