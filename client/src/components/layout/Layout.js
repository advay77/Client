"use client"

import Sidebar from "./Sidebar"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
