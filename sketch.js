let data_aree, data_animali, data_piante, data_funghi, data_cromisti;
let areas = [];
let selectedArea = "south america"; 
let menuOpen = false;
let petalShapes = {};
let centerShapes = {};


const COLORS = {
  Animalia: "#B96A82",
  Plantae: "#A6C3A0",
  Fungi: "#A59382",
  Chromista: "#8096AD"
};

const BG = "#E1DDD3";

// Dizionario per rinominare le cause
const LETTERE_CAUSE = {
  "agriculture and aquaculture": "e",
  "biological resource use": "h",
  "climate change and severe weather": "b",
  "energy production and mining": "f",
  "human intrusions and disturbance": "i",
  "invasive and other problematic species, genes and diseases": "m",
  "natural system modifications": "l",
  "pollution": "n",
  "residential and commericial development": "d",
  "transportation and service corridors": "g",
  "geological events": "a",
  "other/unknown": "c"
};

const NOMI_CAUSE = {
  "agriculture and aquaculture": "Agricoltura",
  "biological resource use": "Sfruttamento risorse",
  "climate change and severe weather": "Cambiamento climatico",
  "energy production and mining": "Energia e miniere",
  "human intrusions and disturbance": "Intrusioni umane",
  "invasive and other problematic species, genes and diseases": "Specie invasive",
  "natural system modifications": "Modifiche naturali",
  "pollution": "Inquinamento",
  "residential and commericial development": "Edilizia",
  "transportation and service corridors": "Trasporti",
  "geological events": "Eventi geologici",
  "other/unknown": "Altro"
};

const DESCRIZIONI_CAUSE = {
  "agriculture and aquaculture": "L'impatto maggiore sulla biodiversità deriva dall'espansione e dell'intensificazione dell'agricoltura e acquacoltura, che interessa circa il 46,5% delle specie minacciate. Questa minaccia è guidata principalmente dalla conversione degli habitat naturali per le colture, il pascolo del bestiame e lo sviluppo dell'acquacoltura, causando una perdita di habitat su vasta scala.",
  "biological resource use": "L'uso insostenibile delle risorse biologiche, come la raccolta eccessiva o la caccia, colpisce circa il 39,6% delle specie. La componente più significativa è il taglio e la raccolta di legname, spesso non sostenibile, seguito dalla pesca e dalla raccolta di risorse acquatiche, e dalla caccia e cattura non regolamentata di animali terrestri e piante.",
  "climate change and severe weather": "Gli impatti dei cambiamenti climatici e delle condizioni meteorologiche estreme minacciano circa il 13,3% delle specie. Questa minaccia include lo spostamento e l'alterazione degli habitat, l'aumento delle siccità e gli estremi di temperatura e le tempeste più violente, che superano la capacità di adattamento delle specie.",
  "energy production and mining": "La produzione di energia e l'attività mineraria minacciano circa il 13,1% delle specie. Le attività di estrazione mineraria e le cave sono la componente più impattante, causando la distruzione fisica dell'habitat, seguite dalle trivellazioni di petrolio e gas e dalle infrastrutture per le energie rinnovabili.",
  "human intrusions and disturbance": "Questa minaccia, che incide su circa il 5,7% delle specie, si riferisce al disturbo diretto causato principalmente dalle attività ricreative non regolamentate. Altri fattori, sebbene minori, includono i conflitti (guerre e disordini civili) che destabilizzano gli ecosistemi.",
  "invasive and other problematic species, genes and diseases": "L'introduzione di specie invasive non native, malattie e altro materiale genetico problematico minaccia circa il 14,5% delle specie. Le specie aliene invasive sono il problema predominante; possono agire come predatori, concorrenti o vettori di malattie, portando al rapido declino delle specie native.",
  "natural system modifications": "Questa categoria rappresenta le alterazioni su larga scala degli ecosistemi, impattando circa il 22,1% delle specie. Le principali cause sono gli incendi (la cui frequenza e intensità sono spesso alterate dall'uomo) e la gestione idrica tramite la costruzione di dighe e la deviazione dei corsi d'acqua, che sconvolgono gli habitat acquatici e terrestri.",
  "pollution": "L'inquinamento danneggia circa il 13,5% delle specie. Sebbene l'inquinamento da effluenti agricoli e forestali (come i fertilizzanti in eccesso) sia spesso la componente più diffusa, anche gli scarichi industriali, i rifiuti solidi e l'inquinamento atmosferico contribuiscono significativamente alla contaminazione degli habitat.",
  "residential and commericial development": "L'espansione dell'urbanizzazione e delle infrastrutture umane, raggruppata nello sviluppo residenziale e commerciale, minaccia circa il 24,5% delle specie. Questa categoria include la crescita delle aree urbane, industriali e turistiche, che provoca la distruzione diretta e la frammentazione degli ecosistemi.",
  "transportation and service corridors": "Lo sviluppo di corridoi di trasporto e servizi minaccia circa l'8,1% delle specie. Questo impatto è dominato dalla costruzione di strade e ferrovie, che oltre a distruggere l'habitat, creano barriere fisiche e aumentano la mortalità degli animali.",
  "geological events": "Gli eventi geologici che minacciano circa l'1,1% delle specie sono perlopiù fenomeni naturali, come frane, valanghe ed eruzioni vulcaniche. Tuttavia, l'impatto sulle specie è spesso esacerbato quando gli habitat sono già stressati da altre minacce antropiche."
};

