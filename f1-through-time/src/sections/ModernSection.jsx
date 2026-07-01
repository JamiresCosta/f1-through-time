import StoryBlock from "../components/storytelling/StoryBlock";
import CalendarExpansion from "../components/visuals/CalendarExpansion";
import AerodynamicsEvolution from "../components/visuals/AerodynamicsEvolution";
import DRSAnimation from "../components/visuals/DRSAnimation";
import HaloBlock from "../components/visuals/HaloBlock";
import SteeringWheelBlock from "../components/visuals/SteeringWheelBlock";  
import DataExplosionBlock from "../components/visuals/DataExplosionBlock";
import CarEvolutionBlock from "../components/visuals/CarEvolutionBlock";
import PitStopBlock from "../components/visuals/PitStopBlock";

export default function ModernSection() {
  return (
    <section id="moderna">

      <StoryBlock
        title="Muito além de sete corridas"
        text="Em 1950, a temporada inaugural da Fórmula 1 possuía apenas sete etapas. As equipes percorriam um calendário curto, com poucos países participantes e uma logística relativamente simples. Setenta anos depois, o campeonato praticamente triplicou de tamanho, atravessando continentes e tornando-se um espetáculo global que exige uma operação logística sem precedentes no automobilismo."
      >
      {(isActive) => (<CalendarExpansion isActive={isActive} />)}
      </StoryBlock>

      <StoryBlock
        title="A evolução da aerodinâmica"
        text="Ao longo das décadas, a Fórmula 1 passou por uma evolução tecnológica impressionante. Um dos aspectos mais notáveis dessa transformação é a aerodinâmica dos carros. Desde os primeiros modelos com linhas simples até os complexos designs atuais, a aerodinâmica desempenha um papel crucial no desempenho e na eficiência dos veículos. Cada curva, cada asa e cada detalhe do carro é meticulosamente projetado para maximizar a velocidade e a estabilidade nas pistas."   
    >
      {(isActive) => (
        <AerodynamicsEvolution isActive={isActive} />
      )}

      </StoryBlock>

      <StoryBlock
        title="O impacto do DRS"
        text="O DRS (Drag Reduction System) é uma inovação tecnológica que revolucionou as corridas de Fórmula 1. Introduzido para aumentar as oportunidades de ultrapassagem, o DRS permite que os pilotos reduzam o arrasto aerodinâmico em determinadas zonas da pista, aumentando a velocidade máxima do carro. Essa tecnologia trouxe uma nova dinâmica para as corridas, tornando-as mais emocionantes e estratégicas, ao mesmo tempo em que desafia os pilotos a dominar essa ferramenta de forma eficaz."
      >
        {(isActive) => (
          <DRSAnimation isActive={isActive} />
        )}

      </StoryBlock>

      <StoryBlock
        title="A segurança em primeiro lugar"
        text="A segurança sempre foi uma prioridade na Fórmula 1, e ao longo dos anos, a categoria implementou diversas medidas para proteger os pilotos. Uma das inovações mais significativas nesse sentido é o Halo, um dispositivo de proteção que envolve a cabeça do piloto, reduzindo o risco de ferimentos graves em caso de acidentes. Desde sua introdução, o Halo tem se mostrado eficaz na prevenção de lesões e salvou vidas, reforçando o compromisso da Fórmula 1 com a segurança e o bem-estar dos competidores."
      >
        {(isActive) => (
          <HaloBlock isActive={isActive} />
        )}
      </StoryBlock>

      <StoryBlock
        title="A evolução da parada nos boxes"
        text="As paradas nos boxes são momentos cruciais em uma corrida de Fórmula 1, e ao longo dos anos, elas passaram por uma evolução significativa. Desde as primeiras paradas lentas e improvisadas até as operações altamente coordenadas e rápidas de hoje, a eficiência e a precisão das equipes de pit stop se tornaram um diferencial competitivo. Cada segundo conta, e a habilidade das equipes em realizar trocas de pneus e ajustes mecânicos em tempo recorde pode determinar o resultado de uma corrida."
      >
        {(isActive) => (
          <PitStopBlock isActive={isActive} />
        )}
      </StoryBlock>

<StoryBlock
        title="A evolução da direção"
        text="A direção dos carros de Fórmula 1 também passou por uma evolução significativa ao longo dos anos. Os volantes modernos são verdadeiras centrais de controle, equipados com uma variedade de botões e ajustes que permitem aos pilotos gerenciar diversos aspectos do carro durante a corrida. Essa complexidade exige habilidade e concentração, tornando a experiência de dirigir um carro de Fórmula 1 uma combinação de técnica, estratégia e reflexos rápidos."
      >
        {(isActive) => (
          <SteeringWheelBlock isActive={isActive} />
        )}
      </StoryBlock>

      <StoryBlock
        title="A explosão de dados"
        text="A Fórmula 1 é uma das categorias mais avançadas em termos de tecnologia e análise de dados. Cada carro é equipado com uma infinidade de sensores que coletam informações em tempo real, desde a performance do motor até o comportamento dos pneus. Esses dados são transmitidos para as equipes, permitindo ajustes estratégicos durante a corrida e contribuindo para o desenvolvimento contínuo dos carros. A análise de dados tornou-se uma ferramenta essencial para maximizar o desempenho e a competitividade na Fórmula 1."
      >
        {(isActive) => (
          <DataExplosionBlock isActive={isActive} />
        )}
      </StoryBlock>

        <StoryBlock
        title="Mais de sete décadas de evolução. Um mesmo objetivo."
        text="Da primeira corrida em Silverstone, em 1950, ao início de uma nova era em 2026, a Fórmula 1 evoluiu em praticamente todos os aspectos. Os carros ficaram mais rápidos e seguros, o campeonato tornou-se global e a tecnologia passou a desempenhar um papel decisivo dentro e fora das pistas. Ao longo desta história, vimos como inovação, engenharia e estratégia transformaram o esporte. Mas, independentemente da época, das regras ou dos protagonistas, a essência permaneceu a mesma: cruzar a linha de chegada antes de todos os outros."
      >
        {(isActive) => (
          <CarEvolutionBlock isActive={isActive} />
        )}
      </StoryBlock>

    </section>
  );
}