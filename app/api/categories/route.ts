import { NextRequest, NextResponse } from 'next/server';
import { Category } from '../../utils/types/category.type';
import {
  createCategoryAdmin,
  deleteCategoryAdmin,
  fetchCategoriesAdmin,
  getNextCategoryOrderAdmin,
  updateCategoryAdmin,
} from '../adminUtils/category.admin';

// GET - Fetch all categories
export async function GET() {
  try {
    const categories = await fetchCategoriesAdmin();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const order = await getNextCategoryOrderAdmin();

    const categoryData = {
      name: name.trim(),
      description: description?.trim() || null,
      order,
    };

    const categoryId = await createCategoryAdmin(categoryData);

    return NextResponse.json({
      success: true,
      data: { id: categoryId, ...categoryData },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, order } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

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

    await updateCategoryAdmin(id, updates);

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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await deleteCategoryAdmin(id);

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
