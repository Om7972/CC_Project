const { CognitoIdentityProviderClient, GetUserCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const jwt = require('jsonwebtoken');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
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
