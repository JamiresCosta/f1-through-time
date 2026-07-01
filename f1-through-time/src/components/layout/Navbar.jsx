import { useEffect, useState } from "react";

const sections = [
  "introducao",
  "historia",
  "pilotos",
  "construtores",
  "circuitos",
  "moderna",
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("introducao");

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + 150;

      sections.forEach((id) => {
        const section = document.getElementById(id);

        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(id);
        }
      });
    }

    window.addEventListener("scroll", handleScroll);

    handleScroll(); // inicializa

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">F1</div>
      <a
        key="introducao"
        href="#introducao"
        className={activeSection === "introducao" ? "active" : ""}
      >
        Introdução
      </a>

      <a
        key="historia"
        href="#historia"
        className={activeSection === "historia" ? "active" : ""}
      >
        História
      </a>

      <a
        key="pilotos"
        href="#pilotos"
        className={activeSection === "pilotos" ? "active" : ""}
      >
        Pilotos
      </a>

      <a
        key={"construtores"}
        href="#construtores"
        className={activeSection === "construtores" ? "active" : ""}
      >
        Construtores
      </a>

      <a
        key={"circuitos"}
        href="#circuitos"
        className={activeSection === "circuitos" ? "active" : ""}
      >
        Circuitos
      </a>

      <a
        key="moderna"
        href="#moderna"
        className={activeSection === "moderna" ? "active" : ""}
      >
        Era Moderna
      </a>
    </nav>
  );
}
