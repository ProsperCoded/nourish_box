import {
  getBusinessRulesAdmin,
  updateBusinessRulesAdmin,
} from '@/app/api/adminUtils/site-content.admin';
import { BusinessRules } from '@/app/utils/types/site-content.type';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/business-rules - Get current business rules
export async function GET() {
  try {
    const businessRules = await getBusinessRulesAdmin();

    return NextResponse.json({
      status: true,
      message: 'Business rules fetched successfully',
      data: businessRules,
    });
  } catch (error) {
    console.error('Error fetching business rules:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to fetch business rules',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/business-rules - Update business rules
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { deliveryFee, taxRate, taxEnabled }: Partial<BusinessRules> = body;

    // Basic validation
    const updates: Partial<BusinessRules> = {};

    if (deliveryFee !== undefined) {
      if (typeof deliveryFee !== 'number' || deliveryFee < 0) {
        return NextResponse.json(
          {
            status: false,
            message: 'Delivery fee must be a non-negative number',
          },
          { status: 400 }
        );
      }
      updates.deliveryFee = deliveryFee;
    }

    if (taxRate !== undefined) {
      if (typeof taxRate !== 'number' || taxRate < 0 || taxRate > 100) {
        return NextResponse.json(
          {
            status: false,
            message: 'Tax rate must be a number between 0 and 100',
          },
          { status: 400 }
        );
      }
      updates.taxRate = taxRate;
    }

    if (taxEnabled !== undefined) {
      if (typeof taxEnabled !== 'boolean') {
        return NextResponse.json(
          {
            status: false,
            message: 'Tax enabled must be a boolean value',
          },
          { status: 400 }
        );
      }
      updates.taxEnabled = taxEnabled;
    }

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'No valid updates provided',
        },
        { status: 400 }
      );
    }

    const updatedBusinessRules = await updateBusinessRulesAdmin(updates);

    return NextResponse.json({
      status: true,
      message: 'Business rules updated successfully',
      data: updatedBusinessRules,
    });
  } catch (error) {
    console.error('Error updating business rules:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to update business rules',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
