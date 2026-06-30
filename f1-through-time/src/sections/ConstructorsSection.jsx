import StoryBlock from "../components/storytelling/StoryBlock";
import ConstructorRanking from "../components/visuals/ConstructorRanking";
import ConstructorDynasties from "../components/visuals/ConstructorDynasties";
import ConstructorNationalities from "../components/visuals/ConstructorNationalities";
import TeamEvolution from "../components/visuals/TeamEvolution";
import DriverConstructorNetwork from "../components/visuals/DriverConstructorNetwork";

export default function ConstructorsSection() {
  return (
    <section id="construtores">

    <StoryBlock
      title="As equipes mais vitoriosas da história"
      text="
      Algumas equipes conseguiram transformar décadas de participação em um legado duradouro. O gráfico apresenta os construtores com maior número de vitórias na Fórmula 1, revelando quais organizações dominaram diferentes períodos da categoria e construíram as bases de seu sucesso esportivo.
      "
    >
      {(isActive) => (
        <ConstructorRanking isActive={isActive} />
      )}
    </StoryBlock>

    <StoryBlock
    title="A linha do tempo das dinastias"
    text="
    Embora algumas equipes acumulem muitos títulos ao longo da história, seus períodos de domínio ocorreram em momentos distintos. Cada ponto representa uma temporada em que um construtor conquistou o campeonato mundial, revelando a sucessão de dinastias que moldaram a Fórmula 1 ao longo das décadas.
    "
  >
    {(isActive) => (
      <ConstructorDynasties
        isActive={isActive}
      />
    )}
  </StoryBlock>

  <StoryBlock
    title="O berço das equipes da Fórmula 1"
    text="
    Embora o campeonato seja mundial, a origem das equipes
    está longe de ser distribuída de forma uniforme.
    Alguns países concentraram boa parte das escuderias
    que participaram da categoria ao longo das décadas,
    com destaque para o Reino Unido, Estados Unidos e a Itália.
    "
  >
    {(isActive) => (
      <ConstructorNationalities isActive={isActive} />
    )}
  </StoryBlock>

  <StoryBlock
    title="As equipes mudam, a história continua"
  text="A Fórmula 1 está em constante transformação. Enquanto algumas escuderias, como Ferrari e McLaren, preservam sua identidade desde a fundação, muitas outras sobreviveram por meio de mudanças de nome, proprietários ou fabricantes. Por trás das equipes atuais existem décadas de evolução, mostrando que, na Fórmula 1, desaparecer nem sempre significa chegar ao fim da linha."
  >
    {(isActive) => (
      <TeamEvolution isActive={isActive} />
    )}
  </StoryBlock>

  {/* <StoryBlock
    title="As parcerias que construíram campeões"
    text="Por trás de cada título existe uma parceria entre piloto e equipe. Algumas dessas conexões se tornaram inseparáveis da história da Fórmula 1: Schumacher e Ferrari, Hamilton e Mercedes, Vettel e Red Bull. A rede abaixo mostra como os maiores campeões da categoria se conectam às equipes que os levaram ao topo, revelando quais construtoras foram responsáveis por moldar diferentes gerações de vencedores."
  >
    {(isActive) => (
      <DriverConstructorNetwork isActive={isActive} />
    )}
  </StoryBlock> */}

    </section>
  );
}