"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#10b981",
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-20 mx-auto px-4">
      <div className="text-center space-y-4 mb-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line max-w-xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center gap-3 mb-10">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label htmlFor="pricing-billing-toggle">
            <Switch
              id="pricing-billing-toggle"
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="font-semibold text-sm text-foreground">
          Annual billing <span className="text-emerald-500">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-3xl border p-6 bg-card text-center relative flex flex-col justify-between`,
              plan.isPopular ? "border-emerald-500 shadow-lg" : "border-border",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform"
                : "z-10"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-emerald-500 py-1 px-3.5 rounded-bl-2xl rounded-tr-3xl flex items-center shadow-sm">
                <Star className="text-background h-4.5 w-4.5 fill-current" />
                <span className="text-background ml-1 text-xs font-bold uppercase tracking-wider">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight text-foreground">
                    ₹
                    <NumberFlow
                      value={
                        isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                      }
                      format={{
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-muted-foreground mt-1">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="mt-8 gap-3 flex flex-col text-xs font-medium text-muted-foreground">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4.5 w-4.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-left text-foreground/80 leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <hr className="w-full my-6 border-border/60" />

                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-sm font-bold tracking-normal py-5",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 hover:bg-emerald-500 hover:text-white",
                    plan.isPopular
                      ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700"
                      : "bg-background text-foreground"
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
