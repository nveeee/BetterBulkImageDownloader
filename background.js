import './jszip.min.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add_to_list",
    title: "Add Image to List",
    contexts: ["image", "link"],
    targetUrlPatterns:
      ["*://*/*.jpg",
      "*://*/*.jpeg",
      "*://*/*.png",
      "*://*/*.gif",
      "*://*/*.bmp",
      "*://*/*.svg"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add_to_list") {
    chrome.storage.session.get({ images: [] }, result => {
      const images = result.images;
      images.push(info.srcUrl ? info.srcUrl : info.linkUrl);
      chrome.storage.session.set({ images: images });

      console.log(images);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "download_all") {
    chrome.storage.session.get({ images: [] }, result => {
      const images = [...new Set(result.images)];
      if (images.length > 0) {

        images.forEach((imageUrl, index) => {
          chrome.downloads.download({ url: imageUrl, filename: `image_${index}.${imageUrl.split(".").pop()}`, saveAs: false });
        });

        sendResponse({ success: true });
      }
    });
  }

  if (message.command === "download_as_zip") {
    chrome.storage.session.get({ images: [] }, result => {
      const images = [...new Set(result.images)];
      if (images.length > 0) {

        const zip = new JSZip();
        const folder = zip.folder("images")
        const downloadPromises = [];

        images.forEach((imageUrl, index) => {
          const filename = `image_${index}.png`;
          const downloadPromise = fetch(imageUrl)
            .then(async response => {
              const blob = await response.blob();
              folder.file(filename, blob, { binary: true });
              return response.blob;
            });

            downloadPromises.push(downloadPromise);
        });

        Promise.all(downloadPromises).then(() => {
          zip.generateAsync({ type: "base64" })
            .then(content => {

              chrome.downloads.download({
                url: `data:application/octet-stream;base64,${content}`,
                filename: "images.zip"
              });

              sendResponse({ success: true });
            });
        });
      }
    });
  }

  if (message.command === "add_all_tabs") {
    chrome.tabs.query({}, (tabs) => {
      chrome.storage.session.get({ images: [] }, result => {
        const images = result.images;

        tabs.forEach(({ url }) => {
          if (url && url.match(/\bhttps?:\/\/\S+?\.(?:jpg|jpeg|png|gif|bmp|svg)\b/)) {
            images.push(url);
          }
        });

        chrome.storage.session.set({ images: images });

        sendResponse({ success: true });
      });
    });
  }

  if (message.command === "clear_images") {
    chrome.storage.session.clear(() =>{
      console.log("Images Cleared!");
    });
  }

  if (message.command === "get_images") {
    chrome.storage.session.get({ images: [] }, result => {
      console.log(result.images);
      console.log("Sending...")
      sendResponse({ images: result.images });
    });
  }

  return true;
});
