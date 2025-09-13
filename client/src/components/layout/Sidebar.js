"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import LanguageSwitcher from "../common/LanguageSwitcher"
import { LayoutDashboard, Package, Plus, ShoppingCart, Users, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { logout, user } = useAuth()
  const { t } = useTranslation()

  const navigation = [
    { name: t("navigation.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("navigation.products"), href: "/products", icon: Package },
    { name: t("navigation.addProduct"), href: "/products/add", icon: Plus },
    { name: t("navigation.orders"), href: "/orders", icon: ShoppingCart },
    { name: t("navigation.customers"), href: "/customers", icon: Users },
    { name: t("navigation.analytics"), href: "/analytics", icon: BarChart3 },
    { name: t("navigation.settings"), href: "/settings", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
  }

  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-white shadow-md border border-gray-200">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t("navigation.adminPanel")}</h1>
              <p className="text-xs text-gray-500">{t("navigation.ecommerceDashboard")}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Language Switcher */}
          <div className="px-4 py-2 border-t border-gray-200">
            <LanguageSwitcher />
          </div>

          {/* User Profile & Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">{user?.firstName?.charAt(0) || "A"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("auth.logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
