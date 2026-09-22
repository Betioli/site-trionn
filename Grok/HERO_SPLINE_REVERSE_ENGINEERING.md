# MONTABOX HERO — Brief de engenharia reversa (Spline → Three.js / R3F)

**Destinatário:** Claude (Fable) e qualquer IA que for implementar.  
**Autor da análise:** Grok (sessão 21/09/2026).  
**Objetivo:** chegar a **~80% do look** da cena Spline *Cursor follow animation* (SLD Agency) **sem** embed do Spline, **sem** câmera interativa do Spline, **sem** comprar a biblioteca de assets.  
**Escopo:** apenas o Hero (`components/Hero.jsx` no projeto Montabox). Não alterar About, WorkAndServices, FAQ, Footer, SmoothScroll.

---

## 0. Leia isto primeiro (regras para a IA implementadora)

1. Este documento é o ponto de verdade desta etapa. Não inventar um “blur overlay” CSS para simular o metal. A cor vem **dos cubos**.
2. Não reintroduzir vinheta azul nos cantos. Já foi identificada como falso-positivo de “luz”.
3. Não embutir `@splinetool/react-spline` nesta etapa. Runtime pesado, watermark, câmera e dependência externa.
4. Não “refatorar o Hero inteiro” se um passo menor resolver. Ordem na **Seção 7** é obrigatória. Não pular A para ir a E.
5. `MeshMatcapMaterial` **não consome luzes da cena**. Se o plano pede point light / directional, o material **precisa** de um termo de lighting no fragment **ou** troca para Standard/Physical. Sem isso o CursorLight é teatro.
6. Não copiar textos, logo, verde-limão da SLD para o site da Montabox. Só **linguagem visual da parede de cubos** (material, profundidade, cursor). UI Montabox permanece (título, CTA, tipografia Ivy/Neue Haas).
7. Assets pagos do Spline **não existem para download**. Os **valores numéricos** já foram extraídos dos prints e do `.splinecode`. O matcap `matcap_roughness_3` **já foi extraído** do binário (legalmente o arquivo está no `.splinecode` que o usuário possui).
8. Depois de cada passo: conferir visualmente contra a print de referência. Critérios na Seção 8.

---

## 1. Fontes (o que existe de verdade)

### 1.1 Cena original

| Item | Valor |
|------|--------|
| Nome | Cursor follow animation |
| Editor | `https://app.spline.design/file/59f2f5a4-9d96-4e62-8e16-333093abf803` |
| Preview | `https://my.spline.design/cursorfollowanimation-ariLrys4ED0uiU1nSjlvHN3X/` |
| Prod | `https://prod.spline.design/6IAMS3eFa7BPGUJw/scene.splinecode` |
| Repo de extração | `Betioli/site-trionn` → pasta `Spline/` |

### 1.2 Arquivos no repo `site-trionn/Spline`

```
Spline/
├── code.txt
├── cursor_follow_animation.gltf      (~2 MB, THREE.GLTFExporter)
├── cursor_follow_animation.spline
├── scene (1).splinecode
├── image/                            # prints das configs SLD
│   ├── Cursor follow animation@1-1920x911.jpg   ← REFERÊNCIA VISUAL OBRIGATÓRIA
│   ├── Assets.png
│   ├── Wall material(fresnel70-noise40-matcap100-lightning100-color888888).png
│   ├── Aluminium roughness 01 prata (matcap100-lightning100-colorB8B8B8).png
│   ├── Aluminium roughness 01 preto(matcap100-lightning100-color616161).png
│   └── Metal Noise 04(noise40-matcap100-lightning100-colorADAEB1).png
└── image -montabox/                  # matcaps para tintar Montabox
    ├── matcap-steel verde.png
    ├── matcap_reflection branco 1.png
    ├── matcap_reflection prata 1..4.png
    └── matcap_reflection preto 1.png
```

### 1.3 Print de referência (o “original”)

Arquivo: `Spline/image/Cursor follow animation@1-1920x911.jpg`

O que a foto mostra (observação direta, não suposição):

