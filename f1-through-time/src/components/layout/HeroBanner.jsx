import banner from "../../assets/images/banner.jpg";

export default function HeroBanner() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,0.6),
            rgba(0,0,0,0.8)
          ),
          url(${banner})
        `
      }}
    >
      <h1>FÓRMULA 1</h1>
      <p>75 anos de velocidade e inovação</p>
    </section>
  );
}