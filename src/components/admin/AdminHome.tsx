
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Map from '@/components/Map';

// Mock data for attendance overview
const attendanceData = [
  { name: 'Mon', present: 42, absent: 8 },
  { name: 'Tue', present: 45, absent: 5 },
  { name: 'Wed', present: 40, absent: 10 },
  { name: 'Thu', present: 43, absent: 7 },
  { name: 'Fri', present: 38, absent: 12 },
];

// Mock recent activity data
const recentActivity = [
  { id: 1, name: 'Alice Johnson', action: 'check-in', time: '09:05:23', status: 'present' },
  { id: 2, name: 'Bob Smith', action: 'check-out', time: '17:15:30', status: 'present' },
  { id: 3, name: 'Charlie Brown', action: 'missed', time: '', status: 'absent' },
  { id: 4, name: 'Diana Prince', action: 'check-in', time: '09:10:45', status: 'present' },
  { id: 5, name: 'Ethan Hunt', action: 'missed', time: '', status: 'absent' },
];

// Mock monthly attendance trend
const monthlyTrend = [
  { name: 'Week 1', attendance: 88 },
  { name: 'Week 2', attendance: 92 },
  { name: 'Week 3', attendance: 85 },
  { name: 'Week 4', attendance: 90 },
];

// Sample user locations for map demonstration
const sampleUserLocations = [
  { id: '1', name: 'Alice Johnson', role: 'student', location: { latitude: 40.7138, longitude: -74.0070 } },
  { id: '2', name: 'Bob Smith', role: 'student', location: { latitude: 40.7148, longitude: -74.0080 } },
  { id: '3', name: 'Charlie Brown', role: 'student', location: { latitude: 40.7118, longitude: -74.0050 } },
  { id: '4', name: 'Diana Prince', role: 'orgMember', location: { latitude: 40.7128, longitude: -74.0040 } },
];

// Geofence center for demo
const geofenceCenter = { latitude: 40.7128, longitude: -74.0060 };
const geofenceRadius = 200; // in meters

const AdminHome = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Members</div>
                <div className="text-2xl font-bold">50</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Today's Attendance</div>
                <div className="text-2xl font-bold">42</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Avg. Attendance</div>
                <div className="text-2xl font-bold">86%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Absences</div>
                <div className="text-2xl font-bold">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily attendance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Attendance percentage by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-Time Location Tracking</CardTitle>
            <CardDescription>Current locations of students and staff members</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <Map 
              showGeofence={true}
              geofenceRadius={geofenceRadius}
              centerLocation={geofenceCenter}
              userLocations={sampleUserLocations}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <div className="flex items-center">
                      {activity.status === 'present' ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          <p className="text-sm text-gray-500">
                            {activity.action === 'check-in' 
                              ? `Checked in at ${activity.time}` 
                              : `Checked out at ${activity.time}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-500 mr-1" />
                          <p className="text-sm text-gray-500">Missed attendance</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
