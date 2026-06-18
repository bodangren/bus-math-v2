import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcknowledgmentsPage() {
  const sections = [
    {
      icon: Heart,
      iconColor: 'text-foreground',
      title: 'Special Thanks',
      content: [
        {
          heading: 'Educational Partners',
          text: 'We are grateful to the educators, curriculum specialists, and industry professionals who provided feedback and insights during the development of this course.'
        },
        {
          heading: 'Student Contributors',
          text: 'This course has been shaped by feedback from students who piloted early versions of the curriculum. Your input helped us create more engaging and effective learning experiences.'
        },
        {
          heading: 'Technical Reviewers',
          text: 'Thank you to the accounting and finance professionals who reviewed the technical accuracy of the course materials and provided real-world context.'
        }
      ]
    },
    {
      icon: Users,
      iconColor: 'text-foreground',
      title: 'Course Development',
      content: [
        {
          heading: 'Curriculum Design',
          text: 'This course follows a project-based learning approach that emphasizes authentic business scenarios and practical Excel skills. The curriculum is designed to meet both educational standards and real-world business needs.'
        },
        {
          heading: 'Technology & Innovation',
          text: 'Built with modern web technologies to provide an interactive, accessible learning experience that works across devices and supports diverse learning styles.'
        }
      ]
    }
  ];

  return (
    <main className="flex-1 bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
        <div className="relative container mx-auto px-4 max-w-4xl space-y-6">
          <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            Acknowledgments
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 leading-tight tracking-tight">
            The people who made this possible
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl leading-relaxed">
            This course represents the collaboration and support of many individuals and organizations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-background border border-border">
                <div className="px-6 py-4 border-b border-border bg-secondary/30">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-foreground">
                    <Icon className="h-3.5 w-3.5" /> {section.title}
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {section.content.map((item) => (
                    <div key={item.heading} className="space-y-2">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{item.heading}</h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-2xl">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Platform Section */}
          <div className="bg-secondary/10 border border-border p-8">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">About the Platform</h2>
            <div className="space-y-4 max-w-2xl">
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                This digital textbook platform was developed to provide an engaging, interactive
                learning experience for business mathematics and accounting. The platform features
                interactive exercises, real-time feedback, and progress tracking to support student
                success.
              </p>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Version 2.0 represents a complete rewrite using modern web technologies including
                Vinext, Convex, and React, with enhanced accessibility features and improved
                performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Ready to start building?
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Log in to access lessons, datasets, and your personal workbook progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/auth/login">
                Student or teacher login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/">
                Back to home
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-12 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <Link href="/preface" className="hover:text-foreground transition-colors">Preface</Link>
            <Link href="/curriculum" className="hover:text-foreground transition-colors">Curriculum</Link>
            <Link href="/capstone" className="hover:text-foreground transition-colors">Capstone</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