- Parede densa de cubos pretos/carvão, **não** ladrilho plano.
- Faces com **volume metálico fosco**: highlight suave, não contorno branco de filete.
- Variação de Z: cubos à frente e atrás, sombras entre blocos.
- Esquerda um pouco mais clara (luz + profundidade).
- Centro mais fundo/escuro (texto da SLD senta nisso).
- Direita com volume, alguns cubos “saltando”.
- Texto SLD verde-limão (NÃO replicar cor de UI na Montabox).
- Um cubo isolado à direita com faixa verde (efeito do **point light no cursor**, não material pintado).

### 1.4 Print do Hero Montabox atual (21/09/2026)

O que a foto mostra:

- Grade regular, quase isométrica/front-on.
- Cubos **pretos uniformes**.
- **Arestas brancas finas** (chanfro RoundedBox pegando o matcap nas bordas).
- Pouca diferença de Z percebida.
- Sem “poças” de metal cinza; parece azulejo com rejunte luminoso.
- Cursor/point light **não pinta** a parede.

Diagnóstico em uma frase: **estamos vendo geometria + filete, não o Wall material do Spline.**

---

## 2. O que o GLTF revelou (números, não feeling)

Export: `cursor_follow_animation.gltf` (THREE.GLTFExporter).  
**Limitação:** 0 materials no GLTF. Material real vive no `.spline` / editor. Use os prints de Assets para a pilha.

### 2.1 Câmera

- Tipo: **orthographic** (Montabox já usa ortho — manter).
- Camera 1: `xmag ≈ 7.69`, `ymag ≈ 4.83`
- Camera 2: `xmag ≈ 14.44`, `ymag ≈ 9.07`
- Hero atual: `zoom: 80`, `position: [0, 0, 100]` — escala de mundo diferente; **não copiar xmag cegamente**. Recalibrar só se a densidade da grade destoar.

### 2.2 Parede (`Wall`)

- ~**901 instâncias** do mesmo `CubeGeometry` (mesh 12).
- Nome do objeto: `Wall`.
- Z no export Spline: **0.00 → 57.81** (média ~31.6, stdev ~10.5).
- Hero atual: Z = `-0.9 + rng()*1.8` → amplitude **~1.8**.  
  **Isso é uma ordem de grandeza menor** que o original (relativo ao tamanho do cubo no Spline). É uma das razões da parede parecer plana.

### 2.3 Hierarquia relevante

```
Scene 1
├── Camera
├── Content          (textos H1/H2, CTAs — no Montabox isso é HTML, ignorar)
├── Cursor
│   ├── Point Light     ← FILHA DO CURSOR
│   └── Ellipse         (gizmo visual do cursor)
├── Wall                (901 cubos)
├── Directional Light
└── Default Ambient Light
```

### 2.4 Luzes extraídas (`KHR_lights_punctual`)

| Luz | Tipo | Cor RGB | Hex aprox. | Intensity | Notas |
|-----|------|---------|------------|-----------|--------|
| Point Light | point | `(0.765, 1.0, 0.0)` | `#c3ff00` | **5.7177** | range 2000 (unidades Spline). No Cursor. |
| Directional Light | directional | `(0.708, 0.708, 0.708)` | `#b4b4b4` | **3.946** | matriz com direção ~`(-10, 14, 16)` no Hero foi uma aproximação razoável |
| Ambient | default | — | — | fraca | Hero usa `0.45` `#222830` — um pouco azulada; preferir cinza neutro |

**Conclusão crítica:** o glow verde da SLD **não é matcap nos cubos**. É **point light presa ao cursor**.  
No Three.js isso **só aparece** se o material responder a luz. Matcap puro ignora.

---

## 3. A pilha de material do Spline (Assets) — o núcleo

O painel Assets lista **4 Material Assets**. A parede usa **Wall material**. Os outros são variantes da biblioteca, **não** 4 materiais diferentes por cubo.

### 3.1 Wall material (RECEITA PRINCIPAL)

Print: `Wall material(fresnel70-noise40-matcap100-lightning100-color888888).png`

