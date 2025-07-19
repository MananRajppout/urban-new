'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Save, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { getWebsiteSettings, updateWebsiteSettings } from '@/lib/api/ApiSettings'
import useSWR from 'swr'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const page = () => {
  const [settings, setSettings] = useState({
    websiteName: '',
    logo: null,
    contactEmail: '',
    metaDescription: '',
    liveDemoAgent: '',
    liveDemoPhoneNumber: ''
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [agents, setAgents] = useState([])
  const [phoneNumbers, setPhoneNumbers] = useState([])

  // Load existing settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getWebsiteSettings();
        
        if (response.code === 200 && response.data && response.data.settings) {
          setSettings(prev => ({
            ...prev,
            websiteName: response.data.settings.website_name || '',
            contactEmail: response.data.settings.contact_email || '',
            metaDescription: response.data.settings.meta_description || '',
            liveDemoAgent: response.data.settings.live_demo_agent || '',
            liveDemoPhoneNumber: response.data.settings.live_demo_phone_number || ''
          }))

       

          setAgents(response.data.agents);
          setPhoneNumbers(response.data.phoneNumbers);
          
          // If there's an existing logo URL, set it as preview
          if (response.data.settings.logo) {
            setLogoPreview(response.data.settings.logo)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load website settings')
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size should be less than 5MB')
        return
      }

      setSettings(prev => ({
        ...prev,
        logo: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!settings.websiteName.trim()) {
      toast.error('Please enter a website name')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await updateWebsiteSettings(
        settings.websiteName.trim(),
        settings.logo,
        settings.contactEmail,
        settings.metaDescription,
        settings.liveDemoAgent,
        settings.liveDemoPhoneNumber
      )
      
      if (response.code === 200) {
        toast.success('Website settings saved successfully!')
        
        // Update the logo preview with the new URL if provided
        if (response.data && response.data.settings && response.data.settings.logo) {
          setLogoPreview(response.data.settings.logo)
        }
        
        // Clear the file input since it's now saved
        setSettings(prev => ({
          ...prev,
          logo: null
        }))
        
        // Clear the file input element
        const fileInput = document.getElementById('logo')
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        toast.error(response.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo: null
    }))
    setLogoPreview(null)
    
    // Clear the file input
    const fileInput = document.getElementById('logo')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-[30rem]">
          <Loader2 className="text-green-500 animate-spin" size={45} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">General Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Configure your website's basic settings and branding.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Website Configuration</CardTitle>
          <CardDescription>
            Update your website name and logo to customize your branding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Name Field */}
            <div className="space-y-2">
              <Label htmlFor="websiteName">Website Name</Label>
              <Input
                id="websiteName"
                name="websiteName"
                type="text"
                placeholder="Enter your website name"
                value={settings.websiteName}
                onChange={handleInputChange}
                className="max-w-md text-white"
                
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed as your website's title.
              </p>
            </div>

            {/* Contact Email Field */}

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="Enter your contact email"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="max-w-md text-white"
                
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed as your website's contact email.
              </p>
            </div>

            {/* Meta Description Field */}
            <div className="space-y-2 flex flex-col gap-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                type="text"
                placeholder="Enter your meta description"
                value={settings.metaDescription}
                onChange={handleInputChange}
                className="max-w-md text-white h-20 border-2 border-gray-300 rounded-md p-2 bg-black text-sm placeholder:text-gray-500"
                
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed as your website's meta description.
              </p>
            </div>
            {/* Logo Upload Field */}
            <div className="space-y-2">
              <Label htmlFor="logo">Website Logo</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1 max-w-md">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer text-white"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload a logo for your website. Recommended size: 200x200px or larger. 
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF.
                  </p>
                </div>
                {logoPreview && (
                  <div className="flex-shrink-0 w-20 h-20 ml-10">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 object-cover rounded-lg border border-input"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-opacity"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">Preview</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="mt-2 w-full text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Agents Select Live Demo Agent if no agent is selected then show a message to add an agent*/}
            <div className="space-y-2">
              <Label htmlFor="liveDemoAgent">Live Demo Agent</Label>
              {agents.length > 0 ? (
                <Select className='text-white' value={settings.liveDemoAgent} onValueChange={(value) => setSettings(prev => ({ ...prev, liveDemoAgent: value }))}>
                  <SelectTrigger className='text-white'>
                    <SelectValue placeholder="Select an agent" className='text-white'/>
                  </SelectTrigger>
                  <SelectContent className='text-white'>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id} className='text-white'>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">No agents found. Please add an agent first.</p>
              )}
            </div>

            {/* Live Demo Phone Number Field */}
            <div className="space-y-2">
                <Label htmlFor="liveDemoPhoneNumber">Live Demo Phone Number</Label>
               {/* select live demo phoner number and is number lenght is 0 then show buy a phone number message*/}
               <Select className='text-white' value={settings.liveDemoPhoneNumber} onValueChange={(value) => setSettings(prev => ({ ...prev, liveDemoPhoneNumber: value }))}>
                <SelectTrigger className='text-white'>
                  <SelectValue placeholder="Select a phone number" className='text-white'/>
                </SelectTrigger>
                {
                  phoneNumbers.length > 0 ? (
                    <SelectContent className='text-white'>
                      {phoneNumbers.map((phoneNumber) => (
                        <SelectItem key={phoneNumber.phone_number} value={phoneNumber.phone_number} className='text-white'>{phoneNumber.phone_number}</SelectItem>
                      ))}
                    </SelectContent>
                  ) : (
                    <p className="text-sm text-muted-foreground">No phone numbers found. Please buy a phone number first.</p>
                  )
                }
               </Select>

                <p className="text-sm text-muted-foreground">
                  This will be displayed as your website's live demo phone number.
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[120px] text-white cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
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