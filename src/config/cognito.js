import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool ID
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
};

const userPool = new CognitoUserPool(poolData);

export function getCognitoUserSub() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          console.error("Session error:", err);
          resolve("guest");
        }

        if (!session.isValid()) {
          console.log(
            "Session is invalid or has expired, redirecting to sign-in."
          );
          resolve("guest");
        }

        cognitoUser.getUserAttributes(function (err, attributes) {
          if (err) {
            reject(err);
          } else {
            for (let attribute of attributes) {
              if (attribute.getName() === "sub") {
                resolve(attribute.getValue());
                return;
              }
            }
            reject(new Error("Sub attribute not found"));
          }
        });
      });
    } else {
      resolve("guest");
    }
  });
}
