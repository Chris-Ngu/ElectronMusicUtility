const { ipcRenderer, remote } = require("electron");

/**
 * SYNCHRONOUS FUNCTION
 * Listens for button click and calls IPCMain thread to ask for files
 * Returns an object that contains the path and file paths
 * If error occurs, then response.error
 */
document.getElementById("getFileButton").addEventListener("click", (event) => {
    const response = ipcRenderer.sendSync("open-file-dialog");

    // Error message received here
    if (response.error) {
        document.getElementById("sourceFileLocation").innerHTML = response.error;
    }
    // No error message and have array of song lists
    else {
        clearDiv("source-directory");
        document.getElementById("sourceFileLocation").innerHTML = "mp3s found here: " + response.files.length;
        document.getElementById("sourcePath").innerHTML = response.path;
        // Creating buttons to append
        for (let i = 0; i < response.files.length; i++) {
            const tag = document.createElement("button");
            const tagLineSeperator = document.createElement("br");
            tag.appendChild(document.createTextNode(response.files[i]));
            tag.onclick = function () { songButtonClick(response.path + "\\" + response.files[i]) };
            document.getElementById("source-directory").appendChild(tag);
            document.getElementById("source-directory").appendChild(tagLineSeperator);
        }

    }
});

/**
 * Same as the top function, just copied and pasted for destination
 */
document.getElementById("getDestinationFileButton").addEventListener("click", (event) => {
    const response = ipcRenderer.sendSync("open-file-dialog");

    // Error message received here
    if (response.error) {
        document.getElementById("destinationFileLocation").innerHTML = response.error;
    }
    // No error message and have array of song lists
    else {
        clearDiv("destination-directory");
        document.getElementById("destinationFileLocation").innerHTML = "mp3s found here: " + response.files.length;
        document.getElementById("destinationPath").innerHTML = response.path;
        // Creating buttons to append
        for (let i = 0; i < response.files.length; i++) {
            const tag = document.createElement("button");
            const tagLineSeperator = document.createElement("br");
            tag.appendChild(document.createTextNode(response.files[i]));
            tag.onclick = function () { songButtonClick(response.path + "\\" + response.files[i]) };
            document.getElementById("destination-directory").appendChild(tag);
            document.getElementById("destination-directory").appendChild(tagLineSeperator);
        }
    }
});

// Context menu shows up when you click the song button 
const songButtonClick = (songPath) => {
    const contextMenu = new remote.Menu();
    const playMenuItem = new remote.MenuItem({
        label: "Play song",
        click: () => {
            ipcRenderer.send("song-button-click", songPath);
        }
    });
    const renameMenuItem = new remote.MenuItem({
        label: "Rename song",
        click: () => {
            ipcRenderer.send("song-button-rename", songPath)
        }
    });
    /**
     * CHRIS YOU LEFT OFF HERE
     * NEED TO FIND A WAY TO GET THE OTHER DIV"S INFORMATION ONTO THE BUTTON CLICK
     * 
     */
    const moveSongDirectory = new remote.MenuItem({
        label: "Move song to other directory",
        click: () => {
            ipcRenderer.send("song-move", {
              sourcePath: songPath,
              destination: 
            })
        }
    })
    contextMenu.append(playMenuItem);
    contextMenu.append(renameMenuItem);

    contextMenu.popup({
        window: remote.getCurrentWindow()
    });
}

ipcRenderer.on("refresh-window-webContents", (event) => {

    // Grab source and destination paths
    const sourcePath = document.getElementById("sourcePath").innerHTML;
    const destinationPath = document.getElementById("destinationPath").innerHTML;

    // Call main thread to grab the new names in the source directory
    const sourcePathSongs = ipcRenderer.sendSync("get-new-song-names", sourcePath);

    // Process new songs as buttons, refer to the top function
    clearDiv("source-directory");
    document.getElementById("sourceFileLocation").innerHTML = "mp3s found here: " + sourcePathSongs.length;
    document.getElementById("sourcePath").innerHTML = sourcePath;
    for (let i = 0; i < sourcePathSongs.length; i++) {
        const tag = document.createElement("button");
        const tagLineSeperator = document.createElement("br");
        tag.appendChild(document.createTextNode(sourcePathSongs[i]));
        tag.onclick = function () { songButtonClick(sourcePath + "\\" + sourcePathSongs[i]) };
        document.getElementById("source-directory").appendChild(tag);
        document.getElementById("source-directory").appendChild(tagLineSeperator);
    };

    // Gets destination path and refreshes destination div (if not empty)
    // Leaves alone if either path/ returned value from main.js is empty
    const destinationPathSongs = ipcRenderer.sendSync("get-new-song-names", destinationPath);
    if (destinationPathSongs.length != 0) {
        clearDiv("destination-directory");

        document.getElementById("destinationFileLocation").innerHTML = "mp3s found here: " + destinationPathSongs.length;
        document.getElementById("destinationPath").innerHTML = destinationPath;
        for (let i = 0; i < destinationPathSongs.length; i++) {
            const tag = document.createElement("button");
            const tagLineSeperator = document.createElement("br");
            tag.appendChild(document.createTextNode(destinationPathSongs[i]));
            tag.onclick = function () { songButtonClick(destinationPath + "\\" + destinationPathSongs[i]) };
            document.getElementById("destination-directory").appendChild(tag);
            document.getElementById("destination-directory").appendChild(tagLineSeperator);
        };
    }

});

// Clears parent div
const clearDiv = (divID) => {
    const div = document.getElementById(divID);
    while (div.firstChild) {
        div.removeChild(div.lastChild);
    }
}