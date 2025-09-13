"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { ArrowLeft, Upload, X, Star } from "lucide-react"

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
    isBestseller: false,
    image: null,
    currentImageUrl: "",
  })

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports & Outdoors",
    "Books",
    "Health & Beauty",
    "Toys & Games",
    "Automotive",
    "Food & Beverages",
    "Other",
  ]

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setFetchLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      const product = response.data.data.product

      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        isBestseller: product.isBestseller,
        image: null,
        currentImageUrl: product.imageUrl,
      })

      if (product.imageUrl) {
        setImagePreview(`http://localhost:5000${product.imageUrl}`)
      }
    } catch (err) {
      setError(t("errors.fetchFailed"))
      console.error("Fetch product error:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("validation.imageTooLarge"))
        return
      }

      if (!file.type.startsWith("image/")) {
        setError(t("validation.imageInvalid"))
        return
      }

      setFormData({ ...formData, image: file })
      setImagePreview(URL.createObjectURL(file))
      setError("")
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null })
    if (formData.currentImageUrl) {
      setImagePreview(`http://localhost:5000${formData.currentImageUrl}`)
    } else {
      setImagePreview(null)
    }
    // Reset file input
    const fileInput = document.getElementById("image")
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("price", formData.price)
      submitData.append("stock", formData.stock)
      submitData.append("isBestseller", formData.isBestseller)

      if (formData.image) {
        submitData.append("image", formData.image)
      }

      await axios.put(`/api/products/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      navigate("/products")
    } catch (err) {
      setError(err.response?.data?.message || t("errors.updateFailed"))
      console.error("Update product error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("products.editProduct")}</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t("products.basicInformation")}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.productName")} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="input-field"
                  placeholder={t("products.enterProductName")}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.description")} *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="input-field resize-none"
                  placeholder={t("products.enterDescription")}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.category")} *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="input-field"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.price")} ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder={t("products.enterPrice")}
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.stock")} *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    className="input-field"
                    placeholder={t("products.enterStock")}
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBestseller"
                      checked={formData.isBestseller}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{t("products.bestseller")}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t("products.productImage")}</h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {t("products.uploadImage")}
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">{t("products.imageUploadHint")}</span>
                      </label>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("products.updating")}
                </div>
              ) : (
                t("products.updateProduct")
              )}
            </button>
            <button type="button" onClick={() => navigate("/products")} className="btn-secondary">
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct
