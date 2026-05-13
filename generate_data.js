const fs = require('fs');
const path = require('path');

const categories = ['rings', 'earings', 'neckles', 'braclete'];
const data = {};

categories.forEach(cat => {
    data[cat] = [];
    const catPath = path.join(__dirname, cat);
    if(fs.existsSync(catPath)){
        const items = fs.readdirSync(catPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        items.forEach(item => {
            const itemPath = path.join(catPath, item);
            const images = fs.readdirSync(itemPath).filter(file => 
                file.toLowerCase().endsWith('.webp') || 
                file.toLowerCase().endsWith('.png') || 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg')
            );
            data[cat].push({
                id: item,
                name: item.replace(/([a-zA-Z]+)(\d+)/i, '$1 $2').toUpperCase().trim(),
                images: images.map(img => `${cat}/${item}/${img}`)
            });
        });
    }
});

fs.writeFileSync(path.join(__dirname, 'data.js'), `const jewelryData = ${JSON.stringify(data, null, 2)};\n\nexport default jewelryData;`);
console.log('data.js generated successfully.');
