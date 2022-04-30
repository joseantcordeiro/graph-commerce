import { Route, Routes, Link } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import SuperTokens, { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react";
import Session from "supertokens-auth-react/recipe/session";
import { SessionExpiredPopup } from '@graph-commerce/react-popups';
import { CurrentUser, getApiDomain, getWebsiteDomain, API_URL } from '@graph-commerce/api-utils';
import { useEffect, useState } from 'react';
import Home from './home/home';
import axios from 'axios';
import Account from './account/account';
import Footer from './footer/footer';
import Group from './group/group';
import Settings from './settings/settings';

SuperTokens.init({
  appInfo: {
      appName: "Tickets Admin", // TODO: Your app name
      apiDomain: getApiDomain(), // TODO: Change to your app's API domain
      websiteDomain: getWebsiteDomain(), // TODO: Change to your app's website domain
  },
  recipeList: [
    EmailPassword.init({
        emailVerificationFeature: {
          mode: "REQUIRED",
        },
        /**
        onHandleEvent: async (context) => {
          if (context.action === "SESSION_ALREADY_EXISTS") {
              // TODO:
          } else {
              if (context.action === "SUCCESS") {
                  if (context.isNewUser) {
                      // TODO: Sign up
                  } else {
                      // TODO: Sign in
                  }
              }
          }
        }

        getRedirectionURL: async (context) => {
          if (context.action === "RESET_PASSWORD") {
              // called when the user clicked on the forgot password button
          } else if (context.action === "SIGN_IN_AND_UP") {
              // called when the user is navigating to sign in / up page
          } else if (context.action === "SUCCESS") {
              // called on a successful sign in / up. Where should the user go next?
              let redirectToPath = context.redirectToPath;
              if (redirectToPath !== undefined) {
                  // we are navigating back to where the user was before they authenticated
                  return redirectToPath;
              }
              if (context.isNewUser) {
                  // user signed up
                  return "/organization/create"
              } else {
                  // user signed in
                  return "/dashboard"
              }
          } else if (context.action === "VERIFY_EMAIL") {
              // called when the user is to be shown the verify email screen
          }
          // return undefined to let the default behaviour play out
          return undefined;
        } */
      }),
      Session.init(),
  ],
});

Session.addAxiosInterceptors(axios);
const initialGlobalState: CurrentUser = {
  userId: "", name: "", email: "", picture: "", defaultOrganizationId: "",
  defaultOrganizationName: ""
};

export function App() {
  const [ showSessionExpiredPopup, updateShowSessionExpiredPopup ] = useState(false);
  const [ currentUser, updateUser ] = useState(initialGlobalState);

  async function loadUserData() {
		try {
			const response = await axios.get(API_URL + "/person");
			if (response.statusText !== "OK") {
				throw Error(response.statusText);
			}
			updateUser( response.data );
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		  loadUserData();
	}, []);

  return (
    <>
      <div />
      <Routes>
        {/* This shows the login UI on "/auth" route */}
        {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"))}
        <Route
          path="/"
          element={
            <EmailPassword.EmailPasswordAuth
              onSessionExpired={() => {
                updateShowSessionExpiredPopup(true);
              }}>
              <Home currentUser={currentUser}/>
              {showSessionExpiredPopup && <SessionExpiredPopup />}
            </EmailPassword.EmailPasswordAuth>
          }
        />
        <Route
          path="/account"
          element={
            <EmailPassword.EmailPasswordAuth
              onSessionExpired={() => {
                updateShowSessionExpiredPopup(true);
              }}>
              <Account currentUser={currentUser}/>
              {showSessionExpiredPopup && <SessionExpiredPopup />}
            </EmailPassword.EmailPasswordAuth>
          }
        />
        <Route
          path="/group"
          element={
            <EmailPassword.EmailPasswordAuth
              onSessionExpired={() => {
                updateShowSessionExpiredPopup(true);
              }}>
              <Group currentUser={currentUser}/>
              {showSessionExpiredPopup && <SessionExpiredPopup />}
            </EmailPassword.EmailPasswordAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <EmailPassword.EmailPasswordAuth
              onSessionExpired={() => {
                updateShowSessionExpiredPopup(true);
              }}>
              <Settings currentUser={currentUser}/>
              {showSessionExpiredPopup && <SessionExpiredPopup />}
            </EmailPassword.EmailPasswordAuth>
          }
        />
      </Routes>
      {/* END: routes */}
      <Footer />
    </>
  );
}

export default App;
