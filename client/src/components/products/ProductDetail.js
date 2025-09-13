"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { ArrowLeft, Edit, Trash2, Star, Package, Calendar, User, Tag } from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data.data.product)
      setError("")
    } catch (err) {
      setError(t("errors.fetchFailed"))
      console.error("Fetch product error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t("products.confirmDelete"))) {
      return
    }

    try {
      await axios.delete(`/api/products/${id}`)
      navigate("/products")
    } catch (err) {
      setError(t("errors.deleteFailed"))
      console.error("Delete product error:", err)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: t("products.outOfStock"), color: "text-red-600 bg-red-50" }
    if (stock < 10) return { text: t("products.lowStock"), color: "text-yellow-600 bg-yellow-50" }
    return { text: t("products.inStock"), color: "text-green-600 bg-green-50" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Product not found"}
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.stock)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/products/${product._id}/edit`} className="btn-primary inline-flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t("common.edit")}
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="card">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={`http://localhost:5000${product.imageUrl}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
              {product.isBestseller && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Star className="h-4 w-4" />
                  Bestseller
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stock</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{product.stock}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category & Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Category:</span>
                <span className="text-sm text-gray-900">{t(`categories.${product.category}`)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">SKU:</span>
                <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <span className="text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()} at{" "}
                  {new Date(product.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {product.updatedAt !== product.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Updated:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()} at{" "}
                    {new Date(product.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {product.createdBy && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Created by:</span>
                  <span className="text-sm text-gray-900">
                    {product.createdBy.firstName} {product.createdBy.lastName}
                  </span>
                </div>
              )}
              {product.updatedBy && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Updated by:</span>
                  <span className="text-sm text-gray-900">
                    {product.updatedBy.firstName} {product.updatedBy.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
