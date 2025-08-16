'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useCategories } from '@/app/contexts/CategoryContext';
import { cn } from '@/app/lib/utils/cn';
import { Recipe } from '@/app/utils/types/recipe.type';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Hash,
  Info,
  Plus,
  Star,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface RecipeCardFormProps {
  recipe?: Recipe | null;
  onSuccess: (recipe: Recipe) => void;
  onCancel: () => void;
}

// Utility functions for number formatting
const formatNumberWithCommas = (num: number | string): string => {
  const cleanNum = String(num).replace(/[^\d]/g, '');
  if (!cleanNum) return '';
  return Number(cleanNum).toLocaleString();
};

const parseFormattedNumber = (formattedStr: string): number => {
  const cleanStr = formattedStr.replace(/[^\d]/g, '');
  return cleanStr ? Number(cleanStr) : 0;
};

const formatDurationDisplay = (minutes: number): string => {
  if (minutes === 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// Duration presets in minutes
const DURATION_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr', minutes: 120 },
  { label: '3 hr', minutes: 180 },
  { label: '5 hr', minutes: 300 },
];

export function RecipeCardForm({
  recipe,
  onSuccess,
  onCancel,
}: RecipeCardFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState<
    Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'clicks' | 'image'>>
  >({
    name: '',
    description: '',
    duration: 0,
    price: 0,
    ingredients: [''],
    categoryId: '',
    order: 0,
    featured: false,
    displayMedia: undefined,
    samples: [],
  });
  const { user } = useAuth();
  const [displayFile, setDisplayFile] = useState<File | null>(null);
  const [displayPreview, setDisplayPreview] = useState<string>('');
  const [displayMediaType, setDisplayMediaType] = useState<'image' | 'video'>(
    'image'
  );

  // New state for formatted inputs
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const [sampleFiles, setSampleFiles] = useState<
    { file: File; variant: string; preview?: string; id: string }[]
  >([]);
  const [existingSamples, setExistingSamples] = useState<
    {
      variant: string;
      media: { url: string; publicId: string; type: 'image' | 'video' };
    }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'basic' | 'media' | 'details'>(
    'basic'
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const ingredientInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description,
        duration: recipe.duration,
        price: recipe.price,
        ingredients:
          recipe.ingredients && recipe.ingredients.length > 0
            ? recipe.ingredients
            : [''],
        categoryId: recipe.categoryId || '',
        order: recipe.order,
        featured: recipe.featured,
        displayMedia: recipe.displayMedia,
      });

      // Set formatted displays
      setPriceDisplay(recipe.price ? formatNumberWithCommas(recipe.price) : '');
      setDurationMinutes(
        recipe.duration ? Math.round(recipe.duration / 60) : 0
      );

      if (recipe.displayMedia) {
        setDisplayPreview(recipe.displayMedia.url);
        setDisplayMediaType(recipe.displayMedia.type || 'image');
      }
      setExistingSamples(recipe.samples || []);
      setDisplayFile(null);
      setSampleFiles([]);
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 0,
        price: 0,
        ingredients: [''],
        categoryId: '',
        order: 0,
        featured: false,
        displayMedia: undefined,
        samples: [],
      });
      setPriceDisplay('');
      setDurationMinutes(0);
      setDisplayFile(null);
      setDisplayPreview('');
      setSampleFiles([]);
      setExistingSamples([]);
    }
  }, [recipe]);

  useEffect(() => {
    const ingredients = formData.ingredients || [''];
    if (ingredients.length > 0 && currentTab === 'basic') {
      const lastIngredientIndex = ingredients.length - 1;
      const lastInput = ingredientInputRefs.current[lastIngredientIndex];
      if (
        lastInput &&
        document.activeElement !== lastInput &&
        ingredients[lastIngredientIndex] === ''
      ) {
        // lastInput.focus(); // Auto-focus can be disruptive, enable if preferred
      }
    }
  }, [formData.ingredients?.length, currentTab]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'order') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientInputChange = (index: number, newValue: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: Array.isArray(prev.ingredients)
        ? (prev.ingredients as string[]).map((ing, i) =>
            i === index ? newValue : ing
          )
        : [],
    }));
  };

  const handleAddIngredientField = (index?: number) => {
    setFormData(prev => {
      const newIngredients = [...(prev.ingredients || [])];
      const insertAt =
        typeof index === 'number' ? index + 1 : newIngredients.length;
      newIngredients.splice(insertAt, 0, '');
      setTimeout(() => ingredientInputRefs.current[insertAt]?.focus(), 0);
      return { ...prev, ingredients: newIngredients };
    });
  };

  const handleRemoveIngredientField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: Array.isArray(prev.ingredients)
        ? (prev.ingredients as string[]).filter((_, i) => i !== index)
        : [],
    }));
  };

  const handleIngredientKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Don't stop propagation to allow form submission to work
      handleAddIngredientField(index);
    }
  };

  const processDisplayFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Invalid file type. Please upload an image or video.');
      return;
    }
    // Optional: Check file size
    // if (file.size > 50 * 1024 * 1024) { // 50MB limit
    //   toast.error("File is too large. Maximum size is 50MB.");
    //   return;
    // }
    setDisplayFile(file);
    setDisplayMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    const fileReader = new FileReader();
    fileReader.onload = event =>
      setDisplayPreview(event.target?.result as string);
    fileReader.readAsDataURL(file);
  };

  const handleDisplayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      processDisplayFile(e.target.files[0]);
    if (e.target) e.target.value = ''; // Reset file input
  };

  const handleRemoveDisplayMedia = () => {
    setDisplayFile(null);
    setDisplayPreview('');
    setFormData(prev => ({ ...prev, displayMedia: undefined }));
    toast.success('Display media cleared from form.');
  };

  const handleSampleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFilesPromises = filesArray.map(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`Sample '${file.name}' is not an image.`);
          return Promise.resolve(null);
        }
        return new Promise<{
          file: File;
          variant: string;
          preview: string;
          id: string;
        } | null>(resolve => {
          const reader = new FileReader();
          reader.onload = event =>
            resolve({
              file,
              variant: '',
              preview: event.target?.result as string,
              id: crypto.randomUUID(),
            });
          reader.onerror = () => {
            toast.error(`Error reading ${file.name}`);
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      });
      const processed = (await Promise.all(newFilesPromises)).filter(
        Boolean
      ) as { file: File; variant: string; preview: string; id: string }[];
      setSampleFiles(prev => [...prev, ...processed]);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  const handleSampleVariantChange = (id: string, variant: string) => {
    setSampleFiles(prev =>
      prev.map(item => (item.id === id ? { ...item, variant } : item))
    );
  };

  const handleExistingSampleVariantChange = (
    index: number,
    variant: string
  ) => {
    setExistingSamples(prev =>
      prev.map((s, i) => (i === index ? { ...s, variant } : s))
    );
  };

  const handleRemoveSampleFile = (id: string) => {
    setSampleFiles(prev => prev.filter(item => item.id !== id));
    toast.success('New sample removed from form.');
  };

  const handleRemoveExistingSample = (index: number) => {
    const sampleName = existingSamples[index]?.variant || 'sample';
    setExistingSamples(prev => prev.filter((_, i) => i !== index));
    toast.success(
      `Existing sample '${sampleName}' removed from form. Save to make permanent.`
    );
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      processDisplayFile(e.dataTransfer.files[0]);
  };

  const uploadFileApi = async (
    file: File,
    fileNameForToast: string
  ): Promise<{
    url: string;
    publicId: string;
    type: 'image' | 'video';
  } | null> => {
    if (!user) {
      toast.error('User not authenticated. Cannot upload media.');
      return null;
    }

    // Log upload attempt details
    console.log(`📤 Starting upload for: ${file.name}`);
    console.log(`📊 File size: ${file.size} bytes`);
    console.log(`📝 File type: ${file.type}`);
    console.log(`👤 User ID: ${user.id}`);

    const apiFormData = new FormData();
    apiFormData.append('file', file);
    apiFormData.append('userId', user.id);

    const toastId = toast.loading(`Uploading ${fileNameForToast}...`);
    try {
      console.log(`🌐 Making request to /api/recipes/upload-media`);
      const response = await fetch('/api/recipes/upload-media', {
        method: 'POST',
        body: apiFormData,
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(
        `📡 Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      const result = await response.json();
      console.log(`📋 Response body:`, result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `HTTP ${response.status}: Upload failed`
        );
      }

      toast.success(`${fileNameForToast} uploaded!`, { id: toastId });
      return { url: result.url, publicId: result.publicId, type: result.type };
    } catch (error: any) {
      console.error(`❌ Upload error for ${fileNameForToast}:`, error);
      toast.error(`Failed to upload ${fileNameForToast}: ${error.message}`, {
        id: toastId,
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Form submission started'); // Debug log
    console.log('Form data:', formData); // Debug log
    console.log('User:', user); // Debug log

    if (!user) {
      toast.error('User not authenticated. Cannot save recipe.');
      return;
    }
    if (!formData.name?.trim() || !formData.description?.trim()) {
      toast.error('Recipe Name and Description are required.');
      setCurrentTab('basic');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Price must be greater than 0.');
      setCurrentTab('basic');
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      toast.error('Duration must be specified.');
      setCurrentTab('basic');
      return;
    }
    if (!recipe && !displayFile && !formData.displayMedia?.url) {
      // New recipe must have display media
      toast.error('Display Image/Video is required for a new recipe.');
      setCurrentTab('media');
      return;
    }
    if (
      Array.isArray(formData.ingredients) &&
      formData.ingredients.join('').trim() === ''
    ) {
      toast.error('At least one ingredient is required.');
      setCurrentTab('basic');
      return;
    }
    if (!formData.categoryId?.trim()) {
      toast.error('Please select a category for this recipe.');
      setCurrentTab('basic');
      return;
    }

    setLoading(true);
    const saveToastId = toast.loading(
      recipe ? 'Updating recipe...' : 'Creating recipe...'
    );

    try {
      let finalDisplayMedia = formData.displayMedia;

      if (displayFile) {
        // New or replacement display file
        const uploaded = await uploadFileApi(displayFile, 'display media');
        if (!uploaded) {
          toast.error('Display media upload failed. Recipe not saved.', {
            id: saveToastId,
          });
          setLoading(false);
          return;
        }
        finalDisplayMedia = uploaded;
      } else if (!finalDisplayMedia && !recipe) {
        // New recipe, no existing media, no new file selected
        toast.error('Display media is required. Recipe not saved.', {
          id: saveToastId,
        });
        setLoading(false);
        return;
      }

      const uploadedSamplesMedia: {
        variant: string;
        media: { url: string; publicId: string; type: 'image' | 'video' };
      }[] = [];
      for (const sf of sampleFiles) {
        const uploaded = await uploadFileApi(
          sf.file,
          `sample '${sf.variant || sf.file.name}'`
        );
        if (uploaded) {
          uploadedSamplesMedia.push({
            variant: sf.variant,
            media: { ...uploaded, type: 'image' },
          }); // Samples are images
        } else {
          toast.error(
            `Upload failed for sample '${
              sf.variant || sf.file.name
            }'. It won't be included.`
          );
        }
      }

      const finalSamples = [...existingSamples, ...uploadedSamplesMedia];
      const finalIngredients = Array.isArray(formData.ingredients)
        ? (formData.ingredients as string[])
            .map(ing => ing.trim())
            .filter(ing => ing !== '')
        : [];

      const payload: any = {
        // Using 'any' temporarily for easier construction
        ...formData,
        ingredients: finalIngredients,
        displayMedia: finalDisplayMedia,
        samples: finalSamples,
        userId: user.id,
      };

      // Clean up payload: remove fields not part of backend schema or that are undefined
      delete payload.image; // old static image field if it exists on formData

      // Determine endpoint and method
      const endpoint =
        recipe && recipe.id ? `/api/recipes/${recipe.id}` : '/api/recipes';
      const method = recipe && recipe.id ? 'PUT' : 'POST';

      console.log('Making API request to:', endpoint); // Debug log
      console.log('Payload:', payload); // Debug log

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
        recipe: Recipe;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save recipe');
      }

      toast.success(result.message || 'Recipe saved successfully!', {
        id: saveToastId,
      });

      onSuccess(result.recipe);
    } catch (error: any) {
      console.error('Form submission error:', error); // Debug log
      toast.error(`Error: ${error.message}`, { id: saveToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8'>
      <Toaster position='top-center' reverseOrder={false} />
      <div className='p-6 sm:p-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl sm:text-3xl font-semibold text-gray-800'>
            {recipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          {!user && (
            <div className='flex items-center text-sm text-yellow-700 bg-yellow-100 p-2 rounded-md border border-yellow-300'>
              <AlertTriangle size={18} className='mr-2 flex-shrink-0' />
              <span>
                User ID not available. Media uploads & saving will fail.
              </span>
            </div>
          )}
        </div>

        <div className='flex border-b mb-6 sm:mb-8'>
          {(['basic', 'media', 'details'] as const).map(tabName => (
            <button
              key={tabName}
              type='button'
              className={cn(
                'px-3 sm:px-4 py-2 font-medium text-sm sm:text-base -mb-px capitalize transition-colors',
                currentTab === tabName
                  ? 'border-b-2 border-brand-logo_green text-brand-logo_green'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2'
              )}
              onClick={() => setCurrentTab(tabName)}
            >
              {tabName === 'details' ? 'Other Details' : `${tabName} Info`}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          <div
            className={cn(
              'space-y-5 sm:space-y-6',
              currentTab === 'basic' ? 'block' : 'hidden'
            )}
          >
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Recipe Name
              </label>
              <input
                id='name'
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
              />
            </div>
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Description
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
              />
            </div>

            {/* Category Selection */}
            <div>
              <label
                htmlFor='categoryId'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Category *
              </label>
              <select
                id='categoryId'
                name='categoryId'
                value={formData.categoryId || ''}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
              >
                <option value=''>Select a category</option>
                {categories &&
                  Object.keys(categories).map((categoryId: string) => (
                    <option key={categoryId} value={categoryId}>
                      {categories[categoryId].name}
                    </option>
                  ))}
              </select>
              {categories && Object.keys(categories).length === 0 && (
                <p className='text-xs text-amber-600 mt-1'>
                  No categories available. Please create categories first.
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
              <div>
                <label
                  htmlFor='price'
                  className='block text-sm font-medium text-gray-700 mb-1 flex items-center'
                >
                  <DollarSign
                    size={16}
                    className='mr-1.5 text-brand-btn_orange'
                  />{' '}
                  Price (₦)
                </label>
                <input
                  id='price'
                  type='text'
                  name='price'
                  value={priceDisplay}
                  onChange={e => {
                    const newValue = parseFormattedNumber(e.target.value);
                    setPriceDisplay(formatNumberWithCommas(newValue));
                    setFormData(prev => ({ ...prev, price: newValue }));
                  }}
                  placeholder='e.g., 20,000'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
                />
                {priceDisplay && (
                  <p className='text-xs text-gray-500 mt-1'>
                    Amount: ₦{priceDisplay}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='duration'
                  className='block text-sm font-medium text-gray-700 mb-1 flex items-center'
                >
                  <Clock size={16} className='mr-1.5 text-gray-500' /> Duration
                </label>
                <div className='space-y-3'>
                  <div className='grid grid-cols-3 gap-2'>
                    {DURATION_PRESETS.map(preset => (
                      <button
                        key={preset.minutes}
                        type='button'
                        onClick={() => {
                          setDurationMinutes(preset.minutes);
                          setFormData(prev => ({
                            ...prev,
                            duration: preset.minutes * 60,
                          }));
                        }}
                        className={cn(
                          'px-3 py-2 text-sm font-medium rounded-md border transition-colors',
                          durationMinutes === preset.minutes
                            ? 'bg-brand-logo_green text-white border-brand-logo_green'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      id='duration'
                      type='number'
                      value={durationMinutes || ''}
                      onChange={e => {
                        const newValue =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        setDurationMinutes(newValue);
                        setFormData(prev => ({
                          ...prev,
                          duration: newValue * 60,
                        }));
                      }}
                      placeholder='Custom minutes'
                      min='0'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
                    />
                    <span className='text-sm text-gray-500 whitespace-nowrap min-w-[60px]'>
                      {durationMinutes > 0 &&
                        formatDurationDisplay(durationMinutes)}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Select a preset or enter custom minutes. Duration will be
                    converted to seconds when saved.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center'>
                <FileText size={16} className='mr-1.5 text-gray-500' />{' '}
                Ingredients
              </label>
              <div className='space-y-2.5'>
                {Array.isArray(formData.ingredients) &&
                  formData.ingredients.map((ingredient, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <input
                        type='text'
                        name={`ingredient-${index}`}
                        ref={el => {
                          ingredientInputRefs.current[index] = el;
                        }}
                        value={ingredient}
                        onChange={e =>
                          handleIngredientInputChange(index, e.target.value)
                        }
                        onKeyDown={e => handleIngredientKeyDown(e, index)}
                        placeholder={`Ingredient ${index + 1}`}
                        required={
                          index === 0 &&
                          (formData.ingredients || [''])[0]?.trim() === '' &&
                          (formData.ingredients?.length || 0) <= 1
                        }
                        className='flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
                      />
                      {(formData.ingredients?.length ?? 0) > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveIngredientField(index)}
                          aria-label='Remove ingredient'
                          className='p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors'
                        >
                          <X size={18} />
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={() => handleAddIngredientField(index)}
                        title='Add ingredient below'
                        aria-label='Add ingredient below'
                        className='p-2 text-brand-logo_green hover:text-brand-dark_green rounded-md hover:bg-green-50 transition-colors'
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
              </div>
              <p className='text-xs text-gray-500 mt-1.5'>
                Press Enter or click '+' to add new ingredient.
              </p>
            </div>
          </div>

          {/* Media Tab */}
          <div
            className={cn(
              'space-y-6 sm:space-y-8',
              currentTab === 'media' ? 'block' : 'hidden'
            )}
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Display Image/Video
              </label>
              {displayPreview ? (
                <div className='relative group w-full h-56 sm:h-72 bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm'>
                  {displayMediaType === 'video' ? (
                    <video
                      src={displayPreview}
                      className='w-full h-full object-contain'
                      controls
                      aria-label='Display media preview'
                    />
                  ) : (
                    <Image
                      src={displayPreview}
                      alt='Display media preview'
                      fill
                      className='object-contain'
                    />
                  )}
                  <button
                    type='button'
                    onClick={handleRemoveDisplayMedia}
                    aria-label='Remove display media'
                    className='absolute top-2 right-2 bg-black bg-opacity-40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-60'
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  role='button'
                  tabIndex={0}
                  aria-label='Drag and drop display media or click to select'
                  className={cn(
                    'border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center mb-3 transition-colors',
                    isDraggingOver
                      ? 'border-brand-logo_green bg-green-50'
                      : 'hover:border-gray-400'
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById('display-file-input')?.click()
                  }
                >
                  <Upload className='mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-600'>
                    Drag & drop or{' '}
                    <span className='text-brand-logo_green font-medium hover:underline cursor-pointer'>
                      click to upload
                    </span>
                  </p>
                  <p className='mt-1 text-xs text-gray-400'>
                    JPG, PNG, GIF, WEBP, MP4, WEBM
                  </p>
                </div>
              )}
              <input
                type='file'
                accept='image/*,video/*'
                onChange={handleDisplayFileChange}
                className='hidden'
                id='display-file-input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sample Images (Optional, Images Only)
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4'>
                {existingSamples.map((sample, index) => (
                  <div
                    key={`existing-${index}-${sample.media.publicId}`}
                    className='border rounded-lg p-2.5 relative group shadow-sm'
                  >
                    <div className='relative w-full h-28 sm:h-32 bg-gray-100 rounded-md overflow-hidden mb-2'>
                      <Image
                        src={sample.media.url}
                        alt={sample.variant || 'Sample image'}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <input
                      type='text'
                      value={sample.variant}
                      onChange={e =>
                        handleExistingSampleVariantChange(index, e.target.value)
                      }
                      placeholder='Variant name'
                      aria-label={`Variant name for existing sample ${
                        index + 1
                      }`}
                      className='w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm mb-1 focus:ring-1 focus:ring-brand-logo_green focus:border-brand-logo_green'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveExistingSample(index)}
                      aria-label={`Remove existing sample ${index + 1}`}
                      className='absolute top-1 right-1 bg-black bg-opacity-40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-60'
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {sampleFiles.map(sample => (
                  <div
                    key={sample.id}
                    className='border rounded-lg p-2.5 relative group shadow-sm'
                  >
                    <div className='relative w-full h-28 sm:h-32 bg-gray-100 rounded-md overflow-hidden mb-2'>
                      {sample.preview && (
                        <Image
                          src={sample.preview}
                          alt={sample.variant || 'New sample preview'}
                          fill
                          className='object-cover'
                        />
                      )}
                    </div>
                    <input
                      type='text'
                      value={sample.variant}
                      onChange={e =>
                        handleSampleVariantChange(sample.id, e.target.value)
                      }
                      placeholder='Variant name'
                      aria-label='Variant name for new sample'
                      className='w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm mb-1 focus:ring-1 focus:ring-brand-logo_green focus:border-brand-logo_green'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveSampleFile(sample.id)}
                      aria-label='Remove new sample'
                      className='absolute top-1 right-1 bg-black bg-opacity-40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-60'
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label
                  htmlFor='sample-files-input'
                  className='border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors h-full min-h-[150px] sm:min-h-[180px]'
                >
                  <Plus className='h-8 w-8 text-gray-400 mb-1.5' />
                  <span className='text-sm text-gray-500 text-center'>
                    Add Sample Image
                  </span>
                </label>
              </div>
              <input
                id='sample-files-input'
                type='file'
                accept='image/*'
                multiple
                onChange={handleSampleFileChange}
                className='hidden'
              />
            </div>
          </div>

          {/* Additional Details Tab */}
          <div
            className={cn(
              'space-y-5 sm:space-y-6',
              currentTab === 'details' ? 'block' : 'hidden'
            )}
          >
            <div>
              <label
                htmlFor='order'
                className='block text-sm font-medium text-gray-700 mb-1 flex items-center'
              >
                <Hash size={16} className='mr-1.5 text-gray-500' /> Display
                Order
              </label>
              <input
                id='order'
                type='number'
                name='order'
                value={formData.order}
                onChange={handleInputChange}
                min='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Lower numbers appear first. Default is 0.
              </p>
            </div>
            <div className='flex items-start mt-4'>
              <div className='flex items-center h-5'>
                <input
                  id='featured'
                  type='checkbox'
                  name='featured'
                  checked={!!formData.featured}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-brand-logo_green border-gray-300 rounded focus:ring-brand-logo_green'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor='featured'
                  className='font-medium text-gray-700 flex items-center cursor-pointer'
                >
                  <Star size={16} className='mr-1.5 text-brand-btn_orange' />{' '}
                  Featured Recipe
                </label>
                <p className='text-xs text-gray-500'>
                  Featured recipes can be highlighted on the homepage.
                </p>
              </div>
            </div>
            {recipe && (
              <div className='pt-4 border-t mt-6'>
                <h3 className='text-md font-medium text-gray-700 mb-2'>
                  Recipe Info
                </h3>
                <p className='text-sm text-gray-600'>
                  <Info size={15} className='inline mr-1.5 mb-0.5' /> Recipe ID:{' '}
                  <code className='text-xs bg-gray-100 p-1 rounded'>
                    {recipe.id}
                  </code>
                </p>
                {recipe.createdAt && (
                  <p className='text-sm text-gray-500 mt-1'>
                    Created: {new Date(recipe.createdAt).toLocaleString()}
                  </p>
                )}
                {recipe.updatedAt && (
                  <p className='text-sm text-gray-500 mt-1'>
                    Last Updated: {new Date(recipe.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='mt-8 sm:mt-10 flex flex-col sm:flex-row justify-end gap-3 border-t pt-6'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400  w-full sm:w-auto'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading || !user}
              className='px-5 py-2 text-sm font-medium text-white bg-brand-logo_green rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-logo_green disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              {loading
                ? recipe
                  ? 'Saving...'
                  : 'Creating...'
                : recipe
                  ? 'Save Changes'
                  : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
