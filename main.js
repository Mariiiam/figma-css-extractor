// main.js
// This script handles the UI and fetches CSS code from the main() function

async function getFigmaFile(fileKey, figmaToken) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { "X-Figma-Token": figmaToken }
  });
  const data = await res.json();
  return data;
}

async function getNodes(fileKey, figmaToken, ids){
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${ids.join(",")}`, 
    {
    headers: { "X-Figma-Token": figmaToken }
    });

    const data = await res.json();
    return data.nodes;
}

function rgbToHex(r, g, b){
  return `#${Math.round(r*255).toString(16).padStart(2, '0')}${Math.round(g*255).toString(16).padStart(2, '0')}${Math.round(b*255).toString(16).padStart(2, '0')}`;
}

async function main(fileKey, figmaToken) {
    const file = await getFigmaFile(fileKey, figmaToken);
    const styles = Object.entries(file.styles);

    const fillStyles = styles.filter(([id, s]) => s.styleType === "FILL");
    const ids = fillStyles.map(([id]) => id);

    const nodes = await getNodes(fileKey, figmaToken, ids);
    
    let css = "";
    for (const [id, style] of fillStyles) {
        const node = nodes[id].document;
        const paint = node.fills?.[0];
        if (paint?.color){
        const {r, g, b} = paint.color;
        const hex = rgbToHex(r, g, b);
        css += `--${style.name.replace(/\s+/g, "-").toLowerCase()}: ${hex};\n`;
        }
    }
    return css;
}

window.generateCSS = async function() {
    const fileKey = document.getElementById('fileKey').value.trim();
    const figmaToken = document.getElementById('figmaToken').value.trim();
    if (!fileKey || !figmaToken) {
        alert('Please enter both File Key and Figma Token.');
        return;
    }
    const css = await main(fileKey, figmaToken);
    document.getElementById('cssCode').value = css;
    document.getElementById('output').style.display = 'block';
};
