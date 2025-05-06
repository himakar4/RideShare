
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { AlertCircle, User, Shield, Car, Bell, MapPin, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useUserContext } from '../context/UserContext';
import MainLayout from '../components/layout/MainLayout';

const Profile = () => {
  const { user, updateUser } = useUserContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      address: user?.address || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  const password = watch('newPassword');
  
  const handleProfileUpdate = (data) => {
    setIsSubmitting(true);
    
    // In a real app, send the updated profile data to an API
    setTimeout(() => {
      updateUser({
        ...user,
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        address: data.address,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handlePasswordChange = (data) => {
    setIsSubmitting(true);
    
    // In a real app, send the password change request to an API
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setIsSubmitting(false);
      setIsChangingPassword(false);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photo || ''} alt={user?.name} />
                <AvatarFallback className="bg-primary text-white text-xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-gray-500">{user?.role === 'rider' ? 'Driver' : 'Passenger'}</p>
              </div>
            </div>
            
            <div className="bg-gray-100 px-4 py-2 rounded text-center">
              <div className="font-bold text-lg">4.9</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.role === 'rider' ? 'Ride Preferences' : 'Ride Preferences'}</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            {...register('name', { required: 'Name is required' })}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            disabled
                            {...register('email')}
                          />
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="(123) 456-7890"
                            {...register('phone', {
                              pattern: {
                                value: /^[0-9()-\s+]*$/,
                                message: 'Invalid phone number format',
                              },
                            })}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Main St, City, State, ZIP"
                            {...register('address')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          placeholder="Tell others a bit about yourself..."
                          {...register('bio')}
                        />
                        <p className="text-xs text-gray-500">
                          This will be visible to other users
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="photo">Profile Photo</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.photo || ''} alt={user?.name} />
                            <AvatarFallback className="bg-primary text-white text-xl">
                              {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <Button type="button" variant="outline">
                            Change Photo
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Ride Preferences</CardTitle>
                  <CardDescription>
                    Customize your ride experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user?.role === 'rider' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Music Preferences</Label>
                          <RadioGroup defaultValue="passenger-choice" className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="passenger-choice" id="passenger-choice" />
                              <Label htmlFor="passenger-choice" className="font-normal">Let passengers choose</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="my-choice" id="my-choice" />
                              <Label htmlFor="my-choice" className="font-normal">I prefer to choose the music</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no-music" id="no-music" />
                              <Label htmlFor="no-music" className="font-normal">No music</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Conversation Level</Label>
                          <Select defaultValue="chatty">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select conversation preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chatty">I enjoy conversation</SelectItem>
                              <SelectItem value="quiet">I prefer quiet rides</SelectItem>
                              <SelectItem value="depends">Depends on my mood</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Pets</Label>
                          <RadioGroup defaultValue="no-pets" className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pets-allowed" id="pets-allowed" />
                              <Label htmlFor="pets-allowed" className="font-normal">Pets are welcome</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no-pets" id="no-pets" />
                              <Label htmlFor="no-pets" className="font-normal">No pets, please</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Search Radius</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select radius preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (up to 1 mile from pickup/dropoff)</SelectItem>
                              <SelectItem value="medium">Medium (up to 3 miles from pickup/dropoff)</SelectItem>
                              <SelectItem value="large">Large (up to 5 miles from pickup/dropoff)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Ride Preferences</Label>
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch id="women-only" />
                            <Label htmlFor="women-only" className="font-normal">Show women drivers only</Label>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch id="verified-only" defaultChecked />
                            <Label htmlFor="verified-only" className="font-normal">Show verified drivers only</Label>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch id="high-rating" defaultChecked />
                            <Label htmlFor="high-rating" className="font-normal">Show drivers with 4+ rating only</Label>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-notifications" className="flex items-center">
                          <Bell className="h-4 w-4 mr-2" />
                          Enable Ride Notifications
                        </Label>
                        <Switch id="allow-notifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="location-sharing" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location Sharing During Rides
                        </Label>
                        <Switch id="location-sharing" defaultChecked />
                      </div>
                    </div>
                    
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
              
              {user?.role === 'rider' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>
                      Update your vehicle details for passengers to see.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Vehicle Make</Label>
                          <Input placeholder="e.g., Toyota" defaultValue="Toyota" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Vehicle Model</Label>
                          <Input placeholder="e.g., Prius" defaultValue="Prius" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input placeholder="e.g., 2020" defaultValue="2020" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input placeholder="e.g., Blue" defaultValue="Blue" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>License Plate</Label>
                          <Input placeholder="e.g., ABC123" defaultValue="ABC123" />
                        </div>
                      </div>
                      
                      <Button>Update Vehicle Information</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your account password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isChangingPassword ? (
                    <Button onClick={() => setIsChangingPassword(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            {...register('currentPassword', {
                              required: 'Current password is required',
                            })}
                          />
                          {errors.currentPassword && (
                            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            {...register('newPassword', {
                              required: 'New password is required',
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                              },
                            })}
                          />
                          {errors.newPassword && (
                            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...register('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: value =>
                                value === password || 'Passwords do not match',
                            })}
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all your data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <AlertCircle className="h-6 w-6 text-destructive mr-3 flex-shrink-0" />
                    <p className="text-sm">
                      This action cannot be undone. All your data will be permanently removed from our servers.
                    </p>
                  </div>
                  <Button variant="destructive" className="mt-4">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
