"use server";

import { db } from "@/db";
import {
  categories,
  products,
  productVariants,
  type InsertCategory,
  type InsertProduct,
  type InsertProductVariant,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  abilityFromSession,
  type Actions,
  type Subjects,
} from "@/lib/casl/ability";
import { PERMISSIONS } from "@/lib/permissions";
import { eq, and, like, desc } from "drizzle-orm";
import { z } from "zod";

/**
 * Get session and verify permissions
 */
async function getAuthorizedSession(permission: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" } as const;
  }

  const ability = abilityFromSession(session);
  const [action, subject] = permission.split(":") as [Actions, Subjects];

  if (!ability.can(action, subject)) {
    return { error: "Forbidden" } as const;
  }

  const tenantId = Number.parseInt(session.user.tenantId);
  const userId = Number.parseInt(session.user.id);

  return { session, tenantId, userId };
}

// ============= CATEGORIES =============

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional(),
});

export async function createCategory(input: z.infer<typeof categorySchema>) {
  const auth = await getAuthorizedSession(PERMISSIONS.CATEGORY_CREATE);
  if ("error" in auth) return auth;

  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    const [category] = await db
      .insert(categories)
      .values({
        tenantId: auth.tenantId,
        ...validated.data,
      })
      .returning();

    return { data: category } as const;
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category" } as const;
  }
}

export async function listCategories() {
  const auth = await getAuthorizedSession(PERMISSIONS.CATEGORY_READ);
  if ("error" in auth) return auth;

  try {
    const result = await db.query.categories.findMany({
      where: eq(categories.tenantId, auth.tenantId),
      orderBy: [desc(categories.createdAt)],
    });

    return { data: result } as const;
  } catch (error) {
    console.error("List categories error:", error);
    return { error: "Failed to fetch categories" } as const;
  }
}

export async function updateCategory(
  id: number,
  input: Partial<z.infer<typeof categorySchema>>,
) {
  const auth = await getAuthorizedSession(PERMISSIONS.CATEGORY_UPDATE);
  if ("error" in auth) return auth;

  try {
    const [category] = await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, auth.tenantId)))
      .returning();

    if (!category) {
      return { error: "Category not found" } as const;
    }

    return { data: category } as const;
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Failed to update category" } as const;
  }
}

export async function deleteCategory(id: number) {
  const auth = await getAuthorizedSession(PERMISSIONS.CATEGORY_DELETE);
  if ("error" in auth) return auth;

  try {
    await db
      .delete(categories)
      .where(
        and(eq(categories.id, id), eq(categories.tenantId, auth.tenantId)),
      );

    return { success: true } as const;
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" } as const;
  }
}

// ============= PRODUCTS =============

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  taxClass: z.string().default("standard"),
  trackStock: z.boolean().default(true),
});

export async function createProduct(input: z.infer<typeof productSchema>) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_CREATE);
  if ("error" in auth) return auth;

  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    const [product] = await db
      .insert(products)
      .values({
        tenantId: auth.tenantId,
        ...validated.data,
      })
      .returning();

    return { data: product } as const;
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product" } as const;
  }
}

export async function listProducts(params?: {
  search?: string;
  categoryId?: number;
}) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_READ);
  if ("error" in auth) return auth;

  try {
    let query = db.query.products.findMany({
      where: eq(products.tenantId, auth.tenantId),
      with: {
        category: true,
        variants: true,
      },
      orderBy: [desc(products.createdAt)],
    });

    const result = await query;

    // Filter by search term or category if provided
    let filtered = result;
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower),
      );
    }
    if (params?.categoryId) {
      filtered = filtered.filter((p) => p.categoryId === params.categoryId);
    }

    return { data: filtered } as const;
  } catch (error) {
    console.error("List products error:", error);
    return { error: "Failed to fetch products" } as const;
  }
}

export async function getProduct(id: number) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_READ);
  if ("error" in auth) return auth;

  try {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, auth.tenantId)),
      with: {
        category: true,
        variants: {
          with: {
            stockItems: true,
          },
        },
      },
    });

    if (!product) {
      return { error: "Product not found" } as const;
    }

    return { data: product } as const;
  } catch (error) {
    console.error("Get product error:", error);
    return { error: "Failed to fetch product" } as const;
  }
}

