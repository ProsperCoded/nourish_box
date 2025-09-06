import axios from 'axios';
import { configService, ENV } from '../utils/config.env';

const BREVO_API_URL = 'https://api.brevo.com/v3';
const BREVO_API_KEY = configService.get(ENV.BREVO_API_KEY);

// Subscribe email to Brevo contact list (always uses list ID 2)
export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();

    // Validate required email field
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Prepare contact data with optional attributes
    const contactData: any = {
      email,
      listIds: [3], // Always use list ID 2
    };

    // Add attributes if firstName and lastName are provided
    if (firstName || lastName) {
      contactData.attributes = {};
      if (firstName) {
        contactData.attributes.FIRSTNAME = firstName;
      }
      if (lastName) {
        contactData.attributes.LASTNAME = lastName;
      }
    }

    // Create or update contact using Brevo API
    const response = await axios.post(
      `${BREVO_API_URL}/contacts`,
      contactData,
      {
        headers: {
          'api-key': BREVO_API_KEY || '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return Response.json(response.data);
  } catch (error: any) {
    console.error(
      'Error subscribing email to list:',
      error.response?.data || error.message
    );
    if (error.response?.data.code === 'duplicate_parameter') {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }
    return Response.json(
      { error: 'Failed to subscribe email to list' },
      { status: 500 }
    );
  }
}
