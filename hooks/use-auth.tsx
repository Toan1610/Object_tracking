"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Kiểu dữ liệu cho context
interface AuthContextType {
  user: any
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profile: { name?: string; email?: string; avatarUrl?: string }) => Promise<void>
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Lấy user hiện tại khi load trang
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })
    if (error) throw new Error(error.message)
    setUser(data.user)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  const updateProfile = async (profile: { name?: string; email?: string; avatarUrl?: string }) => {
    // Example for Supabase
    const updates: any = {}
    if (profile.name) updates.full_name = profile.name
    if (profile.avatarUrl) updates.avatar_url = profile.avatarUrl
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: updates,
      email: profile.email, // Only include if email is changed
    })
    if (error) throw new Error(error.message)
    // Optionally, update local user state
    setUser((prev: any) => ({ ...prev, ...updates, email: profile.email ?? prev.email }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
