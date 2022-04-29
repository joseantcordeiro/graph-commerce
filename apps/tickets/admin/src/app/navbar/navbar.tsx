import { Link, useNavigate } from 'react-router-dom';
import { CurrentUser, getApiDomain, getApiVersion } from '@graph-commerce/api-utils';
import { useState } from 'react';
import { signOut } from "supertokens-auth-react/recipe/emailpassword";
import AccountDropDown from './AccountDropDown';
import styles from './navbar.module.scss';
import OrgDropDown from './OrgDropDown';
import axios from 'axios';

/* eslint-disable-next-line */
export interface NavbarProps {
  currentUser: CurrentUser;
  currentOrganization: { name: string; id: string}
}

export function Navbar(props: NavbarProps) {
  const [isActive, setisActive] = useState(false)

  const navigate = useNavigate();
	async function logoutClicked() {
    await signOut();
    navigate("/auth");
  }

  async function organizationClicked (id: string) {
		const values = { organizationId: id };
		try {
			const response = await axios.post(getApiDomain() + getApiVersion() +"/person/organization", values);
			if (response.statusText !== "OK") {
				throw Error(response.statusText);
			}
			navigate("/");
		} catch (error) {
			console.log(error);
		}
	}

  return (
    <nav className='navbar' role='navigation' aria-label='main navigation'>
      <div className='navbar-brand'>
        <a href='/' className='navbar-item'>
          <img
            src='https://bulma.io/images/bulma-logo.png'
            alt='Logo'
            width='112'
            height='28'
          />
        </a>

        <a
          onClick={() => {
            setisActive(!isActive)
          }}
          role='button'
          className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
          aria-label='menu'
          aria-expanded='false'
          data-target='navbarBasicExample'
        >
          <span aria-hidden='true'></span>
          <span aria-hidden='true'></span>
          <span aria-hidden='true'></span>
        </a>
      </div>

      <div id='navbarBasicExample' className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <a className="navbar-item" href="/">
          <span className="icon">
              <i className="fa fa-home"></i>
            </span>
          <span>{props.currentOrganization.name}</span>
          </a>
          <OrgDropDown organization={props.currentOrganization}/>

          <a className="navbar-item" href="/group">
            Groups
          </a>

          <a className="navbar-item" href="/settings">
            Settings
          </a>
        </div>
      </div>

      <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className='navbar-end'>
          <div className='navbar-item'>
            <span className="icon">
              <i className="fa-brands fa-github"></i>
            </span>
            <span className="icon">
              <i className="fa-brands fa-twitter"></i>
            </span>
            <span className="icon">
              <i className="fas fa-life-ring"></i>
            </span>
            <AccountDropDown logoutClicked={logoutClicked} picture={props.currentUser.picture} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
