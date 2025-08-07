// Populate the thesis table when the page loads
document.addEventListener('DOMContentLoaded', populateThesisTable);

var info;

// Fetch professor thesis' under assignment from the server and populate the table
async function populateThesisTable() {
    const response = await fetch('/prof/get-under-assignment', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    info = data.info
    console.log(info)
    console.log(info.length)

    for (let i = 0; i < info.length; i++) {
        const newRow = document.createElement('li');
        newRow.id = info[i].title
        newRow.textContent = info[i].title;
        newRow.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        document.getElementById('table').appendChild(newRow);

        const newButton = document.createElement('button');
        newButton.textContent = "Επεξεργασία";
        newButton.classList.add("btn", "btn-sm", "btn-secondary");
        newButton.setAttribute('data-bs-toggle', 'modal');
        newButton.setAttribute('data-bs-target', '#thesisModal');
        
        document.getElementById(info[i].title).appendChild(newButton);
    }
}