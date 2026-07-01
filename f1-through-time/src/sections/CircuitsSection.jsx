import StoryBlock from "../components/storytelling/StoryBlock";
import WorldCircuitsMap from "../components/visuals/WorldCircuitsMap";
import HistoricCircuits from "../components/visuals/HistoricCircuits";
import CircuitLifetime from "../components/visuals/CircuitLifetime";
import CircuitsBlock from "../components/visuals/CircuitsBlock";

export default function CircuitsSection() {
  return (
    <section id="circuitos">

      <StoryBlock
        title="Uma categoria que conquistou o mundo"
        text="A Fórmula 1 nasceu na Europa, mas sua trajetória rapidamente ultrapassou fronteiras. A cada temporada, novos circuitos surgiram no calendário, conectando diferentes culturas e transformando o campeonato em um dos eventos esportivos mais globais do planeta."
      >
          {(isActive) => (
    <WorldCircuitsMap isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="Alguns circuitos nunca saíram do calendário"
        text="Ao longo de mais de sete décadas, dezenas de pistas receberam etapas da Fórmula 1. Poucas, porém, conseguiram permanecer no calendário por gerações inteiras. Enquanto muitos circuitos apareceram apenas por alguns anos, outros se tornaram símbolos permanentes da categoria, acompanhando praticamente toda a sua história."
      >
          {(isActive) => (
    <HistoricCircuits isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="Quem resistiu ao tempo?"
        text="Mais de uma centena de circuitos já recebeu corridas da Fórmula 1, mas apenas alguns conseguiram atravessar décadas de transformações e permanecer no calendário. Explore os autódromos que continuam escrevendo a história da categoria e aqueles cuja participação ficou restrita a um período específico."
      >
          {(isActive) => (
    <CircuitLifetime isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="Cada circuito conta uma história"
        text="Ao longo de mais de sete décadas, os circuitos da Fórmula 1 testemunharam conquistas históricas, rivalidades inesquecíveis e momentos que definiram gerações de fãs e pilotos. Alguns permaneceram praticamente inalterados desde as primeiras temporadas, tornando-se parte da identidade da categoria. Outros desapareceram, deram lugar a novas pistas ou retornaram após longos períodos de ausência. Mais do que cenários de corrida, esses autódromos representam capítulos da própria história da Fórmula 1, preservando a memória de um esporte em constante transformação."
        > 

        {(isActive) => (
          <CircuitsBlock isActive={isActive} />
        )}
        
        </StoryBlock>
        
    </section>
  );
}