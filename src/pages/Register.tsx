import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { UserPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios'; // Import Axios

const Register = () => {
  const navigate = useNavigate();
  const { admins } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
    organization: '',
    class: '',
    institution: '',
    adminIds: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleAdminChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      adminIds: prev.adminIds.includes(value)
        ? prev.adminIds.filter(id => id !== value)
        : [...prev.adminIds, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formData)
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        toast({
          variant: 'destructive',
          title: 'Missing required fields',
          description: 'Please fill in all required fields.',
        });
        return;
      }
  
      // Ensure that a class is provided for students
      if (formData.role === 'student' && !formData.class) {
        toast({
          variant: 'destructive',
          title: 'Missing class information',
          description: 'Please specify your class.',
        });
        return;
      }
  
      // Check for missing admin selection for students/orgMembers
      if ((formData.role === 'student' || formData.role === 'orgMember') && formData.adminIds.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Missing admin selection',
          description: 'Please select at least one admin/institution.',
        });
        return;
      }
  
      // Prepare data for the backend
      let registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        adminIds: formData.adminIds,
      };
  
      if (formData.role === 'student') {
        // Add class only for student
        registrationData = {
          ...registrationData,
          class: formData.class,
        };
      }
  
      // Step 1: Make the API call based on role
      let apiUrl = 'http://localhost:5000/api/register'; // Default for admin
if (formData.role === 'student') {
  apiUrl = 'http://localhost:5000/api/registerStudent'; // For students
}

try {
  // Make the API call
  const response = await axios.post(apiUrl, registrationData);

  // Check if the response indicates success
  if (response.data.success) {
    toast({
      title: 'Registration successful',
      description: 'You can now log in with your credentials.',
      status: 'success', // Add status for better visual feedback
      duration: 5000,
      isClosable: true,
    });
    navigate('/login');
  } else {
    // Handle cases where backend returns success: false
    toast({
      title: 'Registration failed',
      description: response.data.message || 'Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
} catch (error) {
  let errorMessage = 'Registration failed. Please try again.';
  
  // Handle specific error cases
  if (error.response) {
    // The request was made and the server responded with a status code
    if (error.response.data.error === 'EMAIL_EXISTS') {
      errorMessage = 'This email is already registered. Please use a different email.';
    } else if (error.response.data.message) {
      errorMessage = error.response.data.message;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Network error. Please check your internet connection.';
  }

  toast({
    title: 'Error',
    description: errorMessage,
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'There was an error registering. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary mr-2" />
          </div>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleRoleChange(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="orgMember">Organization Member</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="class">Class/Grade</Label>
                <Input
                  id="class"
                  name="class"
                  placeholder="e.g. Class 10B"
                  value={formData.class}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.role === 'orgMember' && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="e.g. IT Department"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input
                  id="institution"
                  name="institution"
                  placeholder="e.g. ABC University"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {(formData.role === 'student' || formData.role === 'orgMember') && (
              <div className="space-y-2">
                <Label htmlFor="adminIds">Select Institutions (Multiple)</Label>
                <div className="space-y-2">
                  {admins && admins.length > 0 ? (
                    admins.map(admin => (
                      <div key={admin.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`admin-${admin.id}`}
                          checked={formData.adminIds.includes(admin.id)}
                          onCheckedChange={() => handleAdminChange(admin.id)}
                        />
                        <Label htmlFor={`admin-${admin.id}`}>
                          {admin.institution} ({admin.name})
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 border rounded-md text-center text-gray-500">
                      No institutions available. Please try again later.
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
