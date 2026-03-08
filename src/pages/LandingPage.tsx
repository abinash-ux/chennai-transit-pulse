import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, CreditCard, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { AnimatedBus } from '@/components/AnimatedBus';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import chennaiSkyline from '@/assets/chennai-skyline.png';

const features = [
  { icon: MapPin, title: 'Live Tracking', description: 'Real-time GPS tracking of all MTC buses' },
  { icon: Users, title: 'AI Routing', description: 'Smart rerouting based on passenger demand' },
  { icon: CreditCard, title: 'Digital Payments', description: 'Seamless wallet & QR ticket system' },
  { icon: Shield, title: 'Safety First', description: 'Emergency SOS & incident reporting' },
];

const stats = [
  { value: 3500, suffix: '+', label: 'Buses Monitored' },
  { value: 850, suffix: '', label: 'Routes Covered' },
  { value: 5, suffix: 'M+', label: 'Daily Passengers' },
  { value: 99.9, suffix: '%', label: 'System Uptime' },
];

export default function LandingPage() {
  const [authTab, setAuthTab] = useState('login');

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={chennaiSkyline} 
          alt="Chennai Skyline" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Animated Bus */}
      <AnimatedBus />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2 rounded-xl bg-primary/20 glow">
                <Bus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold gradient-text">
                  Smart Chennai
                </h1>
                <p className="text-xs text-muted-foreground">AI Transport System</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
                <span className="h-2 w-2 rounded-full bg-success pulse-live" />
                System Online
              </span>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">Powered by AI</span>
                </motion.div>

                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-foreground">Chennai's</span>
                  <br />
                  <span className="gradient-text glow-text">Intelligent</span>
                  <br />
                  <span className="text-foreground">Transit Hub</span>
                </h2>

                <p className="text-lg text-muted-foreground max-w-lg">
                  Experience the future of public transport with real-time tracking, 
                  AI-powered routing, and seamless digital payments across Chennai's MTC network.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="glass-panel p-4 text-center"
                  >
                    <div className="text-2xl font-display font-bold text-primary">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Auth Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-8 max-w-md mx-auto w-full"
            >
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl font-bold gradient-text mb-2">
                  Access Control Center
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sign in to manage Chennai's transport network
                </p>
              </div>

              <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Register
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-6">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="signup" className="mt-6">
                  <SignupForm />
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  By accessing, you agree to Chennai MTC's terms of service
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 Chennai Metropolitan Transport Corporation</p>
            <div className="flex items-center gap-1">
              <span>Government of Tamil Nadu</span>
              <ChevronRight className="h-4 w-4" />
              <span>Smart City Initiative</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