export async function updateProduct(
  id: number,
  input: Partial<z.infer<typeof productSchema>>,
) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_UPDATE);
  if ("error" in auth) return auth;

  try {
    const [product] = await db
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, auth.tenantId)))
      .returning();

    if (!product) {
      return { error: "Product not found" } as const;
    }

    return { data: product } as const;
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product" } as const;
  }
}

export async function deleteProduct(id: number) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_DELETE);
  if ("error" in auth) return auth;

  try {
    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, auth.tenantId)));

    return { success: true } as const;
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" } as const;
  }
}

// ============= PRODUCT VARIANTS =============

const variantSchema = z.object({
  productId: z.number().int().positive(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  attributesJson: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format")
    .default("0"),
  status: z.enum(["active", "inactive", "discontinued"]).default("active"),
});

export async function createVariant(input: z.infer<typeof variantSchema>) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_CREATE);
  if ("error" in auth) return auth;

  const validated = variantSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message } as const;
  }

  try {
    // Check if SKU already exists
    const existingSku = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, validated.data.sku),
    });

    if (existingSku) {
      return { error: "SKU already exists" } as const;
    }

    // Check if barcode already exists (if provided)
    if (validated.data.barcode) {
      const existingBarcode = await db.query.productVariants.findFirst({
        where: eq(productVariants.barcode, validated.data.barcode),
      });

      if (existingBarcode) {
        return { error: "Barcode already exists" } as const;
      }
    }

    const [variant] = await db
      .insert(productVariants)
      .values(validated.data)
      .returning();

    return { data: variant } as const;
  } catch (error) {
    console.error("Create variant error:", error);
    return { error: "Failed to create variant" } as const;
  }
}

export async function findVariantByBarcode(barcode: string) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_READ);
  if ("error" in auth) return auth;

  if (!barcode || barcode.length < 3) {
    return { error: "Invalid barcode" } as const;
  }

  try {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.barcode, barcode),
      with: {
        product: {
          with: {
            category: true,
          },
        },
        stockItems: true,
      },
    });

    if (!variant) {
      return { error: "Product not found" } as const;
    }

    // Verify tenant access
    if (variant.product.tenantId !== auth.tenantId) {
      return { error: "Product not found" } as const;
    }

    return { data: variant } as const;
  } catch (error) {
    console.error("Find variant by barcode error:", error);
    return { error: "Failed to find product" } as const;
  }
}

export async function findVariantBySku(sku: string) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_READ);
  if ("error" in auth) return auth;

  if (!sku || sku.length < 1) {
    return { error: "Invalid SKU" } as const;
  }

  try {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, sku),
      with: {
        product: {
          with: {
            category: true,
          },
        },
        stockItems: true,
      },
    });

    if (!variant) {
      return { error: "Product not found" } as const;
    }

    // Verify tenant access
    if (variant.product.tenantId !== auth.tenantId) {
      return { error: "Product not found" } as const;
    }

    return { data: variant } as const;
  } catch (error) {
    console.error("Find variant by SKU error:", error);
    return { error: "Failed to find product" } as const;
  }
}

export async function updateVariant(
  id: number,
  input: Partial<z.infer<typeof variantSchema>>,
) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_UPDATE);
  if ("error" in auth) return auth;

  try {
    const [variant] = await db
      .update(productVariants)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(productVariants.id, id))
      .returning();

    if (!variant) {
      return { error: "Variant not found" } as const;
    }

    return { data: variant } as const;
  } catch (error) {
    console.error("Update variant error:", error);
    return { error: "Failed to update variant" } as const;
  }
}

export async function deleteVariant(id: number) {
  const auth = await getAuthorizedSession(PERMISSIONS.PRODUCT_DELETE);
  if ("error" in auth) return auth;

  try {
    await db.delete(productVariants).where(eq(productVariants.id, id));

    return { success: true } as const;
  } catch (error) {
    console.error("Delete variant error:", error);
    return { error: "Failed to delete variant" } as const;
  }
}
