"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Activity, Clock, Smartphone, Wifi } from "lucide-react";
import Link from "next/link";
import { subscribeToAllBehavioralSessions, addBehavioralSession } from "@/services/firebase";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { BehavioralSession } from "../../../data-testing";

export default function SessionsPage() {
  const { behavioralSessions, setBehavioralSessions, addBehavioralSession: addSessionToStore } = useStore();
  const [userId, setUserId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAllBehavioralSessions((sessions) => {
      setBehavioralSessions(sessions as BehavioralSession[]);
    });

    return () => unsubscribe();
  }, [setBehavioralSessions]);

  const createSampleSession = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    setIsCreating(true);
    try {
      const sampleSession: BehavioralSession = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId.trim(),
        timestamp: Date.now(),
        touchPatterns: [
          {
            gestureType: "tap",
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            pressure: 0.6 + Math.random() * 0.3,
            touchArea: 15 + Math.random() * 10,
            coordinates: [
              { x: 150 + Math.random() * 50, y: 300 + Math.random() * 50, timestamp: Date.now() - 500 }
            ],
            velocity: 0,
            acceleration: 0,
            hesitationCount: Math.floor(Math.random() * 3),
            isRapidTouch: Math.random() > 0.8
          },
          {
            gestureType: "swipe",
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1500,
            pressure: 0.5 + Math.random() * 0.4,
            touchArea: 20 + Math.random() * 15,
            coordinates: [
              { x: 100, y: 400, timestamp: Date.now() - 2000 },
              { x: 200, y: 400, timestamp: Date.now() - 1800 },
              { x: 300, y: 400, timestamp: Date.now() - 1500 }
            ],
            velocity: 150 + Math.random() * 100,
            acceleration: 50 + Math.random() * 30,
            hesitationCount: 0,
            isRapidTouch: false
          }
        ],
        typingPatterns: [
          {
            inputType: "password",
            keystrokes: [
              {
                key: "p",
                dwellTime: 120 + Math.random() * 50,
                flightTime: 80 + Math.random() * 40,
                pressure: 0.7 + Math.random() * 0.2,
                touchArea: 18 + Math.random() * 8,
                timestamp: Date.now() - 3000,
                isCorrection: false
              }
            ],
            typingSpeed: 2.5 + Math.random() * 1.5,
            accuracy: 0.85 + Math.random() * 0.1,
            errorRate: Math.random() * 0.1,
            correctionSpeed: 1.2 + Math.random() * 0.8,
            autocorrectUsed: Math.random() > 0.7,
            predictiveTextUsed: Math.random() > 0.6,
            longPauseCount: Math.floor(Math.random() * 3)
          }
        ],
        loginBehavior: {
          loginTime: Date.now(),
          sessionDuration: 300 + Math.random() * 600,
          sessionDepth: 5 + Math.floor(Math.random() * 10),
          authMethod: Math.random() > 0.5 ? "biometric" : "password",
          authAttempts: 1 + Math.floor(Math.random() * 2),
          authSuccess: Math.random() > 0.1,
          fallbackUsed: Math.random() > 0.8,
          biometricType: "fingerprint",
          biometricSuccess: Math.random() > 0.05,
          idleTime: Math.random() * 60
        },
        locationBehavior: {
          coordinates: {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            accuracy: 5 + Math.random() * 15
          },
          city: "New York",
          country: "USA",
          isVpnUsed: Math.random() > 0.9,
          travelDistance: Math.random() * 50,
          isHighRiskLocation: Math.random() > 0.95,
          locationSpoofingDetected: Math.random() > 0.98
        },
        networkBehavior: {
          networkType: Math.random() > 0.7 ? "wifi" : "cellular",
          networkName: "Home_WiFi_" + Math.floor(Math.random() * 100),
          bandwidth: 50 + Math.random() * 100,
          latency: 20 + Math.random() * 80,
          packetLoss: Math.random() * 0.05,
          isPublicNetwork: Math.random() > 0.8,
          isVpnUsed: Math.random() > 0.9,
          isSecureConnection: Math.random() > 0.1
        },
        deviceBehavior: {
          deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
          deviceModel: "iPhone 14",
          osVersion: "iOS 17.1",
          appVersion: "1.2.3",
          batteryLevel: 20 + Math.random() * 80,
          isCharging: Math.random() > 0.7,
          orientation: Math.random() > 0.8 ? "landscape" : "portrait",
          screenBrightness: 0.3 + Math.random() * 0.7,
          appUsagePatterns: {
            "Banking": 1800 + Math.random() * 600,
            "Social": 3600 + Math.random() * 1800
          },
          deviceMotion: {
            accelerometer: {
              x: (Math.random() - 0.5) * 2,
              y: (Math.random() - 0.5) * 2,
              z: (Math.random() - 0.5) * 2
            },
            gyroscope: {
              x: (Math.random() - 0.5) * 0.5,
              y: (Math.random() - 0.5) * 0.5,
              z: (Math.random() - 0.5) * 0.5
            },
            magnetometer: {
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              z: (Math.random() - 0.5) * 100
            }
          },
          isRooted: Math.random() > 0.95,
          isDebuggingEnabled: Math.random() > 0.98,
          hasUnknownApps: Math.random() > 0.9,
          screenRecordingDetected: Math.random() > 0.99,
          keyloggerDetected: Math.random() > 0.99
        }
      };

      const newSession = await addBehavioralSession(sampleSession);
      addSessionToStore(newSession as BehavioralSession);
      toast.success("Sample behavioral session created successfully!");
      setUserId("");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-purple-600" />
                Behavioral Sessions
              </CardTitle>
              <CardDescription>
                Real-time behavioral session data from mobile devices
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Create Sample Session */}
          <Card>
            <CardHeader>
              <CardTitle>Create Sample Session</CardTitle>
              <CardDescription>
                Generate a sample behavioral session for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                </div>
                <Button onClick={createSampleSession} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions ({behavioralSessions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {behavioralSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No behavioral sessions found</p>
                  <p className="text-sm">Create a sample session to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {behavioralSessions.map((session, index) => (
                    <div key={session.sessionId || index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Session: {session.sessionId}</h3>
                          <p className="text-sm text-gray-600">User: {session.userId}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(session.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          <span>Touch: {session.touchPatterns?.length || 0} gestures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span>Typing: {session.typingPatterns?.length || 0} patterns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-purple-500" />
                          <span>Network: {session.networkBehavior?.networkType || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>Duration: {Math.round((session.loginBehavior?.sessionDuration || 0) / 60)}m</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          session.deviceBehavior?.isRooted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {session.deviceBehavior?.isRooted ? 'Rooted Device' : 'Secure Device'}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          session.locationBehavior?.isVpnUsed ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.locationBehavior?.isVpnUsed ? 'VPN Used' : 'Direct Connection'}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          session.loginBehavior?.authSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {session.loginBehavior?.authSuccess ? 'Auth Success' : 'Auth Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}