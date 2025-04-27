
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Save, Bell, MapPin, Clock, Lock } from 'lucide-react';

const Settings = () => {
  const handleSaveGeneral = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your general settings have been updated successfully.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notification Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  const handleSaveGeofence = () => {
    toast({
      title: 'Geofence Settings Saved',
      description: 'Your geofence settings have been updated.',
    });
  };

  const handleSavePassword = () => {
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="mr-2">
              <MapPin className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle>Institution Settings</CardTitle>
              <CardDescription>
                Manage your institution details and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution-name">Institution Name</Label>
              <Input id="institution-name" defaultValue="Demo Institution" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" defaultValue="admin@example.com" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="institution-address">Address</Label>
            <Textarea id="institution-address" defaultValue="123 Education Street, City, State, 12345" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution-phone">Phone Number</Label>
              <Input id="institution-phone" defaultValue="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution-website">Website</Label>
              <Input id="institution-website" defaultValue="https://example.edu" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGeneral}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="mr-2">
              <Bell className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Check-in Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive alerts when users check in</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Check-out Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive alerts when users check out</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Absence Alerts</h3>
                <p className="text-sm text-muted-foreground">Get notified when users are absent</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Geofence Violations</h3>
                <p className="text-sm text-muted-foreground">Alert when users leave designated areas</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveNotifications}>
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="mr-2">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle>Attendance Settings</CardTitle>
              <CardDescription>
                Configure attendance tracking parameters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in-start">Check-in Window Start</Label>
              <Input id="check-in-start" type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-in-end">Check-in Window End</Label>
              <Input id="check-in-end" type="time" defaultValue="10:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out-start">Check-out Window Start</Label>
              <Input id="check-out-start" type="time" defaultValue="16:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out-end">Check-out Window End</Label>
              <Input id="check-out-end" type="time" defaultValue="18:00" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-geofence-radius">Default Geofence Radius (meters)</Label>
            <Input id="default-geofence-radius" type="number" defaultValue="200" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto-mark Absence</h3>
              <p className="text-sm text-muted-foreground">Automatically mark as absent if no check-in</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGeofence}>
            <Save className="h-4 w-4 mr-2" />
            Save Attendance Settings
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="mr-2">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Enable 2FA for additional security</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePassword}>
            <Save className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
