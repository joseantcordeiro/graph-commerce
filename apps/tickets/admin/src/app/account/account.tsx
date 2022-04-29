import styles from './account.module.scss';
import {
	Formik,
	Form,
	Field,
} from 'formik';
import * as Yup from 'yup';
import ProfilePicture from './profile-picture'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CurrentUser, getApiDomain, getApiVersion } from '@graph-commerce/api-utils';
import Navbar from '../navbar/navbar';

/* eslint-disable-next-line */
export interface AccountProps {
  currentUser: CurrentUser;
  currentOrganization: { name: string; id: string};
}

interface Languages {
	data: { alpha_2: string,	name: string }[];
}

interface FormValues {
	name: string;
	defaultLanguage: string;
}

const ValidatorSchema = Yup.object().shape({
	name: Yup.string()
		.min(8, 'Too Short!')
		.max(100, 'Too Long!')
		.required('Required'),
});

export function Account(props: AccountProps) {
  const [ languages, setLanguages ] = useState<Languages>({ data: [] });

  async function loadData() {
		try {
      const res = await axios.get(getApiDomain() + getApiVersion() + "/languages");
			if (res.statusText !== "OK") {
        throw Error(res.statusText);
      }
      setLanguages({ data: res.data.results });
    } catch (error) {
      console.log(error);
    }
	}

	useEffect(() => {
		  loadData();
	}, []);

  const initialValues: FormValues = { name: props.currentUser.name, defaultLanguage: 'en' };

  return (
    <div className="container">
      <Navbar currentUser={props.currentUser} currentOrganization={props.currentOrganization}/>
				<div className="columns is-centered">
					<div className="column is-one-quarter">
						<div className="box">
							<ProfilePicture image={props.currentUser.picture} />
						</div>
					</div>
					<div className="column">
					<div className="box">
					<Formik
					initialValues={initialValues}
					validationSchema={ValidatorSchema}
					onSubmit={async (values, actions) => {
						console.log({ values, actions });
						const res = await axios.patch(getApiDomain() + getApiVersion() + "/person", values);
						/** if (res.statusText !== "OK") {
							throw Error(res.statusText);
						} */
						alert('Profile updated!');
						actions.setSubmitting(false);
					}}
				>
				{({ errors, touched }) => (
					<Form>
					<div className="field">
						<label htmlFor="name">Full Name</label>
						<div className="control">
							<Field className="input" id="name" name="name" placeholder="Full Name" />
							{errors.name && touched.name ? <div className="notification is-danger is-light"><button className="delete"></button>{errors.name}</div> : null}
						</div>
					</div>
					<div className="field">
						<label className="label">Default Language</label>
						<div className="control">
							<div className="select">
								<Field as="select" name="defaultLanguage">
									{languages.data.map(item => (
										<option value={item.alpha_2}>{item.name}</option>
									))}
								</Field>

							</div>
						</div>
					</div>
						<button className="button is-primary" type="submit">Update Profile</button>
					</Form>
					)}
					</Formik>
					</div>
					</div>
				</div>
			</div>
  );
}

export default Account;
