import { z } from "zod"

// Note: if you edit the schema here, you must also edit the schema in the
// apps/www/public/schema/registry-item.json file.

export const registryItemTypeSchema = z.enum([
    "registry:file",
    "registry:generator"
])

export const registryItemFileSchema = z.discriminatedUnion("type", [
    // Target is required for registry:file
    z.object({
        path: z.string(),
        content: z.string().optional(),
        type: z.enum(["registry:file"]),
        target: z.string().optional(),
    }),
    z.object({
        path: z.string(),
        content: z.string().optional(),
        type: registryItemTypeSchema.exclude(["registry:file"]),
        target: z.string().optional(),
    }),
])

export const registryItemSchema = z.object({
    $schema: z.string().optional(),
    extends: z.string().optional(),
    name: z.string(),
    type: registryItemTypeSchema,
    title: z.string().optional(),
    author: z.string().min(2).optional(),
    description: z.string().optional(),
    scripts: z.record(z.string(), z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    devDependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    files: z.array(registryItemFileSchema).optional(),
    meta: z.record(z.string(), z.any()).optional(),
    docs: z.string().optional(),
    categories: z.array(z.string()).optional(),
})

export const registryIndexSchema = z.array(registryItemSchema)

export const registryResolvedItemsTreeSchema = registryItemSchema.pick({
    dependencies: true,
    devDependencies: true,
    files: true,
    docs: true,
    scripts: true,
})

export type RegistryItem = z.infer<typeof registryItemSchema>

export const registrySchema = z.object({
    name: z.string(),
    homepage: z.string(),
    items: z.array(registryItemSchema),
})