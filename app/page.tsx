"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Upload,
  X,
  Package,
  AlertTriangle,
  LogOut,
  Settings,
  Activity,
  DollarSign,
} from "lucide-react"

// Default categories
const defaultCategories = [
  { id: '1', name: 'Men', description: 'Men\'s products', productCount: 0 },
  { id: '2', name: 'Women', description: 'Women\'s products', productCount: 0 }
]

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  images: string[]
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description: string
  productCount: number
}

interface LoginData {
  email: string
  password: string
}

const STORAGE_KEYS = {
  PRODUCTS: "admin_products",
  CATEGORIES: "admin_categories",
  AUTH: "admin_auth",
}

const saveToStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

const loadFromStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  }
  return defaultValue
}


export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" })

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    sku: "",
    images: [] as string[],
    status: "active" as "active" | "inactive",
  })

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  })


  useEffect(() => {
    const storedAuth = loadFromStorage(STORAGE_KEYS.AUTH, false)
    const storedProducts = loadFromStorage(STORAGE_KEYS.PRODUCTS, [])
    const storedCategories = loadFromStorage(STORAGE_KEYS.CATEGORIES, defaultCategories)

    // If no categories in storage, save the default ones
    if (storedCategories.length === 0) {
      saveToStorage(STORAGE_KEYS.CATEGORIES, defaultCategories)
    }

    setIsLoggedIn(storedAuth)
    setProducts(storedProducts)
    setCategories(storedCategories.length > 0 ? storedCategories : defaultCategories)
  }, [])

  useEffect(() => {
    if (products.length > 0 || loadFromStorage(STORAGE_KEYS.PRODUCTS, []).length > 0) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, products)
      // Update category product counts
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        productCount: products.filter((p) => p.category === cat.name).length,
      }))
      setCategories(updatedCategories)
      saveToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories)
    }
  }, [products])

  useEffect(() => {
    if (categories.length > 0 || loadFromStorage(STORAGE_KEYS.CATEGORIES, []).length > 0) {
      saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
    }
  }, [categories])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === "active").length
  const lowStockProducts = products.filter((p) => p.stock < 10).length
  const totalRevenue = products.reduce((sum, p) => sum + p.price * Math.max(0, 100 - p.stock), 0)

  const handleImageUpload = (files: FileList | null, isEditing = false) => {
    if (!files) return

    const imageUrls: string[] = []
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file)
      imageUrls.push(url)
    })

    if (isEditing && editingProduct) {
      setEditingProduct((prev) => (prev ? { ...prev, images: [...prev.images, ...imageUrls] } : null))
    } else {
      setNewProduct((prev) => ({ ...prev, images: [...(prev.images || []), ...imageUrls] }))
    }
  }

  const addProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      alert("Please fill in all required fields")
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setProducts((prev) => [...prev, product])
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      sku: "",
      images: [],
      status: "active",
    })
    setShowAddProduct(false)
  }

  const updateProduct = () => {
    if (!editingProduct) return

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id ? { ...editingProduct, updatedAt: new Date().toISOString().split("T")[0] } : p,
      ),
    )
    setEditingProduct(null)
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelectedProducts((prev) => prev.filter((pid) => pid !== id))
  }

  const addCategory = () => {
    if (!newCategory.name) {
      alert("Please enter a category name")
      return
    }

    const category: Category = {
      id: Date.now().toString(),
      ...newCategory,
      productCount: 0,
    }

    setCategories((prev) => [...prev, category])
    setNewCategory({ name: "", description: "" })
    setShowAddCategory(false)
  }

  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find((c) => c.id === id)
    if (categoryToDelete && categoryToDelete.productCount > 0) {
      alert("Cannot delete category with existing products")
      return
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const handleBulkAction = () => {
    if (!bulkAction || selectedProducts.length === 0) return

    switch (bulkAction) {
      case "delete":
        setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)))
        break
      case "activate":
        setProducts((prev) =>
          prev.map((p) => (selectedProducts.includes(p.id) ? { ...p, status: "active" as const } : p)),
        )
        break
      case "deactivate":
        setProducts((prev) =>
          prev.map((p) => (selectedProducts.includes(p.id) ? { ...p, status: "inactive" as const } : p)),
        )
        break
    }

    setSelectedProducts([])
    setBulkAction("")
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple authentication - in real app, this would be an API call
    setTimeout(() => {
      if (loginData.email && loginData.password) {
        setIsLoggedIn(true)
        saveToStorage(STORAGE_KEYS.AUTH, true)
      } else {
        alert("Please enter valid credentials")
      }
      setLoading(false)
    }, 500)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    saveToStorage(STORAGE_KEYS.AUTH, false)
    setLoginData({ email: "", password: "" })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Access your e-commerce admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Luxe Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-3xl font-bold text-orange-600">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Product Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>

                <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>Create a new product for your store</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))}
                            placeholder="Enter SKU"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter product description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) =>
                              setNewProduct((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) || 0 }))
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={newProduct.category}
                            onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Product Images</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <Label htmlFor="images" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">Upload images</span>
                              <span className="mt-1 block text-sm text-gray-500">PNG, JPG, GIF up to 10MB</span>
                            </Label>
                            <Input
                              id="images"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e.target.files)}
                              className="hidden"
                            />
                          </div>
                        </div>
                        {newProduct.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mt-4">
                            {newProduct.images.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() =>
                                    setNewProduct((prev) => ({
                                      ...prev,
                                      images: prev.images.filter((_, i) => i !== index),
                                    }))
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addProduct}>Add Product</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedProducts.length} product(s) selected</span>
                  <div className="flex items-center gap-2">
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Bulk actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">Activate</SelectItem>
                        <SelectItem value="deactivate">Deactivate</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkAction} disabled={!bulkAction}>
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {products.length === 0
                    ? "Get started by adding your first product"
                    : "Try adjusting your search or filter criteria"}
                </p>
                {products.length === 0 && (
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                )}
              </Card>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 px-1">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length}
                    onCheckedChange={selectAllProducts}
                  />
                  <Label className="text-sm text-gray-600">Select all ({filteredProducts.length} products)</Label>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </div>
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <Badge
                            variant={product.status === "active" ? "default" : "secondary"}
                            className="absolute top-2 right-2"
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600">${product.price}</span>
                              <Badge variant={product.stock < 10 ? "destructive" : "outline"}>
                                Stock: {product.stock}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>SKU: {product.sku}</span>
                              <span>{product.category}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr className="text-left">
                            <th className="p-4">
                              <Checkbox
                                checked={selectedProducts.length === filteredProducts.length}
                                onCheckedChange={selectAllProducts}
                              />
                            </th>
                            <th className="p-4">Product</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedProducts.includes(product.id)}
                                  onCheckedChange={() => toggleProductSelection(product.id)}
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {product.images.length > 0 ? (
                                    <img
                                      src={product.images[0] || "/placeholder.svg"}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm">{product.sku}</td>
                              <td className="p-4 text-sm">{product.category}</td>
                              <td className="p-4 text-sm font-medium">${product.price}</td>
                              <td className="p-4">
                                <Badge variant={product.stock < 10 ? "destructive" : "outline"}>{product.stock}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                  {product.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 bg-transparent"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{product.name}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>Create a new product category</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name *</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter category description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCategory}>Add Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {categories.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500 mb-4">Create your first product category to get started</p>
                <Button onClick={() => setShowAddCategory(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                          <Badge variant="outline">
                            {category.productCount} product{category.productCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"?
                                {category.productCount > 0 && " This category has products and cannot be deleted."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategory(category.id)}
                                disabled={category.productCount > 0}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Product Name *</Label>
                  <Input
                    id="editName"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSku">SKU</Label>
                  <Input
                    id="editSku"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, sku: e.target.value } : null))}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPrice">Price *</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null,
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStock">Stock</Label>
                  <Input
                    id="editStock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, stock: Number.parseInt(e.target.value) || 0 } : null,
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Category *</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) => setEditingProduct((prev) => (prev ? { ...prev, category: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingProduct.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingProduct((prev) => (prev ? { ...prev, status: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="editImages" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Upload images</span>
                      <span className="mt-1 block text-sm text-gray-500">PNG, JPG, GIF up to 10MB</span>
                    </Label>
                    <Input
                      id="editImages"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files, true)}
                      className="hidden"
                    />
                  </div>
                </div>
                {editingProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {editingProduct.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() =>
                            setEditingProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index),
                                  }
                                : null,
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button onClick={updateProduct}>Update Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
