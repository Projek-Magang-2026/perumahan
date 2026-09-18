const fs = require('fs');
const path = require('path');

const dir = __dirname;
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'script.js'), 'utf8');

function compile(srcName, destName) {
    let html = fs.readFileSync(path.join(dir, srcName), 'utf8');
    
    // Replace stylesheet link
    html = html.replace(/<link rel="stylesheet" href="style\.css">/g, `<style>\n${css}\n</style>`);
    
    // Replace script src
    html = html.replace(/<script src="script\.js"><\/script>/g, `<script>\n${js}\n</script>`);
    
    fs.writeFileSync(path.join(dir, destName), html, 'utf8');
    console.log(`Successfully compiled ${srcName} -> ${destName}`);
}

compile('login.src.html', 'login.html');
compile('status.src.html', 'status.html');
