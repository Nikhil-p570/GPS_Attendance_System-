
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, XCircle, FileText, Calendar as CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceStats } from '@/services/attendanceService';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Interface for attendance statistics
interface AttendanceStat {
  id: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  organization?: string;
  attendanceRate: number;
  presentDays: number;
  totalDays: number;
  lateDays?: number;
}

// Interface for daily attendance data
interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  total: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('daily');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 3, 5),
  });
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyAttendance[]>([]);

  // Load data when component mounts
  useEffect(() => {
    if (user && user.id && user.role === 'admin') {
      fetchAttendanceStats();
      fetchDailyData();
    }
  }, [user]);

  const fetchAttendanceStats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const stats = await getAttendanceStats(user.id, 'month');
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching statistics',
        description: 'Could not load attendance statistics.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // This would be a real API call in a production app
      // For now we'll use mock data
      const mockDailyData = [
        { date: '2025-04-01', present: 42, absent: 8, total: 50 },
        { date: '2025-04-02', present: 45, absent: 5, total: 50 },
        { date: '2025-04-03', present: 40, absent: 10, total: 50 },
        { date: '2025-04-04', present: 46, absent: 4, total: 50 },
        { date: '2025-04-05', present: 38, absent: 12, total: 50 },
      ];
      setDailyData(mockDailyData);
    } catch (error) {
      console.error('Error fetching daily attendance data:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching data',
        description: 'Could not load daily attendance data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (user && user.id) {
      fetchAttendanceStats();
      fetchDailyData();
      
      toast({
        title: 'Report Generated',
        description: 'Your attendance report has been updated with the latest data.',
      });
    }
  };

  const handleDownloadReport = () => {
    // In a real app, this would download the report as a CSV or PDF
    const reportName = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    // Generate CSV from attendance stats
    const headers = ['Name', 'Email', 'Role', 'Class/Organization', 'Attendance Rate', 'Present Days', 'Total Days'];
    
    const csvContent = [
      headers.join(','),
      ...attendanceStats.map(stat => [
        stat.name,
        stat.email,
        stat.role,
        stat.class || stat.organization || 'N/A',
        `${stat.attendanceRate}%`,
        stat.presentDays,
        stat.totalDays
      ].join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', reportName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter attendance stats based on selected filters
  const filteredStats = attendanceStats.filter(stat => {
    const matchesRole = selectedRole === 'all' || stat.role === selectedRole;
    const matchesClass = selectedClass === 'all' || 
                         (stat.class === selectedClass) ||
                         (stat.organization === selectedClass);
    return matchesRole && matchesClass;
  });

  // Calculate summary statistics
  const avgAttendanceRate = filteredStats.length > 0 
    ? Math.round(filteredStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / filteredStats.length) 
    : 0;
    
  const avgDailyPresent = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, day) => sum + day.present, 0) / dailyData.length)
    : 0;
    
  const avgDailyAbsent = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, day) => sum + day.absent, 0) / dailyData.length)
    : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Reports</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Summary of attendance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="class-filter">Class/Group</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger id="class-filter">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="Class A">Class A</SelectItem>
                        <SelectItem value="Class B">Class B</SelectItem>
                        <SelectItem value="Class C">Class C</SelectItem>
                        <SelectItem value="Teaching Dept">Teaching Dept</SelectItem>
                        <SelectItem value="Admin Dept">Admin Dept</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                              </>
                            ) : (
                              format(dateRange.from, 'PPP')
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={new Date(2025, 3)}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <Button onClick={handleGenerateReport}>Generate Report</Button>
                
                {loading ? (
                  <div className="text-center py-10">Loading data...</div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                        />
                        <Legend />
                        <Bar dataKey="present" fill="#10b981" name="Present" />
                        <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-green-500">{avgAttendanceRate}%</p>
                      <p className="text-sm text-gray-500">Average Attendance Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-blue-500">{avgDailyPresent}</p>
                      <p className="text-sm text-gray-500">Average Daily Present</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-red-500">{avgDailyAbsent}</p>
                      <p className="text-sm text-gray-500">Average Daily Absent</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Attendance Reports</CardTitle>
              <CardDescription>View and analyze attendance for individual members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="role-filter">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role-filter">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="orgMember">Organization Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="class-filter-individual">Class/Group</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger id="class-filter-individual">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="Class A">Class A</SelectItem>
                        <SelectItem value="Class B">Class B</SelectItem>
                        <SelectItem value="Class C">Class C</SelectItem>
                        <SelectItem value="Teaching Dept">Teaching Dept</SelectItem>
                        <SelectItem value="Admin Dept">Admin Dept</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-10">Loading data...</div>
                ) : (
                  <div className="border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStats.length > 0 ? (
                          filteredStats.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{member.role}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.attendanceRate}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.presentDays} / {member.totalDays}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {member.attendanceRate >= 75 ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    <CheckCircle className="h-4 w-4 mr-1" /> Good
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    <XCircle className="h-4 w-4 mr-1" /> Poor
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No data available for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Attendance Data</CardTitle>
              <CardDescription>Download attendance data for record keeping and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                              </>
                            ) : (
                              format(dateRange.from, 'PPP')
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={new Date(2025, 3)}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger id="export-format" className="mt-2">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Available Reports</Label>
                  <div className="border rounded-md divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Daily Attendance Summary</p>
                          <p className="text-sm text-gray-500">Includes check-in/out times and attendance status</p>
                        </div>
                      </div>
                      <Button onClick={handleDownloadReport} size="sm" className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Individual Attendance Details</p>
                          <p className="text-sm text-gray-500">Detailed records for each member</p>
                        </div>
                      </div>
                      <Button onClick={handleDownloadReport} size="sm" className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Attendance Percentage Report (75% Filter)</p>
                          <p className="text-sm text-gray-500">Shows members with attendance above/below 75%</p>
                        </div>
                      </div>
                      <Button onClick={handleDownloadReport} size="sm" className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
