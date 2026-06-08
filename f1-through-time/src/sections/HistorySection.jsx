import StoryBlock from "../components/storytelling/StoryBlock";
import CalendarGrowth from "../components/visuals/CalendarGrowth";
import TopCircuits from "../components/visuals/TopCircuits";
import DriverEras from "../components/visuals/DriverEras";
import ConstructorEras from "../components/visuals/ConstructorEras";
import GridVsFinish from "../components/visuals/GridVsFinish";

export default function HistorySection() {
  return (
    <section id="historia">

      <StoryBlock
        title="O crescimento do calendário"
        text="A Fórmula 1 começou em 1950 com um calendário enxuto, composto por poucas etapas concentradas principalmente na Europa. Com o passar das décadas, o número de Grandes Prêmios por temporada cresceu de forma significativa. O gráfico evidencia essa expansão, em que cada barra representa uma temporada e mostra como a categoria deixou de ser um campeonato restrito para se tornar uma competição global, com presença cada vez maior em diferentes continentes."
      >
          {(isActive) => (
    <CalendarGrowth isActive={isActive} />
  )}
      </StoryBlock>


      <StoryBlock
        title="A expansão global dos circuitos"
        text="Alguns circuitos tornaram-se símbolos permanentes da Fórmula 1. Monza, Silverstone e Monaco atravessaram gerações de pilotos e carros, mantendo-se presentes em grande parte da história da categoria. O gráfico destaca os circuitos que mais receberam Grandes Prêmios, revelando quais pistas ajudaram a construir a identidade do campeonato."
      >
          {(isActive) => (
    <TopCircuits isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="As eras dos grandes pilotos"
        text="A história da Fórmula 1 pode ser lida como uma sucessão de eras. Em algumas décadas, poucos pilotos concentraram grande parte dos títulos, criando períodos de domínio muito marcantes. O gráfico organiza os campeões por década e permite observar como nomes como Fangio, Senna, Schumacher, Vettel, Hamilton e Verstappen representam diferentes momentos da competição."
      >
         {(isActive) => (
    <DriverEras isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="As equipes que moldaram cada era"
        text="Por trás de cada campeão existe também uma estrutura técnica. Os construtores projetam os carros, desenvolvem soluções aerodinâmicas, definem estratégias e sustentam o desempenho ao longo da temporada. O gráfico mostra quais equipes conquistaram mais títulos em cada década, revelando como o domínio técnico mudou de mãos entre Ferrari, McLaren, Williams, Mercedes, Red Bull e outras forças históricas."
      >
         {(isActive) => (
    <ConstructorEras isActive={isActive} />
  )}
      </StoryBlock>

      <StoryBlock
        title="Largar na frente nem sempre é vencer"
        text="A classificação define o grid de largada, mas a corrida raramente é uma simples confirmação dessa ordem inicial. Estratégias de pit stop, ultrapassagens, abandonos, punições e condições de pista podem alterar completamente o resultado final. No gráfico, cada ponto compara a posição de largada com a posição de chegada, onde quanto mais distante da diagonal, maior foi a mudança de posição durante a prova."
      >
          {(isActive) => (
    <GridVsFinish isActive={isActive} />
  )}
      </StoryBlock>

    </section>
  );
}