let causes = [];
let hoveredCause = null;
let clickedCause = null;
let scrollY = 0; 

function preload() {
  data_aree    = loadTable("data/data_aree.csv", "csv", "header");
  data_animali = loadTable("data/data_animali.csv", "csv", "header");
  data_piante  = loadTable("data/data_piante.csv", "csv", "header");
  data_funghi  = loadTable("data/data_funghi.csv", "csv", "header");
  data_cromisti= loadTable("data/data_cromisti.csv","csv","header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");

  for (let r = 0; r < data_aree.getRowCount(); r++) {
    let area = data_aree.getString(r, 0);
    if (area && area.toLowerCase() !== "total") areas.push(area.toLowerCase());
  }
  causes = data_animali.columns.slice(1, -1);

  // Precalcolo forme statiche per ogni regno e causa
  for (let regno of ["Animalia","Plantae","Fungi","Chromista"]) {
    petalShapes[regno] = [];
    for (let i = 0; i < causes.length; i++) {
      let layers = [];
      for (let l = 0; l < 12; l++) { // 12 velature per petalo
        let shape = [];
        for (let a = 0; a < TWO_PI; a += PI/8) {
          shape.push({
            angle: a,
            rxVar: random(-3,3),
            ryVar: random(-5,5),
            alpha: 25 + random(-10,10),
            colorVar: [random(-20,20), random(-20,20), random(-20,20)]
          });
        }
        layers.push(shape);
      }
      petalShapes[regno].push(layers);
    }

    // centro del fiore
    centerShapes[regno] = [];
    for (let l = 0; l < 8; l++) {
      let shape = [];
      for (let a = 0; a < TWO_PI; a += PI/10) {
        shape.push({
          angle: a,
          rVar: random(-2,2),
          alpha: 30 + random(-10,10),
          colorVar: [random(-15,15), random(-15,15), random(-15,15)]
        });
      }
      centerShapes[regno].push(shape);
    }
  }
}


function draw() {
  clear();
  push();
  translate(0, scrollY); // scroll del contenuto

  fill(0);
  textAlign(RIGHT, TOP);
  textSize(28);
  text("Cause di rischio estinzione — " + toTitleCase(selectedArea), width - 50, 70);


  drawKingdomFlowers();

  // Se c'è un click, overlay 
  if (clickedCause) drawOverlay(clickedCause);

  pop(); // Fine dello scroll
    
  drawDropdownMenu();
  drawTooltip();
}

