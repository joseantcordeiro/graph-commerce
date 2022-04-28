import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { ConfigInjectionToken, AuthModuleConfig } from './config/auth.config';

@Injectable()
export class SupertokensService {
  constructor(@Inject(ConfigInjectionToken) private config: AuthModuleConfig) {

    supertokens.init({
      appInfo: config.appInfo,
      supertokens: {
        connectionURI: config.connectionURI,
        apiKey: config.apiKey,
      },
      recipeList: [
        EmailPassword.init({
					override: {
						apis: (originalImplementation) => {
								return {
										...originalImplementation,
										signUpPOST: async function (input) {

												if (originalImplementation.signUpPOST === undefined) {
														throw Error("Should never come here");
												}

												// First we call the original implementation of signUpPOST.
												const response = await originalImplementation.signUpPOST(input);

												// Post sign up response, we check if it was successful
												if (response.status === "OK") {
														const { id, email } = response.user;

														// These are the input form fields values that the user used while signing up
														// let formFields = input.formFields;

														// this.personQueue.add('signup', { id: id, email: email });

												}
												return response;
										}
								}
						}
					},

				}),
        Session.init({
          jwt: {
            enable: true,
          },

          /** override: {
            functions: (originalImplementation) => {
              return {
                ...originalImplementation,
                createNewSession: async function (input) {
                  const userId = input.userId;
									const rolesservice = new RolesService(); //
									const roles = await Roles.getOrganizationRoles(userId);

                  // This goes in the access token, and is availble to read on the frontend.
                  input.accessTokenPayload = {
                    ...input.accessTokenPayload,
                    role: roles,
                  };

                  return originalImplementation.createNewSession(input);
                },
              };
            },
        	}, */
				}),
      ],
    });
  }

}
