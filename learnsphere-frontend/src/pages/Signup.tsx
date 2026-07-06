
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSignupForm from '@/components/auth/AdminSignupForm';
import CandidateSignupForm from '@/components/auth/CandidateSignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from '@/components/auth/SignupForm';

const Signup: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("admin");

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} />;
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Join LearnSphere to start creating or taking quizzes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin">New Organization</TabsTrigger>
            <TabsTrigger value="candidate">Join as Student</TabsTrigger>
          </TabsList>
          <TabsContent value="admin">
            <SignupForm />
          </TabsContent>
          <TabsContent value="candidate">
            <CandidateSignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Signup;