Preview da esfera: metal **azul-petróleo / carvão**, highlight suave, borda fresnel.

| Camada | Valor | Significado operacional |
|--------|-------|-------------------------|
| Color | `#888888` @ 100 | Albedo cinza médio. **Não é preto `#080808`**. O preto visual vem do matcap escuro × lighting. |
| Matcap | 100 | Reflexo baked. Identificado no binário como **`matcap_roughness_3`** (JPEG 1024×1024 extraído do `.splinecode`). |
| Noise | 40 | Microvariação de luminância (grain / metal noise). |
| Fresnel | 70 | Anel nas faces rasantes. Alto. Sem isso a aresta some ou vira filete do RoundedBox. |
| Lighting | 100 | Material **responde à cena**. |

Modelo mental (de baixo para cima):

```
Color #888888
    ×  Matcap roughness_3 @ 100%
    ×  Noise @ 40%          (modula grain, não troca a cor base)
    +  Fresnel @ 70%        (add nas bordas)
    ×  Lighting @ 100%      (directional + point do cursor)
```

### 3.2 Metal Noise 04 (variante, não a parede)

Noise 40 · Matcap 100 · Lighting 100 · Color `#ADAEB1`.  
Esfera mais cinza-clara, menos “noite”. **Não usar como default da parede.** Pode inspirar o termo de noise.

### 3.3 Aluminium Roughness 01 — prata

Matcap 100 · Lighting 100 · Color `#B8B8B8`.  
Cromo fosco. **Não é a parede.** Útil se um subconjunto de cubos “altos” precisar de lift metálico sutil — opcional, passo tardio.

### 3.4 Aluminium Roughness 01 — preto

Matcap 100 · Lighting 100 · Color `#616161`.  
Mais próximo da parede que a prata, **mas sem Fresnel/Noise do Wall**. Inferior ao Wall stack.

### 3.5 Matcap extraído: `matcap_roughness_3`

- Origem: JPEG embutido em `scene (1).splinecode` após a string `matcap_roughness_3`.
- 1024×1024 RGB, ~14 KB.
- Visual: fundo preto, blob branco suave à esquerda, arco de rim-light à direita, base cinza. **Matcap de metal fosco escuro.**
- Nome no editor Spline: `matcap_roughness_3` (não `matcap_spline_roughness_3.jpg` como arquivo solto).

**Este é o matcap da parede.** Os PNG `matcap_reflection prata/preto` da pasta montabox são substitutos; o extraído é o match mais próximo do original.

---

## 4. Diagnóstico do Hero Montabox atual (código)

Arquivo: `components/Hero.jsx` (versão colada em 21/09/2026).

### 4.1 O que já está certo (não desfazer)

- Canvas orthographic, `frameloop` condicional, `dpr [1, 1.5]`.
- Grade instanciada (cols/rows a partir do viewport + STEP).
- Seed RNG estável (`SEED = 7331`).
- Offset XY mínimo, rotação mínima.
- CursorTracker + objeto mutável `cursorWorldPos`.
- Point light no cursor com cor/intensity do Spline (`#c3ff00`, 5.72).
- Directional extraída (~3.95).
- IntersectionObserver para pausar fora da viewport.
- UI Montabox (título, CTA, selos) em HTML overlay.

### 4.2 O que está errado (causa → efeito)

