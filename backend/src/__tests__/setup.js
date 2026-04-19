process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-ci-only';
process.env.MONGO_URI = 'mongodb://127.0.0.1:59999/cloudmart_test_nonexistent';
