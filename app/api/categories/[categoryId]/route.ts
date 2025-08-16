import { NextRequest, NextResponse } from 'next/server';
import { Category } from '../../../utils/types/category.type';
import {
  deleteCategoryAdmin,
  fetchCategoryByIdAdmin,
  updateCategoryAdmin,
} from '../../adminUtils/category.admin';

// GET - Fetch a single category
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const category = await fetchCategoryByIdAdmin(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const body = await request.json();
    const { name, description, order } = body;

    const updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> =
      {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Invalid category name' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || order < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid order value' },
          { status: 400 }
        );
      }
      updates.order = order;
    }

    await updateCategoryAdmin(categoryId, updates);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    await deleteCategoryAdmin(categoryId);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