| # | No código | Efeito na tela |
|---|-----------|----------------|
| 1 | `MeshMatcapMaterial` + `onBeforeCompile` que **não lê lights** | Directional e PointLight não pintam cubos |
| 2 | Matcaps: `matcap_reflection prata 1` + `preto 1`, mix por `splash` | Look “prata/preto manchado”, não Wall `#888` + roughness_3 |
| 3 | `baseColor = #ffffff` | Matcap em branco estoura highlight; Spline usa `#888` |
| 4 | `uFresnelStrength = 0.42` vs Spline 70 | Fresnel fraco; aresta vem do **chanfro**, não do material |
| 5 | `RoundedBoxGeometry(..., 4, 0.04)` | Filete branco contínuo = “grade de azulejo” |
| 6 | Splash: `centerSplash` elipse no centro + `rightFalloff` | Mancha central, **não** a leitura da SLD (luz + Z) |
| 7 | Z = `-0.9 + rng()*1.8` | Parede plana |
| 8 | 32 variantes de material com `splashStrength` | Complexidade alta, ganho visual baixo; `customProgramCacheKey` **igual para todos** (`"spline-wall-material-v2"`) — o uniform `uSplashStrength` pode colidir no cache do programa |
| 9 | `ambientLight` `#222830` | Cast azul-petróleo |
| 10 | Lift de cursor `* 1.8` em Z | Se funcionar, explode a grade; se material ignora luz, o lift é o único feedback e parece “buraco” |
| 11 | `GlowCursor` (plane com glow texture) **e** PointLight juntos | Dois sistemas de cursor; glow 2D compete com o 3D |
| 12 | Vinheta radial preta 45% nas bordas | Escurece o metal que já é escuro |

### 4.3 Bug técnico extra (cache de shader)

```js
mat.customProgramCacheKey = () => "spline-wall-material-v2";
```

Todas as 32 variantes compartilham a **mesma** cache key. O `uSplashStrength` pode ficar preso no valor da primeira variante compilada. Resultado: parede uniforme mesmo com índices diferentes.  
**Ação:** cache key deve incluir o índice (`spline-wall-v3-${index}`) **ou** um único material + atributo/uniform por instância.

### 4.4 Coordenadas do cursor vs câmera

`CursorTracker` usa `zoomLevel = 50`. Canvas usa `camera.zoom = 80`.  
World position do cursor **não bate** com a grade. Point light e lift ficam deslocados.  
**Ação:** derivar world pos da própria câmera R3F (`viewport` / `camera.zoom`), nunca hardcode 50.

---

## 5. O que NÃO é o problema

- Não falta “mais blur CSS”.
- Não falta a cor verde da SLD na UI.
- Não falta cloner do Spline (901 cubos vs ~viewport grid é suficiente se Z e material estiverem certos).
- Não precisa Theatre.js / Spline runtime.
- Não precisa comprar Material Library: os **números** já estão nos prints.

---

## 6. Target visual dos 80% (definição de pronto)

Considera **80% atingido** quando, lado a lado com `Cursor follow animation@1-1920x911.jpg`:

1. Cubos leem como **metal carvão**, não azulejo com filete branco.
2. Highlight vem de **matcap + fresnel**, não da geometria arredondada.
3. Há **profundidade** (cubos na frente/atrás, frestas escuras).
4. A parede **não** é uniforme: variação sutil por noise + Z, sem mancha radial óbvia no centro.
5. Mover o mouse **tinta** cubos próximos (verde-limão discreto **ou** lift de metal — calibrar para não virar neon).
6. Texto Montabox continua legível (centro pode ser um pouco mais escuro, sem “buraco” preto).
7. 60fps desktop; mobile com `dpr` limitado e, se preciso, menos cubos animados.

**Fora dos 80% (não bloquear):** clone pixel-perfect do cloner Spline, AO/shadow internos do runtime, watermark, câmera orbit, textos 3D da SLD.

---

## 7. Plano passo a passo (obrigatório nesta ordem)

Cada passo é um commit mental separado. Só avançar se o critério do passo passar.

---

### PASSO A — Matcap certo + albedo `#888` (maior ganho / menor risco)

**Por quê:** hoje o look nasce do matcap errado × branco.

**Fazer:**

1. Copiar o JPEG extraído para o app Montabox:
   - destino sugerido: `public/images/matcap_roughness_3.jpg`
2. `useLoader` **só deste** arquivo no Hero (remover prata/preto do mix nesta etapa).
3. `texture.colorSpace = THREE.SRGBColorSpace`.
4. Material:

```js
new THREE.MeshMatcapMaterial({
  matcap: roughness3,
  color: new THREE.Color("#888888"),
});
```

