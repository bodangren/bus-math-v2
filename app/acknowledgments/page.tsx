import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users } from 'lucide-react';

export default function AcknowledgmentsPage() {
  const sections = [
    {
      icon: Heart,
      iconColor: 'text-red-500',
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
      iconColor: 'text-primary',
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
      <section className="hero-gradient relative overflow-hidden py-20 md:py-28 border-b border-white/[0.08]">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 text-center max-w-3xl space-y-6">
          <span className="section-label section-label-light">Acknowledgments</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 leading-tight">
            The people who made this possible
          </h1>
          <p className="text-lg text-white/70 font-body max-w-xl mx-auto">
            This course represents the collaboration and support of many individuals and organizations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 bg-background ledger-bg">
        <div className="container mx-auto px-4 max-w-5xl space-y-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="card-workbook">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${section.iconColor}`} /> {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.heading}>
                      <h3 className="font-semibold mb-2 text-foreground">{item.heading}</h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Platform Section */}
          <Card className="card-workbook">
            <CardHeader>
              <CardTitle>About the Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-forest-dark relative overflow-hidden">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Ready to start building?
          </h2>
          <p className="text-white/70 font-body text-lg">
            Log in to access lessons, datasets, and your personal workbook progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-white font-body font-semibold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              style={{ color: "oklch(0.22 0.05 157)" }}
            >
              Student or teacher login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-transparent border text-white font-body hover:bg-white/10 hover:border-white/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
              style={{ borderColor: "oklch(1 0 0 / 0.25)" }}
            >
              Back to home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 text-sm text-white/60 font-body">
            <Link href="/preface" className="hover:text-white/90 transition-colors">Preface</Link>
            <span>&middot;</span>
            <Link href="/curriculum" className="hover:text-white/90 transition-colors">Curriculum</Link>
            <span>&middot;</span>
            <Link href="/capstone" className="hover:text-white/90 transition-colors">Capstone</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
