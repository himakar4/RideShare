import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import MainLayout from '../components/layout/MainLayout';

const NotFound = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
              <p className="text-muted-foreground mb-8">
                The page you are looking for doesn't exist or has been moved.
              </p>
              <Button asChild>
                <Link to="/">Go Back Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound; 