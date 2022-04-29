import axios from "axios";
import { Component } from "react";
import Session from "supertokens-auth-react/recipe/session";
import { getApiDomain, getApiVersion } from "@graph-commerce/api-utils";
import cx from "classnames";

Session.addAxiosInterceptors(axios);

interface IProps {
	organization: { name: string; id: string };
}

interface IState {
	data: { name: string,	id: string }[];
}

export default class OrgDropDown extends Component<IProps, IState> {
	constructor(props: IProps) {
    super(props)
    this.state = { data: [] };
  }

	override async componentDidMount() {
    try {
      const response = await axios.get(getApiDomain() + getApiVersion() + "/organization");
			if (response.statusText !== "OK") {
        throw Error(response.statusText);
      }
      this.setState({ data: response.data.results });
    } catch (error) {
      console.log(error);
    }
	}

	override render() {
		return (
		<div className="navbar-item has-dropdown is-hoverable">
			<a className="navbar-link">
				Organizations
			</a>

			<div className="navbar-dropdown">
			{this.state.data.map(item => (
				<a className={cx("navbar-item", item.id === this.props.organization.id && "is-active")} id={item.id} >
					{item.name}
				</a>
			))}
				<hr className="navbar-divider" />
				<a className="navbar-item" href="/organization/create">
					Create
				</a>
			</div>
		</div>
		)
	}
}

