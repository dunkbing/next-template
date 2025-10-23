"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  createVariant,
  uploadImage,
  deleteImage,
  updateProduct,
} from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { ProductWithRelations } from "@/db/schema";
import Image from "next/image";
import { FilePicker, type FileWithPreview } from "@/components/ui/file-picker";

type Variant = {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  price: string;
  cost: string;
};

export default function ProductForm({
  dict,
  lang,
  product,
}: {
  dict: Dictionary;
  lang: string;
  product?: ProductWithRelations | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ key: string; url: string }[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileWithPreview[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: crypto.randomUUID(),
      sku: "",
      barcode: "",
      name: "",
      price: "",
      cost: "",
    },
  ]);

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");

      // Convert URLs to the new format (extract key from URL if needed)
      setImages(product.images || []);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            id: v.id.toString(),
            sku: v.sku,
            barcode: v.barcode || "",
            name: v.name,
            price: v.price,
            cost: v.cost,
          })),
        );
      }
    }
  }, [product]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        sku: "",
        barcode: "",
        name: "",
        price: "",
        cost: "",
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError("");

    try {
      const uploadedImages: { url: string; key: string }[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadImage(product.id, formData);

        if ("error" in result) {
          throw new Error(result.error);
        }

        if ("data" in result) {
          uploadedImages.push({
            url: result.data.url,
            key: result.data.key,
          });
        }
      }
      const newImages = [...images, ...uploadedImages];
      void updateProduct(product.id, { s3Keys: newImages.map((i) => i.key) });

      setImages(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Delete from S3
      const result = await deleteImage(imageToRemove.key);

      if ("error" in result) {
        setError(result.error || "");
        return;
      }

      // Remove from local state
      setImages(images.filter((_, i) => i !== index));
    } catch (err) {
      setError("Failed to delete image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create product
      const productResult = await createProduct({
        name,
        description,
        // s3Keys: images.map((img) => img.url),
        trackStock: true,
        taxClass: "standard",
      });

      if ("error" in productResult) {
        setError(productResult.error || "Failed to create product");
        setLoading(false);
        return;
      }

      const productId = "data" in productResult ? productResult.data.id : 0;

      // Upload images if any
      if (pendingFiles.length > 0) {
        setUploadingImages(true);
        const uploadedKeys: string[] = [];

        try {
          for (const fileItem of pendingFiles) {
            const formData = new FormData();
            formData.append("file", fileItem.file);

            const uploadResult = await uploadImage(productId, formData);

            if ("error" in uploadResult) {
              throw new Error(uploadResult.error);
            }

            if ("data" in uploadResult) {
              uploadedKeys.push(uploadResult.data.key);
            }
          }

          // Update product with uploaded image keys
          if (uploadedKeys.length > 0) {
            await updateProduct(productId, { s3Keys: uploadedKeys });
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to upload images",
          );
          setLoading(false);
          setUploadingImages(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      // Create variants
      for (const variant of variants) {
        const variantResult = await createVariant({
          productId,
          sku: variant.sku,
          barcode: variant.barcode || undefined,
          name: variant.name,
          price: variant.price,
          cost: variant.cost,
          status: "active",
        });

        if ("error" in variantResult) {
          setError(variantResult.error || "Failed to create variant");
          setLoading(false);
          return;
        }
      }

      router.push(`/${lang}/dashboard/catalog/products`);
    } catch (err) {
      setError("Failed to create product");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="text-xl font-semibold">
          {dict.products.form.basicInfo}
        </h2>

        <div>
          <Label htmlFor="name">{dict.products.form.name} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={dict.products.form.namePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="description">{dict.products.form.description}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={dict.products.form.descriptionPlaceholder}
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Product Images</Label>
          {product ? (
            // Edit mode - upload immediately
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  {uploadingImages ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </>
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-xs text-gray-500">
                Upload product images (JPEG, PNG, WebP, GIF). Max 5MB per file.
              </p>
            </div>
          ) : (
            // Create mode - select files first, upload after product creation
            <FilePicker
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              maxSize={5 * 1024 * 1024}
              files={pendingFiles}
              onFilesChange={setPendingFiles}
              disabled={loading}
              loading={uploadingImages}
              helperText="Upload product images (JPEG, PNG, WebP, GIF). Max 5MB per file."
            />
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {dict.products.form.variants}
            </h2>
            <p className="text-sm text-gray-500">
              {dict.products.form.variantsDescription}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addVariant}>
            <Plus className="mr-2 h-4 w-4" />
            {dict.products.form.addVariant}
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div key={variant.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {dict.products.form.variant} {index + 1}
              </span>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{dict.common.name} *</Label>
                <Input
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value)
                  }
                  required
                  placeholder={dict.products.form.namePlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.sku} *</Label>
                <Input
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variant.id, "sku", e.target.value)
                  }
                  required
                  placeholder={dict.products.form.skuPlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.barcode}</Label>
                <Input
                  value={variant.barcode}
                  onChange={(e) =>
                    updateVariant(variant.id, "barcode", e.target.value)
                  }
                  placeholder={dict.products.form.barcodePlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.price} *</Label>
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(variant.id, "price", e.target.value)
                  }
                  required
                  placeholder="100000"
                  step="1000"
                />
              </div>

              <div>
                <Label>{dict.products.form.cost}</Label>
                <Input
                  type="number"
                  value={variant.cost}
                  onChange={(e) =>
                    updateVariant(variant.id, "cost", e.target.value)
                  }
                  placeholder="50000"
                  step="1000"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          {dict.common.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? dict.products.form.creating : dict.products.form.create}
        </Button>
      </div>
    </form>
  );
}
