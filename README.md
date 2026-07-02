# 🏎️ F1 Through Time

**F1 Through Time** é um projeto de **scrollytelling interativo** desenvolvido em React que apresenta a história da Fórmula 1 por meio de visualizações de dados, narrativa visual e técnicas de storytelling.

Mais do que uma exploração histórica, o projeto foi concebido como **um guia para iniciantes**, permitindo que pessoas com pouco ou nenhum conhecimento sobre a categoria compreendam sua evolução, seus personagens, suas equipes, seus circuitos e os principais acontecimentos que marcaram mais de sete décadas do automobilismo.


---

## 🌐 Acesse o projeto

🔗 **Deploy:** [Site disponível](https://f1-through-time-hazel.vercel.app/).

---

## ✨ Principais funcionalidades

- 📖 Scrollytelling guiado
- 📊 Visualizações interativas desenvolvidas com D3.js
- 🏁 Explicações voltadas para iniciantes na Fórmula 1
- 🌍 Exploração histórica da categoria desde 1950
- 🎨 Animações sincronizadas com o scroll
- 💬 Tooltips e elementos interativos
---

## 🛠️ Tecnologias utilizadas

- React
- Vite
- D3.js
- PapaParse
- Tailwind CSS
- JavaScript (ES6+)

---

## 📁 Estrutura do projeto

```text
f1-through-time/
├── public/
│   ├── data/
│   │   ├── f1_circuits.csv
│   │   ├── f1_constructors.csv
│   │   ├── f1_constructor_standings.csv
│   │   ├── f1_drivers.csv
│   │   ├── f1_driver_standings.csv
│   │   ├── f1_qualifying.csv
│   │   ├── f1_races.csv
│   │   └── f1_results.csv
│   ├── world.geojson
│   └── world.json
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── storytelling/
│   │   └── visuals/
│   ├── hooks/
│   ├── sections/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```
---

## 🚀 Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/JamiresCosta/f1-through-time.git
```

Entre na pasta do projeto:

```bash
cd f1-through-time
```

---

### Instale as dependências

```bash
npm install
```

---

### Execute o projeto

```bash
npm run dev
```

O servidor de desenvolvimento será iniciado e o projeto estará disponível em:

```text
http://localhost:5173
```

---

### Build de produção

```bash
npm run build
```

---

### Visualizar a build

```bash
npm run preview
```

---

## 📦 Scripts disponíveis

| Comando | Descrição |
|----------|-----------|
| `npm install` | Instala as dependências |
| `npm run dev` | Executa o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Executa uma prévia da build de produção |

---

## 📊 Base de dados

O projeto utiliza dados históricos da Fórmula 1 abrangendo temporadas entre **1950 e 2026**, incluindo informações sobre:

- circuitos;
- corridas;
- pilotos;
- construtores;
- resultados;
- classificações;
- standings;
- sessões classificatórias.

Os datasets utilizados estão disponíveis publicamente no Kaggle:

**Formula 1 Complete Dataset (1950–2026)**: [Dataset](https://www.kaggle.com/datasets/patelris/formula-1-complete-dataset-1950-2026).

Os arquivos utilizados pelo projeto encontram-se em:

```text
public/data/
```

---

## 🎯 Objetivo

O projeto busca unir **Visualização de Dados** e **Storytelling** para tornar a história da Fórmula 1 mais acessível, especialmente para pessoas que estão conhecendo a categoria pela primeira vez.

Ao longo da narrativa, conceitos históricos são apresentados de forma visual e interativa, permitindo que o usuário compreenda a evolução do esporte antes de explorar.

---

## 👨‍💻 Autoras

- [Danielly Silva](https://github.com/ddniellysilva/)
- [Jamires Costa](https://github.com/JamiresCosta/)
---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.
