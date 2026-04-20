const { 
  CognitoIdentityProviderClient, 
  GetUserCommand, 
  AdminGetUserCommand,
  SignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ChangePasswordCommand,
  GlobalSignOutCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const verifyIdToken = async (idToken) => {
  try {
    // Decode without verification first (get kid from header)
    const decoded = jwt.decode(idToken, { complete: true });
    
    // In production, fetch the public key from Cognito JWKS endpoint
    // and verify the signature properly
    return decoded.payload;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

const getUserFromCognito = async (accessToken) => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });
    const response = await cognitoClient.send(command);
    
    const userAttributes = {};
    response.UserAttributes.forEach(attr => {
      userAttributes[attr.Name] = attr.Value;
    });

    return userAttributes;
  } catch (error) {
    console.error('Error fetching user from Cognito:', error);
    throw error;
  }
};

const createOrUpdateLocalUser = async (User, cognitoData) => {
  const email = cognitoData.email || cognitoData['email'];
  
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      cognitoId: cognitoData.sub,
      email,
      name: cognitoData['name'] || cognitoData['custom:name'] || email.split('@')[0],
      avatar: cognitoData.picture,
      loginProvider: cognitoData.iss?.includes('google') ? 'google' : 'cognito',
    });
  } else {
    user.cognitoId = cognitoData.sub;
    if (cognitoData.picture) user.avatar = cognitoData.picture;
  }

  await user.save();
  return user;
};

module.exports = {
  verifyIdToken,
  getUserFromCognito,
  createOrUpdateLocalUser,
  cognitoClient,
};


const signUpUser = async (email, password, name) => {
  const command = new SignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name }
    ]
  });
  return cognitoClient.send(command);
};

const authenticateUser = async (email, password) => {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  });
  return cognitoClient.send(command);
};

const forgotPassword = async (email) => {
  const command = new ForgotPasswordCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email
  });
  return cognitoClient.send(command);
};

const confirmForgotPassword = async (email, code, newPassword) => {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword
  });
  return cognitoClient.send(command);
};

const confirmSignUp = async (email, code) => {
  const command = new ConfirmSignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code
  });
  return cognitoClient.send(command);
};

const resendConfirmationCode = async (email) => {
  const command = new ResendConfirmationCodeCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email
  });
  return cognitoClient.send(command);
};

const changePassword = async (accessToken, previousPassword, proposedPassword) => {
  const command = new ChangePasswordCommand({
    AccessToken: accessToken,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword
  });
  return cognitoClient.send(command);
};

const globalSignOut = async (accessToken) => {
  const command = new GlobalSignOutCommand({
    AccessToken: accessToken
  });
  return cognitoClient.send(command);
};

const generate2FASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `CloudMart (${email})`,
    issuer: 'CloudMart'
  });
  return secret;
};

const verify2FAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  });
};

const generateQRCode = async (otpauthUrl) => {
  return QRCode.toDataURL(otpauthUrl);
};

module.exports = {
  verifyIdToken,
  getUserFromCognito,
  createOrUpdateLocalUser,
  signUpUser,
  authenticateUser,
  forgotPassword,
  confirmForgotPassword,
  confirmSignUp,
  resendConfirmationCode,
  changePassword,
  globalSignOut,
  generate2FASecret,
  verify2FAToken,
  generateQRCode,
  cognitoClient,
};
