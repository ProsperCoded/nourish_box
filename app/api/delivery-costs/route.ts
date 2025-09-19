import {
  addDeliveryLocation,
  getAllDeliveryLocations,
  getAvailableLGAs,
  getAvailableStates,
  getDeliveryCostForLocation,
  getDeliveryCosts,
  removeDeliveryLocation,
  updateDeliveryCost,
} from '@/app/utils/firebase/delivery-costs.firebase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/delivery-costs - Get delivery costs data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const state = searchParams.get('state');
    const lga = searchParams.get('lga');

    switch (action) {
      case 'states':
        const states = await getAvailableStates();
        return NextResponse.json({
          status: true,
          data: states,
        });

      case 'lgas':
        if (!state) {
          return NextResponse.json(
            { status: false, message: 'State parameter is required' },
            { status: 400 }
          );
        }
        const lgas = await getAvailableLGAs(state);
        return NextResponse.json({
          status: true,
          data: lgas,
        });

      case 'cost':
        if (!state || !lga) {
          return NextResponse.json(
            { status: false, message: 'State and LGA parameters are required' },
            { status: 400 }
          );
        }
        const cost = await getDeliveryCostForLocation(state, lga);
        return NextResponse.json({
          status: true,
          data: cost,
        });

      case 'all-locations':
        const allLocations = await getAllDeliveryLocations();
        return NextResponse.json({
          status: true,
          data: allLocations,
        });

      default:
        const deliveryCosts = await getDeliveryCosts();
        return NextResponse.json({
          status: true,
          data: deliveryCosts,
        });
    }
  } catch (error) {
    console.error('Error in delivery costs GET:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to fetch delivery costs',
      },
      { status: 500 }
    );
  }
}

// POST /api/delivery-costs - Add new delivery location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, lga, cost } = body;

    if (!state || !lga || typeof cost !== 'number') {
      return NextResponse.json(
        {
          status: false,
          message: 'State, LGA, and cost (number) are required',
        },
        { status: 400 }
      );
    }

    if (cost < 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'Cost must be a non-negative number',
        },
        { status: 400 }
      );
    }

    await addDeliveryLocation(state, lga, cost);

    return NextResponse.json({
      status: true,
      message: 'Delivery location added successfully',
    });
  } catch (error) {
    console.error('Error adding delivery location:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to add delivery location',
      },
      { status: 500 }
    );
  }
}

// PUT /api/delivery-costs - Update delivery cost for location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, lga, cost } = body;

    if (!state || !lga || typeof cost !== 'number') {
      return NextResponse.json(
        {
          status: false,
          message: 'State, LGA, and cost (number) are required',
        },
        { status: 400 }
      );
    }

    if (cost < 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'Cost must be a non-negative number',
        },
        { status: 400 }
      );
    }

    await updateDeliveryCost(state, lga, cost);

    return NextResponse.json({
      status: true,
      message: 'Delivery cost updated successfully',
    });
  } catch (error) {
    console.error('Error updating delivery cost:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to update delivery cost',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery-costs - Remove delivery location
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const lga = searchParams.get('lga');

    if (!state || !lga) {
      return NextResponse.json(
        {
          status: false,
          message: 'State and LGA parameters are required',
        },
        { status: 400 }
      );
    }

    await removeDeliveryLocation(state, lga);

    return NextResponse.json({
      status: true,
      message: 'Delivery location removed successfully',
    });
  } catch (error) {
    console.error('Error removing delivery location:', error);
    return NextResponse.json(
      {
        status: false,
        message: 'Failed to remove delivery location',
      },
      { status: 500 }
    );
  }
}
