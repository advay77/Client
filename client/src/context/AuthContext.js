"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case "AUTH_FAIL":
      localStorage.removeItem("token")
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case "LOGOUT":
      localStorage.removeItem("token")
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [state.token])

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const loadUser = async () => {
    try {
      const res = await axios.get("/api/auth/me")
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: res.data.data.user,
          token: state.token,
        },
      })
    } catch (error) {
      dispatch({
        type: "AUTH_FAIL",
        payload: error.response?.data?.message || "Failed to load user",
      })
    }
  }

  const login = async (email, password) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const res = await axios.post("/api/auth/login", { email, password })

      dispatch({
        type: "AUTH_SUCCESS",
        payload: res.data.data,
      })

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      dispatch({
        type: "AUTH_FAIL",
        payload: message,
      })
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const res = await axios.post("/api/auth/register", userData)

      dispatch({
        type: "AUTH_SUCCESS",
        payload: res.data.data,
      })

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      dispatch({
        type: "AUTH_FAIL",
        payload: message,
      })
      return { success: false, message }
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