function drawKingdomFlowers() {
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  
  let gapX = 650;               
  let topPairX = 300;  
  let topPairY = 300;  
  let bottomPairX = 700; 
  let bottomPairY = 650; 
  
  let centerRadius = 20;        
  let angleStep = TWO_PI / causes.length;

  let plantaeX = topPairX + gapX;
  let fungiX = bottomPairX;
  let distDiag = dist(plantaeX, topPairY, fungiX, bottomPairY);
  let maxPossibleRadius = distDiag / 2 - 15; 
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60; 
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    // controlla se ci sono dati > 0
    let hasData = false;
    let maxValInRow = 0;
    for (let c of causes) {
      let val = int(row.get(c));
      if (val > 0) {
        hasData = true;
        if (val > maxValInRow) maxValInRow = val;
      }
    }
    if (!hasData) continue; 
    if (maxValInRow === 0) maxValInRow = 1;

    let col = k % 2; 
    let rowIdx = floor(k / 2);
    let startX = (rowIdx === 0) ? topPairX : bottomPairX;
    let startY = (rowIdx === 0) ? topPairY : bottomPairY;
    let centerX = startX + col * gapX;
    let centerY = startY;

    let baseColor = color(COLORS[regno]);

    push();
    translate(centerX, centerY); 

    // --- PETALI ---
    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let val = int(row.get(causa));
      if (val === 0) continue; 
      
      let petalLength = map(val, 0, maxValInRow, 100, maxPetalLengthLimit);
      let angle = i * angleStep - HALF_PI; 

      let isFlowerHovered = (hoveredCause && hoveredCause.kingdom === regno);
      let isThisPetalHovered = (isFlowerHovered && hoveredCause.cause === causa);
      let isGlobalSameCauseFocus = (hoveredCause && hoveredCause.cause === causa);

      // Regola di sbiadimento:
      let shouldFade =
        hoveredCause && (
          // fiore hoverato → sbiadisci se non è il petalo hoverato
          (isFlowerHovered && !isThisPetalHovered) ||
          // altri fiori → sbiadisci se non è la causa globale
          (!isFlowerHovered && !isGlobalSameCauseFocus)
        );

      push();
      rotate(angle);

      // petalo hoverato “sbuca fuori”
      if (isThisPetalHovered) {
        scale(1.1);
        translate(0, -8);
      }

      for (let l = 0; l < petalShapes[regno][i].length; l++) {
        let shape = petalShapes[regno][i][l];
        beginShape();
        for (let p of shape) {
          let c = color(
            red(baseColor) + p.colorVar[0],
            green(baseColor) + p.colorVar[1],
            blue(baseColor) + p.colorVar[2]
          );

          c.setAlpha(shouldFade ? p.alpha * 0.3 : p.alpha);
          fill(c);

          let rx = dynamicPetalWidth/2 + p.rxVar;
          let ry = petalLength/2 + p.ryVar;
          let baseOffset = centerRadius * 0.6;
          let x = cos(p.angle) * rx;
          let y = baseOffset + petalLength/2 + sin(p.angle) * ry;
          curveVertex(x, y);
        }
        endShape(CLOSE);
      }

      // --- ETICHETTE ---
      push();
      let baseDist = centerRadius + petalLength + 15;
      let stagger = (i % 2 === 0) ? 0 : 12;
      translate(0, baseDist + stagger); 
      rotate(-angle); 
      textSize(12); 
      let etichetta = LETTERE_CAUSE[causa] || causa; 
      fill(0);
      text(etichetta, 0, 0);
      pop(); 

      pop();
    }

    // --- PISTILLO MIGLIORATO ---
    for (let shape of centerShapes[regno]) {
      beginShape();
      for (let p of shape) {
        let c = color(
          red(baseColor) + p.colorVar[0],
          green(baseColor) + p.colorVar[1],
          blue(baseColor) + p.colorVar[2]
        );
        c.setAlpha(p.alpha);
        fill(c);

        let r = centerRadius + p.rVar + noise(p.angle*0.5)*2;
        let x = cos(p.angle) * r;
        let y = sin(p.angle) * r;
        curveVertex(x, y);
      }
      endShape(CLOSE);
    }

    for (let r = centerRadius; r > 0; r -= 3) {
      let c = lerpColor(baseColor, color(255), 0.3);
      c.setAlpha(25);
      fill(c);
      noStroke();
      ellipse(0, 0, r*2, r*2);
    }

    for (let i = 0; i < 4; i++) {
      let x = random(-4,4);
      let y = random(-4,4);
      let c = color(red(baseColor), green(baseColor), blue(baseColor), 15);
      fill(c);
      noStroke();
      ellipse(x, y, random(6,10), random(6,10));
    }

    pop(); 
  }
}




