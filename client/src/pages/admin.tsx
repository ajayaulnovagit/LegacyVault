import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle, Bell, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Simple admin check
  useEffect(() => {
    if (user && user.email !== 'admin@secureestate.com') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const getStatusBadge = (user: any) => {
    if (user.alertCount === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-2 h-2 mr-1" />
          Active
        </Badge>
      );
    } else if (user.alertCount < user.maxAlerts) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <AlertTriangle className="w-2 h-2 mr-1" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <Bell className="w-2 h-2 mr-1" />
          Critical
        </Badge>
      );
    }
  };

  const formatLastCheckIn = (lastCheckIn: string) => {
    const date = new Date(lastCheckIn);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Less than 1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Simple role check
  if (user && user.email !== 'admin@secureestate.com') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Total Users: {stats?.totalUsers || 0}
          </span>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              {stats?.activeUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Pending Alerts</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mt-2">
              {stats?.pendingAlerts || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Critical Alerts</span>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-2">
              {stats?.criticalAlerts || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">New Signups</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              {stats?.newSignups || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-700">User</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Last Check-in</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Alert Count</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Frequency</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {user.firstName?.[0] || user.email?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email
                              }
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        {getStatusBadge(user)}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {user.lastCheckIn ? formatLastCheckIn(user.lastCheckIn) : 'Never'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {user.alertCount}/{user.maxAlerts}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {user.wellbeingFrequency}h
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
