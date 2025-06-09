# Vidcort
online video player

## Environment Variables

To run this server, you will need to set up the following environment variables. You can create a `.env` file in the `server` directory to store these variables:

- `CORS_ORIGIN`: The origin URL for CORS configuration (e.g., `http://localhost:3000`).
- `PORT`: The port on which the server will run (e.g., `8000`).
- `MONGODB_URI`: The connection string for your MongoDB database.
- `ACCESS_TOKEN_SECRET`: Secret key for generating access tokens.
- `ACCESS_TOKEN_EXPIRY`: Expiry time for access tokens (e.g., `1d`).
- `REFRESH_TOKEN_SECRET`: Secret key for generating refresh tokens.
- `REFRESH_TOKEN_EXPIRY`: Expiry time for refresh tokens (e.g., `10d`).
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Your Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.

**Example `.env` file:**
```
CORS_ORIGIN=http://localhost:3000
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
ACCESS_TOKEN_SECRET=youraccesstokensecret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=yourcloudinarycloudname
CLOUDINARY_API_KEY=yourcloudinaryapikey
CLOUDINARY_API_SECRET=yourcloudinaryapisecret
```
Make sure to replace placeholder values with your actual configuration.