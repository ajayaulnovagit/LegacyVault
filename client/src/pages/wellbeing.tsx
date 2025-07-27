import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Settings, Bell, Clock } from "lucide-react";

export default function Wellbeing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [frequency, setFrequency] = useState(user?.wellbeingFrequency?.toString() || "24");
  const [maxAlerts, setMaxAlerts] = useState(user?.maxAlerts?.toString() || "3");

  const confirmWellbeingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wellbeing/confirm");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Well-being Confirmed",
        description: "Your check-in has been recorded and alert counter reset.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm well-being",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { wellbeingFrequency: number; maxAlerts: number }) => {
      await apiRequest("PUT", "/api/wellbeing/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Settings Updated",
        description: "Your well-being settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      wellbeingFrequency: parseInt(frequency),
      maxAlerts: parseInt(maxAlerts),
    });
  };

  const getNextCheckIn = () => {
    if (!user?.lastCheckIn || !user?.wellbeingFrequency) return "Unknown";
    
    const lastCheckIn = new Date(user.lastCheckIn);
    const nextCheckIn = new Date(lastCheckIn.getTime() + (user.wellbeingFrequency * 60 * 60 * 1000));
    const now = new Date();
    
    if (nextCheckIn <= now) {
      return "Overdue";
    }
    
    const hoursUntil = Math.ceil((nextCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60));
    return `${hoursUntil} hours`;
  };

  const getStatusColor = () => {
    if (!user) return "text-gray-500";
    
    if (user.alertCounter === 0) return "text-green-600";
    if (user.alertCounter < user.maxAlerts) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusText = () => {
    if (!user) return "Unknown";
    
    if (user.alertCounter === 0) return "Active";
    if (user.alertCounter < user.maxAlerts) return "Pending";
    return "Critical";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Heart className="h-8 w-8 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Well-being Monitoring</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Status */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  <p className="text-sm text-gray-600">Current Status</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {user?.alertCounter || 0} / {user?.maxAlerts || 3}
                  </div>
                  <p className="text-sm text-gray-600">Alerts Sent</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {getNextCheckIn()}
                  </div>
                  <p className="text-sm text-gray-600">Next Check-in</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Confirm Your Well-being</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click to reset your alert counter and confirm you're okay
                    </p>
                  </div>
                  <Button 
                    onClick={() => confirmWellbeingMutation.mutate()}
                    disabled={confirmWellbeingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    I'm Okay
                  </Button>
                </div>
              </div>

              {user?.lastCheckIn && (
                <div className="mt-4 text-sm text-gray-600">
                  Last check-in: {new Date(user.lastCheckIn).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Well-being Monitoring Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Regular Check-ins</h4>
                    <p className="text-sm text-gray-600">
                      You'll receive check-in reminders at your chosen frequency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Alert Escalation</h4>
                    <p className="text-sm text-gray-600">
                      If you miss check-ins, alerts are sent to your emergency contacts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Emergency Notification</h4>
                    <p className="text-sm text-gray-600">
                      After maximum alerts, your asset information is shared with nominees.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Check-in Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Every 24 hours</SelectItem>
                      <SelectItem value="48">Every 2 days</SelectItem>
                      <SelectItem value="72">Every 3 days</SelectItem>
                      <SelectItem value="168">Every week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxAlerts">Maximum Alerts</Label>
                  <Select value={maxAlerts} onValueChange={setMaxAlerts}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 alert</SelectItem>
                      <SelectItem value="2">2 alerts</SelectItem>
                      <SelectItem value="3">3 alerts</SelectItem>
                      <SelectItem value="5">5 alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account created:</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total check-ins:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Missed check-ins:</span>
                  <span className="font-medium">{user?.alertCounter || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
