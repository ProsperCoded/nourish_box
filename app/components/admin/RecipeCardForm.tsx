"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Upload, Clock, DollarSign, FileText, Hash, Star, Info } from "lucide-react";
import { Recipe } from "@/app/utils/types/recipe.type";
import { cn } from "@/app/lib/utils/cn";

interface RecipeCardFormProps {
  recipe?: Recipe | null;
  onSave: (recipe: Partial<Recipe>, displayFile: File | null, sampleFiles: { file: File; variant: string }[]) => Promise<void>;
  onCancel: () => void;
}

export function RecipeCardForm({ recipe, onSave, onCancel }: RecipeCardFormProps) {
  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: "",
    description: "",
    duration: 0,
    price: 0,
    ingredients: [],
    order: 0,
    featured: false,
  });
  const [displayFile, setDisplayFile] = useState<File | null>(null);
  const [displayPreview, setDisplayPreview] = useState<string>("");
  const [sampleFiles, setSampleFiles] = useState<{ file: File; variant: string; preview?: string }[]>([]);
  const [existingSamples, setExistingSamples] = useState<{ variant: string; image: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"basic" | "media" | "details">("basic");
  const [ingredientsText, setIngredientsText] = useState("");

  // Load recipe data if editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description,
        duration: recipe.duration,
        price: recipe.price,
        ingredients: recipe.ingredients,
        order: recipe.order,
        featured: recipe.featured,
      });
      setIngredientsText(recipe.ingredients.join("\n"));
      setDisplayPreview(recipe.displayUrl);
      setExistingSamples(recipe.samples || []);
    }
  }, [recipe]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "duration" || name === "price" || name === "order") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setIngredientsText(text);
    const ingredients = text.split("\n").filter((item) => item.trim());
    setFormData((prev) => ({ ...prev, ingredients }));
  };

  const handleDisplayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDisplayFile(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setDisplayPreview(event.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSampleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => {
        // Create preview URL
        const fileReader = new FileReader();
        let preview = "";
        fileReader.onload = (event) => {
          preview = event.target?.result as string;
        };
        fileReader.readAsDataURL(file);
        
        return {
          file,
          variant: "",
          preview
        };
      });
      
      setSampleFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSampleVariantChange = (index: number, variant: string) => {
    setSampleFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, variant } : item))
    );
  };

  const handleRemoveSampleFile = (index: number) => {
    setSampleFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingSample = (index: number) => {
    setExistingSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Include existing samples that weren't removed
      const updatedFormData = {
        ...formData,
        samples: existingSamples
      };
      
      await onSave(updatedFormData, displayFile, sampleFiles);
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {recipe ? "Edit Recipe" : "Add New Recipe"}
        </h2>

        {/* Form tabs */}
        <div className="flex border-b mb-6">
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              currentTab === "basic"
                ? "border-b-2 border-brand-logo_green text-brand-logo_green"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setCurrentTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              currentTab === "media"
                ? "border-b-2 border-brand-logo_green text-brand-logo_green"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setCurrentTab("media")}
          >
            Media
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm -mb-px",
              currentTab === "details"
                ? "border-b-2 border-brand-logo_green text-brand-logo_green"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setCurrentTab("details")}
          >
            Additional Details
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          <div className={currentTab === "basic" ? "block" : "hidden"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1 text-brand-btn_orange" />
                      Price (₦)
                    </div>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      Duration (seconds)
                    </div>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-1 text-gray-500" />
                    Ingredients (one per line)
                  </div>
                </label>
                <textarea
                  value={ingredientsText}
                  onChange={handleIngredientsChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                  placeholder="Enter each ingredient on a new line"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media Tab */}
          <div className={currentTab === "media" ? "block" : "hidden"}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Display Image/Video
                </label>
                
                {displayPreview ? (
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {displayPreview.includes("video") ? (
                      <video 
                        src={displayPreview} 
                        className="w-full h-full object-contain" 
                        controls
                      />
                    ) : (
                      <Image 
                        src={displayPreview} 
                        alt="Preview" 
                        fill
                        className="object-contain" 
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setDisplayPreview("")}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop a file here, or click to select a file
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Supported formats: JPG, PNG, GIF, MP4, WEBM
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleDisplayFileChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  id="display-file"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sample Images with Variants
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Existing samples */}
                  {existingSamples.map((sample, index) => (
                    <div key={`existing-${index}`} className="border rounded-lg p-3 relative">
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <Image src={sample.image} alt={sample.variant} fill className="object-cover" />
                      </div>
                      <input
                        type="text"
                        value={sample.variant}
                        onChange={(e) => {
                          const newSamples = [...existingSamples];
                          newSamples[index].variant = e.target.value;
                          setExistingSamples(newSamples);
                        }}
                        placeholder="Variant name"
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm mb-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingSample(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* New samples */}
                  {sampleFiles.map((sample, index) => (
                    <div key={`new-${index}`} className="border rounded-lg p-3 relative">
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                        {sample.preview && (
                          <Image src={sample.preview} alt="Preview" fill className="object-cover" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={sample.variant}
                        onChange={(e) => handleSampleVariantChange(index, e.target.value)}
                        placeholder="Variant name"
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm mb-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSampleFile(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add new sample button */}
                  <label htmlFor="sample-files" className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 h-full">
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Sample</span>
                  </label>
                </div>
                
                <input
                  id="sample-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSampleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Additional Details Tab */}
          <div className={currentTab === "details" ? "block" : "hidden"}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Hash size={16} className="mr-1 text-gray-500" />
                    Display Order
                  </div>
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-logo_green focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers will appear first</p>
              </div>

              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-brand-logo_green border-gray-300 rounded focus:ring-brand-logo_green"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="featured" className="font-medium text-gray-700 flex items-center">
                    <Star size={16} className="mr-1 text-brand-btn_orange" />
                    Featured Recipe
                  </label>
                  <p className="text-gray-500">Featured recipes will be highlighted on the homepage</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-logo_green text-white rounded-md hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 