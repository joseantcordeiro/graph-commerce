import { CurrentUser, API_URL } from '@graph-commerce/api-utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Session from "supertokens-auth-react/recipe/session";
import cx from "classnames";
import Navbar from '../navbar/navbar';
import styles from './group.module.scss';

/* eslint-disable-next-line */
export interface GroupProps {
  currentUser: CurrentUser;
}

Session.addAxiosInterceptors(axios);

export function Group(props: GroupProps) {
  const [searchedWord, setSearch] = useState("");
  const [resultSearch, setResults] = useState([]);
  const [resultCards, setCards] = useState([]);
	const [groupId, setGroupId] = useState("");

  useEffect(() => {
    // Create an scoped async function in the hook
    async function searchWithMeili() {
			if (props.currentUser.defaultOrganizationId.length > 0) {
				const search = await axios.get(API_URL + "/search/indexes/group-" + props.currentUser.defaultOrganizationId + "/search?q=" + searchedWord);
				setResults(search.data.hits);
			}
      /** const search = index.search(searchedWord, {
				limit: 10,
				attributesToHighlight: ["name"],
				filter: 'deleted = false'
			}); */

    }
    // Execute the created function directly
    searchWithMeili();
  }, [props.currentUser.defaultOrganizationId, searchedWord]);

	useEffect(() => {
		async function getCards () {
			const arrayItems: any = [];
			for (const element of resultSearch) {
				const group: any = element;
				arrayItems.push(
					<tr>
						<td>{group.name}</td>
						<td>{group.description}</td>
						<td>{group.type}</td>
						<td><button onClick={() => setGroupId(group.id)} className="js-modal-trigger button is-warning" data-target="roles" >{(group.type === 'PERMISSION') ? 'Roles' : 'Links'}</button></td>
						<td><button onClick={() => setGroupId(group.id)} className="js-modal-trigger button is-info" data-target="members" >Members</button></td>
						<td><button onClick={() => setGroupId(group.id)} className="button is-success">Edit</button></td>
						<td><button onClick={() => setGroupId(group.id)} className="js-modal-trigger button is-danger" data-target="delete" >Delete</button></td>
					</tr>
				);
			}
			setCards(arrayItems);
		}
    getCards();
  }, [resultSearch]);

  return (
    <div className="container">
      <Navbar currentUser={props.currentUser}/>
      <div className="block">
					<div className="card">
						<header className="card-header">
							<p className="card-header-title">
								Group Search
							</p>
							<a href="#" className="card-header-icon" aria-label="more options">
								<span className="icon">
									<i className="fa fa-angle-down" aria-hidden="true"></i>
								</span>
							</a>
						</header>
						<div className="card-content">
							<div className="content">
								<div className="control has-icons-left has-icons-right">
									<input
										type="text"
										value={searchedWord}
										onChange={(event) => setSearch(event.target.value)}
										className="input is-medium"
										placeholder="Type the Group Name, description, type…"
									/>
									<span className="icon is-medium is-left">
										<i className="fa fa-search"></i>
									</span>
									<span className="icon is-medium is-right">
										<i className="fa fa-check"></i>
									</span>
								</div>
							</div>
						</div>
					</div>
        </div>

        <div className="block">
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Description</th>
								<th>Type</th>
								<th><button className="button is-link">Create</button></th>
								<th></th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{resultCards}
						</tbody>
					</table>
				</div>


    </div>
  );
}

export default Group;
