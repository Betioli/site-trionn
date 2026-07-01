import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./testimonials-ui.css";

export default function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
  y = 24,
  duration = 0.7,
  once = true,
  start = "top 85%",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const animateIn = () => {
      gsap.fromTo(
        node,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          delay,
          duration,
          ease: "power3.out",
        }
      );
    };

    if (!("IntersectionObserver" in window)) {
      animateIn();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateIn();
          if (once) observer.disconnect();
        });
      },
      { threshold: 0.15, rootMargin: start === "top 100%" ? "0px 0px 100px 0px" : "0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [delay, duration, once, y, start]);

  return (
    <div ref={ref} className={`fade-in-on-scroll ${className}`.trim()}>
      {children}
    </div>
  );
}
