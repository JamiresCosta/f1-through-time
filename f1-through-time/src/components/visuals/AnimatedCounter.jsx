import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function AnimatedCounter({ value }) {

  const [count, setCount] = useState(0);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {

    if (!inView) return;

    let start = 0;

    const duration = 1500;

    const increment = value / (duration / 16);

    const timer = setInterval(() => {

      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }

    }, 16);

    return () => clearInterval(timer);

  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
    </span>
  );
}