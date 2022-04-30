import { CurrentUser } from '@graph-commerce/api-utils';
import Navbar from '../navbar/navbar';
import styles from './home.module.scss';
import SuccessView from './SuccessView';

/* eslint-disable-next-line */
export interface HomeProps {
  currentUser: CurrentUser;
}

export function Home(props: HomeProps) {
  return (
    <div className="container">
      <Navbar currentUser={props.currentUser}/>
				<div className="columns">

				</div>
				<SuccessView userId={props.currentUser.userId} organizationId={props.currentUser.defaultOrganizationId} />
		</div>
  );
}

export default Home;
