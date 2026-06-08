import useScrollReveal from "../../hooks/useScrollReveal";

export default function StoryBlock({ title, text, children }) {
  const { ref, inView } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`story-block ${inView ? "story-visible" : "story-hidden"}`}
    >
      <div className="story-text">
        <div className="section-marker"></div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

    <div className="story-visual">
      {typeof children === "function"
        ? children(inView)
        : children}
    </div>
    </div>
  );
}



