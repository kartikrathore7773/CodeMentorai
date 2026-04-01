# Forgot Password Implementation

This implementation provides a secure forgot password functionality using Node.js, Express, MongoDB, and Nodemailer.

## Features

- **Secure Token Generation**: Uses cryptographically secure random bytes
- **Hashed Token Storage**: Tokens are SHA-256 hashed before storing in database
- **Time-limited Tokens**: Reset links expire after 15 minutes
- **One-time Use**: Tokens are cleared after successful password reset
- **No Information Leakage**: Backend doesn't reveal if email exists
- **Professional Emails**: HTML emails with branding and security notices

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/yourapp

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Gmail Setup (Production)

For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASS

### 4. MongoDB Setup

Make sure your User model includes these fields:

```javascript
resetPasswordToken: String,
resetPasswordExpire: Date,
```

## API Endpoints

### POST /api/auth/forgot-password

- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "message": "Password reset link sent" }`

### POST /api/auth/reset-password/:token

- **Body**: `{ "password": "newpassword123" }`
- **Response**: `{ "message": "Password reset successful" }`

## Frontend Integration

### Forgot Password Page

- Form with email input
- POST to `/api/auth/forgot-password`
- Show success message

### Reset Password Page

- Extract token from URL params
- Form with password input
- POST to `/api/auth/reset-password/:token`
- Redirect to login on success

## Security Features

1. **Token Security**:
   - 32-byte cryptographically secure random token
   - SHA-256 hashed before database storage
   - 15-minute expiration
   - One-time use (cleared after reset)

2. **User Experience**:
   - No email enumeration (same response for existing/non-existing emails)
   - Clear error messages for invalid/expired tokens
   - Professional email templates

3. **Production Ready**:
   - Environment-based configuration
   - Fallback to Ethereal for development
   - Proper error handling

## Email Templates

The system sends professional HTML emails with:

- Company branding
- Clear call-to-action buttons
- Security notices
- Expiration warnings
- Mobile-responsive design

## Development vs Production

- **Development**: Uses Ethereal (fake SMTP) for email testing
- **Production**: Uses real SMTP (Gmail, SendGrid, etc.)

## Testing

1. Start the server
2. Visit forgot password page
3. Enter an email
4. Check console for Ethereal preview URL
5. Click the link to test password reset

## Error Handling

- Invalid tokens: "Token invalid or expired"
- Expired tokens: Same error (no distinction)
- Network issues: Proper error responses
- Email failures: Logged but don't break the flow
