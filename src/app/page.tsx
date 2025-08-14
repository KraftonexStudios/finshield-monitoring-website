import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Activity, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fraud Detection System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced behavioral analytics and real-time monitoring for banking security
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                User Registration
              </CardTitle>
              <CardDescription>
                Register new users with their basic information and banking details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button className="w-full">
                  Register New User
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-green-600" />
                Behavioral Monitoring
              </CardTitle>
              <CardDescription>
                Monitor real-time user behavioral profiles and risk assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/monitoring">
                <Button className="w-full" variant="outline">
                  View Monitoring Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 space-y-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                System Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Real-time Analytics</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Live behavioral pattern analysis
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced fraud detection algorithms
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Firebase Integration</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Cloud-based data storage and sync
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Testing & Demo</CardTitle>
              <CardDescription className="text-center">
                Create sample data for testing the monitoring dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                  <Link href="/create-profile">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Create Sample Profile
                    </Button>
                  </Link>
                  <Link href="/sessions">
                    <Button variant="outline" className="w-full">
                      View Behavioral Sessions
                    </Button>
                  </Link>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
