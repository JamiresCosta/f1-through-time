import { useInView } from "react-intersection-observer";

export default function useScrollReveal() {
  const { ref, inView } = useInView({
    threshold: 0.35,
    triggerOnce: false,
  });

  return { ref, inView };
}