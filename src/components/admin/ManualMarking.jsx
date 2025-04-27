
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../ui/use-toast';
import { Calendar as CalendarIcon, CheckCircle, XCircle, User, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';

// Mock data for students
const mockStudents = [
  { id: '1', name: 'Alice Johnson', role: 'student', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', role: 'student', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Brown', role: 'student', email: 'charlie@example.com' },
  { id: '4', name: 'Diana Prince', role: 'orgMember', email: 'diana@example.com' },
  { id: '5', name: 'Ethan Hunt', role: 'student', email: 'ethan@example.com' },
];

const ManualMarking = () => {
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState({});

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (studentId, status) => {
    setSelectedStudents({
      ...selectedStudents,
      [studentId]: status
    });
  };

  const handleMarkAttendance = async () => {
    if (Object.keys(selectedStudents).length === 0) {
      toast({
        variant: "destructive",
        title: "No students selected",
        description: "Please mark attendance for at least one student"
      });
      return;
    }

    if (!date) {
      toast({
        variant: "destructive",
        title: "Date required",
        description: "Please select a date for attendance"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Attendance Marked",
        description: `Successfully marked attendance for ${Object.keys(selectedStudents).length} students`
      });
      
      // Reset form
      setSelectedStudents({});
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "Could not mark attendance. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Attendance Marking</CardTitle>
          <CardDescription>Mark attendance manually for students or staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger id="location" className="mt-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campus-a">Main Campus</SelectItem>
                  <SelectItem value="campus-b">Secondary Campus</SelectItem>
                  <SelectItem value="campus-c">Remote Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search Students</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="search" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted py-3 px-4 text-sm font-medium grid grid-cols-12 gap-4">
              <div className="col-span-5">Student</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-4">Status</div>
            </div>
            
            <div className="divide-y">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div key={student.id} className="py-3 px-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{student.role}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {student.email}
                    </div>
                    
                    <div className="col-span-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={selectedStudents[student.id] === 'present' ? 'default' : 'outline'} 
                          className={`flex items-center ${selectedStudents[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          onClick={() => handleStatusChange(student.id, 'present')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={selectedStudents[student.id] === 'absent' ? 'default' : 'outline'} 
                          className={`flex items-center ${selectedStudents[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          onClick={() => handleStatusChange(student.id, 'absent')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">No students found</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleMarkAttendance} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Processing..." : "Save Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualMarking;
