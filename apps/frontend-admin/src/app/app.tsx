// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import style from './app.module.scss';
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import SuperTokens, { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session, { useSessionContext } from "supertokens-auth-react/recipe/session";
import { getApiDomain, getApiVersion, getWebsiteDomain } from '@graph-commerce/api-utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Home from './home/home';
import { SessionExpiredPopup } from '@graph-commerce/react-popups';
import Footer from './common/footer';

SuperTokens.init({
  appInfo: {
      appName: "Graph Commerce Admin", // TODO: Your app name
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

const initialGlobalState = { userId: "", name: "", email: "", picture: ""};

export function App() {
  const [ showSessionExpiredPopup, updateShowSessionExpiredPopup ] = useState(false);
	const { userId, doesSessionExist } = useSessionContext();
	const [ user, updateUser ] = useState(initialGlobalState);
	const [ organization, setOrganization ] = useState({ name: "", id: "" });

  async function loadUserData() {
		try {
			const response = await axios.get(getApiDomain() + getApiVersion() + "/person");
			if (response.statusText !== "OK") {
				throw Error(response.statusText);
			}
			updateUser( {
				userId: response.data.results[0].id,
				name: response.data.results[0].name,
				email: response.data.results[0].email,
				picture: response.data.results[0].picture,
			} );
			const res = await axios.get(getApiDomain() + getApiVersion() + "/person/organization");
			if (res.statusText !== "OK") {
				throw Error(res.statusText);
			}
			setOrganization( { name: res.data.results[0].name, id: res.data.results[0].id } );
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
    if (!doesSessionExist)
		  loadUserData();
	}, []);

  return (
    <div className="App">
        <Router>
          <div className="fill">

            <Routes>
              {/* This shows the login UI on "/auth" route */}
              {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"))}

              <Route
                path="/"
                element={
                                /* This protects the "/" route so that it shows
                                <Home /> only if the user is logged in.
                                Else it redirects the user to "/auth" */
                  <EmailPassword.EmailPasswordAuth
                    onSessionExpired={() => {
                      updateShowSessionExpiredPopup(true);
                    }}>
                    <Home currentUser={user} />
                    {showSessionExpiredPopup && <SessionExpiredPopup />}
                  </EmailPassword.EmailPasswordAuth>
                }
              />


            </Routes>
          </div>
        </Router>
        <Footer />
    </div>
  );
}

export default App;