5. Remover temporariamente o `onBeforeCompile` (voltar no Passo C). Um material compartilhado para todos os cubos.
6. Manter RoundedBox por enquanto (muda no B).

**Não fazer:** 32 variantes, splash, dual matcap.

**Critério:** parede cinza-metálica fosca, não preto chapado nem aço azul. Ainda pode ter filete do chanfro — ok.

---

### PASSO B — Matar o filete branco (geometria)

**Por quê:** radius 0.04 + 4 segments cria o “rejunte luminoso” da print atual.

**Fazer (escolher UMA, testar):**

- **B1 (preferida):** `RoundedBoxGeometry(1, 1, 1, 2, 0.012)` — chanfro mínimo, como metal usinado.
- **B2:** voltar a `BoxGeometry` puro se B1 ainda filetar.

**Critério:** arestas deixam de ser linhas brancas contínuas. Volume vem do matcap nas faces, não do canto.

---

### PASSO C — Empilhar Fresnel 70 + Noise 40 no shader (Wall stack)

**Por quê:** é exatamente o print do Wall material.

Reintroduzir `onBeforeCompile` em **um** material compartilhado (não 32).

Uniforms:

| Uniform | Valor inicial | Origem Spline |
|---------|---------------|---------------|
| `uNoiseStrength` | `0.40` | Noise 40 |
| `uFresnelStrength` | `0.70` | Fresnel 70 |
| (albedo já está em `color` `#888888`) | | Color 100 |

Shader (contrato, não copiar cego se o chunk do three mudar de versão):

1. Varying `vCubeLocalPosition = position` no vertex.
2. No fragment, **depois** do matcap já escrito em `gl_FragColor`:
   - `grain = hash(vCubeLocalPosition * 8.0)` → `mix(1-0.28*n, 1+0.28*n, grain)` (noise 40).
   - `fresnel = pow(1.0 - saturate(dot(N, V)), 2.0) * 0.70`.
   - `gl_FragColor.rgb *= grainFactor;`
   - `gl_FragColor.rgb += vec3(fresnel * 0.12);` — add curto, não substitui o metal.
3. `customProgramCacheKey = () => "wall-stack-v1"` (uma key só, um material).

**Não** misturar segundo matcap preto neste passo.

**Critério:** bordas com glow metálico suave; grain visível de perto; sem “neve” de noise.

---

### PASSO D — Profundidade Z (o que faz a SLD não ser plana)

**Por quê:** GLTF Z stdev ~10 numa malha cujo cubo no Spline é grande; no Hero o cubo é size 1. Normalizar por **tamanho do cubo**, não copiar 0–58.

**Fazer:**

```js
// amplitude em unidades de CUBO, não unidades Spline
const z = (rng() - 0.5) * 2.4; // testar 2.0–3.2
```

Opcional: bias para “ondas” lentas (value noise 6×4) para não parecer estático-random.

**Critério:** frestas escuras entre cubos da frente e de trás. Ainda ortho, mas a parede “respira”.

---

### PASSO E — Lighting de verdade (senão o cursor nunca pinta)

**Por quê:** Spline Lighting = 100. Matcap ignora `pointLight` / `directionalLight`.

**Caminho recomendado (híbrido, não abandonar o matcap):**

No mesmo `onBeforeCompile`, **somar** um termo Lambert/Blinn das luzes da cena.

Implementação prática no R3F/three r160+:

- Usar `MeshStandardMaterial` com `roughness: 0.82`, `metalness: 0.55`, `color: #888888`, `envMapIntensity` baixo **e** `matcap` não existe no Standard.
- **OU** permanecer em Matcap e injetar:

```glsl
// após wall stack
vec3 lightDir = normalize(vec3(-10.0, 14.0, 16.0)); // mesma da directional
float ndl = saturate(dot(normal, lightDir));
gl_FragColor.rgb *= mix(0.55, 1.08, ndl); // “Lighting 100” comprimido

// point light do cursor — passar uniform uCursorPos, uCursorIntensity
vec3 toL = uCursorPos - vWorldPosition;
float dist = length(toL);
float atten = uCursorIntensity / (1.0 + dist * dist * 0.08);
float ndlC = saturate(dot(normal, normalize(toL)));
gl_FragColor.rgb += vec3(0.765, 1.0, 0.0) * ndlC * atten * 0.35;
```

