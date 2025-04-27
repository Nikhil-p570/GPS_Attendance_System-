
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, BookOpen, Mail, Phone, Video, Link } from 'lucide-react';

const Help = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="mr-2">
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Find answers to common questions and get support
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
              <BookOpen className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Documentation</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
              <Video className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Video Tutorials</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
              <Mail className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Email Support</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
              <Phone className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Phone Support</span>
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the GPS attendance tracking work?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Our GPS attendance tracking system uses the geolocation feature on a user's device to determine if they are within the designated geofence area. When a user enters the geofence, they are automatically marked as present. The system continuously monitors their location while they are logged in, and if they leave the geofence area, their status can be updated accordingly.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What is a geofence and how do I set it up?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    A geofence is a virtual geographic boundary that defines an area for attendance tracking. To set up a geofence, go to the GPS Tracking section in the admin dashboard, where you can define the center point of your geofence by dropping a pin on the map, and adjust the radius to cover your desired area. You can create multiple geofences for different locations.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I manually override attendance records?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes, administrators have the ability to manually override attendance records. In the Attendance Records section, you can find the record you wish to modify, and use the toggle or edit button to change a student's attendance status. This is useful for exceptional cases where the automated system might not have worked correctly, or for students with approved absences.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How can I export attendance reports?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    You can export attendance reports in various formats from the Reports section of the admin dashboard. Select the date range and type of report you want to generate, and then click on either "Export as CSV" or "Export as PDF" button. These reports can be used for record-keeping, analysis, or sharing with other stakeholders.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What should students do if their location isn't being detected?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    If students are having trouble with location detection, they should:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Ensure location services are enabled on their device</li>
                      <li>Check that they have granted the app permission to access their location</li>
                      <li>Make sure they have a stable internet connection</li>
                      <li>Try refreshing the page or restarting the app</li>
                      <li>If the problem persists, they should contact an administrator for manual attendance marking</li>
                    </ul>
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <Link className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">User Manual</span>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <Link className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">API Documentation</span>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <Link className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">Troubleshooting Guide</span>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <Link className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">Privacy Policy</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Contact Support</h3>
            <p className="text-muted-foreground mb-4">
              Still need help? Our support team is available to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
