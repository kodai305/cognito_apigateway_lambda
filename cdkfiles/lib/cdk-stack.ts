import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Stack,
  StackProps,
  RemovalPolicy,
  aws_cognito,
  aws_apigateway,
} from 'aws-cdk-lib';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new aws_cognito.UserPool(this, 'userPool', {
      userPoolName: 'testUserPool',
      selfSignUpEnabled: false,
      standardAttributes: {
        email: { required: true, mutable: true },
        phoneNumber: { required: false },
      },
      signInCaseSensitive: false,
      autoVerify: { email: true },
      signInAliases: { email: true },
      accountRecovery: aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // User Pool Domain ログインUIを使う場合のみ?
    userPool.addDomain('domain', {
      cognitoDomain: { domainPrefix: 'demoapponetwothreefourfivesix' },
    });

    // User Pool Client
    const userPoolClient = userPool.addClient('client', {
      userPoolClientName: 'testUserPoolClient',
      generateSecret: false,
      oAuth: {
        callbackUrls: ['https://example.com/callback'],
        logoutUrls: ['https://example.com/signout'],
        flows: { 
          authorizationCodeGrant: true,
          implicitCodeGrant: true
        },
        scopes: [
          aws_cognito.OAuthScope.EMAIL,
          aws_cognito.OAuthScope.OPENID,
          aws_cognito.OAuthScope.COGNITO_ADMIN,
          aws_cognito.OAuthScope.PROFILE,
        ],
      }
    });

    // Amplifyのconfigure時にidentityPoolIdが必要
    new aws_cognito.CfnIdentityPool(this, 'identity-pool', {
      identityPoolName: 'my-identity-pool',
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });    

    // lambda
    const lambdaFunc = new lambdaNodejs.NodejsFunction(this, 'HelloFunction', {
      entry: '../lambda/index.js',
    })

    // api gateway
    const restApi = new aws_apigateway.RestApi(this, 'restApiSample');

    // Cognito Authorizer
    const cognitoAuthorizer = new aws_apigateway.CognitoUserPoolsAuthorizer(this, 'cognitoAuthorizer', {
      authorizerName: 'CognitoAuthorizer',
      cognitoUserPools: [userPool],
    });

    // Rest API Resource/Method
    restApi.root
      .addResource('data')
      .addMethod('GET', new aws_apigateway.LambdaIntegration(lambdaFunc), {
        authorizer: cognitoAuthorizer,
      });

  }
}
