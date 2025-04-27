
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';

const initialMembers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'student', status: 'active', class: 'Class A' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'student', status: 'active', class: 'Class B' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'student', status: 'inactive', class: 'Class A' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'orgMember', status: 'active', organization: 'Teaching Dept' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'orgMember', status: 'active', organization: 'Admin Dept' },
  { id: 6, name: 'Frank Castle', email: 'frank@example.com', role: 'student', status: 'inactive', class: 'Class C' },
  { id: 7, name: 'Grace Kelly', email: 'grace@example.com', role: 'student', status: 'active', class: 'Class B' },
  { id: 8, name: 'Harry Potter', email: 'harry@example.com', role: 'student', status: 'active', class: 'Class A' },
];

const MemberManagement = () => {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle member status
  const toggleStatus = (id: number) => {
    setMembers(members.map(member => 
      member.id === id 
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
        : member
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Manage students and organization members
              </CardDescription>
            </div>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="w-40">
                  <Select 
                    value={roleFilter} 
                    onValueChange={setRoleFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="orgMember">Org Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>{roleFilter === 'student' ? 'Class' : 'Department'}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge className={
                            member.role === 'student' ? 'bg-blue-500' : 'bg-purple-500'
                          }>
                            {member.role === 'student' ? 'Student' : 'Org Member'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.role === 'student' ? member.class : member.organization}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                          }>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => toggleStatus(member.id)}
                              title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {member.status === 'active' ? (
                                <X className="h-4 w-4 text-red-500" />
                              ) : (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button variant="outline" size="icon" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Delete">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No members found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberManagement;