function mouseMoved() {
  hoveredCause = null;

  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];

  // layout identico a drawKingdomFlowers
  let gapX = 650;               
  let topPairX = 300;  
  let topPairY = 300;  
  let bottomPairX = 700; 
  let bottomPairY = 650; 
  
  let centerRadius = 20;        
  let angleStep = TWO_PI / causes.length;

  let plantaeX = topPairX + gapX;
  let fungiX = bottomPairX;
  let distDiag = dist(plantaeX, topPairY, fungiX, bottomPairY);
  let maxPossibleRadius = distDiag / 2 - 15; 
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60; 
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  let mx = mouseX;
  let my = mouseY - scrollY;

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let col = k % 2; 
    let rowIdx = floor(k / 2);

    let startX = (rowIdx === 0) ? topPairX : bottomPairX;
    let startY = (rowIdx === 0) ? topPairY : bottomPairY;
    let centerX = startX + col * gapX;
    let centerY = startY;

    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let maxValInRow = 0;
    for (let c of causes) {
      let val = int(row.get(c));
      if (val > maxValInRow) maxValInRow = val;
    }
    if (maxValInRow === 0) maxValInRow = 1;

    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let val = int(row.get(causa));
      if (val === 0) continue; 

      let petalLength = map(val, 0, maxValInRow, 100, maxPetalLengthLimit);
      let petalAngle = i * angleStep - HALF_PI;

      let dx = mx - centerX;
      let dy = my - centerY;
      let localX = dx * cos(-petalAngle) - dy * sin(-petalAngle);
      let localY = dx * sin(-petalAngle) + dy * cos(-petalAngle);

      // offset identico al draw
      let baseOffset = centerRadius * 0.6;
      let ellipseCenterX = 0;
      let ellipseCenterY = baseOffset + petalLength / 2;
      let radiusX = dynamicPetalWidth / 2; 
      let radiusY = petalLength / 2;

      let part1 = sq(localX - ellipseCenterX) / sq(radiusX);
      let part2 = sq(localY - ellipseCenterY) / sq(radiusY);

      if (part1 + part2 <= 1) {
        hoveredCause = { kingdom: regno, cause: causa, value: val };
        return; 
      }
    }
  }
}


function mouseWheel(event) {
  scrollY -= event.delta; 
}

function mousePressed() {
  // Gestione click menu
  if (mouseX > 20 && mouseX < 240 && mouseY > 20 && mouseY < 56) {
    menuOpen = !menuOpen;
    return;
  }
  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      let iy = 56 + i * 32;
      if (mouseX > 20 && mouseX < 240 && mouseY > iy && mouseY < iy + 32) {
        selectedArea = areas[i];
        menuOpen = false;
        return;
      }
    }
  }
  
  // Gestione click petalo
  if (hoveredCause) {
    clickedCause = hoveredCause.cause; // Salviamo solo il nome della causa per l'overlay
  }
}

function drawDropdownMenu() {
  // Calcolo la posizione basandomi sulla larghezza dello schermo
  let menuW = 220;
  let menuX = width - 50 - menuW; // Allineato a destra come il titolo (margine 50)
  let menuY = 120; // Sotto il titolo
  
  fill(BG);
  noStroke();
  // Rettangolo principale
  rect(menuX, menuY, menuW, 36, 6);
  
  fill(0);
  textSize(14);
  textAlign(LEFT, CENTER);
  text(toTitleCase(selectedArea), menuX + 12, menuY + 18);

  textAlign(RIGHT, CENTER);
  text(menuOpen ? "▴" : "▾", menuX + 210, menuY + 18);

  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      let iy = menuY + 36 + i * 32;
      
      fill("#D6D2C8");
      rect(menuX, iy, menuW, 32, 6);
      
      fill(0);
      textAlign(LEFT, CENTER);
      text(toTitleCase(areas[i]), menuX + 12, iy + 16);
    }
  }
}

