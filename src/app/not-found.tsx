import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <FileQuestion className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
          <p className="text-gray-500">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <Link href="/">
            <Button className="mt-4">Go home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
