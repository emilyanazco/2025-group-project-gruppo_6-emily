let data_aree, data_animali, data_piante, data_funghi, data_cromisti;
let areas = [];
let selectedArea = "south america"; 
let menuOpen = false;
let petalShapes = {};
let centerShapes = {};
let customFont;

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

function preload() {
  customFont = loadFont("fonts/CormorantGaramond-VariableFont_wght.ttf");

  data_aree    = loadTable("data/data_aree.csv", "csv", "header");
  data_animali = loadTable("data/data_animali.csv", "csv", "header");
  data_piante  = loadTable("data/data_piante.csv", "csv", "header");
  data_funghi  = loadTable("data/data_funghi.csv", "csv", "header");
  data_cromisti= loadTable("data/data_cromisti.csv","csv","header");
}

function setup() {
  // Calcolo l’altezza totale necessaria in base al layout dei fiori
  let marginTop = 280;     // margine superiore
  let spacingY = 400;      // distanza verticale tra le righe
  let rows = 2;            // hai 4 regni disposti in 2 righe

  // Altezza totale = margine superiore + (numero righe - 1) * spacingY + margine inferiore
  let totalHeight = marginTop + (rows - 1) * spacingY + 600; 
  // il +600 è un margine extra per titoli, overlay e decorazione in basso

  createCanvas(windowWidth, totalHeight);
  textFont(customFont); // usa il font caricato

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
      for (let l = 0; l < 12; l++) {
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

function windowResized() {
  let marginTop = 280;
  let spacingY = 400;
  let rows = 2;
  let totalHeight = marginTop + (rows - 1) * spacingY + 600;
  resizeCanvas(windowWidth, totalHeight);
}

function draw() {
  clear();

  // 1. Header
  drawHeader();

  // 2. Legenda
  drawLegend();

  // 3. Fiori
  drawKingdomFlowers();

  // 4. Overlay
  if (clickedCause) drawOverlay(clickedCause);

  // 5. Tooltip
  drawTooltip();

  // 6. Menu sopra a tutto
  if (menuOpen) drawDropdownMenu();
}

function drawHeader() {
  push();
  const sz = constrain(width * 0.05, 30, 60);
  textFont(customFont);
  textStyle(NORMAL);
  fill(0);

  const x = width * 0.63;
  const y = sz * 1.2;

  // Prima riga
  textAlign(LEFT, TOP);
  textSize(sz);
  text("Cause di rischio", x, y);

  // Seconda riga
  const titoloY2 = y + sz * 1.2;
  textSize(sz);
  text("estinzione in", x, titoloY2);

  // Terza riga: menu chiuso
  const titoloY3 = titoloY2 + sz * 1.2;
  const label = toTitleCase(selectedArea);

  // Calcola larghezza massima tra label e voci
  textSize(sz * 0.7);
  let maxW = textWidth(label);
  for (let area of areas) {
    maxW = max(maxW, textWidth(toTitleCase(area)));
  }
  const menuW = maxW + 60;
  const menuH = sz * 0.9;
  const menuX = x;
  const menuY = titoloY3;

  // Rettangolo menu principale
  noStroke();
  fill('#F2F0E5');
  rect(menuX, menuY, menuW, menuH, 10);

  // Testo selezionato
  fill(0);
  textAlign(LEFT, CENTER);
  textSize(sz * 0.7);
  text(label, menuX + 12, menuY + menuH / 2);

  // Freccetta
  textAlign(RIGHT, CENTER);
  textSize(sz * 0.6);
  text(menuOpen ? "▲" : "▼", menuX + menuW - 12, menuY + menuH / 2);

  pop();

  // Disegna voci del menu sopra a tutto
  if (menuOpen) drawDropdownMenu(menuX, menuY, menuW, menuH, sz);
}

function drawDropdownMenu() {
  const sz = constrain(width * 0.05, 30, 60);
  const x = width * 0.63;
  const titoloY2 = sz * 1.2 + sz * 1.2;
  const titoloY3 = titoloY2 + sz * 1.2;

  const label = toTitleCase(selectedArea);
  textSize(sz * 0.7);

  // larghezza fissa calcolata sul testo più lungo
  let maxW = textWidth(label);
  for (let area of areas) {
    maxW = max(maxW, textWidth(toTitleCase(area)));
  }
  const menuW = maxW + 60;
  const menuH = sz * 0.9;
  const menuX = x;
  const menuY = titoloY3;

  // voci attaccate al rettangolo principale
  for (let i = 0; i < areas.length; i++) {
    const iy = menuY + menuH + i * menuH;
    const ih = menuH;
    const isHovered = mouseX > menuX && mouseX < menuX + menuW &&
                      mouseY > iy && mouseY < iy + ih;

    fill(isHovered ? "#BFBBAF" : "#F2F0E5"); // stesso colore della casella principale
    rect(menuX, iy, menuW, ih, 6);

    fill(0);
    textAlign(LEFT, CENTER);
    textSize(sz * 0.7);
    text(toTitleCase(areas[i]), menuX + 12, iy + ih / 2);
  }
}

function drawKingdomFlowers() {
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  
  let centerRadius = 20;        
  let angleStep = TWO_PI / causes.length;

  // Layout a tabella 2x2, più in basso e con più margine a sinistra
  let marginLeft = 260;   // margine sinistro aumentato
  let marginTop = 280;    // margine superiore → fiori più in basso
  let spacingX = 420;     // distanza orizzontale
  let spacingY = 400;     // distanza verticale

  let maxPossibleRadius = min(spacingX, spacingY) / 2 - 40; // ridotto per scala più compatta
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60; 
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

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

    // posizione in griglia 2x2
    let col = k % 2;
    let rowIdx = floor(k / 2);
    let centerX = marginLeft + col * spacingX;
    let centerY = marginTop + rowIdx * spacingY;

    let baseColor = color(COLORS[regno]);

    push();
    translate(centerX, centerY); 

    // --- PETALI ---
    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let val = int(row.get(causa));
      if (val === 0) continue; 
      
      // curva logaritmica + scala ridotta
      let normVal = log(val + 1) / log(maxValInRow + 1);
      let petalLength = (80 + normVal * (maxPetalLengthLimit * 1.5 - 80)) * 0.8;

      let angle = i * angleStep - HALF_PI; 

      let isFlowerHovered = (hoveredCause && hoveredCause.kingdom === regno);
      let isThisPetalHovered = (isFlowerHovered && hoveredCause.cause === causa);
      let isGlobalSameCauseFocus = (hoveredCause && hoveredCause.cause === causa);

      let shouldFade =
        hoveredCause && (
          (isFlowerHovered && !isThisPetalHovered) ||
          (!isFlowerHovered && !isGlobalSameCauseFocus)
        );

      push();
      rotate(angle);

      if (isThisPetalHovered) {
        scale(1.1);
        translate(0, -8);
      }

      for (let l = 0; l < petalShapes[regno][i].length; l++) {
        let shape = petalShapes[regno][i][l];
        beginShape();
        noStroke();
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
      textSize(15); 
      textAlign(CENTER, CENTER);
      let etichetta = LETTERE_CAUSE[causa] || causa; 
      fill(0);
      // textWeight(BOLD);
      text(etichetta, 0, 0);
      pop(); 

      pop();
    }

    // --- PISTILLO ---
    for (let shape of centerShapes[regno]) {
      beginShape();
      noStroke();
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
  let isPointer = false; // flag per decidere se mostrare la mano

  // --- LOGICA FIORI (hit-test petali) ---
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  let centerRadius = 20;
  let angleStep = TWO_PI / causes.length;

  let marginLeft = 260;
  let marginTop = 280;
  let spacingX = 420;
  let spacingY = 400;

  let maxPossibleRadius = min(spacingX, spacingY) / 2 - 40;
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60;
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  let mx = mouseX;
  let my = mouseY;

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let maxValInRow = 0;
    for (let c of causes) {
      let v = int(row.get(c));
      if (v > maxValInRow) maxValInRow = v;
    }
    if (maxValInRow === 0) maxValInRow = 1;

    let col = k % 2;
    let rowIdx = floor(k / 2);
    let centerX = marginLeft + col * spacingX;
    let centerY = marginTop + rowIdx * spacingY;

    if (dist(mx, my, centerX, centerY) > maxPossibleRadius + 160) continue;

    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let val = int(row.get(causa));
      if (val === 0) continue;

      let normVal = log(val + 1) / log(maxValInRow + 1);
      let petalLength = (80 + normVal * (maxPetalLengthLimit * 1.5 - 80)) * 0.8;
      let petalAngle = i * angleStep - HALF_PI;

      let dx = mx - centerX;
      let dy = my - centerY;
      let cosA = cos(-petalAngle), sinA = sin(-petalAngle);
      let localX = dx * cosA - dy * sinA;
      let localY = dx * sinA + dy * cosA;

      let baseOffset = centerRadius * 0.6;
      let ellipseCenterX = 0;
      let ellipseCenterY = baseOffset + petalLength / 2;
      let radiusX = dynamicPetalWidth / 2;
      let radiusY = petalLength / 2;

      const tol = 1.05;
      let part1 = sq(localX - ellipseCenterX) / sq(radiusX * tol);
      let part2 = sq(localY - ellipseCenterY) / sq(radiusY * tol);

      if (part1 + part2 <= 1) {
        hoveredCause = { kingdom: regno, cause: causa, value: val };
        isPointer = true; // siamo sopra un petalo
        break;
      }
    }
  }

  // --- LOGICA MENU ---
  const sz = constrain(width * 0.05, 30, 60);
  const x = width * 0.63;
  const y = sz * 1.2;
  const titoloY2 = y + sz * 1.2;
  const titoloY3 = titoloY2 + sz * 1.2;

  textFont(customFont);
  textStyle(NORMAL);

  textSize(sz * 0.7);
  const label = toTitleCase(selectedArea);
  const padding = 40;
  const menuW = textWidth(label) + padding;
  const menuH = sz * 0.9;

  textSize(sz);
  const menuX = x + textWidth("in ") + 10;
  const menuY = titoloY3;

  if ((mouseX > menuX && mouseX < menuX + menuW &&
       mouseY > menuY && mouseY < menuY + menuH) ||
      (menuOpen && mouseY > menuY + menuH && mouseY < menuY + menuH + areas.length * menuH &&
       mouseX > menuX && mouseX < menuX + menuW)) {
    isPointer = true; // siamo sopra il menu o una voce
  }

  // --- DECISIONE FINALE CURSORE ---
  if (isPointer) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function mousePressed() {
  // --- Gestione overlay aperto ---
  if (clickedCause) {
    // Se clicco sulla X dell'overlay → chiudi
    if (overlayCloseBounds &&
        dist(mouseX, mouseY, overlayCloseBounds.x, overlayCloseBounds.y) < overlayCloseBounds.size) {
      clickedCause = null;
      return;
    }
    // Se overlay è aperto, ignora altri click
    return;
  }

  // --- Gestione menu ---
  const sz = constrain(width * 0.05, 30, 60);
  const x = width * 0.63;
  const y = sz * 1.2;
  const titoloY2 = y + sz * 1.2;
  const titoloY3 = titoloY2 + sz * 1.2;

  textFont(customFont);
  textStyle(NORMAL);

  textSize(sz * 0.7);
  const label = toTitleCase(selectedArea);
  let maxW = textWidth(label);
  for (let area of areas) {
    maxW = max(maxW, textWidth(toTitleCase(area)));
  }
  const menuW = maxW + 60;
  const menuH = sz * 0.9;
  const menuX = x;
  const menuY = titoloY3;

  // Click sulla freccetta del menu
  const arrowX1 = menuX + menuW - 24;
  const arrowX2 = menuX + menuW;
  const arrowY1 = menuY;
  const arrowY2 = menuY + menuH;

  if (mouseX > arrowX1 && mouseX < arrowX2 &&
      mouseY > arrowY1 && mouseY < arrowY2) {
    menuOpen = !menuOpen;
    return;
  }

  // Click sulle voci del menu
  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      const iy = menuY + menuH + i * menuH;
      const ih = menuH;
      if (mouseX > menuX && mouseX < menuX + menuW &&
          mouseY > iy && mouseY < iy + ih) {
        selectedArea = areas[i];
        menuOpen = false;
        return;
      }
    }
  }

  // --- Gestione click sui fiori ---
  if (hoveredCause) {
    clickedCause = hoveredCause.cause; // apre overlay
    return;
  }
}


