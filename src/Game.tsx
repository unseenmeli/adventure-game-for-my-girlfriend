import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import Notebook from "./Notebook";
import Notebook1 from "./Notebook1";
import Notebook2 from "./Notebook2";

declare global {
  interface Window {
    isDoorInputOpen?: boolean;
    isDoorUnlocked?: boolean;
    currentGameState?: any;
  }
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isNotebook1Open, setIsNotebook1Open] = useState(false);
  const [isNotebook2Open, setIsNotebook2Open] = useState(false);
  const [, setIsDoorUnlocked] = useState(false);
  const [showDoorInput, setShowDoorInput] = useState(false);
  const [doorInputValue, setDoorInputValue] = useState("");
  const [doorError, setDoorError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!canvasRef.current || gameInstanceRef.current) return;

      const k = kaboom({
        canvas: canvasRef.current,
        width: 800,
        height: 600,
        background: [135, 206, 235],
        global: false,
        crisp: true,
      });

      gameInstanceRef.current = k;
      const TILE_SIZE = 32;

      k.loadSprite("shmariam-idle1", "/shmariam-idle1.png");
      k.loadSprite("shmariam-idle2", "/shmariam-idle2.png");
      k.loadSprite("shmariam-walk1", "/shmariam-walk1.png");
      k.loadSprite("shmariam-walk2", "/shmariam-walk2.png");
      k.loadSprite("flower", "/flower.png");
      k.loadSprite("tree", "/tree.png");
      k.loadSprite("grass1", "/grass1.png");
      k.loadSprite("grass1-1", "/grass1-1.jpg");
      k.loadSprite("grass2", "/grass2.png");
      k.loadSprite("grass3", "/grass3.png");
      k.loadSprite("grass4", "/grass4.png");
      k.loadSprite("grass5", "/grass5.png");
      k.loadSprite("grass-particles1", "/grass-particles1.png");
      k.loadSprite("little-rocks1", "/little-rocks1.png");
      k.loadSprite("randomplant1", "/randomplant1.png");
      k.loadSprite("rock1", "/rock1.png");
      k.loadSprite("bush1", "/bush1.png");
      k.loadSprite("plump", "/plump.png");

      let gameState: any = {
        hasFlower: false,
        currentScene: 1,
        teleportCooldown: false,
        fromScene: undefined,
        openNotebook: () => setIsNotebookOpen(true),
        openNotebook1: () => setIsNotebook1Open(true),
        openNotebook2: () => setIsNotebook2Open(true),
        isDoorUnlocked: window.isDoorUnlocked || false,
        openDoorInput: () => {
          setShowDoorInput(true);
          window.isDoorInputOpen = true;
        },
      };

      const createGrassBackground = () => {
        const GRASS_TILE_SIZE = 16;
        for (let x = -2; x <= 52; x++) {
          for (let y = -2; y <= 40; y++) {
            const r = Math.random();
            const grassType = r < 0.3 ? "grass2" : r < 0.55 ? "grass3" : r < 0.75 ? "grass4" : r < 0.93 ? "grass5" : Math.random() > 0.5 ? "grass1" : "grass1-1";
            k.add([k.sprite(grassType), k.pos(x * GRASS_TILE_SIZE, y * GRASS_TILE_SIZE), k.scale(1), k.z(0)]);
          }
        }
      };

      const addDecorations = () => {
        for (let i = 0; i < 20; i++) {
          if (Math.random() < 0.7) {
            const decorType = Math.random();
            let sprite;
            if (decorType < 0.35) sprite = "little-rocks1";
            else if (decorType < 0.6) sprite = "rock1";
            else sprite = "randomplant1";
            k.add([
              k.sprite(sprite),
              k.pos(Math.random() * 750, Math.random() * 550),
              k.z(2),
            ]);
          }
        }
        for (let i = 0; i < 15; i++) {
          if (Math.random() < 0.5) {
            k.add([
              k.sprite("grass-particles1"),
              k.pos(Math.random() * 800, Math.random() * 600),
              k.z(3),
              k.opacity(0.8),
            ]);
          }
        }
      };

      const addBushes = (count: number) => {
        for (let i = 0; i < count; i++) {
          k.add([k.sprite("bush1"), k.pos(Math.random() * 700 + 50, Math.random() * 500 + 50), k.scale(0.8 + Math.random() * 0.3), k.z(9)]);
        }
      };
      
      const addRect = (x:number,y:number,w:number,h:number,col:any,op:number,z:number,tag?:string) => {
        const props: any[] = [k.rect(w*TILE_SIZE,h*TILE_SIZE),k.pos(x*TILE_SIZE,y*TILE_SIZE),k.color(...col),k.opacity(op),k.z(z)];
        if(tag) props.push(tag);
        return k.add(props as any);
      };
      
      const addBoundary = (x:number,y:number,w:number,h:number) => {
        k.add([k.rect(w*TILE_SIZE,h*TILE_SIZE),k.pos(x*TILE_SIZE,y*TILE_SIZE),k.color(0,0,255),k.opacity(0),k.area(),k.body({isStatic:true}),k.z(48),"boundary"]);
      };

      const getEdgeTrees = () => [
        ...Array.from({length: 10}, (_, i) => [-2.5 + (i%2)*1.5, -3 + i*2]),
        ...Array.from({length: 10}, (_, i) => [19 + (i%3), -3 + i*2]),
      ];
      
      const addTrees = (positions: number[][]) => {
        positions.forEach(([x, y]) => {
          k.add([
            k.sprite("tree"),
            k.pos(x * TILE_SIZE, y * TILE_SIZE),
            k.scale(1.5),
            k.area({
              shape: new k.Rect(k.vec2(0, 0), TILE_SIZE * 0.3, TILE_SIZE * 0.2),
              offset: k.vec2(TILE_SIZE * 0.35, TILE_SIZE * 1.2),
            }),
            k.z(10),
            "tree",
          ]);
        });
      };

      k.scene("scene1", () => {
        createGrassBackground();
        addDecorations();

        const bushPositions = [
          [5, 6],
          [8, 12],
          [15, 4],
          [20, 9],
          [4, 14],
          [18, 11],
        ];
        bushPositions.forEach(([x, y]) => {
          k.add([
            k.sprite("bush1"),
            k.pos(x * TILE_SIZE, y * TILE_SIZE),
            k.scale(1.2),
            k.area(),
            k.z(9),
          ]);
        });

        const treePositions = [
          ...getEdgeTrees(),
          ...[3,1,5,2,15,1,17,2,6,0,8,1,10,0,12,1,14,0,4,3,7,3,11,2,13,3,16,3,9,2,10,3,2,5,4,6,17,5,18,6,6,5,14,5,3,12,5,13,16,12,18,13,2,15,4,16,15,15,17,16,7,7,15,7,8,14,12,14].reduce((a,v,i,arr) => i%2 ? [...a,[arr[i-1],v]] : a, [] as number[][])
        ];
        addTrees(treePositions);

        treePositions.forEach(([x, y]) => {
          if (Math.random() < 0.3) {
            const bushOffsets = [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ];
            const offset =
              bushOffsets[Math.floor(Math.random() * bushOffsets.length)];
            const bushX = x + offset[0];
            const bushY = y + offset[1];
            if (bushX >= 0 && bushX <= 24 && bushY > 0 && bushY < 18) {
              k.add([
                k.sprite("bush1"),
                k.pos(bushX * TILE_SIZE, bushY * TILE_SIZE),
                k.scale(0.8 + Math.random() * 0.4),
                k.area(),
                k.z(9),
              ]);
            }
          }
        });

        addBushes(15);

        if (!gameState.hasFlower) {
          k.add([
            k.sprite("flower"),
            k.pos(14 * TILE_SIZE, 8 * TILE_SIZE),
            k.scale(1.5),
            k.area({
              shape: new k.Rect(k.vec2(0, 0), 4, 4),
              offset: k.vec2(0, 0),
            }),
            k.anchor("center"),
            k.z(15),
            "collectible-flower",
          ]);

            k.add([
            k.circle(25),
            k.pos(14 * TILE_SIZE, 8 * TILE_SIZE),
            k.outline(1, k.rgb(255, 255, 255)),
            k.opacity(0.3),
            k.anchor("center"),
            k.z(14),
            "flower-circle",
          ]);

          k.add([
            k.text("Pick up the flower!", { size: 24 }),
            k.pos(k.width() / 2, 30),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
            "flower-instruction",
          ]);
        }

        const walkablePath = [
          { x: 3, y: 0, w: 2, h: 1 },
          { x: 5, y: 0.5, w: 3, h: 0.5 },
          { x: 4, y: 1, w: 4, h: 1 },
          { x: 8, y: 0, w: 2, h: 2 },
          { x: 10, y: 0.5, w: 3, h: 1.5 },
          { x: 13, y: 0, w: 2, h: 2 },
          { x: 15, y: 1, w: 3, h: 1 },
          { x: 17, y: 0, w: 4, h: 2.5 },
          { x: 18, y: 2, w: 2, h: 1 },

          { x: 3, y: 2, w: 1.5, h: 2 },
          { x: 3.5, y: 4, w: 1, h: 1 },
          { x: 3, y: 5, w: 1.5, h: 2 },
          { x: 3.5, y: 7, w: 1, h: 1 },
          { x: 3, y: 8, w: 2, h: 1.5 },
          { x: 4, y: 9, w: 1.5, h: 1 },

          { x: 9, y: 6, w: 2, h: 1 },
          { x: 10, y: 7, w: 6, h: 3 },
          { x: 11, y: 6.5, w: 4, h: 0.5 },
          { x: 12, y: 10, w: 3, h: 0.5 },
          { x: 16, y: 7.5, w: 1, h: 2 },

          { x: 4, y: 10, w: 3, h: 1.5 },
          { x: 5, y: 11, w: 4, h: 2 },
          { x: 7, y: 10.5, w: 2, h: 3 },
          { x: 9, y: 11, w: 3, h: 2.5 },
          { x: 11, y: 10.5, w: 4, h: 3 },
          { x: 14, y: 11, w: 3, h: 2.5 },
          { x: 16, y: 10.5, w: 3, h: 2 },
          { x: 18, y: 11.5, w: 2, h: 2 },
          { x: 19, y: 12, w: 1.5, h: 1.5 },

          { x: 8, y: 13.5, w: 2, h: 1 },
          { x: 9, y: 14, w: 4, h: 1 },
          { x: 10, y: 14.5, w: 3, h: 0.5 },
          { x: 12, y: 14, w: 3, h: 1.5 },
          { x: 14, y: 14.5, w: 2, h: 1 },
          { x: 15, y: 15, w: 3, h: 0.5 },
          { x: 11, y: 15, w: 4, h: 1 },
          { x: 9, y: 15.5, w: 2, h: 0.5 },

          { x: 4.5, y: 3.5, w: 0.5, h: 0.5 },
          { x: 5.5, y: 9.5, w: 0.5, h: 0.5 },
          { x: 8.5, y: 6.5, w: 0.5, h: 0.5 },
          { x: 15.5, y: 9.5, w: 0.5, h: 0.5 },
        ];

        walkablePath.forEach(p => addRect(p.x,p.y,p.w,p.h,[255,0,0],0,49,"walkable"));

        const allBoundaries = [
          { x: -2, y: -5, w: 30, h: 5 },

          { x: -2, y: -2, w: 5, h: 2 },
          { x: -2, y: 0, w: 3, h: 20 },
          { x: 0, y: 0, w: 3, h: 30 },
          { x: 0, y: 5, w: 3, h: 3 },
          { x: 0, y: 8, w: 3, h: 2 },
          { x: 0, y: 10, w: 3, h: 1 },
          { x: 0, y: 11, w: 2, h: 2 },
          { x: 0, y: 13, w: 2, h: 1 },
          { x: 0, y: 14, w: 8, h: 0 },
          { x: 0, y: 15, w: 9, h: 1 },
          { x: 0, y: 16, w: 25, h: 4 },

          { x: 21, y: -2, w: 5, h: 22 },
          { x: 20, y: 3, w: 1, h: 4 },
          { x: 17, y: 6, w: 10, h: 4 },
          { x: 19, y: 13.5, w: 2, h: 2.5 },
          { x: 18, y: 15.5, w: 3, h: 0.5 },

          { x: 5, y: 2.5, w: 3, h: 4 },
          { x: 8, y: 2, w: 2, h: 4 },
          { x: 10, y: 2, w: 3, h: 4 },
          { x: 13, y: 2, w: 2, h: 4 },
          { x: 15, y: 2, w: 2, h: 4 },
          { x: 17, y: 2.5, w: 1, h: 3.5 },

          { x: 5, y: 6, w: 4, h: 1 },
          { x: 5, y: 7, w: 5, h: 3 },
          { x: 16, y: 6, w: 4, h: 1.5 },
          { x: 17, y: 9.5, w: 3, h: 1 },

          { x: 5, y: 14, w: 2, h: 1 },
        ];

        allBoundaries.forEach(b => addBoundary(b.x,b.y,b.w,b.h));

        k.add([
          k.text("↑", { size: 48 }),
          k.pos(12.5 * TILE_SIZE, 2 * TILE_SIZE),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(15),
        ]);

        k.add([
          k.rect(TILE_SIZE * 3, 10),
          k.pos(11 * TILE_SIZE, 0),
          k.opacity(0),
          k.area(),
          "exit1",
        ]);

        const spawnPos =
          gameState.fromScene === 2 ? { x: 12.5, y: 3.5 } : undefined;
        createPlayer(k, TILE_SIZE, gameState, spawnPos);
      });

      k.scene("scene2", () => {
        createGrassBackground();
        addDecorations();

        const treePositions = [...getEdgeTrees(),...[[3,0],[8,1],[11,0],[14,1],[4,2],[9,2],[12,2],[16,2],[2,7],[3,8],[14,7],[15,8],[3,14],[5,15],[8,14],[11,15],[14,14],[17,15],[4,16],[10,16],[15,16]]];
        addTrees(treePositions);
        addBushes(10);

        const memories = [{ x: 8, y: 5, text: "Our First Date 💕" }];

        memories.forEach((memory) => {
          k.add([
            k.sprite("plump"),
            k.pos(memory.x * TILE_SIZE, memory.y * TILE_SIZE),
            k.scale(2),
            k.z(3),
          ]);
        });

        k.add([
          k.rect(24, 32),
          k.pos(12 * TILE_SIZE, 8 * TILE_SIZE),
          k.color(139, 69, 19),
          k.area(),
          k.anchor("center"),
          k.z(15),
          "notebook",
        ]);

        k.add([
          k.text("📓", { size: 20 }),
          k.pos(12 * TILE_SIZE, 8 * TILE_SIZE),
          k.anchor("center"),
          k.z(16),
        ]);

        k.add([
          k.text("Touch to read", { size: 10 }),
          k.pos(12 * TILE_SIZE, 8 * TILE_SIZE - 25),
          k.anchor("center"),
          k.color(0, 0, 0),
          k.z(16),
        ]);

        if (!gameState.isDoorUnlocked) {
          k.add([
            k.text("(სასწაული კარი)", { size: 20 }),
            k.pos(9 * TILE_SIZE, 3 * TILE_SIZE),
            k.anchor("center"),
            k.rotate(90),
            k.color(255, 255, 255),
            k.area(),
            k.body({ isStatic: true }),
            k.z(50),
            "door",
          ]);
        }

        const walkablePath = [
          { x: 10, y: 0, w: 5, h: 3 },
          { x: 9, y: 3, w: 7, h: 2 },
          { x: 8, y: 5, w: 9, h: 3 },
          { x: 7, y: 8, w: 11, h: 2 },
          { x: 6, y: 10, w: 13, h: 3 },
          { x: 8, y: 13, w: 9, h: 2 },
          { x: 10, y: 15, w: 5, h: 4 },
        ];

        walkablePath.forEach(p => addRect(p.x,p.y,p.w,p.h,[255,0,0],0,49,"walkable"));

        const allBoundaries = [
          { x: -2, y: -5, w: 30, h: 5 },

          { x: -2, y: 19, w: 30, h: 5 },

          { x: -5, y: -5, w: 5, h: 30 },

          { x: 25, y: -5, w: 5, h: 30 },

          { x: 2, y: 9.5, w: 5, h: 2 },
          { x: 16.5, y: 9.5, w: 1.5, h: 1.5 },

          { x: 3, y: 16, w: 6, h: 2 },
          { x: 14, y: 16, w: 8, h: 2 },
          { x: 10.5, y: 3, w: 12, h: 3 },
          { x: 0, y: 2, w: 7, h: 4 },

          { x: 1, y: 0, w: 2, h: 30 },
          { x: 22, y: 0, w: 2, h: 30 },
        ];

        allBoundaries.forEach(b => addBoundary(b.x,b.y,b.w,b.h));

        k.add([
          k.text("↑", { size: 48 }),
          k.pos(12.5 * TILE_SIZE, 2 * TILE_SIZE),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(15),
        ]);

        k.add([
          k.text("↓", { size: 48 }),
          k.pos(12.5 * TILE_SIZE, 17 * TILE_SIZE),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(15),
        ]);

        k.add([
          k.rect(TILE_SIZE * 3, 10),
          k.pos(11 * TILE_SIZE, 0),
          k.opacity(0),
          k.area(),
          "exit2",
        ]);

        k.add([
          k.rect(TILE_SIZE * 3, 10),
          k.pos(11 * TILE_SIZE, k.height() - 10),
          k.opacity(0),
          k.area(),
          "back1",
        ]);

        const spawnPos =
          gameState.fromScene === 1
            ? { x: 12.5, y: 17 }
            : gameState.fromScene === 3
            ? { x: 12.5, y: 3.5 }
            : { x: 12.5, y: 2 };
        createPlayer(k, TILE_SIZE, gameState, spawnPos);
      });

      k.scene("scene3", () => {
        createGrassBackground();
        addDecorations();

        const treePositions = [...getEdgeTrees(),...[[2,0],[2,8],[2,16],[17,0],[17,8],[17,16]]];
        addTrees(treePositions);
        addBushes(12);

        const plumpY = 5;
        const plumps = [
          { x: 5, y: plumpY },
          { x: 12, y: plumpY },
        ];

        plumps.forEach((plump) => {
          k.add([
            k.sprite("plump"),
            k.pos(plump.x * TILE_SIZE, plump.y * TILE_SIZE),
            k.scale(2),
            k.z(3),
          ]);
        });

        k.add([
          k.rect(24, 32),
          k.pos(5 * TILE_SIZE + 128, 290),
          k.color(139, 69, 19),
          k.area(),
          k.anchor("center"),
          k.z(15),
          "notebook3-1",
        ]);

        k.add([
          k.text("📓", { size: 20 }),
          k.pos(5 * TILE_SIZE + 128, 290),
          k.anchor("center"),
          k.z(16),
        ]);

        k.add([
          k.text("Touch to read", { size: 10 }),
          k.pos(5 * TILE_SIZE + 128, 265),
          k.anchor("center"),
          k.color(0, 0, 0),
          k.z(16),
        ]);

        k.add([
          k.rect(24, 32),
          k.pos(12 * TILE_SIZE + 128, 290),
          k.color(139, 69, 19),
          k.area(),
          k.anchor("center"),
          k.z(15),
          "notebook3-2",
        ]);

        k.add([
          k.text("📔", { size: 20 }),
          k.pos(12 * TILE_SIZE + 128, 290),
          k.anchor("center"),
          k.z(16),
        ]);

        k.add([
          k.text("Touch to read", { size: 10 }),
          k.pos(12 * TILE_SIZE + 128, 265),
          k.anchor("center"),
          k.color(0, 0, 0),
          k.z(16),
        ]);

        const walkablePath = [
          { x: 10, y: 0, w: 5, h: 2 },
          { x: 8, y: 2, w: 9, h: 2 },
          { x: 6, y: 4, w: 13, h: 3 },
          { x: 5, y: 7, w: 15, h: 2 },
          { x: 6, y: 9, w: 13, h: 3 },
          { x: 7, y: 12, w: 11, h: 2 },
          { x: 9, y: 14, w: 7, h: 2 },
          { x: 10, y: 16, w: 5, h: 3 },
        ];

        walkablePath.forEach(p => addRect(p.x,p.y,p.w,p.h,[255,0,0],0,49,"walkable"));

        const allBoundaries = [
          { x: -2, y: -5, w: 30, h: 5 },

          { x: -2, y: 0, w: 8, h: 20 },

          { x: 20, y: 0, w: 10, h: 20 },

          { x: 3, y: 4, w: 3, h: 3 },
          { x: 19, y: 4, w: 1, h: 3 },
          { x: 3, y: 9, w: 3, h: 3 },
          { x: 19, y: 9, w: 1, h: 3 },

          { x: -2, y: 19, w: 30, h: 5 },
        ];

        allBoundaries.forEach(b => addBoundary(b.x,b.y,b.w,b.h));

        k.add([
          k.text("↑", { size: 48 }),
          k.pos(12.5 * TILE_SIZE, 2 * TILE_SIZE),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(15),
        ]);

        k.add([
          k.text("↓", { size: 48 }),
          k.pos(12.5 * TILE_SIZE, 17 * TILE_SIZE),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(15),
        ]);

        k.add([
          k.rect(TILE_SIZE * 3, 10),
          k.pos(11 * TILE_SIZE, 0),
          k.opacity(0),
          k.area(),
          "exit3",
        ]);

        k.add([
          k.rect(TILE_SIZE * 3, 10),
          k.pos(11 * TILE_SIZE, k.height() - 10),
          k.opacity(0),
          k.area(),
          "back2",
        ]);

        const spawnPos =
          gameState.fromScene === 2 ? { x: 12.5, y: 17 } : { x: 12.5, y: 3.5 };
        createPlayer(k, TILE_SIZE, gameState, spawnPos);
      });

      k.scene("finale", () => {
        const GRASS_TILE_SIZE = 16;
        for (let x = -2; x <= 52; x++) {
          for (let y = -2; y <= 40; y++) {
            const grassType = Math.random() > 0.5 ? "grass1" : "grass2";
            k.add([
              k.sprite(grassType),
              k.pos(x * GRASS_TILE_SIZE, y * GRASS_TILE_SIZE),
              k.scale(1),
              k.opacity(0.9),
              k.z(0),
            ]);
          }
        }

        if (gameState.hasFlower) {
          k.add([
            k.rect(TILE_SIZE * 3, TILE_SIZE * 3),
            k.pos(11 * TILE_SIZE, 4 * TILE_SIZE),
            k.color(255, 215, 0),
            k.opacity(0.5),
            k.area(),
            "flower-spot",
          ]);

          k.add([
            k.text("Place the flower here 🌸", { size: 16 }),
            k.pos(12.5 * TILE_SIZE, 6 * TILE_SIZE),
            k.anchor("center"),
            k.color(255, 255, 255),
          ]);
        }

        createPlayer(k, TILE_SIZE, gameState);
      });

      function createPlayer(
        k: any,
        TILE_SIZE: number,
        gameState: any,
        spawnPosition?: { x: number; y: number }
      ) {
          window.currentGameState = gameState;
        const defaultPos = { x: 12, y: 14.5 };
        const pos = spawnPosition || defaultPos;

        const player = k.add([
          k.sprite("shmariam-idle1"),
          k.pos(pos.x * TILE_SIZE, pos.y * TILE_SIZE),
          k.area({ width: 16, height: 16 }),
          k.body(),
          k.scale(2),
          k.anchor("center"),
          k.z(20),
          "player",
          {
            currentSprite: "idle",
            walkFrame: 0,
            walkTimer: 0,
            idleFrame: 0,
            idleTimer: 0,
          },
        ]);

        if (gameState.hasFlower) {
          k.add([
            k.text("🌸", { size: 20 }),
            k.pos(0, -30),
            k.follow(player),
            k.z(21),
            "flower-indicator",
          ]);
        }

        const SPEED = 100;
        const VERTICAL_SPEED = 80; // Slower vertical movement
        const handleMovement = (dx: number, dy: number) => {
          if (window.isDoorInputOpen) return;

          const speedX = dx !== 0 ? SPEED : 0;
          const speedY = dy !== 0 ? VERTICAL_SPEED : 0;
          player.move(dx * speedX, dy * speedY);
          player.walkTimer += k.dt();
          if (player.walkTimer > 0.2) {
            player.walkTimer = 0;
            player.walkFrame = player.walkFrame === 0 ? 1 : 0;
            const walkSprite =
              player.walkFrame === 0 ? "shmariam-walk1" : "shmariam-walk2";
            player.use(k.sprite(walkSprite));
            player.currentSprite = "walk";
          }
        };

        k.onKeyDown("left", () => handleMovement(-1, 0));
        k.onKeyDown("right", () => handleMovement(1, 0));
        k.onKeyDown("up", () => handleMovement(0, -1));
        k.onKeyDown("down", () => handleMovement(0, 1));
        k.onKeyDown("a", () => handleMovement(-1, 0));
        k.onKeyDown("d", () => handleMovement(1, 0));
        k.onKeyDown("w", () => handleMovement(0, -1));
        k.onKeyDown("s", () => handleMovement(0, 1));

        k.onUpdate(() => {
          if (window.isDoorInputOpen) return;

          const keys = ["left", "right", "up", "down", "a", "d", "w", "s"];
          const anyKeyPressed = keys.some((key) => k.isKeyDown(key));

          if (!anyKeyPressed) {
            if (player.currentSprite !== "idle") {
              player.currentSprite = "idle";
              player.walkTimer = 0;
              player.idleTimer = 0;
            }
            player.idleTimer += k.dt();
            if (player.idleTimer > 0.8) {
              player.idleTimer = 0;
              player.idleFrame = player.idleFrame === 0 ? 1 : 0;
              const idleSprite =
                player.idleFrame === 0 ? "shmariam-idle1" : "shmariam-idle2";
              player.use(k.sprite(idleSprite));
            }
          }
        });

        player.onCollide("collectible-flower", (flower: any) => {
          k.destroy(flower);
          const circle = k.get("flower-circle")[0];
          if (circle) k.destroy(circle);
          const instructionText = k.get("flower-instruction")[0];
          if (instructionText) k.destroy(instructionText);
          gameState.hasFlower = true;

          const msg = k.add([
            k.text("You picked up the flower! 🌸", { size: 24 }),
            k.pos(k.width() / 2, k.height() - 100),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
          ]);

          k.wait(2, () => k.destroy(msg));

          k.add([
            k.text("🌸", { size: 20 }),
            k.pos(0, -30),
            k.follow(player),
            k.z(21),
            "flower-indicator",
          ]);
        });

        player.onCollide("exit1", () => {
          if (!gameState.teleportCooldown) {
            gameState.currentScene = 2;
            gameState.fromScene = 1;
            gameState.teleportCooldown = true;
            k.go("scene2");
            setTimeout(() => {
              gameState.teleportCooldown = false;
            }, 1000);
          }
        });

        player.onCollide("exit2", () => {
          if (!gameState.teleportCooldown) {
            gameState.currentScene = 3;
            gameState.fromScene = 2;
            gameState.teleportCooldown = true;
            k.go("scene3");
            setTimeout(() => {
              gameState.teleportCooldown = false;
            }, 1000);
          }
        });

        player.onCollide("exit3", () => {
          if (gameState.hasFlower) {
            gameState.currentScene = 4;
            k.go("finale");
          } else {
            const msg = k.add([
              k.text("You need the flower first!", { size: 20 }),
              k.pos(k.width() / 2, k.height() - 100),
              k.anchor("center"),
              k.color(255, 255, 255),
              k.z(100),
            ]);
            k.wait(2, () => k.destroy(msg));
          }
        });

        player.onCollide("back1", () => {
          if (!gameState.teleportCooldown) {
            gameState.currentScene = 1;
            gameState.fromScene = 2;
            gameState.teleportCooldown = true;
            k.go("scene1");
            setTimeout(() => {
              gameState.teleportCooldown = false;
            }, 1000);
          }
        });

        player.onCollide("back2", () => {
          if (!gameState.teleportCooldown) {
            gameState.currentScene = 2;
            gameState.fromScene = 3;
            gameState.teleportCooldown = true;
            k.go("scene2");
            setTimeout(() => {
              gameState.teleportCooldown = false;
            }, 1000);
          }
        });

        player.onCollide("notebook", () => {
          gameState.openNotebook();

          const msg = k.add([
            k.text("Opening notebook...", { size: 16 }),
            k.pos(k.width() / 2, k.height() - 80),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
          ]);

          k.wait(0.5, () => k.destroy(msg));
        });

        player.onCollide("notebook3-1", () => {
          gameState.openNotebook1();

          const msg = k.add([
            k.text("Opening first memories...", { size: 16 }),
            k.pos(k.width() / 2, k.height() - 80),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
          ]);

          k.wait(0.5, () => k.destroy(msg));
        });

        player.onCollide("notebook3-2", () => {
          gameState.openNotebook2();

          const msg = k.add([
            k.text("Opening second memories...", { size: 16 }),
            k.pos(k.width() / 2, k.height() - 80),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
          ]);

          k.wait(0.5, () => k.destroy(msg));
        });

        player.onCollide("door", () => {
          if (!gameState.isDoorUnlocked && !window.isDoorInputOpen) {
            window.isDoorInputOpen = true;
            gameState.openDoorInput();
            player.pos.y += 30;
          }
        });

        player.onCollide("flower-spot", () => {
          if (gameState.hasFlower) {
            // Romantic overlay
            k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(0, 0, 0), k.opacity(0.4), k.z(40)]);
            
            // Gradient circles for depth
            for (let i = 5; i > 0; i--) {
              k.add([
                k.circle(60 * i),
                k.pos(k.width() / 2, k.height() / 2),
                k.color(255, 192 + i*10, 203),
                k.opacity(0.08),
                k.z(41 + i),
              ]);
            }
            
            // Hearts floating up
            k.loop(0.5, () => {
              const heart = k.add([
                k.text("❤️", { size: k.rand(20, 40) }),
                k.pos(k.rand(50, k.width() - 50), k.height() + 20),
                k.color(255, 105, 180),
                k.opacity(0.8),
                k.z(150),
              ]);
              heart.onUpdate(() => {
                heart.pos.y -= 2;
                heart.pos.x += Math.sin(heart.pos.y / 30) * 1;
                heart.opacity -= 0.005;
                if (heart.opacity <= 0) k.destroy(heart);
              });
            });
            
            // Sparkles
            k.loop(0.2, () => {
              const sparkle = k.add([
                k.text("✨", { size: k.rand(10, 25) }),
                k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
                k.color(255, 255, 255),
                k.opacity(0),
                k.z(160),
              ]);
              sparkle.onUpdate(() => {
                sparkle.opacity = Math.sin(k.time() * 5) * 0.8;
                sparkle.angle += 3;
              });
              k.wait(2, () => k.destroy(sparkle));
            });
            
            // Main message with animation
            const mainMsg = k.add([
              k.text("I LOVE YOU SHMARIAM", {size: 60, font: "serif"}),
              k.pos(k.width() / 2, k.height() / 2 - 30),
              k.anchor("center"),
              k.color(255, 255, 255),
              k.outline(4, k.rgb(255, 20, 147)),
              k.scale(0),
              k.z(201),
            ]);
            
            // Animate main message
            mainMsg.onUpdate(() => {
              if (mainMsg.scale.x < 1) {
                mainMsg.scale = k.vec2(mainMsg.scale.x + 0.02);
              }
              mainMsg.color = k.rgb(
                255,
                200 + Math.sin(k.time() * 3) * 55,
                200 + Math.sin(k.time() * 3) * 55
              );
            });
            
            // Subtitle
            k.wait(0.5, () => {
              const subtitle = k.add([
                k.text("Forever begins today", {size: 32, font: "serif"}),
                k.pos(k.width() / 2, k.height() / 2 + 50),
                k.anchor("center"),
                k.color(255, 182, 193),
                k.opacity(0),
                k.z(200),
              ]);
              subtitle.onUpdate(() => {
                if (subtitle.opacity < 1) subtitle.opacity += 0.02;
              });
            });
            
            // Date text
            k.wait(1, () => {
              k.add([
                k.text("3 Months Together 💕", {size: 24}),
                k.pos(k.width() / 2, k.height() / 2 + 100),
                k.anchor("center"),
                k.color(255, 105, 180),
                k.z(200),
              ]);
            });
            
            // Rose petals falling
            k.loop(0.3, () => {
              const petal = k.add([
                k.text("🌹", { size: 20 }),
                k.pos(k.rand(0, k.width()), -20),
                k.rotate(k.rand(0, 360)),
                k.opacity(0.7),
                k.z(155),
              ]);
              petal.onUpdate(() => {
                petal.pos.y += 1.5;
                petal.pos.x += Math.sin(petal.pos.y / 20) * 0.8;
                petal.angle += 2;
                if (petal.pos.y > k.height() + 20) k.destroy(petal);
              });
            });
            
            // Glowing ring pulse
            const ring = k.add([
              k.circle(200),
              k.pos(k.width() / 2, k.height() / 2),
              k.color(255, 255, 255),
              k.opacity(0),
              k.z(45),
            ]);
            ring.onUpdate(() => {
              ring.scale = k.vec2(1 + Math.sin(k.time() * 2) * 0.1);
              ring.opacity = 0.1 + Math.sin(k.time() * 2) * 0.05;
            });
            
            // Fireworks after 2 seconds
            k.wait(2, () => {
              k.loop(0.8, () => {
                const x = k.rand(100, k.width() - 100);
                const y = k.rand(100, k.height() / 2);
                for (let i = 0; i < 12; i++) {
                  const angle = (i / 12) * Math.PI * 2;
                  const firework = k.add([
                    k.circle(3),
                    k.pos(x, y),
                    k.color(k.rand(200, 255), k.rand(100, 255), k.rand(150, 255)),
                    k.opacity(1),
                    k.z(170),
                  ]);
                  const speed = 3;
                  firework.onUpdate(() => {
                    firework.pos.x += Math.cos(angle) * speed;
                    firework.pos.y += Math.sin(angle) * speed;
                    firework.opacity -= 0.02;
                    if (firework.opacity <= 0) k.destroy(firework);
                  });
                }
              });
            });

          }
        });
      }

      k.go("scene1");
    }, 100);

    return () => {
      clearTimeout(timer);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.quit();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  const handleDoorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = doorInputValue.toLowerCase().replace(/\s+/g, "");

    if (normalizedInput === "g35" || normalizedInput === "g-35") {
      setShowDoorInput(false);
      setDoorInputValue("");
      setDoorError(false);
      window.isDoorInputOpen = false;

      if (gameInstanceRef.current) {
        try {
          const k = gameInstanceRef.current;
          const doors = k.get("door");
          if (doors && doors.length > 0) {
            doors.forEach((door: any) => {
              k.destroy(door);
            });
          }
          setIsDoorUnlocked(true);
          window.isDoorUnlocked = true;

          const msg = k.add([
            k.text("Door Unlocked! ✨", { size: 24 }),
            k.pos(k.width() / 2, k.height() - 100),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(100),
          ]);

          k.wait(2, () => k.destroy(msg));
        } catch (error) {
          console.error("Error removing door:", error);
        }
      }
    } else {
      setDoorError(true);
      setDoorInputValue("");
      setTimeout(() => setDoorError(false), 2000);
    }
  };

  const handleDoorClose = () => {
    setShowDoorInput(false);
    setDoorInputValue("");
    setDoorError(false);
    window.isDoorInputOpen = false;
  };

  const handlePlayClick = () => {
    setShowPlayOverlay(false);
    const audio = document.getElementById('bgMusic') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.5;
      audio.play();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 relative">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          Our Anniversary Adventure 💕
        </h1>
        <p className="text-pink-500 mb-4">
          Find the flower and bring it to our special place!
        </p>
        <div className="border-4 border-pink-300 rounded-lg shadow-lg overflow-hidden relative">
          <canvas ref={canvasRef} width={800} height={600} />
          {showPlayOverlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <button
                onClick={handlePlayClick}
                className="px-12 py-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-3xl font-bold rounded-full hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-2xl animate-pulse"
              >
                ▶ Play
              </button>
            </div>
          )}
        </div>
        <p className="text-pink-400 mt-4 text-center max-w-md">
          A journey through our memories... 3 months of love! 💕
        </p>
      </div>
      <Notebook
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />
      <Notebook1
        isOpen={isNotebook1Open}
        onClose={() => setIsNotebook1Open(false)}
      />
      <Notebook2
        isOpen={isNotebook2Open}
        onClose={() => setIsNotebook2Open(false)}
      />

      {showDoorInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl shadow-2xl border-2 border-purple-200 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-purple-800 mb-2">
                (სასწაული კარი)
              </h3>
              <p className="text-gray-600">🔐 Enter the car model to unlock</p>
            </div>
            <form onSubmit={handleDoorSubmit}>
              <input
                type="text"
                value={doorInputValue}
                onChange={(e) => setDoorInputValue(e.target.value)}
                className="px-4 py-3 border-2 border-purple-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-lg"
                placeholder="Type here..."
                autoFocus
              />
              {doorError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-center animate-pulse">
                  ❌ Wrong! Try again!
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
                >
                  Unlock 🗝️
                </button>
                <button
                  type="button"
                  onClick={handleDoorClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
