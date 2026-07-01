import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { gsap } from "gsap";
import "./testimonials-ui.css";

function splitContent(text, html, animationType) {
  if (html) {
    return { __html: html };
  }

  const raw = typeof text === "string" ? text : "";
  if (animationType === "words") {
    return raw
      .split(/(\s+)/)
      .map((part, index) =>
        /\s+/.test(part) ? (
          part
        ) : (
          <span className="blur-text__word" key={`${part}-${index}`}>
            {part}
          </span>
        )
      );
  }

  return raw.split("").map((char, index) => (
    <span className="blur-text__char" key={`${char}-${index}`}>
      {char}
    </span>
  ));
}

const BlurTextReveal = forwardRef(function BlurTextReveal(
  {
    as: Tag = "div",
    text = "",
    html = "",
    className = "",
    animationType = "chars",
    stagger = 0.05,
    once = true,
  },
  ref
) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useImperativeHandle(ref, () => rootRef.current);

  const content = useMemo(() => splitContent(text, html, animationType), [text, html, animationType]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || hasAnimatedRef.current) return;

    const items = root.querySelectorAll(".blur-text__char, .blur-text__word");
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 18, filter: "blur(10px)" });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          timelineRef.current?.kill();
          timelineRef.current = gsap.to(items, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            stagger,
          });

          if (once) {
            hasAnimatedRef.current = true;
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    io.observe(root);

    return () => {
      io.disconnect();
      timelineRef.current?.kill();
    };
  }, [stagger, once, text, html, animationType]);

  return (
    <Tag ref={rootRef} className={`blur-text-reveal ${className}`.trim()}>
      {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : content}
    </Tag>
  );
});

export default BlurTextReveal;
