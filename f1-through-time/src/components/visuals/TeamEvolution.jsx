import { useMemo } from "react";

export default function TeamEvolution({ isActive }) {

  const teams = useMemo(() => [

    {
      label: "Ferrari",
      status: "alive",
      history: [
        { year: 1950, name: "Ferrari" }
      ]
    },

    {
      label: "McLaren",
      status: "alive",
      history: [
        { year: 1966, name: "McLaren" }
      ]
    },

    {
      label: "Williams",
      status: "alive",
      history: [
        { year: 1977, name: "Williams" }
      ]
    },

    {
      label: "Mercedes",
      status: "alive",
      history: [
        { year: 1954, name: "Mercedes" },
        { year: 1956, name: "Sai da F1" },
        { year: 2010, name: "Mercedes" }
      ]
    },

    {
      label: "Red Bull",
      status: "rename",
      history: [
        { year: 1997, name: "Stewart" },
        { year: 2000, name: "Jaguar" },
        { year: 2005, name: "Red Bull" }
      ]
    },

    {
      label: "Aston Martin",
      status: "rename",
      history: [
        { year: 1991, name: "Jordan" },
        { year: 2006, name: "Midland" },
        { year: 2007, name: "Spyker" },
        { year: 2008, name: "Force India" },
        { year: 2019, name: "Racing Point" },
        { year: 2021, name: "Aston Martin" }
      ]
    },

    {
      label: "Audi",
      status: "rename",
      history: [
        { year: 1993, name: "Sauber" },
        { year: 2019, name: "Alfa Romeo" },
        { year: 2024, name: "Sauber" },
        { year: 2026, name: "Audi" }
      ]
    },

    {
      label: "Alpine",
      status: "rename",
      history: [
        { year: 1981, name: "Toleman" },
        { year: 1986, name: "Benetton" },
        { year: 2002, name: "Renault" },
        { year: 2012, name: "Lotus" },
        { year: 2016, name: "Renault" },
        { year: 2021, name: "Alpine" }
      ]
    },

    {
      label: "Brabham",
      status: "dead",
     history:[
        {year:1962,name:"Brabham"},
        {year:1992,name:"Fim"}
      ]
    },

    {
      label:"Tyrrell",
     status:"dead",
     history:[
        {year:1970,name:"Tyrrell"},
        {year:1998,name:"Comprada pela BAR"}
      ]
    }

  ], []);

  return (

    <div className="chart-card evolution-card">

      <div className="chart-title">
        A evolução das equipes
      </div>

      <div className="team-list">

        {teams.map((team,index)=>(

          <div
            key={team.label}
            className={`team-item ${isActive?"visible":""}`}
            style={{transitionDelay:`${index*120}ms`}}
          >

            <div className={`team-dot ${team.status}`}></div>

            <div className="team-content">

              <div className="team-name">

                {team.label}

                {team.status==="alive" &&
                  <span className="status alive">Ativa</span>
                }

                {team.status==="rename" &&
                  <span className="status rename">Mudou de nome</span>
                }

                {team.status==="dead" &&
                  <span className="status dead">Encerrada</span>
                }

              </div>

              <div className="timeline">

                {team.history.map((step,i)=>(

                  <span key={i}>

                    <strong>{step.year}</strong>

                    {" • "}

                    {step.name}

                    {i<team.history.length-1 &&

                      <span className="arrow">
                        →
                      </span>

                    }

                  </span>

                ))}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}