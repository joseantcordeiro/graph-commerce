import axios from 'axios';
import Session from "supertokens-auth-react/recipe/session";
import styles from './api-utils.module.scss';

export type CurrentUser = {
	userId: string;
  name: string;
	email: string;
	picture: string;
  defaultLanguage: string;
	defaultOrganizationId: string;
	defaultOrganizationName: string;
}

export function getApiDomain() {
  const apiPort = process.env['REACT_APP_API_PORT'] || 3333;
  return process.env['REACT_APP_API_URL'] || `http://localhost:${apiPort}`;
}

export function getWebsiteDomain() {
  const websitePort = process.env['REACT_APP_WEBSITE_PORT'] || 4200;
  return process.env['REACT_APP_WEBSITE_URL'] || `http://localhost:${websitePort}`;
}

export function getApiVersion() {
const apiVersion = process.env['REACT_APP_API_VERSION'] || 'v1';
return process.env['REACT_APP_API_PATH'] || `/api/${apiVersion}`;
}

export function getMinioDomain() {
const minioPort = process.env['REACT_APP_MINIO_PORT'] || 9000;
return process.env['REACT_APP_MINIO_URL'] || `http://192.168.1.95:${minioPort}`;
}

export function CallAPIView() {
  async function callAPIClicked() {
      // this will also automatically refresh the session if needed
      const response = await axios.get(API_URL + "/person");
      window.alert("Session Information:\n" + JSON.stringify(response, null, 2));
  }

  return (
    <div className="buttons">
      <button onClick={callAPIClicked} className="button is-primary">Call API</button>
    </div>
  );
}

export const API_URL = getApiDomain() + getApiVersion();

export const api = {
  get(url: string) {
    Session.addAxiosInterceptors(axios);
    return axios
      .get(`${API_URL}${url}`)
      .then((response) => {
        return response.data?.data;
      })
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  getFullResponse(url: string, params?: { [key: string]: string | string[] | number }) {
    return axios
      .get(`${API_URL}${url}`, {
        params,
      })
      .then((response) => response.data)
      .catch((error) => {

        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  put(url: string, payload: any) {
    return axios
      .put(`${API_URL}${url}`, payload)
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  post(url: string, payload: any) {
    return axios
      .post(`${API_URL}${url}`, payload)
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
};
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