function drawOverlay(causeKey) {
  fill(0, 150);
  rect(0, 0, width, height);

  push();
  translate(0, -scrollY); 

  fill(255);
  rect(width/2 - 250, height/2 - 150, 500, 300, 10);

  // Recupera il nome leggibile e la descrizione
  let titolo = NOMI_CAUSE[causeKey] || causeKey;
  let descrizione = DESCRIZIONI_CAUSE[causeKey] || "Descrizione non disponibile per questa causa.";

  fill(0);
  textAlign(CENTER, TOP);
  
  // Titolo
  textSize(22);
  textStyle(BOLD);
  text(titolo, width/2, height/2 - 110);

  // Descrizione (con word wrapping per andare a capo)
  textSize(16);
  textStyle(NORMAL);
  textWrap(WORD); // Importante per far andare a capo il testo
  
  // Disegna il testo dentro un rettangolo immaginario largo 400px
  text(descrizione, width/2 - 200, height/2 - 60, 400);

  // Bottone Chiudi
  fill("#EDEDED");
  rect(width/2 - 40, height/2 + 80, 80, 30, 5);
  fill(0);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Chiudi", width/2, height/2 + 95);

  pop();
}

function mousePressed() {
  // --- PRIORITÀ 1: GESTIONE POPUP (Overlay) ---
  if (clickedCause) {
    // Coordinate del bottone "Chiudi" (identiche a quelle usate in drawOverlay)
    // width/2 - 40, height/2 + 80, larghezza 80, altezza 30
    if (mouseX > width/2 - 40 && mouseX < width/2 + 40 &&
        mouseY > height/2 + 80 && mouseY < height/2 + 110) {
      clickedCause = null; // Chiudi il popup
    }
    // IMPORTANTE: Se il popup è aperto, blocchiamo qualsiasi altro click (fiori o menu)
    return; 
  }

  // --- PRIORITÀ 2: GESTIONE MENU ---
  // Testata del menu
  let menuW = 220;
  let menuX = width - 50 - menuW; 
  let menuY = 120; 

  if (mouseX > menuX && mouseX < menuX + menuW && mouseY > menuY && mouseY < menuY + 36) {
    menuOpen = !menuOpen;
    return;
  }

  // Voci del menu (se aperto)
  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      let iy = menuY + 36 + i * 32;
      if (mouseX > menuX && mouseX < menuX + menuW && mouseY > iy && mouseY < iy + 32) {
        selectedArea = areas[i];
        menuOpen = false;
        return;
      }
    }
  }
  
  // --- PRIORITÀ 3: GESTIONE FIORI ---
  // Solo se non abbiamo cliccato nient'altro sopra
  if (hoveredCause) {
    clickedCause = hoveredCause.cause; 
  }
}

function getDatasetByKingdom(regno) {
    if (regno === "Animalia") return data_animali;
    if (regno === "Plantae")  return data_piante;
    if (regno === "Fungi")    return data_funghi;
    if (regno === "Chromista")return data_cromisti;
    return null;
}
  
function getRowByArea(table, areaLower) {
  for (let r = 0; r < table.getRowCount(); r++) {
    let name = table.getString(r, 0);
    if (!name) continue;
    if (name.trim().toLowerCase() === areaLower.trim().toLowerCase()) {
      return table.getRow(r);
    }
  }
  return null;
}
  
function toTitleCase(s) {
  return String(s)
    .toLowerCase()
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function drawTooltip() {
  if (hoveredCause) {
    let lettera = LETTERE_CAUSE[hoveredCause.cause] || "";
    let nomeEsteso = NOMI_CAUSE[hoveredCause.cause] || hoveredCause.cause;
    let txt = lettera + " - " + nomeEsteso + ": " + hoveredCause.value + " specie";
    
    textSize(14);
    let w = textWidth(txt) + 20;
    let h = 30;
    
    // Coordinate vicino al mouse
    let x = mouseX + 15;
    let y = mouseY + 15;
    
    // Evito che esca dallo schermo
    if (x + w > width) x = mouseX - w - 10;
    if (y + h > height) y = mouseY - h - 10;
    
    // Rettangolo sfondo
    fill(255);
    stroke(0);
    strokeWeight(1);
    rect(x, y, w, h, 5); // 5 raggio angoli arrotondati
    
    // Testo
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    text(txt, x + 10, y + h/2);
  }
}