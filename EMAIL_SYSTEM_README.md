# Nourish Box Email System Documentation

This document explains the email notification system implemented using Brevo (formerly Sendinblue) for the Nourish Box application.

## Overview

The email system handles two main types of notifications:

1. **Contact Form Submissions** - Sends notifications to all admin users when someone submits the contact form
2. **Order Notifications** - Sends order confirmations to customers and notifications to admins when orders are placed

## Setup

### 1. Install Dependencies

The Brevo Node SDK is already installed:

```bash
pnpm add @getbrevo/brevo
```

### 2. Environment Variables

Add your Brevo API key to your `.env.local` file:

```env
BREVO_API_KEY=your_brevo_api_key_here
```

**How to get your Brevo API key:**

1. Sign up/login to [Brevo](https://app.brevo.com/)
2. Go to Settings → API Keys → SMTP & API
3. Create a new API key
4. Copy the key to your environment file

### 3. Admin Users Setup

Make sure you have admin users in your database with `role: "admin"` to receive notifications.

## Features

### Contact Form Notifications

- **Trigger**: When someone submits the contact form at `/contact_us`
- **Recipients**: All admin users in the database
- **Template**: Professional email template with contact details and message
- **Reply-To**: Set to the customer's email for easy response

### Order Notifications

#### Customer Order Confirmation

- **Trigger**: After successful payment verification
- **Recipients**: The customer who placed the order
- **Template**: Order details, recipes, delivery info, and next steps
- **Sender**: orders@nourishbox.com

#### Admin Order Notification

- **Trigger**: After successful payment verification
- **Recipients**: All admin users in the database
- **Template**: Urgent notification with customer info, order details, and action items
- **Sender**: admin@nourishbox.com

## API Endpoints

### Contact Form API

```
POST /api/contact
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "message": "Your message here"
}
```

### Order Notification API

```
POST /api/email/order-notification
```

**Request Body:**

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "orderId": "order-123",
  "orderAmount": 15000,
  "recipes": [
    { "name": "Jollof Rice", "price": 8000 },
    { "name": "Grilled Chicken", "price": 7000 }
  ],
  "deliveryAddress": "123 Main St",
  "deliveryCity": "Lagos",
  "deliveryState": "Lagos",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Test Email API (Development Only)

```
POST /api/test-email
```

**Request Body:**

```json
{
  "type": "contact|order-customer|order-admin",
  "testEmail": "test@example.com"
}
```

## Implementation Details

### Email Service (`app/api/utils/email.service.ts`)

- Uses Brevo's TransactionalEmailsApi
- Professional HTML email templates with inline CSS
- Error handling and logging
- Nigerian currency formatting
- Responsive email design

### Contact Form Integration

- Form validation (Nigerian phone numbers)
- Real-time error handling
- Loading states
- Success/error toast notifications
- Form reset on successful submission

### Order Flow Integration

- Automatically triggered after payment verification
- Fetches delivery and recipe details
- Sends emails to both customer and admins
- Graceful error handling (doesn't fail transaction if emails fail)

## Email Templates

### Contact Form Template

- Branded header with Nourish Box logo
- Customer contact details in organized cards
- Message display with line break handling
- Call-to-action for admin response
- Professional footer

### Customer Order Confirmation

- Order confirmation badge
- Personalized greeting
- Order details (ID, date, delivery address)
- Recipe table with prices
- Total amount highlighted
- Next steps and expectations
- Customer service contact info

### Admin Order Notification

- Urgent alert styling
- Customer information card
- Order details with timestamp
- Recipe preparation list
- Revenue tracking
- Action checklist for order processing
- 2-hour response requirement

## Testing

### Manual Testing

1. **Test Contact Form:**

   - Go to `/contact_us`
   - Fill out and submit the form
   - Check admin emails for notification

2. **Test Order Flow:**
   - Place a test order through the checkout process
   - Complete payment with test Paystack credentials
   - Check customer email for confirmation
   - Check admin emails for notification

### API Testing

Use the test endpoint to verify email functionality:

```bash
# Test contact notification
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "contact", "testEmail": "your-test-email@example.com"}'

# Test customer order confirmation
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "order-customer", "testEmail": "your-test-email@example.com"}'

# Test admin order notification
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "order-admin", "testEmail": "your-test-email@example.com"}'
```

## Error Handling

- API validation for required fields
- Email format validation
- Phone number validation (Nigerian format)
- Brevo API error handling
- Database connection error handling
- Graceful degradation (transaction succeeds even if emails fail)

## Security

- Environment variables for API keys
- Input sanitization and validation
- SQL injection prevention through Firebase
- Rate limiting (implement if needed)

## Maintenance

### Monitoring

- Check server logs for email sending errors
- Monitor Brevo dashboard for delivery rates
- Track API usage and rate limits

### Admin User Management

- Ensure admin users have valid email addresses
- Regularly audit admin user list
- Update admin users as team changes

## Troubleshooting

### Common Issues

1. **Emails not sending:**

   - Check BREVO_API_KEY is set correctly
   - Verify API key has transactional email permissions
   - Check server logs for error messages

2. **Admin notifications not received:**

   - Verify admin users exist in database with role="admin"
   - Check admin email addresses are valid
   - Ensure admin users have verified email addresses

3. **Email formatting issues:**

   - Check email client compatibility
   - Verify HTML template syntax
   - Test with different email providers

4. **API errors:**
   - Validate request body format
   - Check required fields are provided
   - Verify database connections

### Support

For Brevo-specific issues, check their documentation:

- [Brevo API Docs](https://developers.brevo.com/)
- [Node.js SDK](https://github.com/getbrevo/brevo-node)

## Next Steps

Future enhancements could include:

- Email templates customization in admin panel
- Email delivery tracking and analytics
- Customer email preferences management
- Automated order status update emails
- Newsletter functionality
- Email queue for high-volume scenarios