function drawOverlay(causeKey) {
  // Sfondo scuro semitrasparente dietro al popup
  fill(0, 120);
  noStroke();
  rect(0, 0, width, height);

  // Dimensioni box centrato
  const w = 500;
  const h = 300;
  const popX = width / 2;
  const popY = height / 2;
  const boxLeft = popX - w / 2;
  const boxTop = popY - h / 2;

  push();
  // Sfondo con bordi arrotondati
  fill(255);
  stroke(0);
  strokeWeight(1.5);
  rect(boxLeft, boxTop, w, h, 12);

  // Titolo e descrizione
  let titolo = NOMI_CAUSE[causeKey] || causeKey;
  let descrizione = DESCRIZIONI_CAUSE[causeKey] || "Descrizione non disponibile.";

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(22);
  text(titolo, popX, boxTop + 20);

  textStyle(NORMAL);
  textSize(16);
  textAlign(LEFT, TOP);
  text(descrizione, boxLeft + 30, boxTop + 70, w - 60, h - 100);

  // Icona X in alto a destra
  const btnSize = 20;
  const closeCx = boxLeft + w - 25;
  const closeCy = boxTop + 25;

  stroke(0);
  strokeWeight(2);
  line(closeCx - btnSize/2, closeCy - btnSize/2, closeCx + btnSize/2, closeCy + btnSize/2);
  line(closeCx + btnSize/2, closeCy - btnSize/2, closeCx - btnSize/2, closeCy + btnSize/2);

  

  pop();

  // Salva coordinate per gestione click
  overlayCloseBounds = {x: closeCx, y: closeCy, size: btnSize};
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
    strokeWeight(0);
    rect(x, y, w, h, 5); // 5 raggio angoli arrotondati
    
    // Testo
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    text(txt, x + 10, y + h/2);
  }
}

