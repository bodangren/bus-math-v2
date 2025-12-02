import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, Users } from 'lucide-react';

export default function AcknowledgmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center space-y-4">
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              <BookOpen className="inline-block mr-2 h-4 w-4" /> Acknowledgments
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Acknowledgments</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This course represents the collaboration and support of many individuals and organizations.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10 max-w-4xl">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Special Thanks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Educational Partners</h3>
                <p className="text-sm text-muted-foreground">
                  We are grateful to the educators, curriculum specialists, and industry professionals
                  who provided feedback and insights during the development of this course.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Student Contributors</h3>
                <p className="text-sm text-muted-foreground">
                  This course has been shaped by feedback from students who piloted early versions
                  of the curriculum. Your input helped us create more engaging and effective learning experiences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Reviewers</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you to the accounting and finance professionals who reviewed the technical
                  accuracy of the course materials and provided real-world context.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Course Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Curriculum Design</h3>
                <p className="text-sm text-muted-foreground">
                  This course follows a project-based learning approach that emphasizes authentic
                  business scenarios and practical Excel skills. The curriculum is designed to meet
                  both educational standards and real-world business needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technology & Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Built with modern web technologies to provide an interactive, accessible learning
                  experience that works across devices and supports diverse learning styles.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This digital textbook platform was developed to provide an engaging, interactive
                learning experience for business mathematics and accounting. The platform features
                interactive exercises, real-time feedback, and progress tracking to support student
                success.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 2.0 represents a complete rewrite using modern web technologies including
                Next.js, Supabase, and React, with enhanced accessibility features and improved
                performance.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 text-center">
          <p className="text-muted-foreground">Continue exploring</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/preface" className="underline">Read the Preface</Link>
            <span>•</span>
            <Link href="/curriculum" className="underline">View Curriculum</Link>
            <span>•</span>
            <Link href="/" className="underline">Back to Home</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
