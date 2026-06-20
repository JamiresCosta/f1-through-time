import { useState } from "react";
import StoryBlock from "../components/storytelling/StoryBlock";
import TopDrivers from "../components/visuals/TopDrivers";
import DriverProfile from "../components/visuals/DriverProfile";
import CareerTimeline from "../components/visuals/CareerTimeline";
import DriverTeams from "../components/visuals/DriverTeams";
import DriverFavoriteCircuits from "../components/visuals/DriverFavoriteCircuits";
import DriverComparison from "../components/visuals/DriverComparison";
import DriverRivalsNetwork from "../components/visuals/DriverRivalsNetwork";
import ChampionsMap from "../components/visuals/ChampionsMap";


export default function PilotsSection() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <section id="pilotos">
      <StoryBlock
        title="Quem são os maiores pilotos?"
        text="Ao longo da história da Fórmula 1, poucos pilotos conseguiram transformar talento, consistência e velocidade em títulos mundiais. O gráfico apresenta os pilotos mais vitoriosos em campeonatos e permite selecionar um nome para explorar sua trajetória nos próximos blocos."
      >
        {(isActive) => (
          <TopDrivers
            isActive={isActive}
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
          />
        )}
      </StoryBlock>
      <StoryBlock
  title="Comparando carreiras"
  text="Embora os títulos sejam a medida mais conhecida do sucesso, 
  eles representam apenas uma parte da carreira de um piloto. Vitórias, pódios e longevidade revelam diferentes aspectos do desempenho ao longo dos anos"
>
  <DriverProfile selectedDriver={selectedDriver} />
</StoryBlock>
<StoryBlock
  title="A trajetória temporada a temporada"
  text="Nem toda carreira começa no topo. Alguns campeões precisaram de várias temporadas para conquistar o primeiro título, 
  enquanto outros dominaram rapidamente a categoria. A linha ao lado mostra como a posição final do piloto evoluiu ao longo do campeonato ano após ano"
>
  {(isActive) => (
    <CareerTimeline
      selectedDriver={selectedDriver}
      isActive={isActive}
    />
  )}
</StoryBlock>
<StoryBlock
  title="As equipes da carreira"
  text="A trajetória de um piloto também é marcada pelas equipes por onde passou. Algumas carreiras foram construídas em uma única escuderia dominante, enquanto outras atravessaram diferentes projetos técnicos. O gráfico mostra em quais construtores o piloto selecionado mais disputou corridas."
>
  {(isActive) => (
    <DriverTeams
      selectedDriver={selectedDriver}
      isActive={isActive}
    />
  )}
</StoryBlock>
<StoryBlock
  title="Onde ele mais venceu?"
  text="As vitórias de um piloto não se distribuem igualmente pelo calendário. Algumas pistas concentram resultados marcantes e ajudam a revelar onde determinada carreira teve seus momentos mais fortes. Cada bolha representa um Grande Prêmio vencido pelo piloto selecionado; quanto maior a bolha, maior o número de vitórias. Clique em uma bolha para destacar o circuito e ver o total no painel lateral."
>
  {(isActive) => (
    <DriverFavoriteCircuits
      selectedDriver={selectedDriver}
      isActive={isActive}
    />
  )}
</StoryBlock>
<StoryBlock
  title="Como ele se compara a outros campeões?"
  text="Nenhuma carreira é grande isoladamente. Ao comparar títulos, vitórias, pódios, pontos e temporadas, é possível perceber diferentes formas de domínio na Fórmula 1. Escolha outro piloto para comparar com o nome selecionado no ranking."
>
  <DriverComparison selectedDriver={selectedDriver} />
</StoryBlock>
<StoryBlock
  title="Quem esteve mais próximo dele?"
  text="Grandes carreiras são marcadas por disputas. A rede ao lado aproxima rivalidades observando quais pilotos terminaram próximos do piloto selecionado na classificação final dos campeonatos. Quanto maior o nó, mais vezes aquele nome apareceu perto dele na tabela."
>
  {(isActive) => (
    <DriverRivalsNetwork
      selectedDriver={selectedDriver}
      isActive={isActive}
    />
  )}
</StoryBlock>
<StoryBlock
  title="De onde vêm os campeões?"
  text="A Fórmula 1 é global, mas seus campeões se concentram em poucos países. O mapa destaca as nações que já produziram campeões mundiais, revelando como a história da categoria também é marcada por tradições nacionais."
>
  {(isActive) => <ChampionsMap isActive={isActive} />}
</StoryBlock>
    </section>
  );
}