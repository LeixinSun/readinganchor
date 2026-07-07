const TOGGLE_MESSAGE = { type: "READING_ANCHOR_TOGGLE" };

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"],
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    await chrome.tabs.sendMessage(tab.id, TOGGLE_MESSAGE);
  } catch (error) {
    console.warn("Reading Anchors could not run on this page.", error);
  }
});
