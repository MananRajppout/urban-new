'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, Save, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { changePassword } from '@/lib/api/ApiExtra'

const page = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      toast.error('Please enter your current password')
      return false
    }

    if (!formData.newPassword.trim()) {
      toast.error('Please enter a new password')
      return false
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return false
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password')
      return false
    }

    if (!formData.confirmPassword.trim()) {
      toast.error('Please confirm your new password')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await changePassword(formData.currentPassword, formData.newPassword)
      
      if (response.data && response.data.success) {
        toast.success('Password changed successfully!')
        
        // Clear the form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.data?.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to change password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="mt-1 text-muted-foreground">
              Update your account password to keep your account secure.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Security
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new strong password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative max-w-md">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your current password to verify your identity.
              </p>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative max-w-md">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose a strong password with at least 8 characters.
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative max-w-md">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Re-enter your new password to confirm.
              </p>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/20 rounded-lg p-4 max-w-md">
              <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className={`flex items-center gap-2 ${formData.newPassword.length >= 8 ? 'text-green-500' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  At least 8 characters long
                </li>
                <li className={`flex items-center gap-2 ${formData.newPassword !== formData.currentPassword && formData.newPassword ? 'text-green-500' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword !== formData.currentPassword && formData.newPassword ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  Different from current password
                </li>
                <li className={`flex items-center gap-2 ${formData.newPassword === formData.confirmPassword && formData.newPassword ? 'text-green-500' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword === formData.confirmPassword && formData.newPassword ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  Passwords match
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
                className="min-w-[100px] text-white cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[140px] text-white cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default page