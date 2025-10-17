export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Mock authentication - in production, this would call your API
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    if (email === "demo@example.com" && password === "password") {
      const user: User = {
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      }
      localStorage.setItem("auth_user", JSON.stringify(user))
      return user
    }

    throw new Error("Invalid credentials")
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    // Mock registration - in production, this would call your API
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      avatarUrl: "/placeholder.svg?height=40&width=40",
    }
    localStorage.setItem("auth_user", JSON.stringify(user))
    return user
  },

  logout: () => {
    localStorage.removeItem("auth_user")
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("auth_user")
    return userStr ? JSON.parse(userStr) : null
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const currentUser = authService.getCurrentUser()
    if (!currentUser) throw new Error("Not authenticated")

    const updatedUser = { ...currentUser, ...updates }
    localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    return updatedUser
  },
}
