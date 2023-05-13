// chrome.runtime.onMessage.addListener(message => {
// 	if (message.url) {
// 		chrome.downloads.download({
// 			url: message.url,
// 			filename: "images.zip"
// 		});
// 	}
// });

const downloadAllImages = () => {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({ command: "download_all" }, response => {
			resolve({ success: response.success });
		});
	});
};

const downloadAsZip = () => {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({ command: "download_as_zip" }, response => {
			resolve({ success: response.success });
		});
	});
};

const addAllTabs = () => {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({ command: "add_all_tabs" }, response => {
			resolve({ success: response.success });
		});
	});
};

const clearImages = () => {
	chrome.runtime.sendMessage({ command: "clear_images" }, response => {
		// stuff
	});
};

const getImageCount = () => {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({ command: "get_images" }, response => {
			resolve(response ? [...new Set(response.images)].length : 0);
		});
	});
};

document.addEventListener("DOMContentLoaded", async () => {
	const imageCount = await getImageCount();

	console.log(imageCount);

	const imageCountText = document.getElementById("imageCount");
	const downloadImagesButton = document.getElementById("downloadImages");
	const downloadButton = document.getElementById("downloadButton");
	const allTabsButton = document.getElementById("allTabs");
	const clearButton = document.getElementById("clear");

	imageCountText.innerText = imageCount

	downloadImagesButton.addEventListener("click", async () => {
		await downloadAllImages();
		clearImages();
		imageCountText.innerText = await getImageCount();
	});
	downloadButton.addEventListener("click", async () => {
		await downloadAsZip();
		clearImages();
		imageCountText.innerText = await getImageCount();
	});
	allTabsButton.addEventListener("click", async () => {
		await addAllTabs();
		imageCountText.innerText = await getImageCount();
	});
	clearButton.addEventListener("click", async () => {
		clearImages();
		imageCountText.innerText = await getImageCount();
	});
});