Uniforms do cursor atualizados no `useFrame` a partir de `cursorWorldPos` (já existe).

**Corrigir zoom do tracker:** usar `camera.zoom` real (80), não 50.

**Ambient:** `#1a1a1a` ou `#222` intensity `0.25–0.35`. Tirar `#222830`.

**PointLight JSX:** pode ficar para meshes Standard; se o termo for no shader, o `<pointLight>` vira redundante — **não manter os dois no máximo**. Escolher shader-uniform **ou** Standard+lights.

**Critério:** mouse sobre a parede muda o metal (verde discreto + faces mais claras). Sem o mouse, directional ainda modela volume.

---

### PASSO F — Cursor: um sistema só

**Fazer:**

1. Escolher **shader point** (Passo E) como fonte da cor.
2. `GlowCursor` (plane 2D): reduzir opacity **ou** remover se duplicar.
3. Lift em Z: `lift = (1 - dist/R) * 0.35 * active` — não 1.8.
4. Raio mundo: `R ≈ 3.5–4.5` (já próximo).

**Critério:** um único “blob” de influência, sem glow 2D + cubos verdes + lift exagerado.

---

### PASSO G — Variação entre cubos SEM splash radial

**Por quê:** a SLD não tem elipse no centro. A variação é Z + noise + ângulo.

**Fazer:**

- Remover `centerSplash`, `rightFalloff`, `topLeftLift` como drivers de material.
- Opcional sutil: `albedo *= 0.85 + 0.15 * grainBroad` (máx 15% de diferença).
- Escurecer **levemente** a zona do título (`nx 0.15–0.45`, `ny 0.35–0.65`) **só** se o texto perder contraste — `* 0.9`, não um buraco.

**Não** voltar ao triângulo invertido de “cores pintadas” desta fase. Aquilo era um mal-entendido (blur vs cubos). A leitura da SLD nasce de **luz + Z + fresnel**.

**Critério:** parede viva, sem mancha óbvia de Photoshop.

---

### PASSO H — Performance e mobile

- Um material, uma geometria, instancing se o count estourar (opcional: `InstancedMesh` — só se FPS < 50).
- `animCount` 20% ok; amplitude de flutuação `0.12–0.18` (hoje 0.2–0.4 pode ser agitada demais vs SLD).
- `prefers-reduced-motion` já existe — manter.
- Se 900+ meshes doerem: `InstancedMesh` + `instanceColor` para grain.

**Critério:** 60fps 1080p; mobile não dropar o Hero.

---

## 8. Checklist de verificação (repetir a cada passo)

- [ ] Hero ainda ocupa `h-dvh`, UI Montabox intacta.
- [ ] Nenhum overlay azul de canto.
- [ ] Console sem erro de shader (`onBeforeCompile` quebrado = tela preta nos cubos).
- [ ] Comparar screenshot desktop com `Cursor follow animation@1-1920x911.jpg`.
- [ ] Mouse: influência visível e localizada.
- [ ] Outras seções do site inalteradas.
- [ ] `npm run build` passa.

---

## 9. Mapa de constantes (copiar, não reinventar)

```js
// Material Wall
const WALL_COLOR = "#888888";
const FRESNEL = 0.70;
const NOISE = 0.40;
const MATCAP_PATH = "/images/matcap_roughness_3.jpg";

// Lights (Spline)
const DIR_COLOR = "#b4b4b4";
const DIR_INTENSITY = 3.95;
const DIR_POS = [-10, 14, 16]; // aproximação da matriz extraída
const POINT_COLOR = "#c3ff00";
const POINT_INTENSITY = 5.72;

const AMBIENT_COLOR = "#1a1a1a";
const AMBIENT_INTENSITY = 0.30;

// Grade
const CUBE_SIZE = 1.0;
const GAP = 0.05;
const ROUNDED_RADIUS = 0.012; // Passo B
const Z_AMP = 2.4;            // Passo D — calibrar

// Cursor
const CURSOR_RADIUS = 4.0;
const CURSOR_LIFT = 0.35;
```

