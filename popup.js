const btn = document.querySelector('.changeColorBtn');
const colorGrid = document.querySelector('.colorGrid');
const colorValue = document.querySelector('.colorValue');
const colorList = document.querySelector('.colorList');
const clearAllBtn = document.querySelector('.clearAllBtn');


chrome.storage.sync.get('colors', ({ colors }) => {
    console.log('colors: ', colors);
    if (colors && colors.length > 0) {
        // Display the last saved color
        const lastColor = colors[colors.length - 1];
        colorGrid.style.backgroundColor = lastColor;
        colorValue.innerText = lastColor;
        displaySavedColors(colors)
    }
});


btn.addEventListener('click', async () => {
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: pickColor,
        },
        async (injectionResults) => {
            const [data] = injectionResults;
            if (data.result) {
                const color = data.result.sRGBHex;
                colorGrid.style.backgroundColor = color;
                colorValue.innerText = color;
                try {
                    await navigator.clipboard.writeText(color);
                } catch (err) {
                    console.error(err);
                }
                // Save the color
                chrome.storage.sync.get('colors', ({ colors }) => {
                    const newColors = colors ? [...colors, color] : [color];
                    chrome.storage.sync.set({ colors: newColors });
                    // Display the saved colors
                    displaySavedColors(newColors);
                });
            }
        }
    );
});

function displaySavedColors(colors) {
    const colorList = document.querySelector('.colorList');
    colorList.innerHTML = '';
    colors.forEach(color => {
        const li = document.createElement('li');
        li.innerText = color;
        li.style.backgroundColor = color;

        
        // Add a delete button for each color
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => {
            // Remove the color from the colors array
            const newColors = colors.filter(c => c !== color);
            chrome.storage.sync.set({ colors: newColors });
            // Update the displayed list of saved colors
            displaySavedColors(newColors);
        });

        li.appendChild(deleteBtn);
        colorList.appendChild(li);
        li.addEventListener('click', () => {
            colorGrid.style.backgroundColor = color;
            colorValue.innerText = color;
        });
    });
}


clearAllBtn.addEventListener('click', () => {
    chrome.storage.sync.remove('colors');
    colorList.innerHTML = '';
});

async function pickColor() {
    const hasSupport = () => ('EyeDropper' in window);
    if (hasSupport()){
  // Picker
        const eyeDropper = new window.EyeDropper();
        return await eyeDropper.open();
    }
    else{
        alert('This browser does not support the Eye Dropper API');
    }
}
