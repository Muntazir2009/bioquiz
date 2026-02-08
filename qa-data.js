const qaData = [

/* ===============================
   Q1: PLANT vs ANIMAL CELL
   =============================== */
{
  question: "Differentiate between Plant Cell and Animal Cell.",
  answer: `
<div class="diff-wrapper">
  <div class="diff-header">
    <span>Plant Cell</span>
    <span class="vs">VS</span>
    <span>Animal Cell</span>
  </div>

  <div class="diff-row">
    <div>Cell wall present</div>
    <div>Cell wall absent</div>
  </div>
  <div class="diff-row">
    <div>Chloroplasts present</div>
    <div>Chloroplasts absent</div>
  </div>
  <div class="diff-row">
    <div>Large central vacuole</div>
    <div>Small or temporary vacuoles</div>
  </div>
  <div class="diff-row">
    <div>Autotrophic (photosynthesis)</div>
    <div>Heterotrophic</div>
  </div>
  <div class="diff-row">
    <div>Stores food as starch</div>
    <div>Stores food as glycogen</div>
  </div>
  <div class="diff-row">
    <div>Plastids present</div>
    <div>Plastids absent</div>
  </div>
  <div class="diff-row">
    <div>Centrioles usually absent</div>
    <div>Centrioles present</div>
  </div>
  <div class="diff-row">
    <div>Plasmodesmata present</div>
    <div>Plasmodesmata absent</div>
  </div>
  <div class="diff-row">
    <div>Usually larger in size</div>
    <div>Usually smaller in size</div>
  </div>
</div>
`
},
/* ===============================
   Q2: PROKARYOTIC vs EUKARYOTIC
   =============================== */
{
  question: "Differentiate between Prokaryotic Cell and Eukaryotic Cell.",
  answer: `
  <div class="diff-wrapper">

    <div class="diff-header">
      <span>Prokaryotic Cell</span>
      <span class="vs">VS</span>
      <span>Eukaryotic Cell</span>
    </div>

    <div class="diff-images">
      <img src="images/diagrams/prokaryotic_cell.png" alt="Prokaryotic Cell">
      <img src="images/diagrams/eukaryotic_cell.png" alt="Eukaryotic Cell">
    </div>

    <div class="diff-row"><div>No true nucleus</div><div>True nucleus present</div></div>
    <div class="diff-row"><div>Nuclear membrane absent</div><div>Nuclear membrane present</div></div>
    <div class="diff-row"><div>Membrane-bound organelles absent</div><div>Membrane-bound organelles present</div></div>
    <div class="diff-row"><div>DNA is circular and naked</div><div>DNA is linear with proteins</div></div>
    <div class="diff-row"><div>Ribosomes are 70S</div><div>Ribosomes are 80S</div></div>
    <div class="diff-row"><div>Cell size small (1–10 µm)</div><div>Cell size larger (10–100 µm)</div></div>
    <div class="diff-row"><div>Mitochondria absent</div><div>Mitochondria present</div></div>
    <div class="diff-row"><div>Binary fission</div><div>Mitosis / Meiosis</div></div>
    <div class="diff-row"><div>Examples: Bacteria</div><div>Plants & Animals</div></div>
    <div class="diff-row"><div>Simple organisation</div><div>Complex organisation</div></div>

  </div>
  `
},
/* ===============================
   THEORY QUESTIONS
   =============================== */

{
  question: "What would happen if the plasma membrane ruptures or breaks down?",
  answer:
    "If the plasma membrane ruptures, the contents of the cell will leak out into the surrounding environment. This disturbs the internal balance of the cell and essential life processes stop. As a result, the cell cannot survive and eventually dies."
},

{
  question: "What would happen to the life of a cell if there was no Golgi apparatus?",
  answer:
    "The Golgi apparatus modifies, packages, and transports proteins and lipids. Without it, these substances would not reach their correct destinations inside or outside the cell. This would disrupt secretion and transport, severely affecting cell survival."
},

{
  question: "Which organelle is known as the powerhouse of the cell? Why?",
  answer:
    "Mitochondria are known as the powerhouse of the cell because they produce energy in the form of ATP during cellular respiration. This energy is required for all metabolic and life activities of the cell."
},

{
  question: "Where do the lipids and proteins constituting the cell membrane get synthesised?",
  answer:
    "Lipids are synthesised in the smooth endoplasmic reticulum, while proteins are synthesised by ribosomes on the rough endoplasmic reticulum. These components are later modified and transported by the Golgi apparatus to form the cell membrane."
},

{
  question: "How does an Amoeba obtain its food?",
  answer:
    "An Amoeba obtains its food by endocytosis. It forms finger-like projections called pseudopodia that surround and engulf the food particle. A food vacuole is formed where digestion takes place."
},

{
  question: "What is osmosis?",
  answer:
    "Osmosis is the movement of water molecules through a semi-permeable membrane from a region of higher water concentration to a region of lower water concentration. It is a passive process and does not require energy."
},

/* ===============================
   Q9: OSMOSIS EXPERIMENT (a–d TOGETHER)
   =============================== */
{
  question: `Carry out the following osmosis experiment:

a) Keep potato cup A empty  
b) Put one teaspoon sugar in cup B  
c) Put one teaspoon salt in cup C  
d) Put one teaspoon sugar in the boiled potato cup D  

After two hours, answer the following questions.`,
  
  answer: `
<b>i) Why does water collect in cups B and C?</b><br>
Water collects in cups B and C due to osmosis. The sugar and salt solutions create a concentrated solution inside the potato cups, so water moves from the surrounding dilute solution into the cups through the semi-permeable membrane.<br><br>

<b>ii) Why is potato cup A necessary?</b><br>
Potato cup A acts as a control. Since no solute is present, no osmotic movement occurs. This proves that osmosis requires a concentration difference.<br><br>

<b>iii) Why does water not collect in cups A and D?</b><br>
In cup A, there is no concentration difference. In cup D, boiling destroys the semi-permeable membrane of potato cells, preventing osmosis.
`
}

];
