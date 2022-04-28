import axios from 'axios';
import Session from "supertokens-auth-react/recipe/session";
import styles from './api-utils.module.scss';

export type CurrentUser = {
	userId: string;
  name: string;
	email: string;
	picture: string;
	/** defaultOrganizationId: string;
	defaultOrganizationName: string; */
}

Session.addAxiosInterceptors(axios);

export function getApiDomain() {
  const apiPort = process.env['REACT_APP_API_PORT'] || 3333;
  const apiUrl = process.env['REACT_APP_API_URL'] || `http://localhost:${apiPort}`;
  return apiUrl;
}

export function getWebsiteDomain() {
  const websitePort = process.env['REACT_APP_WEBSITE_PORT'] || 4200;
  const websiteUrl = process.env['REACT_APP_WEBSITE_URL'] || `http://localhost:${websitePort}`;
  return websiteUrl;
}

export function getApiVersion() {
const apiVersion = process.env['REACT_APP_API_VERSION'] || 'v1';
const apiPath = process.env['REACT_APP_API_PATH'] || `/api/${apiVersion}`;
return apiPath;
}

export function getMinioDomain() {
const minioPort = process.env['REACT_APP_MINIO_PORT'] || 9000;
const minioUrl = process.env['REACT_APP_MINIO_URL'] || `http://192.168.1.95:${minioPort}`;
return minioUrl;
}

export function CallAPIView() {
  async function callAPIClicked() {
      // this will also automatically refresh the session if needed
      const response = await axios.get(getApiDomain() + "/api/v1/person");
      window.alert("Session Information:\n" + JSON.stringify(response, null, 2));
  }

  return (
    <div className="buttons">
      <button onClick={callAPIClicked} className="button is-primary">Call API</button>
    </div>
  );
}
/* eslint-disable-next-line */
export interface ApiUtilsProps {}

export function ApiUtils(props: ApiUtilsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ApiUtils!</h1>
    </div>
  );
}

export default ApiUtils;
