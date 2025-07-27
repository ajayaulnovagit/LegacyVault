import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Bell, Server, Lock, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">SecureEstate</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Your Digital Legacy
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Protect your assets and ensure your loved ones have access to your digital estate when they need it most. 
            A comprehensive platform for managing your financial legacy with peace of mind.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure Asset Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Store and organize all your financial assets - bank accounts, properties, investments, 
                and crypto holdings - in one secure location.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Well-being Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Customizable check-in system ensures your well-being is monitored, with automatic 
                alerts to family members if needed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Designate trusted family members and friends who will receive your asset information 
                in case of emergency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Multiple Storage Options</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose where to store your data - Google Drive, DigiLocker, or local server - 
                based on your security preferences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent alert system with escalation ensures timely notifications while 
                respecting your privacy and schedule.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Cross-Platform Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access your digital estate from any device - web, Android, or iOS - with responsive 
                design and mobile-friendly interface.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Secure Your Legacy?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of families who trust SecureEstate with their digital legacy management.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            Start Your Digital Estate Plan
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 SecureEstate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
