import React from "react";
import { Amplify, Auth } from "aws-amplify";
import {
  AmplifyProvider,
  Authenticator,
  Button,
  Flex,
  Image,
  Text,
  View,
} from "@aws-amplify/ui-react";
//import aws_exports from "./aws-exports";

import "@aws-amplify/ui-react/styles.css";
import theme from "./theme";
//import logo from "./logo.svg";

const awsConfig = {
  identityPoolId: 'ap-northeast-1:22406f1d-c7ab-4d64-869c-2ee0ee0b115c',
  region: 'ap-northeast-1',
  userPoolId: 'ap-northeast-1_HqFhOiwUN',
  userPoolWebClientId: '4ufcl5bmgedv80a99js6n4d4u1'
}

Amplify.configure(awsConfig);
Auth.configure(awsConfig);

const App = () => {
  Auth.currentSession().then(res=>{
    let accessToken = res.getAccessToken()
    let jwt = accessToken.getJwtToken()
    //You can print them to see the full objects
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
    console.log(`myJwt: ${jwt}`)
  });

  return (
    <AmplifyProvider theme={theme}>
      <Authenticator>
        {({ signOut, user }) => (
          <Flex
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            alignContent="flex-start"
            wrap="nowrap"
            gap="1rem"
            textAlign="center"
          >
{/**
            <View width="100%">
              <Image src={logo} alt="logo" width={240} height={240} />
            </View>
*/}
            {user && (
              <View width="100%">
                <Text>Hello {user.username}</Text>
                <Button onClick={signOut}>
                  <Text>Sign Out</Text>
                </Button>
              </View>
            )}
          </Flex>
        )}
      </Authenticator>
    </AmplifyProvider>
  );
};

export default App;
