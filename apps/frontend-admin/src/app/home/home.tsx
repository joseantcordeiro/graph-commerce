// import styles from './home.module.scss';
import { CurrentUser } from '@graph-commerce/api-utils';
import SuccessView from './successview';

/* eslint-disable-next-line */
export interface HomeProps {
  currentUser: CurrentUser;
}

export function Home(props: HomeProps) {
  return (
    <div className="container">
				<div className="columns">

				</div>
				<SuccessView userId={props.currentUser.userId} />
		</div>
  );
}

export default Home;
