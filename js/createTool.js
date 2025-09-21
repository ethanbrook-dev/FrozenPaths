import { TILE_SIZE } from "./game.js";
import { updateCursor } from "./cursor.js"; 

export function createTool(canvas, paletteDiv, labelText, imgSrc, selectedTileValue, setSelectedTile) {
    const div = document.createElement("div");
    div.className = "tileOption";
    const img = document.createElement("img");
    img.src = imgSrc;
    img.width = TILE_SIZE;
    img.height = TILE_SIZE;
    const label = document.createElement("p");
    label.innerText = labelText;
    div.appendChild(img);
    div.appendChild(label);
    div.addEventListener("click", () => {
        document.querySelectorAll(".tileOption").forEach(opt => opt.classList.remove("selected"));
        div.classList.add("selected");
        setSelectedTile(selectedTileValue);
        if (selectedTileValue === null) updateCursor(canvas, null);
    });
    paletteDiv.appendChild(div);
}