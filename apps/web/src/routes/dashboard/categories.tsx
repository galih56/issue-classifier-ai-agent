import { createFileRoute } from "@tanstack/solid-router"
import { createSignal, createResource, For, Show } from "solid-js"
import { api } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-solid"

export const Route = createFileRoute("/dashboard/categories")({
  component: CategoriesPage,
})

interface Collection {
  id: string
  name: string
  description: string | null
  workspaceId: string | null
  createdAt: string
}

interface Category {
  id: string
  collectionId: string
  name: string
  description: string | null
  parentId: string | null
  orderIndex: number | null
  createdAt: string
}

async function fetchCollections(): Promise<Collection[]> {
  const data = await api.get<{ collections: Collection[] }>("/collections")
  return data.collections
}

async function fetchCategories(collectionId: string): Promise<Category[]> {
  const data = await api.get<{ categories: Category[] }>(
    `/collections/${collectionId}/categories`
  )
  return data.categories
}

async function createCollection(name: string, description: string) {
  return await api.post("/collections", { name, description })
}

async function createCategory(
  collectionId: string,
  name: string,
  description: string,
  parentId: string | null
) {
  return await api.post("/categories", { collectionId, name, description, parentId })
}

async function deleteCollection(id: string) {
  await api.delete(`/collections/${id}`)
}

async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`)
}

function CategoriesPage() {
  const [collections, { refetch: refetchCollections }] = createResource(fetchCollections)
  const [selectedCollection, setSelectedCollection] = createSignal<string | null>(null)
  const [categories, setCategories] = createSignal<Category[]>([])
  const [showCollectionForm, setShowCollectionForm] = createSignal(false)
  const [showCategoryForm, setShowCategoryForm] = createSignal(false)
  const [collectionName, setCollectionName] = createSignal("")
  const [collectionDescription, setCollectionDescription] = createSignal("")
  const [categoryName, setCategoryName] = createSignal("")
  const [categoryDescription, setCategoryDescription] = createSignal("")
  const [categoryParentId, setCategoryParentId] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(false)

  const loadCategories = async (collectionId: string) => {
    try {
      const cats = await fetchCategories(collectionId)
      setCategories(cats)
    } catch (error) {
      console.error("Failed to load categories:", error)
      alert("Failed to load categories. Please try again.")
    }
  }

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId)
    loadCategories(collectionId)
  }

  const handleCreateCollection = async (e: Event) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createCollection(collectionName(), collectionDescription())
      await refetchCollections()
      setCollectionName("")
      setCollectionDescription("")
      setShowCollectionForm(false)
    } catch (error) {
      console.error("Failed to create collection:", error)
      alert("Failed to create collection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: Event) => {
    e.preventDefault()
    if (!selectedCollection()) return
    setLoading(true)

    try {
      await createCategory(
        selectedCollection()!,
        categoryName(),
        categoryDescription(),
        categoryParentId()
      )
      await loadCategories(selectedCollection()!)
      setCategoryName("")
      setCategoryDescription("")
      setCategoryParentId(null)
      setShowCategoryForm(false)
    } catch (error) {
      console.error("Failed to create category:", error)
      alert("Failed to create category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return

    try {
      await deleteCollection(id)
      await refetchCollections()
      if (selectedCollection() === id) {
        setSelectedCollection(null)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to delete collection:", error)
      alert("Failed to delete collection. Please try again.")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    if (!selectedCollection()) return

    try {
      await deleteCategory(id)
      await loadCategories(selectedCollection()!)
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert("Failed to delete category. Please try again.")
    }
  }

  return (
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div class="grid gap-4 md:grid-cols-2">
        {/* Collections Panel */}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold tracking-tight">Collections</h2>
                <p class="text-sm text-muted-foreground">
                  Manage your category collections
                </p>
              </div>
              <button
                onClick={() => setShowCollectionForm(!showCollectionForm())}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Collection
              </button>
            </div>

            <Show when={showCollectionForm()}>
              <form onSubmit={handleCreateCollection} class="mb-4 p-4 border rounded-lg">
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={collectionName()}
                      onInput={(e) => setCollectionName(e.currentTarget.value)}
                      required
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium">Description</label>
                    <textarea
                      value={collectionDescription()}
                      onInput={(e) => setCollectionDescription(e.currentTarget.value)}
                      class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading()}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCollectionForm(false)}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </Show>

            <div class="space-y-2">
              <Show when={collections.error}>
                <Alert variant="destructive">
                  <AlertCircle class="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load collections. Please try again.
                    <button
                      onClick={() => refetchCollections()}
                      class="ml-2 underline"
                    >
                      Retry
                    </button>
                  </AlertDescription>
                </Alert>
              </Show>
              <Show
                when={!collections.loading && collections()}
                fallback={<p class="text-sm text-muted-foreground">Loading collections...</p>}
              >
                <For each={collections()}>
                  {(collection) => (
                    <div
                      class={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCollection() === collection.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div class="flex items-center justify-between">
                        <div
                          class="flex-1"
                          onClick={() => handleCollectionSelect(collection.id)}
                        >
                          <h3 class="font-medium">{collection.name}</h3>
                          <Show when={collection.description}>
                            <p class="text-sm text-muted-foreground">{collection.description}</p>
                          </Show>
                        </div>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          class="ml-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>
        </div>

        {/* Categories Panel */}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold tracking-tight">Categories</h2>
                <p class="text-sm text-muted-foreground">
                  {selectedCollection() ? "Manage categories" : "Select a collection"}
                </p>
              </div>
              <Show when={selectedCollection()}>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm())}
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Add Category
                </button>
              </Show>
            </div>

            <Show when={showCategoryForm() && selectedCollection()}>
              <form onSubmit={handleCreateCategory} class="mb-4 p-4 border rounded-lg">
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={categoryName()}
                      onInput={(e) => setCategoryName(e.currentTarget.value)}
                      required
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium">Description</label>
                    <textarea
                      value={categoryDescription()}
                      onInput={(e) => setCategoryDescription(e.currentTarget.value)}
                      class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium">Parent Category (Optional)</label>
                    <select
                      value={categoryParentId() || ""}
                      onChange={(e) => setCategoryParentId(e.currentTarget.value || null)}
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">None (Top Level)</option>
                      <For each={categories().filter((c) => !c.parentId)}>
                        {(cat) => <option value={cat.id}>{cat.name}</option>}
                      </For>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading()}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </Show>

            <div class="space-y-2">
              <Show when={selectedCollection()}>
                <Show
                  when={categories().length > 0}
                  fallback={<p class="text-sm text-muted-foreground">No categories yet.</p>}
                >
                  <For each={categories().filter((c) => !c.parentId)}>
                    {(category) => (
                      <div class="border rounded-lg">
                        <div class="p-3 flex items-center justify-between">
                          <div>
                            <h3 class="font-medium">{category.name}</h3>
                            <Show when={category.description}>
                              <p class="text-sm text-muted-foreground">{category.description}</p>
                            </Show>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            class="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        {/* Subcategories */}
                        <For each={categories().filter((c) => c.parentId === category.id)}>
                          {(subcategory) => (
                            <div class="pl-6 pr-3 py-2 border-t bg-muted/30 flex items-center justify-between">
                              <div>
                                <h4 class="text-sm font-medium">↳ {subcategory.name}</h4>
                                <Show when={subcategory.description}>
                                  <p class="text-xs text-muted-foreground">
                                    {subcategory.description}
                                  </p>
                                </Show>
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(subcategory.id)}
                                class="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