---

## 10. Ordem de arquivos a tocar (Montabox)

| Arquivo | Ação |
|---------|------|
| `public/images/matcap_roughness_3.jpg` | **Criar** (JPEG extraído do splinecode) |
| `components/Hero.jsx` | Passos A–H |
| `components/GlowCursor.jsx` | Só no Passo F (reduzir/remover) |
| Qualquer outro | **Não tocar** |

---

## 11. Anti-padrões (se a IA estiver tentada)

| Tentação | Por que falha |
|----------|----------------|
| Overlay radial CSS “luz” | Não é o original; já foi rejeitado |
| Dual matcap prata/preto por splash | Não é Wall material |
| `color: #ffffff` no matcap | Estoura; Spline usa `#888` |
| Intensificar directional em Matcap puro | Luz não entra |
| Copiar Z 0–58 do GLTF literal | Escala Spline ≠ cubo size 1 |
| 32 materiais com mesma cache key | Uniform preso |
| PointLight + GlowCursor + lift 1.8 | Três cursores |
| Embed Spline “só para conferir” | Peso, watermark, câmera, fora de escopo |
| Verde-limão no título Montabox | Brand SLD, não Montabox |

---

## 12. Expectativa honesta (para o Fable / William)

| Faixa | O que cobre |
|-------|-------------|
| **Passos A+B** | ~40–50% — metal certo, some o azulejo |
| **+C+D** | ~65–70% — fresnel, grain, profundidade |
| **+E+F+G** | **~80%** — luz, cursor, variação viva |
| 100% | Runtime Spline (cloner, AO interno, assets pagos, câmera) — **fora** |

Se A+B não mudarem a print de forma óbvia, **parar** e verificar: (1) o JPG do matcap está servindo, (2) colorSpace sRGB, (3) material realmente aplicado no mesh, (4) não há segundo material/lineSegments escondido.

O Hero atual **removeu** `lineSegments`/edges — bom. Não recolocá-los.

---

## 13. Perguntas em aberto (não decidir sozinho se for ambíguo)

1. O verde do cursor Montabox deve ser `#c3ff00` (fiel Spline) ou um cinza/branco (mais “vidraçaria”)? **Sugestão:** `#c3ff00` em intensity baixa no metal (0.35 no shader); se o William achar propaganda, dessaturar.
2. InstancedMesh agora ou só se FPS cair? **Sugestão:** depois de E, medir.
3. GlowCursor 2D: matar ou opacity 0.3? **Sugestão:** matar no F se o shader point estiver visível.

---

## 14. Apêndice — extração do matcap (já feita)

Do `scene (1).splinecode`:

- String `matcap_roughness_3`
- JPEG magia `FF D8 FF` ~37–667 bytes depois do nome
- EOI `FF D9`
- Arquivo extraído: 1024×1024, ~13925 bytes

Se o arquivo se perder, repetir extração no binário. **Não** substituir por um matcap genérico da internet sem o William ver.

---

## 15. Apêndice — Hero atual (âncoras para diff)

Trechos que o implementador deve **substituir**, não “melhorar em volta”:

- `useLoader` dos dois matcaps prata/preto
- `MATERIAL_VARIANTS = 32` e o loop `gradientMats`
- `onBeforeCompile` atual (splash mix 0.58 para blackMetal)
- `centerSplash` / `rightFalloff` / `topLeftLift`
- `RoundedBoxGeometry(..., 4, 0.04)`
- `z = -0.9 + rng() * 1.8`
- `zoomLevel = 50` no CursorTracker
- `lift * 1.8`
- `ambientLight` `#222830` 0.45
- Vinheta radial 45% (pode ficar mais suave **depois** do metal existir; agora ela esconde o problema)

---

*Fim do brief. Implementar na ordem A → H. Qualquer desvio documentar numa nota no topo deste arquivo.*
