import StoryBlock from "../components/storytelling/StoryBlock";
import F1Ecosystem from "../components/visuals/F1Ecosystem";
import GlobalStats from "../components/visuals/GlobalStats";
import QualifyingPreview from "../components/visuals/QualifyingPreview";
import PointsSystem from "../components/visuals/PointsSystem";
import QualifyingExample
from "../components/visuals/QualifyingExample";
import TopChampions
from "../components/visuals/TopChampions";
import TopConstructors from "../components/visuals/TopConstructors";

export default function IntroductionSection() {
  return (
    <section id="introducao">

      <StoryBlock
        title="Entendendo a Fórmula 1"
        text="A Fórmula 1 é a categoria máxima do automobilismo mundial. Desde 1950, 
        o campeonato reúne os carros mais rápidos do planeta numa disputa global decidida Grande Prêmio a Grande Prêmio."
      >
        <GlobalStats />
      </StoryBlock>

      <StoryBlock
        title="Os três pilares"
        text="Para compreender esta história de 75 anos, o nosso ponto de partida 
        assenta em três pilares fundamentais: os Pilotos, os Construtores (equipes) e os Circuitos."
      >
       {(isActive) => (
  <F1Ecosystem isActive={isActive} />
)}
      </StoryBlock>

      <StoryBlock
        title="Qualifying: a batalha contra o relógio"
        text="Antes da corrida de domingo, os pilotos enfrentam uma disputa individual contra o cronômetro. 
        A sessão de Qualifying define a ordem de largada do Grande Prêmio e é dividida em três fases eliminatórias: Q1, Q2 e Q3. A cada etapa, 
        os pilotos mais lentos são eliminados, reduzindo gradualmente o grid até restarem apenas os mais rápidos. 
        No final, quem registra a melhor volta conquista a Pole Position — o lugar mais privilegiado na largada."
      >
        {(isActive) => (
  <QualifyingPreview isActive={isActive} />
)}
      </StoryBlock>
      <StoryBlock
  title="Uma sessão real de Qualifying"
  text="A tabela ao lado apresenta os resultados da sessão classificatória mais recente disponível no conjunto de dados:
   o Grande Prêmio do Japão de 2026. Durante o Qualifying, os pilotos disputam voltas rápidas para garantir as melhores posições no grid de largada. 
   O melhor tempo da sessão conquistou a Pole Position, enquanto os demais pilotos foram organizados de acordo com seu desempenho.
 Esses resultados determinam a ordem de largada da corrida de domingo e podem influenciar diretamente as estratégias e as chances de vitória."
>
  <QualifyingExample />
</StoryBlock>

      <StoryBlock
        title="A corrida e a distribuição de pontos"
        text="No domingo acontece o momento mais aguardado do fim de semana: a corrida. Ao longo de dezenas de voltas, os pilotos disputam posições,
         executam estratégias de pit stop e procuram maximizar o desempenho dos carros. Ao final da prova, os pontos são distribuídos aos pilotos mais bem colocados. 
Esses pontos alimentam duas classificações paralelas: o Campeonato de Pilotos e o Campeonato de Construtores, que definirão os campeões da temporada."
      >
        {(isActive) => (
  <PointsSystem isActive={isActive} />
)}
      </StoryBlock>
      <StoryBlock
  title="Os maiores campeões da história"
  text="Ao longo de mais de sete décadas de competição, alguns pilotos conseguiram transformar vitórias em títulos mundiais e marcar seus nomes na história da Fórmula 1. O gráfico apresenta os pilotos que mais vezes conquistaram o Campeonato Mundial."
>
  {(isActive) => (
  <TopChampions isActive={isActive} />
)}
</StoryBlock>
      <StoryBlock
  title="A batalha dos construtores"
  text="Além do Campeonato de Pilotos, a Fórmula 1 também premia os construtores: 
  as equipes responsáveis por projetar, desenvolver e colocar os carros na pista. Ao final de cada temporada, os pontos conquistados pelos pilotos de uma mesma equipe são somados. O ranking ao lado mostra quais construtores 
mais vezes terminaram uma temporada no topo, revelando as equipes que dominaram diferentes eras da categoria."
>
  {(isActive) => (
  <TopConstructors isActive={isActive} />
)}
</StoryBlock>

    </section>
  );
}