function drawLegend() {
  push();
  textFont(customFont);
  textStyle(NORMAL);
  fill(0);
  textAlign(LEFT, TOP);

  const sz = constrain(width * 0.05, 30, 60);
  const x = width * 0.63;
  const titoloY2 = sz * 1.2 + sz * 1.2;
  const titoloY3 = titoloY2 + sz * 1.2;
  const startX = x;
  const startY = titoloY3 + sz * 2.0;  // sotto al titolo
  const lineHeight = 34;

  // Ordina alfabeticamente
  let entries = Object.entries(LETTERE_CAUSE)
    .sort((a, b) => a[1].localeCompare(b[1]));

  for (let i = 0; i < entries.length; i++) {
    const causa = entries[i][0];
    const lettera = entries[i][1];
    const nome = NOMI_CAUSE[causa];
    const y = startY + i * lineHeight;

    // Testo completo (lettera + nome)
    const fullText = `${lettera}) ${nome}`;

    // Evidenzia se hover o click
    let isHovered = hoveredCause && hoveredCause.cause === causa;
    let isClicked = clickedCause && clickedCause === causa;

    if (isHovered) {
      fill("#8f3b56");
      textStyle(BOLD);
    } else if (isClicked) {
      fill("#333");
      textStyle(BOLD);
    } else {
      fill(0);
      textStyle(NORMAL);
    }

    // Disegna tutto il testo
    textFont(customFont, isHovered || isClicked ? 700 : 400);
    textSize(24);
    text(fullText, startX, y);

    // Sottolineatura su hover → copre tutta la voce
    if (isHovered) {
      const underlineY = y + 22; // posizione sotto la riga
      const underlineW = textWidth(fullText);
      stroke("#8f3b56");
      strokeWeight(1.6);
      line(startX, underlineY, startX + underlineW, underlineY);
      noStroke();
    }
  }

  pop();
}


